import { currentOwnerUserId } from "@/lib/current-owner";
import { getPerson, pushTimelineItem } from "@/lib/demo-data";

export type RelationshipType = "friend" | "coworker" | "boss" | "subordinate" | "family" | "partner" | "referral" | "business" | "other";

export type Relationship = {
  id: string;
  ownerUserId: string;
  personAId: string;
  personBId: string;
  type: RelationshipType;
  note?: string;
  createdAt: string;
};

const relationships: Relationship[] = [];

function makeId() {
  return `rel_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

export function listRelationships(ownerUserId = currentOwnerUserId()) {
  return relationships.filter((relationship) => relationship.ownerUserId === ownerUserId);
}

export function listRelationshipsForPerson(personId: string, ownerUserId = currentOwnerUserId()) {
  return listRelationships(ownerUserId).filter((relationship) => relationship.personAId === personId || relationship.personBId === personId);
}

export function createRelationship(values: { personAId: string; personBId: string; type: RelationshipType; note?: string }, ownerUserId = currentOwnerUserId()) {
  if (values.personAId === values.personBId) return undefined;
  const personA = getPerson(values.personAId, ownerUserId);
  const personB = getPerson(values.personBId, ownerUserId);
  if (!personA || !personB) return undefined;
  const relationship: Relationship = {
    id: makeId(), ownerUserId, personAId: values.personAId, personBId: values.personBId,
    type: values.type, note: values.note?.trim() || undefined, createdAt: new Date().toISOString(),
  };
  relationships.push(relationship);
  const labels: Record<RelationshipType, string> = { friend: "友人", coworker: "同僚", boss: "上司", subordinate: "部下", family: "家族", partner: "パートナー", referral: "紹介", business: "取引先", other: "関係" };
  pushTimelineItem(personA.id, { id: `${relationship.id}_a`, date: relationship.createdAt.slice(0, 10), title: `${personB.name} · ${labels[relationship.type]}`, body: relationship.note }, ownerUserId);
  pushTimelineItem(personB.id, { id: `${relationship.id}_b`, date: relationship.createdAt.slice(0, 10), title: `${personA.name} · ${labels[relationship.type]}`, body: relationship.note }, ownerUserId);
  return relationship;
}
