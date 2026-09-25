"use server";

import { redirect } from "next/navigation";
import { getRequestIdentity } from "@/lib/auth/request-identity";
import { createCapture } from "@/lib/capture-repository";
import { INPUT_LIMITS } from "@/lib/input-limits";
import { createNextAction } from "@/lib/professional-next-action-repository";
import { createConversationEpisode, type ConversationEpisodeState } from "@/lib/conversation-episode-repository";
import { upsertOngoingTopicFromEpisode } from "@/lib/ongoing-topic-repository";

export type CaptureOrganizeState = { error?: "empty" | "too_long" | "save_failed" };

export async function organizeCaptureAction(
  customerId: string | undefined,
  fromVisit: string | undefined,
  _previousState: CaptureOrganizeState,
  formData: FormData,
): Promise<CaptureOrganizeState> {
  const { workspaceId, userId } = await getRequestIdentity();
  const value = String(formData.get("value") ?? "").trim();
  const structuredRemember = String(formData.get("structuredRemember") ?? "[]");

  if (!value) return { error: "empty" };
  if (value.length > INPUT_LIMITS.capture) return { error: "too_long" };

  let structured: Array<{ sectionId: string; topicId: string; label: string; content: string }> = [];
  try { const parsed = JSON.parse(structuredRemember); if (Array.isArray(parsed)) structured = parsed.filter(item => item && typeof item.sectionId === "string" && typeof item.topicId === "string" && typeof item.label === "string" && typeof item.content === "string"); } catch { structured = []; }

  let raw;
  try {
    raw = await createCapture({
      workspaceId,
      userId,
      customerId,
      kind: customerId ? "conversation_note" : "free_text",
      value,
    });
  } catch {
    return { error: "save_failed" };
  }
  if (!raw) return { error: "save_failed" };

  if (customerId) {
    const conversationItems = structured.filter(item => item.sectionId === "conversation" && !item.topicId.startsWith("conversation.status."));
    const stateItem = structured.find(item => item.sectionId === "conversation" && item.topicId.startsWith("conversation.status."));
    const stateByTopic: Record<string,ConversationEpisodeState> = {"conversation.status.new":"new","conversation.status.continued":"continued","conversation.status.changed":"changed","conversation.status.done":"done"};
    const episodeState = stateItem ? stateByTopic[stateItem.topicId] ?? "new" : "new";
    for (const item of conversationItems) {
      try { const episode=await createConversationEpisode({workspaceId,userId,customerId,visitId:fromVisit,captureId:raw.id,topicId:item.topicId,label:item.label,content:item.content,state:episodeState,occurredAt:raw.createdAt}); if(episode) await upsertOngoingTopicFromEpisode(episode); } catch { return { error: "save_failed" }; }
    }
    const nextActions = structured.filter(item => item.sectionId === "next_action" && !item.topicId.startsWith("action.meta."));
    const conversationTopicIds = [...new Set(conversationItems.map(item => item.topicId))];
    const timing = structured.some(item => item.topicId === "action.meta.next_visit") ? "next_visit" as const : structured.some(item => item.topicId === "action.meta.date" || item.topicId === "action.meta.deadline") ? "date" as const : undefined;
    const dueValue = structured.find(item => item.topicId === "action.meta.date" || item.topicId === "action.meta.deadline")?.content;
    const dueAt = dueValue && /^\\d{4}-\\d{2}-\\d{2}$/.test(dueValue) ? new Date(`${dueValue}T09:00:00+09:00`).toISOString() : undefined;
    const priorityValue = structured.find(item => item.topicId === "action.meta.priority")?.content;
    const priority = priorityValue === "高" ? "high" as const : priorityValue === "低" ? "low" as const : priorityValue === "中" ? "normal" as const : undefined;
    for (const item of nextActions) {
      const actionType = item.topicId.startsWith("action.") ? item.topicId.split(".").slice(0, 2).join(".") : "action.follow_up";
      const sourceTopicId = conversationTopicIds.includes(item.topicId) ? item.topicId : conversationTopicIds.length === 1 ? conversationTopicIds[0] : undefined;
      try { await createNextAction(workspaceId, userId, customerId, item.content, dueAt, { actionType, topicId: item.topicId, timing, priority, sourceCaptureId: raw.id, sourceTopicId }); } catch { return { error: "save_failed" }; }
    }
  }

  const organizeParams = new URLSearchParams();
  if (customerId) organizeParams.set("customerId", customerId);
  if (fromVisit) organizeParams.set("fromVisit", fromVisit);
  organizeParams.set("saved", "今日の内容を保存しました");
  const query = organizeParams.toString();
  redirect(`/capture?${query ? `?${query}` : ""}`);
}
