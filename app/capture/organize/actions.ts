"use server";

import { redirect } from "next/navigation";
import { getRequestIdentity } from "@/lib/auth/request-identity";
import { createCapture } from "@/lib/capture-repository";

export async function organizeCaptureAction(personId: string | undefined, formData: FormData) {
  const { ownerUserId } = await getRequestIdentity();
  const value = String(formData.get("value") ?? "").trim();
  if (!value) redirect(personId ? `/capture?personId=${personId}&error=empty` : "/capture?error=empty");

  const raw = await createCapture({ ownerUserId, personId, kind: "free_text", value });
  if (!raw) redirect(personId ? `/capture?personId=${personId}&error=invalid` : "/capture?error=invalid");
  redirect(`/capture/organize/${raw.id}`);
}
