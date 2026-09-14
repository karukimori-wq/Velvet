"use server";

import { redirect } from "next/navigation";
import { getRequestIdentity } from "@/lib/auth/request-identity";
import { setSoonAlertsEnabled } from "@/lib/owner-preferences";

export async function setSoonAlertsAction(formData: FormData) {
  const { ownerUserId } = await getRequestIdentity();
  const enabled = String(formData.get("enabled") ?? "") === "true";
  await setSoonAlertsEnabled(ownerUserId, enabled);
  redirect(`/settings?soonAlerts=${enabled ? "on" : "off"}`);
}
