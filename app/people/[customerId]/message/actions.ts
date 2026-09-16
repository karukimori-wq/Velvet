"use server";

import { getRequestIdentity } from "@/lib/auth/request-identity";
import { getPlanAccess } from "@/lib/plan-access";
import { generateMessageDraft, type MessageDraftChannel } from "@/lib/message-draft";

export type MessageDraftActionState = {
  status?: "success" | "warning" | "error" | "skipped";
  channel?: MessageDraftChannel;
  purpose?: string;
  draftText?: string;
  errorCode?: string;
};

export async function requestMessageDraftAction(customerId: string, _previousState: MessageDraftActionState, formData: FormData): Promise<MessageDraftActionState> {
  const identity = await getRequestIdentity();
  const access = await getPlanAccess(identity.ownerUserId);
  if (!access.messageDraftAllowed) return { status: "error", errorCode: "PRO_REQUIRED" };
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

  return {
    status: result.status,
    channel,
    purpose,
    draftText: result.draftText,
    errorCode: result.errorCode,
  };
}
