"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCapture } from "@/lib/capture-repository";
import { getRequestIdentity } from "@/lib/auth/request-identity";
import { getCustomerMemory, upsertCustomerMemory } from "@/lib/customer-memory-repository";
import { recordDictionaryUse } from "@/lib/capture-dictionary-repository";
import { createScheduleEntry } from "@/lib/schedule-repository";
import { createGift, type GiftDirection } from "@/lib/gift-repository";

export async function confirmKnowledgeCandidatesAction(captureId: string, formData: FormData) {
  const { workspaceId, userId } = await getRequestIdentity();
  const capture = await getCapture(captureId, workspaceId, userId);
  if (!capture) redirect("/capture?error=missing");

  const selected = formData.getAll("knowledge").map(String).map((value) => value.trim()).filter(Boolean);
  for (const value of selected) await recordDictionaryUse(workspaceId, userId, value, "knowledge");

  if (capture.customerId && selected.length) {
    const memory = await getCustomerMemory(workspaceId, userId, capture.customerId);
    const tags = Array.from(new Set([...(memory?.tags ?? []), ...selected]));
    await upsertCustomerMemory(workspaceId, userId, capture.customerId, { tags });
  }

  const scheduleValues = formData.getAll("scheduleValue").map(String);
  const scheduleTimes = formData.getAll("scheduleStartsAt").map(String);
  for (let index = 0; index < scheduleValues.length; index += 1) {
    const title = scheduleValues[index]?.trim();
    const startsAtRaw = scheduleTimes[index]?.trim();
    if (!title || !startsAtRaw) continue;
    const startsAt = new Date(startsAtRaw);
    if (Number.isNaN(startsAt.getTime())) continue;
    await createScheduleEntry({
      workspaceId,
      userId,
      customerId: capture.customerId,
      kind: "other",
      title,
      startsAt: startsAt.toISOString(),
      note: "Captureから確認して追加",
    });
  }

  if (capture.customerId) {
    const giftValues = formData.getAll("giftValue").map(String);
    const giftDirections = formData.getAll("giftDirection").map(String);
    for (let index = 0; index < giftValues.length; index += 1) {
      const item = giftValues[index]?.trim();
      const rawDirection = giftDirections[index]?.trim();
      if (!item || !["received", "given"].includes(rawDirection)) continue;
      const direction = rawDirection as GiftDirection;
      await createGift({ workspaceId, userId, customerId: capture.customerId, direction, item, note: "Captureから確認して追加" });
      await recordDictionaryUse(workspaceId, userId, item, "gift");
    }
  }

  if (capture.customerId) {
    revalidatePath(`/people/${capture.customerId}`);
    revalidatePath("/people");
    revalidatePath("/schedule");
    redirect(`/people/${capture.customerId}`);
  }
  revalidatePath("/schedule");
  redirect("/capture?saved=1");
}
