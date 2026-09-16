"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getRequestIdentity } from "@/lib/auth/request-identity";
import { upsertCustomerMemory } from "@/lib/customer-memory-repository";
import { INPUT_LIMITS } from "@/lib/input-limits";

const fields = ["personalityNote", "preferenceNote", "cautionNote", "conversationSummary", "lastInteractionSummary", "nextTopicHint"] as const;

export async function updateCustomerMemoryAction(customerId: string, formData: FormData) {
  if (!customerId || customerId.length > INPUT_LIMITS.customerId) redirect("/people?error=invalid_customer");
  const values = Object.fromEntries(fields.map(key => [key, String(formData.get(key) || "").trim()])) as Record<(typeof fields)[number], string>;
  const tags = Array.from(new Set(String(formData.get("tags") || "").split(/[、,\n]/).map(value => value.trim()).filter(Boolean)));
  if (fields.some(key => values[key].length > INPUT_LIMITS.memoryField) || tags.length > INPUT_LIMITS.memoryTags || tags.some(tag => tag.length > INPUT_LIMITS.memoryTag)) {
    redirect(`/people/${encodeURIComponent(customerId)}/edit?error=too_long`);
  }
  const identity = await getRequestIdentity();
  await upsertCustomerMemory(identity.workspaceId, identity.userId, customerId, {
    personalityNote: values.personalityNote || undefined,
    preferenceNote: values.preferenceNote || undefined,
    cautionNote: values.cautionNote || undefined,
    conversationSummary: values.conversationSummary || undefined,
    lastInteractionSummary: values.lastInteractionSummary || undefined,
    nextTopicHint: values.nextTopicHint || undefined,
    tags,
  });
  revalidatePath(`/people/${customerId}`);
  redirect(`/people/${customerId}`);
}
