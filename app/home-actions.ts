"use server";

import { redirect } from "next/navigation";
import { getRequestIdentity } from "@/lib/auth/request-identity";
import { getActiveProfessionalVisit, startProfessionalVisit } from "@/lib/professional-visit-repository";

export async function startHomeVisitAction(customerId: string, visitScheduleId: string | undefined) {
  const identity = await getRequestIdentity();
  const active = await getActiveProfessionalVisit(identity.workspaceId, identity.userId, customerId);
  if (active) redirect(`/visits/${active.id}`);
  const visit = await startProfessionalVisit({
    workspaceId: identity.workspaceId,
    userId: identity.userId,
    customerId,
    visitScheduleId,
    serviceContext: "scheduled_visit",
  });
  redirect(`/visits/${visit.id}`);
}
