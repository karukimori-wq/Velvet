export type AiPlatformStatus = {
  configured: boolean;
  endpoint?: string;
  contractReady: boolean;
};

export type CaptureCandidate = {
  type: "knowledge" | "schedule" | "gift" | "unknown";
  value: string;
};

export function getAiPlatformStatus(): AiPlatformStatus {
  const endpoint = process.env.AI_PLATFORM_CORE_URL?.trim();
  return {
    configured: Boolean(endpoint),
    endpoint: endpoint || undefined,
    // Current shared API catalog does not yet define a synchronous
    // Velvet Capture.Structure/Search.Parse contract.
    contractReady: false,
  };
}

/**
 * Safe local fallback used until the shared contract gains a synchronous
 * structured-result capability. It never mutates canonical data.
 */
export function organizeCaptureLocally(raw: string): CaptureCandidate[] {
  const values = raw
    .split(/[、,\n]/)
    .map((value) => value.trim())
    .filter(Boolean);

  return values.map((value) => {
    if (/誕生日|来週|来月|明日|予定|出張/.test(value)) {
      return { type: "schedule", value };
    }
    if (/もらった|貰った|あげた|プレゼント|お土産/.test(value)) {
      return { type: "gift", value };
    }
    return { type: "knowledge", value };
  });
}
