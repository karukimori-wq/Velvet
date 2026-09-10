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

function matchesImageSignature(bytes: Uint8Array, mimeType: string) {
  if (mimeType === "image/png") return bytes.length >= 8 && [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every((value, index) => bytes[index] === value);
  if (mimeType === "image/jpeg") return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (mimeType === "image/gif") {
    const header = String.fromCharCode(...bytes.slice(0, 6));
    return header === "GIF87a" || header === "GIF89a";
  }
  if (mimeType === "image/webp") {
    const riff = String.fromCharCode(...bytes.slice(0, 4));
    const webp = String.fromCharCode(...bytes.slice(8, 12));
    return bytes.length >= 12 && riff === "RIFF" && webp === "WEBP";
  }
  return false;
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

  const buffer = await file.arrayBuffer();
  if (!matchesImageSignature(new Uint8Array(buffer), file.type)) {
    return Response.json({ status: "error", error: { code: "IMAGE_CONTENT_MISMATCH", message: "画像の内容とファイル形式が一致しません。", retryable: false }, ...obs }, { status: 415 });
  }

  const bucket = await getMediaBucket();
  if (!bucket) return Response.json({ status: "error", error: { code: "IMAGE_STORAGE_NOT_CONFIGURED", message: "画像保存先がまだ設定されていません。", retryable: true }, ...obs }, { status: 503 });

  const key = makeMediaKey({ workspaceId, userId, customerId: normalizedCustomerId, fileName: file.name });
  await bucket.put(key, buffer, {
    httpMetadata: { contentType: file.type },
    customMetadata: { workspaceId, userId, customerId: normalizedCustomerId, originalName: file.name.slice(0, 200) },
  });

  let timeline;
  try {
    timeline = await addProfessionalTimelineItem({
      workspaceId,
      userId,
      customerId: normalizedCustomerId,
      eventType: "media",
      title: "画像を保存",
      body: `${file.type} / ${Math.ceil(file.size / 1024)}KB`,
      sourceRef: `r2:${key}`,
    });
  } catch {
    let cleanupSucceeded = true;
    try {
      await bucket.delete(key);
    } catch {
      cleanupSucceeded = false;
    }
    return Response.json({
      status: "error",
      error: { code: "MEDIA_REGISTRATION_FAILED", message: "画像の顧客記録への登録に失敗しました。", retryable: cleanupSucceeded },
      ...obs,
    }, { status: 500 });
  }

  return Response.json({
    status: "success",
    media: { key, contentType: file.type, size: file.size, customerId: normalizedCustomerId, timelineId: timeline.id },
    eventName: "velvet.media.uploaded.v1",
    ...obs,
  }, { status: 201 });
}
