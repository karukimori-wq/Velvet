import { getBillingReadiness } from "@/lib/billing-readiness";
import { getRequestIdentity } from "@/lib/auth/request-identity";
import { getPlanAccess } from "@/lib/plan-access";

export async function GET() {
  const { ownerUserId } = await getRequestIdentity();
  const [billing, access] = await Promise.all([Promise.resolve(getBillingReadiness()), getPlanAccess(ownerUserId)]);
  return Response.json({
    appName: "velvet",
    domain: "billing-readiness",
    ...billing,
    currentPlan: access.plan,
  });
}
