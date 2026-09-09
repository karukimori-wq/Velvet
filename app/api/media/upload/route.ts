import { getRequestIdentity } from "@/lib/auth/request-identity";
import { getCustomerMemory } from "@/lib/customer-memory-repository";
import { getMediaAccess } from "@/lib/media-access";
import { addProfessionalTimelineItem } from "@/lib/professional-timeline-repository";
import { getMediaBucket, makeMediaKey } from "@/lib/storage/r2";

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

function observability(request: Request) {
  const traceId = request.headers.get("x-trace-id") ?? crypto.randomUUID();
  return {
    traceId,
    correlationId: request.headers.get("x-correlation-id") ?? traceId,
    requestId: request.headers.get("x-request-id") ?? crypto.randomUUID(),
  };
}

export async function POST(request: Request) {
  const { workspaceId, userId, ownerUserId } = await getRequestIdentity();
  const obs = observability(request);
  const media = await getMediaAccess(ownerUserId);

  if (!media.allowed) {
    const isPlan = media.errorCode === "PRO_REQUIRED";
    return Response.json({
      status: "error",
      error: {
        code: media.errorCode,
        message: isPlan ? "画像機能はProプランで利用できます。" : "画像保存先がまだ設定されていません。",
        retryable: !isPlan,
      },
      ...obs,
    }, { status: isPlan ? 403 : 503 });
  }

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  const customerId = form?.get("customerId");
  const normalizedCustomerId = typeof customerId === "string" ? customerId.trim() : "";
  if (!(file instanceof File) || !normalizedCustomerId) {
    return Response.json({ status: "error", error: { code: "INVALID_MEDIA_REQUEST", message: "file と customerId が必要です。", retryable: false }, ...obs }, { status: 400 });
  }

  const memory = await getCustomerMemory(workspaceId, userId, normalizedCustomerId);
  if (!memory) {
    return Response.json({
      status: "error",
      error: {
        code: "CUSTOMER_REFERENCE_NOT_FOUND",
        message: "この顧客は現在のworkspace/userに紐づくVelvet記録として確認できません。先に顧客メモリを作成してください。",
        retryable: false,
      },
      ...obs,
    }, { status: 404 });
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return Response.json({ status: "error", error: { code: "UNSUPPORTED_IMAGE_TYPE", message: "JPEG、PNG、WebP、GIFのみ保存できます。", retryable: false }, ...obs }, { status: 415 });
  }
  if (file.size <= 0 || file.size > MAX_IMAGE_BYTES) {
    return Response.json({ status: "error", error: { code: "IMAGE_TOO_LARGE", message: "画像は10MB以下にしてください。", retryable: false }, ...obs }, { status: 413 });
  }

  const bucket = await getMediaBucket();
  if (!bucket) return Response.json({ status: "error", error: { code: "IMAGE_STORAGE_NOT_CONFIGURED", message: "画像保存先がまだ設定されていません。", retryable: true }, ...obs }, { status: 503 });

  const key = makeMediaKey({ workspaceId, userId, customerId: normalizedCustomerId, fileName: file.name });
  await bucket.put(key, await file.arrayBuffer(), {
    httpMetadata: { contentType: file.type },
    customMetadata: { workspaceId, userId, customerId: normalizedCustomerId, originalName: file.name.slice(0, 200) },
  });

  const timeline = await addProfessionalTimelineItem({
    workspaceId,
    userId,
    customerId: normalizedCustomerId,
    eventType: "media",
    title: "画像を保存",
    body: `${file.type} / ${Math.ceil(file.size / 1024)}KB`,
    sourceRef: `r2:${key}`,
  });

  return Response.json({
    status: "success",
    media: { key, contentType: file.type, size: file.size, customerId: normalizedCustomerId, timelineId: timeline.id },
    eventName: "velvet.media.uploaded.v1",
    ...obs,
  }, { status: 201 });
}
