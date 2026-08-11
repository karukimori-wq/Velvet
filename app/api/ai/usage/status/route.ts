import { getAiUsageStatus } from "@/lib/ai-usage";
import { getCurrentOwnerUserId } from "@/lib/current-owner";

export async function GET() {
  const usage = await getAiUsageStatus(getCurrentOwnerUserId());
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
