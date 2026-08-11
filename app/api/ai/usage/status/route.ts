import { getAiUsageStatus } from "@/lib/ai-usage";
import { getRequestIdentity } from "@/lib/auth/request-identity";

export async function GET() {
  const { ownerUserId } = await getRequestIdentity();
  const usage = await getAiUsageStatus(ownerUserId);
  return Response.json({
    appName: "velvet",
    domain: "ai-usage",
    status: usage.connected ? "success" : "warning",
    ...usage,
    error: usage.connected ? null : {
      code: "AI_USAGE_NOT_CONNECTED",
      message: usage.message,
      retryable: false,
    },
  });
}
