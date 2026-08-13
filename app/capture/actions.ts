"use server";

import { redirect } from "next/navigation";
import { createCapture, type CaptureKind } from "@/lib/capture-repository";
import { getRequestIdentity } from "@/lib/auth/request-identity";

export async function captureAction(customerId: string | undefined, kind: CaptureKind, formData: FormData) {
  const { workspaceId, userId } = await getRequestIdentity();
  const value = String(formData.get("value") ?? "").trim();
  if (!value) redirect(customerId ? `/capture?customerId=${customerId}&error=empty` : "/capture?error=empty");
  const created = await createCapture({ workspaceId, userId, customerId, kind, value });
  if (!created) redirect(customerId ? `/capture?customerId=${customerId}&error=invalid` : "/capture?error=invalid");
  redirect(customerId ? `/people/${customerId}` : `/capture?saved=${encodeURIComponent(value)}`);
}

export async function conversationMemoAction(customerId: string, visitId: string | undefined, formData: FormData) {
  const { workspaceId, userId } = await getRequestIdentity();
  const value = String(formData.get("value") ?? "").trim();
  const mode = String(formData.get("mode") ?? "save");
  if (!value) redirect(`/capture?customerId=${customerId}${visitId ? `&fromVisit=${encodeURIComponent(visitId)}` : ""}&error=empty`);
  const created = await createCapture({ workspaceId, userId, customerId, kind: "conversation_note", value });
  if (!created) redirect(`/capture?customerId=${customerId}&error=invalid`);
  if (mode === "organize") redirect(`/capture/organize/${created.id}`);
  redirect(`/people/${customerId}`);
}

export async function quickCaptureAction(customerId: string | undefined, kind: CaptureKind, value: string, fromVisit?: string) {
  const { workspaceId, userId } = await getRequestIdentity();
  await createCapture({ workspaceId, userId, customerId, kind, value });
  const visitQuery = fromVisit ? `&fromVisit=${encodeURIComponent(fromVisit)}` : "";
  const savedQuery = `saved=${encodeURIComponent(value)}`;
  redirect(customerId ? `/capture?customerId=${customerId}&${savedQuery}${visitQuery}` : `/capture?${savedQuery}`);
}
