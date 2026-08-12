"use server";

import { redirect } from "next/navigation";
import { getRequestIdentity } from "@/lib/auth/request-identity";
import { createRelationship, type RelationshipType } from "@/lib/relationship-repository";

export async function createRelationshipAction(formData: FormData) {
  const { workspaceId, userId } = await getRequestIdentity();
  const customerAId = String(formData.get("customerAId") ?? "").trim();
  const customerBId = String(formData.get("customerBId") ?? "").trim();
  const type = String(formData.get("type") ?? "other") as RelationshipType;
  const note = String(formData.get("note") ?? "").trim() || undefined;
  if (!customerAId || !customerBId) return;
  const result = await createRelationship({ workspaceId, userId, customerAId, customerBId, type, note });
  redirect(result ? `/people/${customerAId}` : "/people");
}
