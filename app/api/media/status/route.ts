import { getRequestIdentity } from "@/lib/auth/request-identity";
import { getMediaAccess } from "@/lib/media-access";
import { getPlanAccess } from "@/lib/plan-access";

export async function GET() {
  const { ownerUserId } = await getRequestIdentity();
  const [access, media] = await Promise.all([getPlanAccess(ownerUserId), getMediaAccess(ownerUserId)]);
  return Response.json({
    appName: "velvet",
    domain: "media-access",
    status: media.allowed ? "success" : "warning",
    plan: access.plan,
    imagesAllowedByPlan: access.imagesAllowed,
    storageConfigured: media.configured,
    uploadReady: media.allowed,
    retrievalReady: media.allowed,
    uploadEndpoint: "POST /api/media/upload",
    retrievalEndpoint: "GET /api/media/object?key={r2Key}&customerId={customerId}",
    ownershipBoundary: "workspaceId+userId+customerId",
    error: media.errorCode ? { code: media.errorCode, retryable: media.errorCode === "IMAGE_STORAGE_NOT_CONFIGURED" } : null,
  });
}
