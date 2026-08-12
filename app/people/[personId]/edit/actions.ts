"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getRequestIdentity } from "@/lib/auth/request-identity";
import { upsertCustomerMemory } from "@/lib/customer-memory-repository";

export async function updateCustomerMemoryAction(customerId: string, formData: FormData) {
  const identity = await getRequestIdentity();
  const tags = String(formData.get("tags") || "").split(/[、,\n]/).map((value) => value.trim()).filter(Boolean);
  await upsertCustomerMemory(identity.workspaceId, identity.userId, customerId, {
    personalityNote: String(formData.get("personalityNote") || "").trim() || undefined,
    preferenceNote: String(formData.get("preferenceNote") || "").trim() || undefined,
    cautionNote: String(formData.get("cautionNote") || "").trim() || undefined,
    conversationSummary: String(formData.get("conversationSummary") || "").trim() || undefined,
    lastInteractionSummary: String(formData.get("lastInteractionSummary") || "").trim() || undefined,
    nextTopicHint: String(formData.get("nextTopicHint") || "").trim() || undefined,
    tags,
    pinned: formData.get("pinned") === "on",
  });
  revalidatePath(`/people/${customerId}`);
  redirect(`/people/${customerId}`);
}
