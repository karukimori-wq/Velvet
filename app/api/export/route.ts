import { getRequestIdentity } from "@/lib/auth/request-identity";
import { exportVelvetData } from "@/lib/import-export";
import { getPlanAccess,hasVelvetFeature } from "@/lib/plan-access";

export async function GET() {
  const { workspaceId, userId, ownerUserId } = await getRequestIdentity();
  const access=await getPlanAccess(ownerUserId);
  if(!hasVelvetFeature(access,"export.data"))return Response.json({status:"error",error:{code:"PRO_REQUIRED",message:"Data export is available on Pro."},plan:access.plan},{status:403});
  return Response.json(await exportVelvetData(workspaceId, userId), {
    headers: { "Content-Disposition": "attachment; filename=velvet-professional-memory-export.json" },
  });
}
