"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCapture } from "@/lib/capture-repository";
import { getRequestIdentity } from "@/lib/auth/request-identity";
import { addPersonKnowledgeStore } from "@/lib/person-store";

export async function confirmKnowledgeCandidatesAction(captureId: string, formData: FormData) {
  const { ownerUserId } = await getRequestIdentity();
  const capture = await getCapture(captureId, ownerUserId);
  if (!capture) redirect("/capture?error=missing");

  const selected = formData.getAll("knowledge").map(String).map((value) => value.trim()).filter(Boolean);
  if (capture.personId) {
    for (const value of selected) await addPersonKnowledgeStore(capture.personId, value, ownerUserId);
    revalidatePath(`/people/${capture.personId}`);
    revalidatePath("/people");
    redirect(`/people/${capture.personId}`);
  }
  redirect("/capture?saved=1");
}
