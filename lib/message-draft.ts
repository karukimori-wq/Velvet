import { createTraceContext, traceHeaders, type TraceContext } from "@/lib/observability";

export type MessageDraftChannel = "line" | "instagram" | "email" | "sms" | "other";

export type MessageDraftRequest = {
  workspaceId: string;
  userId: string;
  sourceApp: "velvet";
  targetStudio: "velvet";
  channel: MessageDraftChannel;
  purpose: string;
  audienceSegment: string;
  tone: string;
  cta: string;
  inputRef: string;
};

export type MessageDraftResponse = {
  status: "success" | "warning" | "error" | "skipped";
  messageDraftId?: string;
  messageDraftStatus?: string;
  channel?: string;
  purpose?: string;
  eventName?: string;
  traceId?: string;
  correlationId?: string;
  requestId?: string;
  draftText?: string;
  errorCode?: string;
};

export function getMessageDraftStatus() {
  const baseUrl = process.env.SNS_PLANNER_BASE_URL?.trim().replace(/\/$/, "");
  return {
    configured: Boolean(baseUrl),
    endpoint: baseUrl ? `${baseUrl}/api/message-drafts` : undefined,
    operation: "MessageDraft.Generate",
    sourceApp: "velvet",
    targetStudio: "velvet",
  };
}

export async function generateMessageDraft(
  input: Omit<MessageDraftRequest, "sourceApp" | "targetStudio">,
  traceSeed?: Partial<TraceContext>,
): Promise<MessageDraftResponse> {
  const status = getMessageDraftStatus();
  const trace = createTraceContext(traceSeed);
  if (!status.endpoint) {
    return {
      status: "warning",
      errorCode: "MESSAGE_DRAFT_NOT_CONFIGURED",
      traceId: trace.traceId,
      correlationId: trace.correlationId,
      requestId: trace.requestId,
    };
  }

  const payload: MessageDraftRequest = {
    ...input,
    sourceApp: "velvet",
    targetStudio: "velvet",
  };

  const response = await fetch(status.endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...traceHeaders(trace),
    },
    cache: "no-store",
    body: JSON.stringify(payload),
  });

  const body = await response.json().catch(() => ({})) as Record<string, unknown>;
  if (!response.ok) {
    return {
      status: "error",
      errorCode: typeof body.errorCode === "string" ? body.errorCode : `SNS_PLANNER_${response.status}`,
      traceId: trace.traceId,
      correlationId: trace.correlationId,
      requestId: trace.requestId,
    };
  }

  const contractStatus = ["success", "warning", "error", "skipped"].includes(String(body.status))
    ? body.status as MessageDraftResponse["status"]
    : "warning";

  return {
    status: contractStatus,
    messageDraftId: typeof body.messageDraftId === "string" ? body.messageDraftId : undefined,
    messageDraftStatus: typeof body.messageDraftStatus === "string" ? body.messageDraftStatus : undefined,
    channel: typeof body.channel === "string" ? body.channel : undefined,
    purpose: typeof body.purpose === "string" ? body.purpose : undefined,
    eventName: typeof body.eventName === "string" ? body.eventName : undefined,
    traceId: typeof body.traceId === "string" ? body.traceId : trace.traceId,
    correlationId: typeof body.correlationId === "string" ? body.correlationId : trace.correlationId,
    requestId: typeof body.requestId === "string" ? body.requestId : trace.requestId,
    draftText: typeof body.draftText === "string" ? body.draftText : typeof body.text === "string" ? body.text : undefined,
  };
}
