import { createTraceContext, traceHeaders, type TraceContext } from "@/lib/observability";

export type AiUsageStatus = {
  configured: boolean;
  sourceOfTruth: "ai-platform-core";
  connected: boolean;
  usageCount?: number;
  totalTokens?: number;
  totalCost?: number;
  pointBalanceAvailable: false;
  message: string;
  trace?: TraceContext;
};

function usageEndpoint() {
  const base = process.env.AI_PLATFORM_CORE_URL?.trim().replace(/\/$/, "");
  if (!base) return undefined;
  const path = process.env.AI_PLATFORM_CORE_USAGE_PATH?.trim() || "/v1/analytics/usage";
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export async function getAiUsageStatus(ownerUserId?: string): Promise<AiUsageStatus> {
  const endpoint = usageEndpoint();
  const client = process.env.AI_PLATFORM_CORE_CLIENT_ID?.trim();
  if (!endpoint || !client) {
    return {
      configured: false,
      sourceOfTruth: "ai-platform-core",
      connected: false,
      pointBalanceAvailable: false,
      message: "AI usage source of truth is not connected yet.",
    };
  }

  const trace = createTraceContext();
  try {
    const url = new URL(endpoint);
    url.searchParams.set("client", client);
    url.searchParams.set("period", "month");
    if (ownerUserId) url.searchParams.set("userId", ownerUserId);

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
        pointBalanceAvailable: false,
        message: `AI usage endpoint returned ${response.status}.`,
        trace,
      };
    }

    const payload = await response.json() as {
      ok?: boolean;
      summary?: { usageCount?: number; totalTokens?: number; totalCost?: number };
    };
    const summary = payload.summary;
    if (!payload.ok || !summary) {
      return {
        configured: true,
        sourceOfTruth: "ai-platform-core",
        connected: false,
        pointBalanceAvailable: false,
        message: "Usage endpoint responded with an unexpected shape.",
        trace,
      };
    }

    return {
      configured: true,
      sourceOfTruth: "ai-platform-core",
      connected: true,
      usageCount: typeof summary.usageCount === "number" ? summary.usageCount : 0,
      totalTokens: typeof summary.totalTokens === "number" ? summary.totalTokens : 0,
      totalCost: typeof summary.totalCost === "number" ? summary.totalCost : 0,
      pointBalanceAvailable: false,
      message: "AI usage loaded from AI Platform Core. Point balance is a separate future billing capability.",
      trace,
    };
  } catch {
    return {
      configured: true,
      sourceOfTruth: "ai-platform-core",
      connected: false,
      pointBalanceAvailable: false,
      message: "AI usage endpoint could not be reached.",
      trace,
    };
  }
}
