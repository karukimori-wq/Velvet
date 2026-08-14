"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCapture } from "@/lib/capture-repository";
import { getRequestIdentity } from "@/lib/auth/request-identity";
import { getCustomerMemory, upsertCustomerMemory } from "@/lib/customer-memory-repository";
import { recordDictionaryUse } from "@/lib/capture-dictionary-repository";
import { createScheduleEntry } from "@/lib/schedule-repository";
import { createGift, type GiftDirection } from "@/lib/gift-repository";

export async function confirmKnowledgeCandidatesAction(captureId: string, fromVisit: string | undefined, formData: FormData) {
  const { workspaceId, userId } = await getRequestIdentity();
  const capture = await getCapture(captureId, workspaceId, userId);
  if (!capture) redirect("/capture?error=missing");

  const selected = formData.getAll("knowledge").map(String).map((value) => value.trim()).filter(Boolean);
  const preferences = formData.getAll("preference").map(String).map((value) => value.trim()).filter(Boolean);
  const nextTopic = String(formData.get("nextTopic") ?? "").trim();

  for (const value of selected) await recordDictionaryUse(workspaceId, userId, value, "knowledge");
  for (const value of preferences) await recordDictionaryUse(workspaceId, userId, value, "hobby");

  if (capture.customerId) {
    const memory = await getCustomerMemory(workspaceId, userId, capture.customerId);
    const tags = Array.from(new Set([...(memory?.tags ?? []), ...selected, ...preferences]));
    const existingPreferences = (memory?.preferenceNote ?? "").split("、").map((value) => value.trim()).filter(Boolean);
    const mergedPreferences = Array.from(new Set([...existingPreferences, ...preferences]));
    await upsertCustomerMemory(workspaceId, userId, capture.customerId, {
      tags,
      ...(mergedPreferences.length ? { preferenceNote: mergedPreferences.join("、") } : {}),
      ...(nextTopic ? { nextTopicHint: nextTopic } : {}),
      lastInteractionSummary: capture.value,
    });
  }

  const scheduleValues = formData.getAll("scheduleValue").map(String);
  const scheduleTimes = formData.getAll("scheduleStartsAt").map(String);
  for (let index = 0; index < scheduleValues.length; index += 1) {
    const title = scheduleValues[index]?.trim();
    const startsAtRaw = scheduleTimes[index]?.trim();
    if (!title || !startsAtRaw) continue;
    const startsAt = new Date(startsAtRaw);
    if (Number.isNaN(startsAt.getTime())) continue;
    await createScheduleEntry({ workspaceId, userId, customerId: capture.customerId, kind: "other", title, startsAt: startsAt.toISOString(), note: "会話から追加" });
  }

  if (capture.customerId) {
    const giftCount = Number(formData.get("giftCount") ?? 0);
    for (let index = 0; index < giftCount; index += 1) {
      const item = String(formData.get(`giftValue-${index}`) ?? "").trim();
      const rawDirection = String(formData.get(`giftDirection-${index}`) ?? "skip").trim();
      if (!item || !["received", "given"].includes(rawDirection)) continue;
      const direction = rawDirection as GiftDirection;
      await createGift({ workspaceId, userId, customerId: capture.customerId, direction, item, note: "会話から追加" });
      await recordDictionaryUse(workspaceId, userId, item, "gift");
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

  if (capture.customerId) redirect(`/people/${capture.customerId}?captureSaved=1`);
  redirect("/capture");
}
