import { getRequestIdentity } from "@/lib/auth/request-identity";
import { getMediaAccess } from "@/lib/media-access";

export async function POST() {
  const { ownerUserId } = await getRequestIdentity();
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

  // Storage provider adapter is intentionally required before accepting bytes.
  // This endpoint must never accept/discard files silently.
  return Response.json({
    status: "error",
    error: {
      code: "IMAGE_STORAGE_ADAPTER_NOT_IMPLEMENTED",
      message: "画像保存adapterの実装が必要です。",
      retryable: false,
    },
  }, { status: 501 });
}
