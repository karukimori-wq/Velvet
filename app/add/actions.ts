"use server";

import { redirect } from "next/navigation";
import { getRequestIdentity } from "@/lib/auth/request-identity";
import { createGrowthCustomer } from "@/lib/growth-engine-customer";
import { upsertCustomerMemory } from "@/lib/customer-memory-repository";

export async function createCustomerFromVelvetAction(formData: FormData) {
  const displayName = String(formData.get("displayName") ?? "").trim();
  if (!displayName) redirect("/add?error=name");

  const { workspaceId, userId } = await getRequestIdentity();
  const customer = await createGrowthCustomer(workspaceId, userId, displayName);
  if (!customer) redirect(`/add?error=customer_create&name=${encodeURIComponent(displayName)}`);

  // Velvet never becomes the Customer source of truth. This is only a display snapshot
  // attached to the customerId returned by Growth Engine.
  await upsertCustomerMemory(workspaceId, userId, customer.customerId, {
    displayNameSnapshot: customer.displayName ?? displayName,
  });

  redirect(`/capture/profile?customerId=${encodeURIComponent(customer.customerId)}&new=1`);
}
