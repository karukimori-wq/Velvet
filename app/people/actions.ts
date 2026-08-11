"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getRequestIdentity } from "@/lib/auth/request-identity";
import { createPersonContact, deletePersonContact, type ContactType } from "@/lib/contact-repository";
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

export async function addContactAction(personId: string, formData: FormData) {
  const { ownerUserId } = await getRequestIdentity();
  const rawType = String(formData.get("type") ?? "other");
  const allowed: ContactType[] = ["phone", "email", "line", "instagram", "x", "tiktok", "other"];
  const type = allowed.includes(rawType as ContactType) ? (rawType as ContactType) : "other";
  const value = String(formData.get("value") ?? "").trim();
  const label = String(formData.get("label") ?? "").trim();
  const isPrimary = formData.get("isPrimary") === "on";
  if (value) await createPersonContact({ personId, type, value, label, isPrimary }, ownerUserId);
  revalidatePath(`/people/${personId}`);
  revalidatePath(`/people/${personId}/edit`);
  redirect(`/people/${personId}/edit`);
}

export async function deleteContactAction(personId: string, contactId: string) {
  const { ownerUserId } = await getRequestIdentity();
  await deletePersonContact(contactId, ownerUserId);
  revalidatePath(`/people/${personId}`);
  revalidatePath(`/people/${personId}/edit`);
}
