"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function customerWriteNotOwned(): never {
  throw new Error("VELVET_CUSTOMER_WRITE_NOT_OWNED: Customer master and legacy Person records are read-only. Use Growth Engine for Customer data and Velvet Customer Memory for professional notes.");
}

export async function createPersonAction() { return customerWriteNotOwned(); }
export async function addKnowledgeAction() { return customerWriteNotOwned(); }
export async function removeKnowledgeAction() { return customerWriteNotOwned(); }

export async function updatePersonAction(customerId: string) {
  revalidatePath("/people");
  revalidatePath(`/people/${customerId}`);
  redirect(`/people/${customerId}`);
}

export async function updatePersonProfileAction(customerId: string) {
  revalidatePath(`/people/${customerId}`);
  redirect(`/people/${customerId}`);
}

export async function addContactAction(customerId: string) {
  revalidatePath(`/people/${customerId}`);
  redirect(`/people/${customerId}`);
}

export async function deleteContactAction(customerId: string) {
  revalidatePath(`/people/${customerId}`);
}
