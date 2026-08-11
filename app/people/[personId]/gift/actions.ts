"use server";

import { redirect } from "next/navigation";
import { createGift, type GiftDirection } from "@/lib/gift-repository";
import { getCurrentOwnerUserId } from "@/lib/current-owner";

export async function createGiftAction(personId: string, direction: GiftDirection, formData: FormData) {
  const ownerUserId = getCurrentOwnerUserId();
  const item = String(formData.get("item") ?? "").trim();
  const rawValue = String(formData.get("estimatedValue") ?? "").trim();
  const estimatedValue = rawValue ? Number(rawValue) : undefined;
  const occasion = String(formData.get("occasion") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim();

  const gift = createGift({
    ownerUserId,
    personId,
    direction,
    item,
    estimatedValue: Number.isFinite(estimatedValue) ? estimatedValue : undefined,
    occasion,
    note,
  });

  if (!gift) redirect(`/people/${personId}/gift?error=1`);
  redirect(`/people/${personId}`);
}
