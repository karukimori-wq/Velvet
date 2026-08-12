"use server";

import { redirect } from "next/navigation";
import { getRequestIdentity } from "@/lib/auth/request-identity";
import { generateMessageDraft, type MessageDraftChannel } from "@/lib/message-draft";

export async function requestMessageDraftAction(customerId: string, formData: FormData) {
  const identity = await getRequestIdentity();
  const channelRaw = String(formData.get("channel") ?? "line");
  const channel = (["line", "instagram", "email", "sms", "other"] as const).includes(channelRaw as MessageDraftChannel)
    ? channelRaw as MessageDraftChannel
    : "other";
  const purpose = String(formData.get("purpose") ?? "follow_up").trim() || "follow_up";
  const tone = String(formData.get("tone") ?? "natural").trim() || "natural";
  const cta = String(formData.get("cta") ?? "").trim();

  const result = await generateMessageDraft({
    workspaceId: identity.workspaceId,
    userId: identity.userId,
    channel,
    purpose,
    audienceSegment: "individual_customer",
    tone,
    cta,
    inputRef: `velvet:customer:${customerId}`,
  });

  const params = new URLSearchParams({
    status: result.status,
    channel,
    purpose,
  });
  if (result.messageDraftId) params.set("messageDraftId", result.messageDraftId);
  if (result.messageDraftStatus) params.set("messageDraftStatus", result.messageDraftStatus);
  if (result.eventName) params.set("eventName", result.eventName);
  if (result.traceId) params.set("traceId", result.traceId);
  if (result.draftText) params.set("draftText", result.draftText);
  if (result.errorCode) params.set("errorCode", result.errorCode);
  redirect(`/people/${customerId}/message?${params.toString()}`);
}
