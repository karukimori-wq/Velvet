"use server";

import { redirect } from "next/navigation";
import { getCurrentOwnerUserId } from "@/lib/current-owner";
import { createRelationship, type RelationshipType } from "@/lib/relationship-repository";

export async function createRelationshipAction(formData: FormData) {
  const ownerUserId = getCurrentOwnerUserId();
  const personAId = String(formData.get("personAId") ?? "").trim();
  const personBId = String(formData.get("personBId") ?? "").trim();
  const type = String(formData.get("type") ?? "other") as RelationshipType;
  const note = String(formData.get("note") ?? "").trim() || undefined;
  if (!personAId || !personBId) return;
  const result = await createRelationship({ personAId, personBId, type, note }, ownerUserId);
  redirect(result ? `/people/${personAId}` : "/people");
}
