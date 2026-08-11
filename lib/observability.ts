export type TraceContext = {
  traceId: string;
  correlationId: string;
  requestId: string;
};

function makeId(prefix: string) {
  return `${prefix}_${crypto.randomUUID()}`;
}

export function createTraceContext(seed?: Partial<TraceContext>): TraceContext {
  const traceId = seed?.traceId || makeId("trace");
  return {
    traceId,
    correlationId: seed?.correlationId || traceId,
    requestId: seed?.requestId || makeId("req"),
  };
}

export function traceHeaders(context: TraceContext) {
  return {
    "X-Trace-Id": context.traceId,
    "X-Correlation-Id": context.correlationId,
    "X-Request-Id": context.requestId,
    "X-Source-App": "velvet",
  };
}
