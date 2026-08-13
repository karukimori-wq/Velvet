"use server";

import { revalidatePath } from "next/cache";
import { getRequestIdentity } from "@/lib/auth/request-identity";
import { getCustomerMemory, upsertCustomerMemory } from "@/lib/customer-memory-repository";

export async function toggleCustomerPinAction(customerId: string) {
  const { workspaceId, userId } = await getRequestIdentity();
  const memory = await getCustomerMemory(workspaceId, userId, customerId);
  await upsertCustomerMemory(workspaceId, userId, customerId, { pinned: !(memory?.pinned ?? false) });
  revalidatePath(`/people/${customerId}`);
  revalidatePath("/people");
}
