"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getRequestIdentity } from "@/lib/auth/request-identity";
import {
  addPersonKnowledgeStore,
  removePersonKnowledgeStore,
} from "@/lib/person-store";

export async function createPersonAction() {
  throw new Error("VELVET_CUSTOMER_CREATION_DISABLED: Customer master is owned by Growth Engine.");
}

export async function updatePersonAction(personId: string) {
  revalidatePath("/people");
  revalidatePath(`/people/${personId}`);
  redirect(`/people/${personId}`);
}

export async function updatePersonProfileAction(personId: string) {
  revalidatePath(`/people/${personId}`);
  revalidatePath(`/people/${personId}/edit`);
  redirect(`/people/${personId}`);
}

export async function addKnowledgeAction(personId: string, formData: FormData) {
  const { ownerUserId } = await getRequestIdentity();
  const value = String(formData.get("value") ?? "").trim();
  if (value) await addPersonKnowledgeStore(personId, value, ownerUserId);
  revalidatePath("/people");
  revalidatePath(`/people/${personId}`);
  redirect(`/people/${personId}`);
}

export async function removeKnowledgeAction(personId: string, value: string) {
  const { ownerUserId } = await getRequestIdentity();
  await removePersonKnowledgeStore(personId, value, ownerUserId);
  revalidatePath("/people");
  revalidatePath(`/people/${personId}`);
}

export async function addContactAction(personId: string) {
  revalidatePath(`/people/${personId}`);
  revalidatePath(`/people/${personId}/edit`);
  redirect(`/people/${personId}/edit`);
}

export async function deleteContactAction(personId: string) {
  revalidatePath(`/people/${personId}`);
  revalidatePath(`/people/${personId}/edit`);
}
