"use server";

import { redirect } from "next/navigation";
import { addParticipant, endVisit, startVisit, updateVisit, type VisitContext } from "@/lib/visit-repository";
import { getRequestIdentity } from "@/lib/auth/request-identity";

export async function startVisitAction(formData: FormData) {
  const { ownerUserId } = await getRequestIdentity();
  const personId = String(formData.get("personId") || "");
  const visit = await startVisit(personId, ownerUserId);
  if (!visit) redirect(`/people/${personId}`);
  redirect(`/visits/${visit.id}`);
}

export async function endVisitAction(formData: FormData) {
  const { ownerUserId } = await getRequestIdentity();
  const visitId = String(formData.get("visitId") || "");
  const visit = await endVisit(visitId, ownerUserId);
  if (!visit) redirect("/people");
  const primaryPersonId = visit.participantIds[0];
  redirect(primaryPersonId ? `/people/${primaryPersonId}` : "/people");
}

export async function quickUpdateVisitAction(visitId: string, field: "seatingReason" | "paymentMethod" | "visitContext", value: string) {
  const { ownerUserId } = await getRequestIdentity();
  if (field === "seatingReason") {
    await updateVisit(visitId, {
      seatingReason: value || undefined,
      visitContext: value === "同伴" ? "accompaniment" : undefined,
    }, ownerUserId);
  } else if (field === "visitContext") {
    const allowed: VisitContext[] = ["solo", "group", "entertainment", "business", "accompaniment", "other"];
    const visitContext = allowed.includes(value as VisitContext) ? value as VisitContext : undefined;
    if (visitContext) await updateVisit(visitId, { visitContext }, ownerUserId);
  } else {
    const allowed = ["cash", "card", "qr", "receivable", "other"] as const;
    const paymentMethod = allowed.includes(value as (typeof allowed)[number]) ? value as (typeof allowed)[number] : undefined;
    if (paymentMethod) await updateVisit(visitId, { paymentMethod }, ownerUserId);
  }
  redirect(`/visits/${visitId}`);
}

export async function updateVisitAction(formData: FormData) {
  const { ownerUserId } = await getRequestIdentity();
  const visitId = String(formData.get("visitId") || "");
  const salesRaw = String(formData.get("salesAmount") || "").trim();
  const patch: { salesAmount?: number } = {};
  if (salesRaw) {
    const value = Number(salesRaw);
    if (Number.isFinite(value) && value >= 0) patch.salesAmount = value;
  }
  await updateVisit(visitId, patch, ownerUserId);
  redirect(`/visits/${visitId}`);
}

export async function addParticipantAction(formData: FormData) {
  const { ownerUserId } = await getRequestIdentity();
  const visitId = String(formData.get("visitId") || "");
  const personId = String(formData.get("personId") || "");
  await addParticipant(visitId, personId, ownerUserId);
  redirect(`/visits/${visitId}`);
}
