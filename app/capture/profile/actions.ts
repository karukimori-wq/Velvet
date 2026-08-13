"use server";

import { redirect } from "next/navigation";
import { getRequestIdentity } from "@/lib/auth/request-identity";
import { createCapture, type CaptureKind } from "@/lib/capture-repository";

export async function addProfileAttributeAction(customerId: string, label: string, kind: CaptureKind, preset: string | undefined, formData: FormData) {
  const raw = preset ?? String(formData.get("value") ?? "");
  const value = raw.trim();
  if (!value) redirect(`/capture/profile?customerId=${encodeURIComponent(customerId)}&error=empty`);

  const { workspaceId, userId } = await getRequestIdentity();
  const stored = `${label}：${value}`;
  const created = await createCapture({ workspaceId, userId, customerId, kind, value: stored });
  if (!created) redirect(`/capture/profile?customerId=${encodeURIComponent(customerId)}&error=invalid`);

  redirect(`/capture/profile?customerId=${encodeURIComponent(customerId)}&savedLabel=${encodeURIComponent(label)}&savedValue=${encodeURIComponent(value)}`);
}
