import { getStorageMode } from "@/lib/storage/config";
import { dbQuery } from "@/lib/storage/postgres";

export type ProfessionalTimelineItem = {
  id: string;
  workspaceId: string;
  userId: string;
  customerId: string;
  occurredAt: string;
  eventType: string;
  title: string;
  body?: string;
  sourceRef?: string;
};

const rows: ProfessionalTimelineItem[] = [];
const makeId = () => `note_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

type TimelineRow = {
  id: string;
  workspace_id: string;
  user_id: string;
  customer_id: string;
  occurred_at: string;
  event_type: string;
  title: string;
  body: string | null;
  source_ref: string | null;
};

function mapRow(row: TimelineRow): ProfessionalTimelineItem {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    userId: row.user_id,
    customerId: row.customer_id,
    occurredAt: new Date(row.occurred_at).toISOString(),
    eventType: row.event_type,
    title: row.title,
    body: row.body ?? undefined,
    sourceRef: row.source_ref ?? undefined,
  };
}

export async function listProfessionalTimeline(workspaceId: string, userId: string, customerId: string): Promise<ProfessionalTimelineItem[]> {
  if (getStorageMode() !== "postgres") return rows.filter((row) => row.workspaceId === workspaceId && row.userId === userId && row.customerId === customerId).sort((a,b) => b.occurredAt.localeCompare(a.occurredAt));
  const result = await dbQuery<TimelineRow>(
    `select id, workspace_id, user_id, customer_id, occurred_at::text, event_type, title, body, source_ref
     from velvet_professional_timeline where workspace_id=$1 and user_id=$2 and customer_id=$3 order by occurred_at desc`,
    [workspaceId, userId, customerId],
  );
  return result.rows.map(mapRow);
}

export async function addProfessionalTimelineItem(input: {
  workspaceId: string;
  userId: string;
  customerId: string;
  eventType: string;
  title: string;
  body?: string;
  sourceRef?: string;
  occurredAt?: string;
}): Promise<ProfessionalTimelineItem> {
  const item: ProfessionalTimelineItem = {
    id: makeId(),
    workspaceId: input.workspaceId,
    userId: input.userId,
    customerId: input.customerId,
    occurredAt: input.occurredAt ?? new Date().toISOString(),
    eventType: input.eventType,
    title: input.title,
    body: input.body,
    sourceRef: input.sourceRef,
  };
  if (getStorageMode() !== "postgres") { rows.unshift(item); return item; }
  await dbQuery(
    `insert into velvet_professional_timeline (id, workspace_id, user_id, customer_id, occurred_at, event_type, title, body, source_ref)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
    [item.id, item.workspaceId, item.userId, item.customerId, item.occurredAt, item.eventType, item.title, item.body ?? null, item.sourceRef ?? null],
  );
  return item;
}
