import { getRequestIdentity } from "@/lib/auth/request-identity";
import { getMediaAccess } from "@/lib/media-access";
import { getMediaBucket, makeMediaKey } from "@/lib/storage/r2";

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function POST(request: Request) {
  const { workspaceId, userId, ownerUserId } = await getRequestIdentity();
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
    }, { status: isPlan ? 403 : 503 });
  }

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  const customerId = form?.get("customerId");
  if (!(file instanceof File) || typeof customerId !== "string" || !customerId.trim()) {
    return Response.json({ status: "error", error: { code: "INVALID_MEDIA_REQUEST", message: "file と customerId が必要です。", retryable: false } }, { status: 400 });
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return Response.json({ status: "error", error: { code: "UNSUPPORTED_IMAGE_TYPE", message: "JPEG、PNG、WebP、GIFのみ保存できます。", retryable: false } }, { status: 415 });
  }
  if (file.size <= 0 || file.size > MAX_IMAGE_BYTES) {
    return Response.json({ status: "error", error: { code: "IMAGE_TOO_LARGE", message: "画像は10MB以下にしてください。", retryable: false } }, { status: 413 });
  }

  const bucket = await getMediaBucket();
  if (!bucket) return Response.json({ status: "error", error: { code: "IMAGE_STORAGE_NOT_CONFIGURED", message: "画像保存先がまだ設定されていません。", retryable: true } }, { status: 503 });

  const key = makeMediaKey({ workspaceId, userId, customerId: customerId.trim(), fileName: file.name });
  await bucket.put(key, await file.arrayBuffer(), {
    httpMetadata: { contentType: file.type },
    customMetadata: { workspaceId, userId, customerId: customerId.trim(), originalName: file.name.slice(0, 200) },
  });

  return Response.json({ status: "success", media: { key, contentType: file.type, size: file.size, customerId: customerId.trim() }, eventName: "velvet.media.uploaded.v1" }, { status: 201 });
}
