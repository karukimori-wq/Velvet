"use server";

import { redirect } from "next/navigation";
import { getRequestIdentity } from "@/lib/auth/request-identity";
import { createCapture, type CaptureKind } from "@/lib/capture-repository";

export async function saveRememberField(customerId: string, label: string, kind: CaptureKind, preset: string | undefined, formData: FormData) {
  const value = (preset ?? String(formData.get("value") ?? "")).trim();
  if (!value) redirect(`/remember?customerId=${encodeURIComponent(customerId)}&error=empty`);
  const { workspaceId, userId } = await getRequestIdentity();
  const saved = await createCapture({ workspaceId, userId, customerId, kind, value: `${label}：${value}` });
  if (!saved) redirect(`/remember?customerId=${encodeURIComponent(customerId)}&error=invalid`);
  redirect(`/remember?customerId=${encodeURIComponent(customerId)}&savedLabel=${encodeURIComponent(label)}&savedValue=${encodeURIComponent(value)}`);
}
