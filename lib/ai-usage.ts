import { createTraceContext, traceHeaders, type TraceContext } from "@/lib/observability";

export type AiUsageStatus = {
  configured: boolean;
  sourceOfTruth: "ai-platform-core";
  connected: boolean;
  balance?: number;
  unit?: "points";
  message: string;
  trace?: TraceContext;
};

export async function getAiUsageStatus(ownerUserId?: string): Promise<AiUsageStatus> {
  const endpoint = process.env.AI_PLATFORM_CORE_USAGE_URL?.trim();
  if (!endpoint) {
    return {
      configured: false,
      sourceOfTruth: "ai-platform-core",
      connected: false,
      message: "AI usage source of truth is not connected yet.",
    };
  }

  const trace = createTraceContext();
  try {
    const url = new URL(endpoint);
    url.searchParams.set("sourceApp", "velvet");
    if (ownerUserId) url.searchParams.set("ownerUserId", ownerUserId);

    const response = await fetch(url, {
      method: "GET",
      headers: traceHeaders(trace),
      cache: "no-store",
    });
    if (!response.ok) {
      return {
        configured: true,
        sourceOfTruth: "ai-platform-core",
        connected: false,
        message: `AI usage endpoint returned ${response.status}.`,
        trace,
      };
    }

    const payload = await response.json() as {
      balance?: number;
      pointsBalance?: number;
      unit?: string;
      status?: string;
    };
    const balance = typeof payload.balance === "number"
      ? payload.balance
      : typeof payload.pointsBalance === "number"
        ? payload.pointsBalance
        : undefined;

    if (typeof balance !== "number") {
      return {
        configured: true,
        sourceOfTruth: "ai-platform-core",
        connected: false,
        message: "Usage endpoint responded, but no verified point balance was returned.",
        trace,
      };
    }

    return {
      configured: true,
      sourceOfTruth: "ai-platform-core",
      connected: true,
      balance,
      unit: "points",
      message: "AI point balance loaded from AI Platform Core.",
      trace,
    };
  } catch {
    return {
      configured: true,
      sourceOfTruth: "ai-platform-core",
      connected: false,
      message: "AI usage endpoint could not be reached.",
      trace,
    };
  }
}
