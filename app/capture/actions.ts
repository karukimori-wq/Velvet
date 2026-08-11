"use server";

import { redirect } from "next/navigation";
import { createCapture, type CaptureKind } from "@/lib/capture-repository";
import { getCurrentOwnerUserId } from "@/lib/current-owner";

export async function captureAction(personId: string | undefined, kind: CaptureKind, formData: FormData) {
  const ownerUserId = getCurrentOwnerUserId();
  const value = String(formData.get("value") ?? "").trim();
  if (!value) redirect(personId ? `/capture?personId=${personId}&error=empty` : "/capture?error=empty");

  const created = await createCapture({ ownerUserId, personId, kind, value });
  if (!created) redirect(personId ? `/capture?personId=${personId}&error=invalid` : "/capture?error=invalid");
  redirect(personId ? `/people/${personId}` : "/capture?saved=1");
}

export async function quickCaptureAction(personId: string | undefined, kind: CaptureKind, value: string) {
  const ownerUserId = getCurrentOwnerUserId();
  await createCapture({ ownerUserId, personId, kind, value });
  redirect(personId ? `/capture?personId=${personId}&saved=1` : "/capture?saved=1");
}
