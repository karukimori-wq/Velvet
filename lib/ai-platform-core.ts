import { createTraceContext, traceHeaders, type TraceContext } from "@/lib/observability";

export type AiPlatformStatus = {
  configured: boolean;
  endpoint?: string;
  contractReady: boolean;
  capturePathConfigured: boolean;
  searchPathConfigured: boolean;
};

export type CaptureCandidate = {
  type: "knowledge" | "schedule" | "gift" | "unknown";
  value: string;
};

export type StructuredCaptureResult = {
  status: "success" | "warning";
  mode: "ai" | "local";
  candidates: CaptureCandidate[];
  trace: TraceContext;
  errorCode?: string;
};

export type SearchIntentResult = {
  status: "success" | "warning";
  mode: "ai" | "local";
  terms: string[];
  trace: TraceContext;
  errorCode?: string;
};

function baseUrl() {
  return process.env.AI_PLATFORM_CORE_URL?.trim().replace(/\/$/, "");
}

export function getAiPlatformStatus(): AiPlatformStatus {
  const endpoint = baseUrl();
  return {
    configured: Boolean(endpoint),
    endpoint: endpoint || undefined,
    contractReady: true,
    capturePathConfigured: Boolean(process.env.AI_PLATFORM_CORE_CAPTURE_PATH?.trim()),
    searchPathConfigured: Boolean(process.env.AI_PLATFORM_CORE_SEARCH_PATH?.trim()),
  };
}

function endpointFor(pathValue?: string) {
  const base = baseUrl();
  const path = pathValue?.trim();
  if (!base || !path) return undefined;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

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

function localSearchTerms(raw: string) {
  return Array.from(new Set(
    raw
      .normalize("NFKC")
      .replace(/[、。,.!?！？/・]/g, " ")
      .split(/\s+|好き|で|の|人|客|お客様|探して|教えて/)
      .map((value) => value.trim())
      .filter((value) => value.length > 0),
  ));
}

export async function structureCapture(raw: string, traceSeed?: Partial<TraceContext>): Promise<StructuredCaptureResult> {
  const trace = createTraceContext(traceSeed);
  const endpoint = endpointFor(process.env.AI_PLATFORM_CORE_CAPTURE_PATH);
  if (!endpoint) {
    return { status: "warning", mode: "local", candidates: organizeCaptureLocally(raw), trace, errorCode: "AI_CAPABILITY_NOT_CONFIGURED" };
  }

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...traceHeaders(trace) },
      body: JSON.stringify({
        operation: "VelvetCapture.Structure",
        sourceApp: "velvet",
        rawText: raw,
        traceId: trace.traceId,
        correlationId: trace.correlationId,
        requestId: trace.requestId,
      }),
      cache: "no-store",
    });
    if (!response.ok) throw new Error(`AI Platform Core returned ${response.status}`);
    const payload = await response.json() as { candidates?: CaptureCandidate[] };
    if (!Array.isArray(payload.candidates)) throw new Error("Invalid structured capture response");
    return { status: "success", mode: "ai", candidates: payload.candidates, trace };
  } catch {
    return { status: "warning", mode: "local", candidates: organizeCaptureLocally(raw), trace, errorCode: "AI_UPSTREAM_FALLBACK" };
  }
}

export async function parseSearchIntent(raw: string, traceSeed?: Partial<TraceContext>): Promise<SearchIntentResult> {
  const trace = createTraceContext(traceSeed);
  const endpoint = endpointFor(process.env.AI_PLATFORM_CORE_SEARCH_PATH);
  if (!endpoint) {
    return { status: "warning", mode: "local", terms: localSearchTerms(raw), trace, errorCode: "AI_CAPABILITY_NOT_CONFIGURED" };
  }

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...traceHeaders(trace) },
      body: JSON.stringify({
        operation: "VelvetSearch.ParseIntent",
        sourceApp: "velvet",
        query: raw,
        traceId: trace.traceId,
        correlationId: trace.correlationId,
        requestId: trace.requestId,
      }),
      cache: "no-store",
    });
    if (!response.ok) throw new Error(`AI Platform Core returned ${response.status}`);
    const payload = await response.json() as { terms?: string[] };
    const terms = Array.isArray(payload.terms) ? payload.terms.map((value) => String(value).trim()).filter(Boolean) : [];
    if (terms.length === 0) throw new Error("Invalid search intent response");
    return { status: "success", mode: "ai", terms, trace };
  } catch {
    return { status: "warning", mode: "local", terms: localSearchTerms(raw), trace, errorCode: "AI_UPSTREAM_FALLBACK" };
  }
}
