import { getStorageMode } from "@/lib/storage/config";
import { dbQuery } from "@/lib/storage/postgres";
import { getD1Database } from "@/lib/storage/d1";
import { addProfessionalTimelineItem } from "@/lib/professional-timeline-repository";
import { makeIdempotentRecordId } from "@/lib/idempotency";

const memoryKeys = new Set<string>();

type Input = { workspaceId: string; userId: string; customerId: string; eventType: string; title: string; body?: string; sourceRef?: string; occurredAt?: string; idempotencyKey: string };

export async function addIdempotentProfessionalTimelineItem(input: Input) {
  const id = makeIdempotentRecordId("timeline", input.idempotencyKey);
  const occurredAt = input.occurredAt ?? new Date().toISOString();
  const db = await getD1Database();
  if (db) {
    await db.prepare("insert or ignore into velvet_professional_timeline(id,workspace_id,user_id,customer_id,occurred_at,event_type,title,body,source_ref) values(?,?,?,?,?,?,?,?,?)").bind(id, input.workspaceId, input.userId, input.customerId, occurredAt, input.eventType, input.title, input.body ?? null, input.sourceRef ?? null).run();
    return;
  }
  if (getStorageMode() === "postgres") {
    await dbQuery(`insert into velvet_professional_timeline(id,workspace_id,user_id,customer_id,occurred_at,event_type,title,body,source_ref) values($1,$2,$3,$4,$5,$6,$7,$8,$9) on conflict (id) do nothing`, [id, input.workspaceId, input.userId, input.customerId, occurredAt, input.eventType, input.title, input.body ?? null, input.sourceRef ?? null]);
    return;
  }
  const scope = `${input.workspaceId}:${input.userId}:${id}`;
  if (memoryKeys.has(scope)) return;
  memoryKeys.add(scope);
  await addProfessionalTimelineItem({ workspaceId: input.workspaceId, userId: input.userId, customerId: input.customerId, eventType: input.eventType, title: input.title, body: input.body, sourceRef: input.sourceRef, occurredAt });
}
