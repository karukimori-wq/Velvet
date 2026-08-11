import { getRequestIdentity } from "@/lib/auth/request-identity";
import { getPlanAccess } from "@/lib/plan-access";

export async function GET() {
  const { ownerUserId } = await getRequestIdentity();
  const access = await getPlanAccess(ownerUserId);
  return Response.json({
    appName: "velvet",
    domain: "plan-access",
    status: "success",
    plan: access.plan,
    fullHistory: access.fullHistory,
    imagesAllowed: access.imagesAllowed,
    historyCutoff: access.historyCutoff?.toISOString() ?? null,
  });
}
