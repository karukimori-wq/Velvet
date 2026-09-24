"use server";

import { redirect } from "next/navigation";
import { getRequestIdentity } from "@/lib/auth/request-identity";
import { createCapture } from "@/lib/capture-repository";
import { INPUT_LIMITS } from "@/lib/input-limits";
import { createNextAction } from "@/lib/professional-next-action-repository";

export type CaptureOrganizeState = { error?: "empty" | "too_long" | "save_failed" };

export async function organizeCaptureAction(
  customerId: string | undefined,
  fromVisit: string | undefined,
  _previousState: CaptureOrganizeState,
  formData: FormData,
): Promise<CaptureOrganizeState> {
  const { workspaceId, userId } = await getRequestIdentity();
  const value = String(formData.get("value") ?? "").trim();
  const structuredRemember = String(formData.get("structuredRemember") ?? "[]");

  if (!value) return { error: "empty" };
  if (value.length > INPUT_LIMITS.capture) return { error: "too_long" };

  let structured: Array<{ sectionId: string; topicId: string; label: string; content: string }> = [];
  try { const parsed = JSON.parse(structuredRemember); if (Array.isArray(parsed)) structured = parsed.filter(item => item && typeof item.sectionId === "string" && typeof item.topicId === "string" && typeof item.label === "string" && typeof item.content === "string"); } catch { structured = []; }

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
  if (!raw) return { error: "save_failed" };

  if (customerId) {
    const nextActions = structured.filter(item => item.sectionId === "next_action" && !item.topicId.startsWith("action.meta."));
    for (const item of nextActions) {
      try { await createNextAction(workspaceId, userId, customerId, item.content); } catch { return { error: "save_failed" }; }
    }
  }

  const organizeParams = new URLSearchParams();
  if (customerId) organizeParams.set("customerId", customerId);
  if (fromVisit) organizeParams.set("fromVisit", fromVisit);
  const query = organizeParams.toString();
  redirect(`/capture/organize/${raw.id}${query ? `?${query}` : ""}`);
}
