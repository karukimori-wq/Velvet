import { getRequestIdentity } from "@/lib/auth/request-identity";
import { getMediaAccess } from "@/lib/media-access";
import { deleteProfessionalTimelineItem, listProfessionalTimeline } from "@/lib/professional-timeline-repository";
import { getMediaBucket } from "@/lib/storage/r2";

function observability(request: Request) {
  const traceId = request.headers.get("x-trace-id") ?? crypto.randomUUID();
  return {
    traceId,
    correlationId: request.headers.get("x-correlation-id") ?? traceId,
    requestId: request.headers.get("x-request-id") ?? crypto.randomUUID(),
  };
}

function belongsToCurrentScope(key: string, input: { workspaceId: string; userId: string; customerId: string }) {
  const base = `velvet/${encodeURIComponent(input.workspaceId)}/${encodeURIComponent(input.userId)}/${encodeURIComponent(input.customerId)}/`;
  return key.startsWith(base);
}

async function resolveMediaRequest(request: Request) {
  const { workspaceId, userId, ownerUserId } = await getRequestIdentity();
  const obs = observability(request);
  const url = new URL(request.url);
  const key = url.searchParams.get("key")?.trim() ?? "";
  const customerId = url.searchParams.get("customerId")?.trim() ?? "";
  if (!key) return { response: Response.json({ status: "error", error: { code: "MEDIA_KEY_REQUIRED", message: "key is required", retryable: false }, ...obs }, { status: 400 }) } as const;
  if (!customerId) return { response: Response.json({ status: "error", error: { code: "MEDIA_CUSTOMER_REQUIRED", message: "customerId is required", retryable: false }, ...obs }, { status: 400 }) } as const;

  const media = await getMediaAccess(ownerUserId);
  if (!media.allowed) {
    const isPlan = media.errorCode === "PRO_REQUIRED";
    return { response: Response.json({
      status: "error",
      error: { code: media.errorCode, message: isPlan ? "画像機能はProプランで利用できます。" : "画像保存先がまだ設定されていません。", retryable: !isPlan },
      ...obs,
    }, { status: isPlan ? 403 : 503 }) } as const;
  }

  if (!belongsToCurrentScope(key, { workspaceId, userId, customerId })) {
    return { response: Response.json({ status: "error", error: { code: "MEDIA_SCOPE_FORBIDDEN", message: "この画像は現在のworkspace/user/customerに紐づいていません。", retryable: false }, ...obs }, { status: 403 }) } as const;
  }

  const timeline = await listProfessionalTimeline(workspaceId, userId, customerId);
  const reference = timeline.find(item => item.eventType === "media" && item.sourceRef === `r2:${key}`);
  if (!reference) {
    return { response: Response.json({ status: "error", error: { code: "MEDIA_REFERENCE_NOT_FOUND", message: "この画像を現在の顧客記録に紐づくメディアとして確認できません。", retryable: false }, ...obs }, { status: 404 }) } as const;
  }

  const bucket = await getMediaBucket();
  if (!bucket) {
    return { response: Response.json({ status: "error", error: { code: "IMAGE_STORAGE_NOT_CONFIGURED", message: "画像保存先がまだ設定されていません。", retryable: true }, ...obs }, { status: 503 }) } as const;
  }

  return { workspaceId, userId, customerId, key, reference, bucket, obs } as const;
}

export async function GET(request: Request) {
  const resolved = await resolveMediaRequest(request);
  if ("response" in resolved) return resolved.response;

  const object = await resolved.bucket.get(resolved.key);
  if (!object) {
    return Response.json({ status: "error", error: { code: "MEDIA_NOT_FOUND", message: "画像が見つかりません。", retryable: false }, ...resolved.obs }, { status: 404 });
  }

  return new Response(object.body, {
    status: 200,
    headers: {
      "content-type": object.httpMetadata?.contentType ?? "application/octet-stream",
      "cache-control": "private, max-age=60",
      "x-velvet-media-key": resolved.key,
      "x-request-id": resolved.obs.requestId,
      "x-trace-id": resolved.obs.traceId,
      "x-correlation-id": resolved.obs.correlationId,
    },
  });
}

export async function DELETE(request: Request) {
  const resolved = await resolveMediaRequest(request);
  if ("response" in resolved) return resolved.response;

  await resolved.bucket.delete(resolved.key);
  await deleteProfessionalTimelineItem(resolved.workspaceId, resolved.userId, resolved.customerId, resolved.reference.id);

  return Response.json({
    status: "success",
    deleted: true,
    media: { key: resolved.key, customerId: resolved.customerId, timelineId: resolved.reference.id },
    eventName: "velvet.media.deleted.v1",
    ...resolved.obs,
  });
}
