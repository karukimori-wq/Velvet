"use server";

import { redirect } from "next/navigation";
import { getRequestIdentity } from "@/lib/auth/request-identity";
import { createCapture, type CaptureKind } from "@/lib/capture-repository";
import { INPUT_LIMITS } from "@/lib/input-limits";

export async function addProfileAttributeAction(customerId: string, label: string, kind: CaptureKind, preset: string | undefined, formData: FormData) {
  if (!customerId || customerId.length > INPUT_LIMITS.customerId) redirect("/capture?error=invalid_customer");
  const raw = preset ?? String(formData.get("value") ?? "");
  const value = raw.trim();
  if (!value) redirect(`/capture/profile?customerId=${encodeURIComponent(customerId)}&error=empty`);
  const stored = `${label}：${value}`;
  if (stored.length > INPUT_LIMITS.capture) redirect(`/capture/profile?customerId=${encodeURIComponent(customerId)}&error=too_long`);

  const { workspaceId, userId } = await getRequestIdentity();
  const created = await createCapture({ workspaceId, userId, customerId, kind, value: stored });
  if (!created) redirect(`/capture/profile?customerId=${encodeURIComponent(customerId)}&error=invalid`);

  redirect(`/capture/profile?customerId=${encodeURIComponent(customerId)}&savedLabel=${encodeURIComponent(label)}&savedValue=${encodeURIComponent(value)}`);
}
