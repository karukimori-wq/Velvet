import { getAiPlatformStatus } from "@/lib/ai-platform-core";

export async function GET() {
  const ai = getAiPlatformStatus();
  const capabilityPathsReady = ai.capturePathConfigured && ai.searchPathConfigured;
  const ready = ai.configured && ai.contractReady && capabilityPathsReady;

  return Response.json({
    appName: "velvet",
    domain: "ai-integration",
    status: ready ? "success" : "warning",
    configured: ai.configured,
    contractReady: ai.contractReady,
    endpointConfigured: Boolean(ai.endpoint),
    capturePathConfigured: ai.capturePathConfigured,
    searchPathConfigured: ai.searchPathConfigured,
    error: ready
      ? null
      : {
          code: !ai.configured ? "AI_PLATFORM_NOT_CONFIGURED" : !capabilityPathsReady ? "AI_CAPABILITY_PATH_NOT_CONFIGURED" : "AI_INTEGRATION_NOT_READY",
          message: !ai.configured
            ? "AI Platform Core endpoint is not configured."
            : !capabilityPathsReady
              ? "Velvet AI contracts are approved, but synchronous operation paths are not configured."
              : "Velvet AI integration is not ready.",
          retryable: false,
        },
  });
}
