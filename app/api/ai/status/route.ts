import { getAiPlatformStatus } from "@/lib/ai-platform-core";

export async function GET() {
  const ai = getAiPlatformStatus();
  const ready = ai.configured && ai.contractReady && ai.clientConfigured;

  return Response.json({
    appName: "velvet",
    domain: "ai-integration",
    status: ready ? "success" : "warning",
    configured: ai.configured,
    contractReady: ai.contractReady,
    endpointConfigured: Boolean(ai.endpoint),
    clientConfigured: ai.clientConfigured,
    gatewayPath: ai.gatewayPath,
    error: ready
      ? null
      : {
          code: !ai.configured ? "AI_PLATFORM_NOT_CONFIGURED" : !ai.clientConfigured ? "AI_CLIENT_NOT_CONFIGURED" : "AI_INTEGRATION_NOT_READY",
          message: !ai.configured
            ? "AI Platform Core endpoint is not configured."
            : !ai.clientConfigured
              ? "AI Platform Core Client Manifest id is not configured."
              : "Velvet AI integration is not ready.",
          retryable: false,
        },
  });
}
