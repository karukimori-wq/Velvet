"use server";

import { revalidatePath } from "next/cache";
import { getRequestIdentity } from "@/lib/auth/request-identity";
import { deleteDictionaryEntry } from "@/lib/capture-dictionary-repository";

export async function deleteDictionaryEntryAction(id: string) {
  const { workspaceId, userId } = await getRequestIdentity();
  await deleteDictionaryEntry(id, workspaceId, userId);
  revalidatePath("/settings/dictionary");
  revalidatePath("/capture");
}
