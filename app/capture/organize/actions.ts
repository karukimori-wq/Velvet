"use server";

import { redirect } from "next/navigation";
import { getRequestIdentity } from "@/lib/auth/request-identity";
import { createCapture } from "@/lib/capture-repository";

export async function organizeCaptureAction(customerId: string | undefined, fromVisit: string | undefined, formData: FormData) {
  const { workspaceId, userId } = await getRequestIdentity();
  const value = String(formData.get("value") ?? "").trim();
  const captureParams = new URLSearchParams();
  if (customerId) captureParams.set("customerId", customerId);
  if (fromVisit) captureParams.set("fromVisit", fromVisit);

  if (!value) {
    captureParams.set("error", "empty");
    redirect(`/capture?${captureParams.toString()}`);
  }

  const raw = await createCapture({ workspaceId, userId, customerId, kind: "free_text", value });
  if (!raw) {
    captureParams.set("error", "invalid");
    redirect(`/capture?${captureParams.toString()}`);
  }

  const organizeParams = new URLSearchParams();
  if (fromVisit) organizeParams.set("fromVisit", fromVisit);
  const query = organizeParams.toString();
  redirect(`/capture/organize/${raw.id}${query ? `?${query}` : ""}`);
}
