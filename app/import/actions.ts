"use server";

import { redirect } from "next/navigation";
import { getRequestIdentity } from "@/lib/auth/request-identity";
import { importVelvetData, validateImportPayload, type DuplicatePolicy } from "@/lib/import-export";

export async function importJsonAction(formData: FormData) {
  const { ownerUserId } = await getRequestIdentity();
  const raw = String(formData.get("json") ?? "").trim();
  if (!raw) redirect("/import?error=empty");
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    redirect("/import?error=json");
  }
  const result = validateImportPayload(parsed);
  if (!result.ok) redirect(`/import?error=${encodeURIComponent(result.error)}`);

  const duplicatePolicy: DuplicatePolicy = formData.get("duplicatePolicy") === "create_separate" ? "create_separate" : "skip";
  const imported = await importVelvetData(result.data, ownerUserId, duplicatePolicy);
  redirect(`/people?imported=${imported.createdIds.length}&skipped=${imported.skippedNames.length}`);
}
