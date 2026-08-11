import { getCurrentOwnerUserId } from "@/lib/current-owner";
import { getStorageMode } from "@/lib/storage/config";
import { dbQuery } from "@/lib/storage/postgres";
import { addTimelineItemStore, getPersonStore } from "@/lib/person-store";

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
const makeId = () => `rel_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;

type RelationshipRow = { id: string; owner_user_id: string; person_a_id: string; person_b_id: string; relation_type: RelationshipType; label: string | null; created_at: string };
const mapRow = (row: RelationshipRow): Relationship => ({
  id: row.id,
  ownerUserId: row.owner_user_id,
  personAId: row.person_a_id,
  personBId: row.person_b_id,
  type: row.relation_type,
  note: row.label ?? undefined,
  createdAt: new Date(row.created_at).toISOString(),
});

export async function listRelationships(ownerUserId = getCurrentOwnerUserId()) {
  if (getStorageMode() !== "postgres") return relationships.filter((relationship) => relationship.ownerUserId === ownerUserId);
  const result = await dbQuery<RelationshipRow>(
    "select id, owner_user_id, person_a_id, person_b_id, relation_type, label, created_at::text from velvet_relationships where owner_user_id = $1 order by created_at desc",
    [ownerUserId],
  );
  return result.rows.map(mapRow);
}

export async function listRelationshipsForPerson(personId: string, ownerUserId = getCurrentOwnerUserId()) {
  return (await listRelationships(ownerUserId)).filter((relationship) => relationship.personAId === personId || relationship.personBId === personId);
}

export async function createRelationship(values: { personAId: string; personBId: string; type: RelationshipType; note?: string }, ownerUserId = getCurrentOwnerUserId()) {
  if (values.personAId === values.personBId) return undefined;
  const [personA, personB] = await Promise.all([getPersonStore(values.personAId, ownerUserId), getPersonStore(values.personBId, ownerUserId)]);
  if (!personA || !personB) return undefined;

  const relationship: Relationship = {
    id: makeId(), ownerUserId, personAId: values.personAId, personBId: values.personBId,
    type: values.type, note: values.note?.trim() || undefined, createdAt: new Date().toISOString(),
  };
  if (getStorageMode() !== "postgres") relationships.push(relationship);
  else await dbQuery(
    "insert into velvet_relationships (id, owner_user_id, person_a_id, person_b_id, relation_type, label, created_at) values ($1,$2,$3,$4,$5,$6,$7)",
    [relationship.id, ownerUserId, relationship.personAId, relationship.personBId, relationship.type, relationship.note ?? null, relationship.createdAt],
  );

  const labels: Record<RelationshipType, string> = { friend: "友人", coworker: "同僚", boss: "上司", subordinate: "部下", family: "家族", partner: "パートナー", referral: "紹介", business: "取引先", other: "関係" };
  await Promise.all([
    addTimelineItemStore(personA.id, { id: `${relationship.id}_a`, date: relationship.createdAt.slice(0, 10), title: `${personB.name} · ${labels[relationship.type]}`, body: relationship.note, eventType: "relationship", sourceRef: relationship.id }, ownerUserId),
    addTimelineItemStore(personB.id, { id: `${relationship.id}_b`, date: relationship.createdAt.slice(0, 10), title: `${personA.name} · ${labels[relationship.type]}`, body: relationship.note, eventType: "relationship", sourceRef: relationship.id }, ownerUserId),
  ]);
  return relationship;
}
