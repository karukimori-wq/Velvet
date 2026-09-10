import { getStorageMode } from "@/lib/storage/config";
import { dbQuery } from "@/lib/storage/postgres";
import { getD1Database, makeD1Id } from "@/lib/storage/d1";

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

type Row = {
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

const map = (row: Row): ProfessionalTimelineItem => ({
  id: row.id,
  workspaceId: row.workspace_id,
  userId: row.user_id,
  customerId: row.customer_id,
  occurredAt: new Date(row.occurred_at).toISOString(),
  eventType: row.event_type,
  title: row.title,
  body: row.body ?? undefined,
  sourceRef: row.source_ref ?? undefined,
});

export async function listProfessionalTimeline(workspaceId: string, userId: string, customerId: string) {
  const db = await getD1Database();
  if (db) {
    const result = await db.prepare("select id,workspace_id,user_id,customer_id,occurred_at,event_type,title,body,source_ref from velvet_professional_timeline where workspace_id=? and user_id=? and customer_id=? order by occurred_at desc").bind(workspaceId, userId, customerId).all<Row>();
    return result.results.map(map);
  }
  const mode = getStorageMode();
  if (mode !== "postgres") return rows.filter(row => row.workspaceId === workspaceId && row.userId === userId && row.customerId === customerId).sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
  const result = await dbQuery<Row>(`select id,workspace_id,user_id,customer_id,occurred_at::text,event_type,title,body,source_ref from velvet_professional_timeline where workspace_id=$1 and user_id=$2 and customer_id=$3 order by occurred_at desc`, [workspaceId, userId, customerId]);
  return result.rows.map(map);
}

export async function getProfessionalTimelineItem(workspaceId: string, userId: string, customerId: string, id: string) {
  const db = await getD1Database();
  if (db) {
    const row = await db.prepare("select id,workspace_id,user_id,customer_id,occurred_at,event_type,title,body,source_ref from velvet_professional_timeline where id=? and workspace_id=? and user_id=? and customer_id=? limit 1").bind(id, workspaceId, userId, customerId).first<Row>();
    return row ? map(row) : undefined;
  }
  const mode = getStorageMode();
  if (mode !== "postgres") return rows.find(row => row.id === id && row.workspaceId === workspaceId && row.userId === userId && row.customerId === customerId);
  const result = await dbQuery<Row>(`select id,workspace_id,user_id,customer_id,occurred_at::text,event_type,title,body,source_ref from velvet_professional_timeline where id=$1 and workspace_id=$2 and user_id=$3 and customer_id=$4 limit 1`, [id, workspaceId, userId, customerId]);
  return result.rows[0] ? map(result.rows[0]) : undefined;
}

export async function listLatestConversationsByCustomer(workspaceId: string, userId: string, customerIds: string[]) {
  const result = new Map<string, ProfessionalTimelineItem>();
  if (!customerIds.length) return result;
  const allowed = new Set(customerIds);
  const db = await getD1Database();
  if (db) {
    for (const id of customerIds) {
      const items = await listProfessionalTimeline(workspaceId, userId, id);
      const item = items.find(entry => entry.eventType === "conversation");
      if (item) result.set(id, item);
    }
    return result;
  }
  if (getStorageMode() !== "postgres") {
    rows.filter(row => row.workspaceId === workspaceId && row.userId === userId && row.eventType === "conversation" && allowed.has(row.customerId)).sort((a, b) => b.occurredAt.localeCompare(a.occurredAt)).forEach(row => {
      if (!result.has(row.customerId)) result.set(row.customerId, row);
    });
    return result;
  }
  const query = await dbQuery<Row>(`select distinct on (customer_id) id,workspace_id,user_id,customer_id,occurred_at::text,event_type,title,body,source_ref from velvet_professional_timeline where workspace_id=$1 and user_id=$2 and event_type='conversation' and customer_id=any($3::text[]) order by customer_id,occurred_at desc`, [workspaceId, userId, customerIds]);
  return new Map(query.rows.map(row => {
    const item = map(row);
    return [item.customerId, item] as const;
  }));
}

export async function addProfessionalTimelineItem(input: { workspaceId: string; userId: string; customerId: string; eventType: string; title: string; body?: string; sourceRef?: string; occurredAt?: string }) {
  const db = await getD1Database();
  const item: ProfessionalTimelineItem = {
    id: db ? makeD1Id("timeline") : makeId(),
    workspaceId: input.workspaceId,
    userId: input.userId,
    customerId: input.customerId,
    occurredAt: input.occurredAt ?? new Date().toISOString(),
    eventType: input.eventType,
    title: input.title,
    body: input.body,
    sourceRef: input.sourceRef,
  };
  if (db) {
    await db.prepare("insert into velvet_professional_timeline(id,workspace_id,user_id,customer_id,occurred_at,event_type,title,body,source_ref) values(?,?,?,?,?,?,?,?,?)").bind(item.id, item.workspaceId, item.userId, item.customerId, item.occurredAt, item.eventType, item.title, item.body ?? null, item.sourceRef ?? null).run();
    return item;
  }
  if (getStorageMode() !== "postgres") {
    rows.unshift(item);
    return item;
  }
  await dbQuery(`insert into velvet_professional_timeline(id,workspace_id,user_id,customer_id,occurred_at,event_type,title,body,source_ref) values($1,$2,$3,$4,$5,$6,$7,$8,$9)`, [item.id, item.workspaceId, item.userId, item.customerId, item.occurredAt, item.eventType, item.title, item.body ?? null, item.sourceRef ?? null]);
  return item;
}

export async function deleteProfessionalTimelineItem(workspaceId: string, userId: string, customerId: string, id: string) {
  const db = await getD1Database();
  if (db) {
    await db.prepare("delete from velvet_professional_timeline where id=? and workspace_id=? and user_id=? and customer_id=?").bind(id, workspaceId, userId, customerId).run();
    return;
  }
  if (getStorageMode() !== "postgres") {
    const index = rows.findIndex(row => row.id === id && row.workspaceId === workspaceId && row.userId === userId && row.customerId === customerId);
    if (index >= 0) rows.splice(index, 1);
    return;
  }
  await dbQuery(`delete from velvet_professional_timeline where id=$1 and workspace_id=$2 and user_id=$3 and customer_id=$4`, [id, workspaceId, userId, customerId]);
}
