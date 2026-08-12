"use server";

import { redirect } from "next/navigation";
import { getRequestIdentity } from "@/lib/auth/request-identity";
import { importVelvetData, validateImportPayload } from "@/lib/import-export";

export async function importJsonAction(formData: FormData) {
  const { workspaceId, userId } = await getRequestIdentity();
  const raw = String(formData.get("json") ?? "").trim();
  if (!raw) redirect("/import?error=empty");
  let parsed: unknown;
  try { parsed = JSON.parse(raw); } catch { redirect("/import?error=json"); }
  const result = validateImportPayload(parsed);
  if (!result.ok) redirect(`/import?error=${encodeURIComponent(result.error)}`);
  const imported = await importVelvetData(result.data, workspaceId, userId);
  redirect(`/people?imported=${imported.importedCustomerIds.length}`);
}
