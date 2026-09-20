"use server";

import { redirect } from "next/navigation";
import { getRequestIdentity } from "@/lib/auth/request-identity";
import { createGrowthCustomer, listGrowthCustomersWithStatus } from "@/lib/growth-engine-customer";
import { upsertCustomerMemory } from "@/lib/customer-memory-repository";
import { getPlanAccess } from "@/lib/plan-access";

export type AddCustomerActionState = {
  error?: "name" | "customer_limit" | "customer_create" | "source_unavailable";
  count?: number;
};

export async function createCustomerFromVelvetAction(_previousState: AddCustomerActionState, formData: FormData): Promise<AddCustomerActionState> {
  const displayName = String(formData.get("displayName") ?? "").trim();
  if (!displayName) return { error: "name" };

  const { workspaceId, userId, ownerUserId } = await getRequestIdentity();
  const access = await getPlanAccess(ownerUserId);

  if (access.customerLimit) {
    const result = await listGrowthCustomersWithStatus(workspaceId, userId);
    if (result.status !== "ok") return { error: "source_unavailable" };
    if (result.customers.length >= access.customerLimit) return { error: "customer_limit", count: result.customers.length };
  }

  const customer = await createGrowthCustomer(workspaceId, userId, displayName);
  if (!customer) return { error: "customer_create" };

  await upsertCustomerMemory(workspaceId, userId, customer.customerId, { displayNameSnapshot: customer.displayName ?? displayName });
  redirect(`/remember?customerId=${encodeURIComponent(customer.customerId)}&new=1`);
}
