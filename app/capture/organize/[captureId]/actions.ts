"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCapture } from "@/lib/capture-repository";
import { getRequestIdentity } from "@/lib/auth/request-identity";
import { getCustomerMemory, upsertCustomerMemory } from "@/lib/customer-memory-repository";

export async function confirmKnowledgeCandidatesAction(captureId: string, formData: FormData) {
  const { workspaceId, userId } = await getRequestIdentity();
  const capture = await getCapture(captureId, workspaceId, userId);
  if (!capture) redirect("/capture?error=missing");
  const selected = formData.getAll("knowledge").map(String).map((value) => value.trim()).filter(Boolean);
  if (capture.customerId) {
    const memory = await getCustomerMemory(workspaceId, userId, capture.customerId);
    const tags = Array.from(new Set([...(memory?.tags ?? []), ...selected]));
    await upsertCustomerMemory(workspaceId, userId, capture.customerId, { tags });
    revalidatePath(`/people/${capture.customerId}`);
    revalidatePath("/people");
    redirect(`/people/${capture.customerId}`);
  }
  redirect("/capture?saved=1");
}
