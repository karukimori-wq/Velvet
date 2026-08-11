export type AiUsageStatus = {
  configured: boolean;
  sourceOfTruth: "ai-platform-core";
  connected: boolean;
  balance?: number;
  unit?: "points";
  message: string;
};

export function getAiUsageStatus(): AiUsageStatus {
  const endpoint = process.env.AI_PLATFORM_CORE_USAGE_URL?.trim();
  if (!endpoint) {
    return {
      configured: false,
      sourceOfTruth: "ai-platform-core",
      connected: false,
      message: "AI usage source of truth is not connected yet.",
    };
  }

  // Do not invent or cache an authoritative balance here. The actual
  // balance must be fetched from AI Platform Core when the shared usage
  // contract is available and verified.
  return {
    configured: true,
    sourceOfTruth: "ai-platform-core",
    connected: false,
    message: "Usage endpoint is configured, but the verified balance contract is not active yet.",
  };
}
