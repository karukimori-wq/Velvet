"use server";

import { redirect } from "next/navigation";
import { getRequestIdentity } from "@/lib/auth/request-identity";
import {
  endProfessionalVisit,
  startProfessionalVisit,
  updateProfessionalVisit,
} from "@/lib/professional-visit-repository";

export async function startVisitAction(formData: FormData) {
  const identity = await getRequestIdentity();
  const customerId = String(formData.get("customerId") || formData.get("personId") || "").trim();
  if (!customerId) redirect("/people");
  const reservationId = String(formData.get("reservationId") || "").trim() || undefined;
  const visitScheduleId = String(formData.get("visitScheduleId") || "").trim() || undefined;
  const intent = String(formData.get("intent") || "").trim() || undefined;
  const visit = await startProfessionalVisit({
    workspaceId: identity.workspaceId,
    userId: identity.userId,
    customerId,
    reservationId,
    visitScheduleId,
    serviceContext: intent,
  });
  redirect(`/visits/${visit.id}`);
}

export async function endVisitAction(formData: FormData) {
  const identity = await getRequestIdentity();
  const visitId = String(formData.get("visitId") || "");
  const visit = await endProfessionalVisit(visitId, identity.workspaceId, identity.userId);
  if (!visit) redirect("/people");
  redirect(`/people/${visit.customerId}?justEnded=${encodeURIComponent(visit.id)}`);
}

export async function quickUpdateVisitAction(visitId: string, field: "seatingReason" | "serviceContext", value: string) {
  const identity = await getRequestIdentity();
  const patch = field === "seatingReason" ? { seatingReason: value || undefined } : { serviceContext: value || undefined };
  await updateProfessionalVisit(visitId, identity.workspaceId, identity.userId, patch);
  redirect(`/visits/${visitId}`);
}

export async function updateVisitAction(formData: FormData) {
  const identity = await getRequestIdentity();
  const visitId = String(formData.get("visitId") || "");
  await updateProfessionalVisit(visitId, identity.workspaceId, identity.userId, {
    conversationMemo: String(formData.get("conversationMemo") || "").trim() || undefined,
    preferenceMemo: String(formData.get("preferenceMemo") || "").trim() || undefined,
    cautionMemo: String(formData.get("cautionMemo") || "").trim() || undefined,
    nextActionMemo: String(formData.get("nextActionMemo") || "").trim() || undefined,
    summary: String(formData.get("summary") || "").trim() || undefined,
  });
  redirect(`/visits/${visitId}`);
}

export async function addParticipantAction(formData: FormData) {
  const visitId = String(formData.get("visitId") || "");
  redirect(`/visits/${visitId}`);
}
