"use server";

import { redirect } from "next/navigation";
import { addParticipant, endVisit, startVisit, updateVisit } from "@/lib/visit-repository";
import { getCurrentOwnerUserId } from "@/lib/current-owner";

export async function startVisitAction(formData: FormData) {
  const ownerUserId = getCurrentOwnerUserId();
  const personId = String(formData.get("personId") || "");
  const visit = await startVisit(personId, ownerUserId);
  if (!visit) redirect(`/people/${personId}`);
  redirect(`/visits/${visit.id}`);
}

export async function endVisitAction(formData: FormData) {
  const ownerUserId = getCurrentOwnerUserId();
  const visitId = String(formData.get("visitId") || "");
  const visit = await endVisit(visitId, ownerUserId);
  if (!visit) redirect("/people");
  const primaryPersonId = visit.participantIds[0];
  redirect(primaryPersonId ? `/people/${primaryPersonId}` : "/people");
}

export async function updateVisitAction(formData: FormData) {
  const ownerUserId = getCurrentOwnerUserId();
  const visitId = String(formData.get("visitId") || "");
  const salesRaw = String(formData.get("salesAmount") || "").trim();
  const paymentRaw = String(formData.get("paymentMethod") || "").trim();
  const seatingReason = String(formData.get("seatingReason") || "").trim();

  const paymentMethod = ["cash", "card", "qr", "receivable", "other"].includes(paymentRaw)
    ? (paymentRaw as "cash" | "card" | "qr" | "receivable" | "other")
    : undefined;

  await updateVisit(
    visitId,
    {
      salesAmount: salesRaw ? Number(salesRaw) : undefined,
      paymentMethod,
      seatingReason: seatingReason || undefined,
    },
    ownerUserId,
  );
  redirect(`/visits/${visitId}`);
}

export async function addParticipantAction(formData: FormData) {
  const ownerUserId = getCurrentOwnerUserId();
  const visitId = String(formData.get("visitId") || "");
  const personId = String(formData.get("personId") || "");
  await addParticipant(visitId, personId, ownerUserId);
  redirect(`/visits/${visitId}`);
}
