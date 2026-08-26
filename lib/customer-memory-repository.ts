import { getStorageMode } from "@/lib/storage/config";
import { getD1Database, makeD1Id } from "@/lib/storage/d1";
import { dbQuery } from "@/lib/storage/postgres";

export type VelvetCustomerMemory = {
  id: string;
  workspaceId: string;
  userId: string;
  customerId: string;
  displayNameSnapshot?: string;
  personalityNote?: string;
  preferenceNote?: string;
  cautionNote?: string;
  conversationSummary?: string;
  lastInteractionSummary?: string;
  nextTopicHint?: string;
  tags: string[];
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
};

const memoryRows: VelvetCustomerMemory[] = [];
const makeId = () => makeD1Id("memory");

type MemoryRow = {
  id: string; workspace_id: string; user_id: string; customer_id: string; display_name_snapshot: string | null;
  personality_note: string | null; preference_note: string | null; caution_note: string | null; conversation_summary: string | null;
  last_interaction_summary: string | null; next_topic_hint: string | null; tags: string[] | null; pinned: boolean; created_at: string; updated_at: string;
};

type D1MemoryRow = Omit<MemoryRow, "tags" | "pinned"> & { tags_json: string | null; pinned: number | boolean | null };

function safeTags(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === "string");
  if (typeof value !== "string") return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function mapRow(row: MemoryRow): VelvetCustomerMemory {
  return { id: row.id, workspaceId: row.workspace_id, userId: row.user_id, customerId: row.customer_id, displayNameSnapshot: row.display_name_snapshot ?? undefined,
    personalityNote: row.personality_note ?? undefined, preferenceNote: row.preference_note ?? undefined, cautionNote: row.caution_note ?? undefined,
    conversationSummary: row.conversation_summary ?? undefined, lastInteractionSummary: row.last_interaction_summary ?? undefined,
    nextTopicHint: row.next_topic_hint ?? undefined, tags: row.tags ?? [], pinned: row.pinned,
    createdAt: new Date(row.created_at).toISOString(), updatedAt: new Date(row.updated_at).toISOString() };
}

function mapD1Row(row: D1MemoryRow): VelvetCustomerMemory {
  return mapRow({
    ...row,
    tags: safeTags(row.tags_json),
    pinned: row.pinned === true || row.pinned === 1
  });
}

const selectSql = `select id, workspace_id, user_id, customer_id, display_name_snapshot, personality_note, preference_note, caution_note,
 conversation_summary, last_interaction_summary, next_topic_hint, tags, pinned, created_at::text, updated_at::text from velvet_customer_memories`;
const d1SelectSql = `select id, workspace_id, user_id, customer_id, display_name_snapshot, personality_note, preference_note, caution_note,
 conversation_summary, last_interaction_summary, next_topic_hint, tags_json, pinned, created_at, updated_at from velvet_customer_memories`;

export async function listCustomerMemories(workspaceId: string, userId: string): Promise<VelvetCustomerMemory[]> {
  const mode = getStorageMode();
  if (mode === "d1") {
    const db = await getD1Database();
    if (!db) return [];
    const rows = await db.prepare(`${d1SelectSql} where workspace_id = ? and user_id = ? order by pinned desc, updated_at desc`).bind(workspaceId, userId).all<D1MemoryRow>();
    return rows.results.map(mapD1Row);
  }
  if (mode !== "postgres") return memoryRows.filter((row) => row.workspaceId === workspaceId && row.userId === userId).sort((a,b) => b.updatedAt.localeCompare(a.updatedAt));
  const rows = await dbQuery<MemoryRow>(`${selectSql} where workspace_id=$1 and user_id=$2 order by pinned desc, updated_at desc`, [workspaceId, userId]);
  return rows.rows.map(mapRow);
}

export async function getCustomerMemory(workspaceId: string, userId: string, customerId: string): Promise<VelvetCustomerMemory | undefined> {
  const mode = getStorageMode();
  if (mode === "d1") {
    const db = await getD1Database();
    if (!db) return undefined;
    const row = await db.prepare(`${d1SelectSql} where workspace_id = ? and user_id = ? and customer_id = ? limit 1`).bind(workspaceId, userId, customerId).first<D1MemoryRow>();
    return row ? mapD1Row(row) : undefined;
  }
  if (mode !== "postgres") return memoryRows.find((row) => row.workspaceId === workspaceId && row.userId === userId && row.customerId === customerId);
  const rows = await dbQuery<MemoryRow>(`${selectSql} where workspace_id=$1 and user_id=$2 and customer_id=$3 limit 1`, [workspaceId, userId, customerId]);
  return rows.rows[0] ? mapRow(rows.rows[0]) : undefined;
}

export async function upsertCustomerMemory(workspaceId: string, userId: string, customerId: string, patch: Partial<Omit<VelvetCustomerMemory, "id"|"workspaceId"|"userId"|"customerId"|"createdAt"|"updatedAt">>): Promise<VelvetCustomerMemory> {
  const existing = await getCustomerMemory(workspaceId,userId,customerId);
  const input = { workspaceId,userId,customerId,displayNameSnapshot:patch.displayNameSnapshot ?? existing?.displayNameSnapshot, personalityNote:patch.personalityNote ?? existing?.personalityNote,
    preferenceNote:patch.preferenceNote ?? existing?.preferenceNote,cautionNote:patch.cautionNote ?? existing?.cautionNote,conversationSummary:patch.conversationSummary ?? existing?.conversationSummary,
    lastInteractionSummary:patch.lastInteractionSummary ?? existing?.lastInteractionSummary,nextTopicHint:patch.nextTopicHint ?? existing?.nextTopicHint,tags:patch.tags ?? existing?.tags ?? [],pinned:patch.pinned ?? existing?.pinned ?? false };
  const now = new Date().toISOString();
  const mode = getStorageMode();
  if (mode === "d1") {
    const db = await getD1Database();
    if (!db) throw new Error("D1_NOT_CONFIGURED");
    const id = existing?.id ?? makeId();
    await db.prepare(`insert into velvet_customer_memories (id,workspace_id,user_id,customer_id,display_name_snapshot,personality_note,preference_note,caution_note,conversation_summary,last_interaction_summary,next_topic_hint,tags_json,pinned,created_at,updated_at)
      values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      on conflict(workspace_id,user_id,customer_id) do update set display_name_snapshot=excluded.display_name_snapshot,personality_note=excluded.personality_note,preference_note=excluded.preference_note,caution_note=excluded.caution_note,conversation_summary=excluded.conversation_summary,last_interaction_summary=excluded.last_interaction_summary,next_topic_hint=excluded.next_topic_hint,tags_json=excluded.tags_json,pinned=excluded.pinned,updated_at=excluded.updated_at`)
      .bind(id,workspaceId,userId,customerId,input.displayNameSnapshot??null,input.personalityNote??null,input.preferenceNote??null,input.cautionNote??null,input.conversationSummary??null,input.lastInteractionSummary??null,input.nextTopicHint??null,JSON.stringify(input.tags),input.pinned?1:0,existing?.createdAt??now,now).run();
    const saved = await getCustomerMemory(workspaceId, userId, customerId);
    if (!saved) throw new Error("D1_MEMORY_UPSERT_FAILED");
    return saved;
  }
  if (mode !== "postgres") {
    if (existing) { Object.assign(existing,input,{updatedAt:now}); return existing; }
    const created:VelvetCustomerMemory={id:makeId(),...input,createdAt:now,updatedAt:now}; memoryRows.push(created); return created;
  }
  const id=existing?.id??makeId();
  const rows=await dbQuery<MemoryRow>(`insert into velvet_customer_memories (id,workspace_id,user_id,customer_id,display_name_snapshot,personality_note,preference_note,caution_note,conversation_summary,last_interaction_summary,next_topic_hint,tags,pinned)
  values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) on conflict (workspace_id,user_id,customer_id) do update set display_name_snapshot=excluded.display_name_snapshot,personality_note=excluded.personality_note,preference_note=excluded.preference_note,caution_note=excluded.caution_note,conversation_summary=excluded.conversation_summary,last_interaction_summary=excluded.last_interaction_summary,next_topic_hint=excluded.next_topic_hint,tags=excluded.tags,pinned=excluded.pinned,updated_at=now() returning id,workspace_id,user_id,customer_id,display_name_snapshot,personality_note,preference_note,caution_note,conversation_summary,last_interaction_summary,next_topic_hint,tags,pinned,created_at::text,updated_at::text`,
  [id,workspaceId,userId,customerId,input.displayNameSnapshot??null,input.personalityNote??null,input.preferenceNote??null,input.cautionNote??null,input.conversationSummary??null,input.lastInteractionSummary??null,input.nextTopicHint??null,input.tags,input.pinned]);
  return mapRow(rows.rows[0]);
}
