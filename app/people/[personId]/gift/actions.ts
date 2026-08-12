"use server";

import { redirect } from "next/navigation";
import { createGift, type GiftDirection } from "@/lib/gift-repository";
import { getRequestIdentity } from "@/lib/auth/request-identity";

export async function createGiftAction(customerId: string, direction: GiftDirection, formData: FormData) {
  const { workspaceId, userId } = await getRequestIdentity();
  const item = String(formData.get("item") ?? "").trim();
  const occasion = String(formData.get("occasion") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim();
  const gift = await createGift({ workspaceId, userId, customerId, direction, item, occasion, note });
  if (!gift) redirect(`/people/${customerId}/gift?error=1`);
  redirect(`/people/${customerId}`);
}
