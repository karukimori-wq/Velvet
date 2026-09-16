"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCapture } from "@/lib/capture-repository";
import { getRequestIdentity } from "@/lib/auth/request-identity";
import { getPlanAccess, isWithinHistoryWindow } from "@/lib/plan-access";
import { getCustomerMemory, upsertCustomerMemory } from "@/lib/customer-memory-repository";
import { recordDictionaryUse } from "@/lib/capture-dictionary-repository";
import { createScheduleEntry } from "@/lib/schedule-repository";
import { createGift, type GiftDirection } from "@/lib/gift-repository";
import { mergeNextTopics } from "@/lib/next-topic";
import { describeMemoryTagChanges, mergeMemoryTags } from "@/lib/memory-tag-policy";
import { addProfessionalTimelineItem } from "@/lib/professional-timeline-repository";
import { INPUT_LIMITS } from "@/lib/input-limits";

function invalidSelection(customerId: string | undefined, fromVisit: string | undefined) {
  const params = new URLSearchParams({ error: "invalid_selection" });
  if (customerId) params.set("customerId", customerId);
  if (fromVisit) params.set("fromVisit", fromVisit);
  redirect(`/capture?${params.toString()}`);
}

function values(formData: FormData, name: string) {
  return formData.getAll(name).map(String).map(value => value.trim()).filter(Boolean);
}

export async function confirmKnowledgeCandidatesAction(captureId: string, fromVisit: string | undefined, formData: FormData) {
  const { workspaceId, userId, ownerUserId } = await getRequestIdentity();
  const [capture, access] = await Promise.all([getCapture(captureId, workspaceId, userId), getPlanAccess(ownerUserId)]);
  if (!capture) redirect("/capture?error=missing");
  if (!isWithinHistoryWindow(capture.createdAt, access)) redirect("/plans?reason=history_window");

  const memoryTags = values(formData, "memoryTag");
  const selected = values(formData, "knowledge");
  const preferences = values(formData, "preference");
  const nextTopics = values(formData, "nextTopic");
  const scheduleValues = formData.getAll("scheduleValue").map(String).map(value => value.trim());
  const scheduleTimes = formData.getAll("scheduleStartsAt").map(String).map(value => value.trim());
  const giftCountRaw = Number(formData.get("giftCount") ?? 0);
  const giftCount = Number.isInteger(giftCountRaw) ? giftCountRaw : -1;
  const structured = [...selected, ...preferences, ...nextTopics];
  const invalid = memoryTags.length > INPUT_LIMITS.memoryTags || memoryTags.some(value => value.length > INPUT_LIMITS.memoryTag) || structured.length + memoryTags.length + scheduleValues.length + Math.max(giftCount, 0) > INPUT_LIMITS.structuredCandidates || structured.some(value => value.length > INPUT_LIMITS.structuredValue) || scheduleValues.length > INPUT_LIMITS.structuredCandidates || scheduleValues.some(value => value.length > INPUT_LIMITS.scheduleTitle) || scheduleTimes.length > INPUT_LIMITS.structuredCandidates || giftCount < 0 || giftCount > INPUT_LIMITS.structuredCandidates;
  if (invalid) invalidSelection(capture.customerId, fromVisit);
  for (let i = 0; i < giftCount; i += 1) {
    const item = String(formData.get(`giftValue-${i}`) ?? "").trim();
    if (item.length > INPUT_LIMITS.giftItem) invalidSelection(capture.customerId, fromVisit);
  }

  let memoryChangeCount = 0;
  if (capture.customerId) {
    const memory = await getCustomerMemory(workspaceId, userId, capture.customerId);
    const changes = describeMemoryTagChanges(memory?.tags ?? [], memoryTags);
    const structuredTags = mergeMemoryTags(memory?.tags ?? [], memoryTags);
    const tags = Array.from(new Set([...structuredTags, ...selected, ...preferences]));
    const existingPreferences = (memory?.preferenceNote ?? "").split("、").map(value => value.trim()).filter(Boolean);
    const mergedPreferences = Array.from(new Set([...existingPreferences, ...preferences]));
    const mergedNextTopics = mergeNextTopics(memory?.nextTopicHint, nextTopics);
    if (tags.length > INPUT_LIMITS.memoryTags || tags.some(tag => tag.length > INPUT_LIMITS.memoryTag) || mergedPreferences.join("、").length > INPUT_LIMITS.memoryField || (mergedNextTopics?.length ?? 0) > INPUT_LIMITS.memoryField) invalidSelection(capture.customerId, fromVisit);
    memoryChangeCount = changes.length;

    for (const value of [...memoryTags, ...selected]) await recordDictionaryUse(workspaceId, userId, value, "knowledge");
    for (const value of preferences) await recordDictionaryUse(workspaceId, userId, value, "hobby");
    await upsertCustomerMemory(workspaceId, userId, capture.customerId, {
      tags,
      ...(mergedPreferences.length ? { preferenceNote: mergedPreferences.join("、") } : {}),
      ...(mergedNextTopics ? { nextTopicHint: mergedNextTopics } : {}),
      lastInteractionSummary: capture.value,
    });
    if (changes.length) {
      const body = changes.map(change => change.kind === "changed" ? `${change.label}：${change.previousValues.join("・")} → ${change.value}` : change.kind === "added" ? `${change.label}：${change.value} を追加` : `${change.label}：${change.value}`).join("\n");
      await addProfessionalTimelineItem({ workspaceId, userId, customerId: capture.customerId, eventType: "note", title: "この人について更新", body, sourceRef: capture.id });
    }
  } else {
    for (const value of [...memoryTags, ...selected]) await recordDictionaryUse(workspaceId, userId, value, "knowledge");
    for (const value of preferences) await recordDictionaryUse(workspaceId, userId, value, "hobby");
  }

  let scheduleCount = 0;
  for (let i = 0; i < scheduleValues.length; i += 1) {
    const title = scheduleValues[i];
    const raw = scheduleTimes[i];
    if (!title || !raw) continue;
    const startsAt = new Date(raw);
    if (Number.isNaN(startsAt.getTime())) continue;
    await createScheduleEntry({ workspaceId, userId, customerId: capture.customerId, kind: "other", title, startsAt: startsAt.toISOString(), note: "会話から追加" });
    scheduleCount += 1;
  }

  let giftCountSaved = 0;
  if (capture.customerId) {
    for (let i = 0; i < giftCount; i += 1) {
      const item = String(formData.get(`giftValue-${i}`) ?? "").trim();
      const raw = String(formData.get(`giftDirection-${i}`) ?? "skip").trim();
      if (!item || !["received", "given"].includes(raw)) continue;
      await createGift({ workspaceId, userId, customerId: capture.customerId, direction: raw as GiftDirection, item, note: "会話から追加" });
      await recordDictionaryUse(workspaceId, userId, item, "gift");
      giftCountSaved += 1;
    }
  }

  revalidatePath("/");
  revalidatePath("/people");
  revalidatePath("/schedule");
  if (capture.customerId) revalidatePath(`/people/${capture.customerId}`);
  const submitIntent = String(formData.get("submitIntent") ?? "done");
  if (submitIntent === "continue") {
    const params = new URLSearchParams();
    if (capture.customerId) params.set("customerId", capture.customerId);
    if (fromVisit) params.set("fromVisit", fromVisit);
    redirect(`/capture?${params.toString()}`);
  }
  if (capture.customerId) {
    const params = new URLSearchParams({ captureSaved: "1", memoryAdded: String(memoryChangeCount), knowledgeAdded: String(selected.length), preferenceAdded: String(preferences.length), nextTopicAdded: String(nextTopics.length), scheduleAdded: String(scheduleCount), giftAdded: String(giftCountSaved) });
    redirect(`/people/${capture.customerId}?${params.toString()}`);
  }
  redirect("/capture");
}
