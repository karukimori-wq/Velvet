"use server";

import { redirect } from "next/navigation";
import { createGift, type GiftDirection } from "@/lib/gift-repository";
import { getRequestIdentity } from "@/lib/auth/request-identity";
import { INPUT_LIMITS } from "@/lib/input-limits";

export async function createGiftAction(customerId: string, direction: GiftDirection, formData: FormData) {
  if (!customerId || customerId.length > INPUT_LIMITS.customerId) redirect("/people?error=invalid_customer");
  const item = String(formData.get("item") ?? "").trim();
  const occasion = String(formData.get("occasion") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim();
  if (item.length > INPUT_LIMITS.giftItem || occasion.length > INPUT_LIMITS.giftOccasion || note.length > INPUT_LIMITS.giftNote) {
    redirect(`/people/${encodeURIComponent(customerId)}/gift?error=too_long`);
  }
  const { workspaceId, userId } = await getRequestIdentity();
  const gift = await createGift({ workspaceId, userId, customerId, direction, item, occasion, note });
  if (!gift) redirect(`/people/${encodeURIComponent(customerId)}/gift?error=1`);
  redirect(`/people/${encodeURIComponent(customerId)}`);
}
