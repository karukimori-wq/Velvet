"use server";

import { redirect } from "next/navigation";
import { getRequestIdentity } from "@/lib/auth/request-identity";
import { createCapture, type CaptureKind } from "@/lib/capture-repository";
import { getCustomerMemory, upsertCustomerMemory } from "@/lib/customer-memory-repository";

export async function saveRememberField(customerId: string, label: string, kind: CaptureKind, preset: string | undefined, formData: FormData) {
  const value = (preset ?? String(formData.get("value") ?? "")).trim();
  if (!value) redirect(`/remember?customerId=${encodeURIComponent(customerId)}&error=empty`);

  const { workspaceId, userId } = await getRequestIdentity();
  const stored = `${label}：${value}`;
  const saved = await createCapture({ workspaceId, userId, customerId, kind, value: stored });
  if (!saved) redirect(`/remember?customerId=${encodeURIComponent(customerId)}&error=invalid`);

  const memory = await getCustomerMemory(workspaceId, userId, customerId);
  const tags = [
    ...(memory?.tags ?? []).filter((tag) => !tag.startsWith(`${label}：`)),
    stored,
  ];
  await upsertCustomerMemory(workspaceId, userId, customerId, { tags });

  redirect(`/remember?customerId=${encodeURIComponent(customerId)}&savedLabel=${encodeURIComponent(label)}&savedValue=${encodeURIComponent(value)}`);
}
