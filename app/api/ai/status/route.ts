import { getAiPlatformStatus } from "@/lib/ai-platform-core";

export async function GET() {
  const ai = getAiPlatformStatus();
  const ready = ai.configured && ai.contractReady;

  return Response.json({
    appName: "velvet",
    domain: "ai-integration",
    status: ready ? "success" : "warning",
    configured: ai.configured,
    contractReady: ai.contractReady,
    endpointConfigured: Boolean(ai.endpoint),
    error: ready
      ? null
      : {
          code: ai.configured ? "CONTRACT_NOT_READY" : "AI_PLATFORM_NOT_CONFIGURED",
          message: ai.configured
            ? "Shared synchronous Velvet AI capability contract is not yet approved."
            : "AI Platform Core endpoint is not configured.",
          retryable: false,
        },
  });
}
