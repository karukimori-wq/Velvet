import { getPlanAccess } from "@/lib/plan-access";
import { getMediaBucket } from "@/lib/storage/r2";

export type MediaAccessStatus = {
  allowed: boolean;
  configured: boolean;
  errorCode: null | "PRO_REQUIRED" | "IMAGE_STORAGE_NOT_CONFIGURED";
};

export async function getMediaAccess(ownerUserId: string): Promise<MediaAccessStatus> {
  const access = await getPlanAccess(ownerUserId);
  if (!access.imagesAllowed) return { allowed: false, configured: false, errorCode: "PRO_REQUIRED" };

  const bucket = await getMediaBucket();
  const configured = Boolean(bucket);
  return {
    allowed: configured,
    configured,
    errorCode: configured ? null : "IMAGE_STORAGE_NOT_CONFIGURED",
  };
}
