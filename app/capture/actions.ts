"use server";

import { redirect } from "next/navigation";
import { createCapture, type CaptureKind } from "@/lib/capture-repository";
import { getRequestIdentity } from "@/lib/auth/request-identity";

export async function captureAction(personId: string | undefined, kind: CaptureKind, formData: FormData) {
  const { ownerUserId } = await getRequestIdentity();
  const value = String(formData.get("value") ?? "").trim();
  if (!value) redirect(personId ? `/capture?personId=${personId}&error=empty` : "/capture?error=empty");

  const created = await createCapture({ ownerUserId, personId, kind, value });
  if (!created) redirect(personId ? `/capture?personId=${personId}&error=invalid` : "/capture?error=invalid");
  redirect(personId ? `/people/${personId}` : "/capture?saved=1");
}

export async function conversationMemoAction(personId: string, visitId: string | undefined, formData: FormData) {
  const { ownerUserId } = await getRequestIdentity();
  const value = String(formData.get("value") ?? "").trim();
  if (!value) redirect(`/capture?personId=${personId}${visitId ? `&fromVisit=${encodeURIComponent(visitId)}` : ""}&error=empty`);
  const created = await createCapture({ ownerUserId, personId, kind: "conversation_note", value });
  if (!created) redirect(`/capture?personId=${personId}&error=invalid`);
  redirect(`/people/${personId}`);
}

export async function quickCaptureAction(personId: string | undefined, kind: CaptureKind, value: string, fromVisit?: string) {
  const { ownerUserId } = await getRequestIdentity();
  await createCapture({ ownerUserId, personId, kind, value });
  const visitQuery = fromVisit ? `&fromVisit=${encodeURIComponent(fromVisit)}` : "";
  redirect(personId ? `/capture?personId=${personId}&saved=1${visitQuery}` : "/capture?saved=1");
}
