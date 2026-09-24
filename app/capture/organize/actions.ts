"use server";

import { redirect } from "next/navigation";
import { getRequestIdentity } from "@/lib/auth/request-identity";
import { createCapture } from "@/lib/capture-repository";
import { INPUT_LIMITS } from "@/lib/input-limits";\nimport { createNextAction } from "@/lib/professional-next-action-repository";

export type CaptureOrganizeState = { error?: "empty" | "too_long" | "save_failed" };

export async function organizeCaptureAction(
  customerId: string | undefined,
  fromVisit: string | undefined,
  _previousState: CaptureOrganizeState,
  formData: FormData,
): Promise<CaptureOrganizeState> {
  const { workspaceId, userId } = await getRequestIdentity();
  const value = String(formData.get("value") ?? "").trim();\n  const structuredRemember = String(formData.get("structuredRemember") ?? "[]");

  if (!value) return { error: "empty" };
  if (value.length > INPUT_LIMITS.capture) return { error: "too_long" };\n\n  let structured: Array<{ sectionId: string; topicId: string; label: string; content: string }> = [];\n  try { const parsed = JSON.parse(structuredRemember); if (Array.isArray(parsed)) structured = parsed.filter(item => item && typeof item.sectionId === "string" && typeof item.topicId === "string" && typeof item.label === "string" && typeof item.content === "string"); } catch { structured = []; }

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
  if (!raw) return { error: "save_failed" };\n\n  if (customerId) {\n    const nextActions = structured.filter(item => item.sectionId === "next_action" && !item.topicId.startsWith("action.meta."));\n    for (const item of nextActions) {\n      try { await createNextAction(workspaceId, userId, customerId, item.content); } catch { return { error: "save_failed" }; }\n    }\n  }

  const organizeParams = new URLSearchParams();
  if (customerId) organizeParams.set("customerId", customerId);
  if (fromVisit) organizeParams.set("fromVisit", fromVisit);
  const query = organizeParams.toString();
  redirect(`/capture/organize/${raw.id}${query ? `?${query}` : ""}`);
}
