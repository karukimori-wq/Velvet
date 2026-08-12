"use server";

import { redirect } from "next/navigation";
import { getRequestIdentity } from "@/lib/auth/request-identity";
import { createCapture } from "@/lib/capture-repository";

export async function organizeCaptureAction(customerId: string | undefined, formData: FormData) {
  const { workspaceId, userId } = await getRequestIdentity();
  const value = String(formData.get("value") ?? "").trim();
  if (!value) redirect(customerId ? `/capture?customerId=${customerId}&error=empty` : "/capture?error=empty");
  const raw = await createCapture({ workspaceId, userId, customerId, kind: "free_text", value });
  if (!raw) redirect(customerId ? `/capture?customerId=${customerId}&error=invalid` : "/capture?error=invalid");
  redirect(`/capture/organize/${raw.id}`);
}
