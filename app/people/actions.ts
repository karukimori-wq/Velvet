"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getRequestIdentity } from "@/lib/auth/request-identity";
import {
  addPersonKnowledgeStore,
  createPersonStore,
  removePersonKnowledgeStore,
  updatePersonBasicsStore,
} from "@/lib/person-store";

export async function createPersonAction(formData: FormData) {
  const { ownerUserId } = await getRequestIdentity();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) redirect("/people/new?error=name");
  const person = await createPersonStore(name, ownerUserId);
  revalidatePath("/people");
  redirect(`/people/${person.id}`);
}

export async function updatePersonAction(personId: string, formData: FormData) {
  const { ownerUserId } = await getRequestIdentity();
  const name = String(formData.get("name") ?? "").trim();
  const rank = String(formData.get("rank") ?? "").trim();
  await updatePersonBasicsStore(personId, { name, rank }, ownerUserId);
  revalidatePath("/people");
  revalidatePath(`/people/${personId}`);
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
