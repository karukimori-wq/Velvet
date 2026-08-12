"use server";

import { redirect } from "next/navigation";
import { addParticipant, endVisit, startVisit, updateVisit, type NominationType, type ReceivableStatus, type VisitContext } from "@/lib/visit-repository";
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
  redirect(primaryPersonId ? `/people/${primaryPersonId}?justEnded=${encodeURIComponent(visit.id)}` : "/people");
}

export async function quickUpdateVisitAction(visitId: string, field: "seatingReason" | "paymentMethod" | "visitContext" | "nominationType" | "receivableStatus", value: string) {
  const { ownerUserId } = await getRequestIdentity();
  if (field === "seatingReason") {
    await updateVisit(visitId, { seatingReason: value || undefined, visitContext: value === "同伴" ? "accompaniment" : undefined }, ownerUserId);
  } else if (field === "visitContext") {
    const allowed: VisitContext[] = ["solo", "group", "entertainment", "business", "accompaniment", "other"];
    if (allowed.includes(value as VisitContext)) await updateVisit(visitId, { visitContext: value as VisitContext }, ownerUserId);
  } else if (field === "nominationType") {
    const allowed: NominationType[] = ["main", "in_store", "help", "free", "other"];
    if (allowed.includes(value as NominationType)) await updateVisit(visitId, { nominationType: value as NominationType }, ownerUserId);
  } else if (field === "receivableStatus") {
    const allowed: ReceivableStatus[] = ["open", "partial", "paid"];
    if (allowed.includes(value as ReceivableStatus)) await updateVisit(visitId, { receivableStatus: value as ReceivableStatus }, ownerUserId);
  } else {
    const allowed = ["cash", "card", "qr", "receivable", "other"] as const;
    const paymentMethod = allowed.includes(value as (typeof allowed)[number]) ? value as (typeof allowed)[number] : undefined;
    if (paymentMethod) await updateVisit(visitId, { paymentMethod, receivableStatus: paymentMethod === "receivable" ? "open" : undefined }, ownerUserId);
  }
  redirect(`/visits/${visitId}`);
}

export async function updateVisitAction(formData: FormData) {
  const { ownerUserId } = await getRequestIdentity();
  const visitId = String(formData.get("visitId") || "");
  const numeric = (name: string) => {
    const raw = String(formData.get(name) || "").trim();
    if (!raw) return undefined;
    const value = Number(raw);
    return Number.isFinite(value) && value >= 0 ? value : undefined;
  };
  await updateVisit(visitId, {
    salesAmount: numeric("salesAmount"),
    receivableAmount: numeric("receivableAmount"),
    drinkCount: numeric("drinkCount"),
    bottleCount: numeric("bottleCount"),
    bottleNote: String(formData.get("bottleNote") || "").trim() || undefined,
  }, ownerUserId);
  redirect(`/visits/${visitId}`);
}

export async function addParticipantAction(formData: FormData) {
  const { ownerUserId } = await getRequestIdentity();
  const visitId = String(formData.get("visitId") || "");
  const personId = String(formData.get("personId") || "");
  await addParticipant(visitId, personId, ownerUserId);
  redirect(`/visits/${visitId}`);
}
