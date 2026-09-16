"use server";

import { redirect } from "next/navigation";
import { getRequestIdentity } from "@/lib/auth/request-identity";
import { createCapture } from "@/lib/capture-repository";

export type CaptureOrganizeState = { error?: "empty" | "save_failed" };

export async function organizeCaptureAction(
  customerId: string | undefined,
  fromVisit: string | undefined,
  _previousState: CaptureOrganizeState,
  formData: FormData,
): Promise<CaptureOrganizeState> {
  const { workspaceId, userId } = await getRequestIdentity();
  const value = String(formData.get("value") ?? "").trim();

  if (!value) return { error: "empty" };

  let raw;
  try {
    raw = await createCapture({
      workspaceId,
      userId,
      customerId,
      kind: customerId ? "conversation_note" : "free_text",
      value,
    });
  } catch {
    return { error: "save_failed" };
  }
  if (!raw) return { error: "empty" };

  const organizeParams = new URLSearchParams();
  if (customerId) organizeParams.set("customerId", customerId);
  if (fromVisit) organizeParams.set("fromVisit", fromVisit);
  const query = organizeParams.toString();
  redirect(`/capture/organize/${raw.id}${query ? `?${query}` : ""}`);
}
