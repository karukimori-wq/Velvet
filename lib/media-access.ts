import { getPlanAccess } from "@/lib/plan-access";

export type MediaAccessStatus = {
  allowed: boolean;
  configured: boolean;
  errorCode: null | "PRO_REQUIRED" | "IMAGE_STORAGE_NOT_CONFIGURED";
};

export async function getMediaAccess(ownerUserId: string): Promise<MediaAccessStatus> {
  const access = await getPlanAccess(ownerUserId);
  if (!access.imagesAllowed) return { allowed: false, configured: false, errorCode: "PRO_REQUIRED" };

  // Storage provider remains intentionally abstract until a provider is selected.
  // Do not pretend image upload works simply because the user is Pro.
  const configured = Boolean(process.env.VELVET_IMAGE_STORAGE_PROVIDER?.trim());
  return {
    allowed: configured,
    configured,
    errorCode: configured ? null : "IMAGE_STORAGE_NOT_CONFIGURED",
  };
}
