import { getRequestIdentity } from "@/lib/auth/request-identity";
import { getMediaAccess } from "@/lib/media-access";
import { getMediaBucket } from "@/lib/storage/r2";

function observability(request: Request) {
  const traceId = request.headers.get("x-trace-id") ?? crypto.randomUUID();
  return {
    traceId,
    correlationId: request.headers.get("x-correlation-id") ?? traceId,
    requestId: request.headers.get("x-request-id") ?? crypto.randomUUID(),
  };
}

function belongsToCurrentScope(key: string, input: { workspaceId: string; userId: string; customerId?: string }) {
  const base = `velvet/${encodeURIComponent(input.workspaceId)}/${encodeURIComponent(input.userId)}/`;
  if (!key.startsWith(base)) return false;
  if (!input.customerId) return true;
  return key.startsWith(`${base}${encodeURIComponent(input.customerId)}/`);
}

export async function GET(request: Request) {
  const { workspaceId, userId, ownerUserId } = await getRequestIdentity();
  const obs = observability(request);
  const url = new URL(request.url);
  const key = url.searchParams.get("key")?.trim() ?? "";
  const customerId = url.searchParams.get("customerId")?.trim() || undefined;
  if (!key) {
    return Response.json({ status: "error", error: { code: "MEDIA_KEY_REQUIRED", message: "key is required", retryable: false }, ...obs }, { status: 400 });
  }

  const media = await getMediaAccess(ownerUserId);
  if (!media.allowed) {
    const isPlan = media.errorCode === "PRO_REQUIRED";
    return Response.json({
      status: "error",
      error: { code: media.errorCode, message: isPlan ? "画像機能はProプランで利用できます。" : "画像保存先がまだ設定されていません。", retryable: !isPlan },
      ...obs,
    }, { status: isPlan ? 403 : 503 });
  }

  if (!belongsToCurrentScope(key, { workspaceId, userId, customerId })) {
    return Response.json({ status: "error", error: { code: "MEDIA_SCOPE_FORBIDDEN", message: "この画像は現在のworkspace/user/customerに紐づいていません。", retryable: false }, ...obs }, { status: 403 });
  }

  const bucket = await getMediaBucket();
  if (!bucket) {
    return Response.json({ status: "error", error: { code: "IMAGE_STORAGE_NOT_CONFIGURED", message: "画像保存先がまだ設定されていません。", retryable: true }, ...obs }, { status: 503 });
  }

  const object = await bucket.get(key);
  if (!object) {
    return Response.json({ status: "error", error: { code: "MEDIA_NOT_FOUND", message: "画像が見つかりません。", retryable: false }, ...obs }, { status: 404 });
  }

  return new Response(object.body, {
    status: 200,
    headers: {
      "content-type": object.httpMetadata?.contentType ?? "application/octet-stream",
      "cache-control": "private, max-age=60",
      "x-velvet-media-key": key,
      "x-request-id": obs.requestId,
      "x-trace-id": obs.traceId,
      "x-correlation-id": obs.correlationId,
    },
  });
}
