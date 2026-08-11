"use server";

import { redirect } from "next/navigation";
import { addParticipant, endVisit, startVisit, updateVisit } from "@/lib/visit-repository";

const OWNER = "user_demo_owner";

export async function startVisitAction(formData: FormData) {
  const personId = String(formData.get("personId") || "");
  const visit = startVisit(personId, OWNER);
  if (!visit) redirect(`/people/${personId}`);
  redirect(`/visits/${visit.id}`);
}

export async function endVisitAction(formData: FormData) {
  const visitId = String(formData.get("visitId") || "");
  const visit = endVisit(visitId, OWNER);
  if (!visit) redirect("/people");
  const primaryPersonId = visit.participantIds[0];
  redirect(primaryPersonId ? `/people/${primaryPersonId}` : "/people");
}

export async function updateVisitAction(formData: FormData) {
  const visitId = String(formData.get("visitId") || "");
  const salesRaw = String(formData.get("salesAmount") || "").trim();
  const paymentRaw = String(formData.get("paymentMethod") || "").trim();
  const seatingReason = String(formData.get("seatingReason") || "").trim();

  const paymentMethod = ["cash", "card", "qr", "receivable", "other"].includes(paymentRaw)
    ? (paymentRaw as "cash" | "card" | "qr" | "receivable" | "other")
    : undefined;

  updateVisit(
    visitId,
    {
      salesAmount: salesRaw ? Number(salesRaw) : undefined,
      paymentMethod,
      seatingReason: seatingReason || undefined,
    },
    OWNER,
  );
  redirect(`/visits/${visitId}`);
}

export async function addParticipantAction(formData: FormData) {
  const visitId = String(formData.get("visitId") || "");
  const personId = String(formData.get("personId") || "");
  addParticipant(visitId, personId, OWNER);
  redirect(`/visits/${visitId}`);
}
