"use server";

import { redirect } from "next/navigation";
import { getRequestIdentity } from "@/lib/auth/request-identity";
import { createCapture, type CaptureKind } from "@/lib/capture-repository";
import { getCustomerMemory, upsertCustomerMemory } from "@/lib/customer-memory-repository";

function rememberHref(customerId: string, params: Record<string, string | undefined>) {
  const query = new URLSearchParams({ customerId });
  for (const [key, value] of Object.entries(params)) if (value) query.set(key, value);
  return `/remember?${query.toString()}`;
}

export async function saveRememberField(customerId: string, label: string, kind: CaptureKind, preset: string | undefined, firstCustomer: boolean, formData: FormData) {
  const value = (preset ?? String(formData.get("value") ?? "")).trim();
  const flow = firstCustomer ? { new: "1" } : {};
  if (!value) redirect(rememberHref(customerId, { ...flow, error: "empty" }));
  const { workspaceId, userId } = await getRequestIdentity();
  const stored = `${label}：${value}`;
  const saved = await createCapture({ workspaceId, userId, customerId, kind, value: stored });
  if (!saved) redirect(rememberHref(customerId, { ...flow, error: "invalid" }));
  const memory = await getCustomerMemory(workspaceId, userId, customerId);
  const tags = [...(memory?.tags ?? []).filter((tag) => !tag.startsWith(`${label}：`)), stored];
  await upsertCustomerMemory(workspaceId, userId, customerId, { tags });
  redirect(rememberHref(customerId, { ...flow, savedLabel: label, savedValue: value }));
}

export async function removeRememberField(customerId: string, label: string, firstCustomer: boolean) {
  const flow = firstCustomer ? { new: "1" } : {};
  const { workspaceId, userId } = await getRequestIdentity();
  const memory = await getCustomerMemory(workspaceId, userId, customerId);
  const tags = (memory?.tags ?? []).filter((tag) => !tag.startsWith(`${label}：`));
  await upsertCustomerMemory(workspaceId, userId, customerId, { tags });
  redirect(rememberHref(customerId, { ...flow, removedLabel: label }));
}
