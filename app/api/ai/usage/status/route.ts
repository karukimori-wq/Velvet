import { getAiUsageStatus } from "@/lib/ai-usage";

export async function GET() {
  const usage = getAiUsageStatus();
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
