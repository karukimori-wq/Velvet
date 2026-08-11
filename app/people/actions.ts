"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { addPersonKnowledge, createPerson, removePersonKnowledge, updatePersonBasics } from "@/lib/demo-data";

const OWNER = "user_demo_owner";

export async function createPersonAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) redirect("/people/new?error=name");
  const person = createPerson(name, OWNER);
  revalidatePath("/people");
  redirect(`/people/${person.id}`);
}

export async function updatePersonAction(personId: string, formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const rank = String(formData.get("rank") ?? "").trim();
  updatePersonBasics(personId, { name, rank }, OWNER);
  revalidatePath("/people");
  revalidatePath(`/people/${personId}`);
  redirect(`/people/${personId}`);
}

export async function addKnowledgeAction(personId: string, formData: FormData) {
  const value = String(formData.get("value") ?? "").trim();
  if (value) addPersonKnowledge(personId, value, OWNER);
  revalidatePath("/people");
  revalidatePath(`/people/${personId}`);
  redirect(`/people/${personId}`);
}

export async function removeKnowledgeAction(personId: string, value: string) {
  removePersonKnowledge(personId, value, OWNER);
  revalidatePath("/people");
  revalidatePath(`/people/${personId}`);
}
