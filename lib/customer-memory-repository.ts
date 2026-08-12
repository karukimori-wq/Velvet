import { getStorageMode } from "@/lib/storage/config";
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
const makeId = () => `memory_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

type MemoryRow = {
  id: string;
  workspace_id: string;
  user_id: string;
  customer_id: string;
  display_name_snapshot: string | null;
  personality_note: string | null;
  preference_note: string | null;
  caution_note: string | null;
  conversation_summary: string | null;
  last_interaction_summary: string | null;
  next_topic_hint: string | null;
  tags: string[] | null;
  pinned: boolean;
  created_at: string;
  updated_at: string;
};

function mapRow(row: MemoryRow): VelvetCustomerMemory {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    userId: row.user_id,
    customerId: row.customer_id,
    displayNameSnapshot: row.display_name_snapshot ?? undefined,
    personalityNote: row.personality_note ?? undefined,
    preferenceNote: row.preference_note ?? undefined,
    cautionNote: row.caution_note ?? undefined,
    conversationSummary: row.conversation_summary ?? undefined,
    lastInteractionSummary: row.last_interaction_summary ?? undefined,
    nextTopicHint: row.next_topic_hint ?? undefined,
    tags: row.tags ?? [],
    pinned: row.pinned,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  };
}

export async function getCustomerMemory(workspaceId: string, userId: string, customerId: string): Promise<VelvetCustomerMemory | undefined> {
  if (getStorageMode() !== "postgres") return memoryRows.find((row) => row.workspaceId === workspaceId && row.userId === userId && row.customerId === customerId);
  const rows = await dbQuery<MemoryRow>(
    `select id, workspace_id, user_id, customer_id, display_name_snapshot, personality_note, preference_note, caution_note,
            conversation_summary, last_interaction_summary, next_topic_hint, tags, pinned, created_at::text, updated_at::text
     from velvet_customer_memories where workspace_id=$1 and user_id=$2 and customer_id=$3 limit 1`,
    [workspaceId, userId, customerId],
  );
  return rows.rows[0] ? mapRow(rows.rows[0]) : undefined;
}

export async function upsertCustomerMemory(input: Omit<VelvetCustomerMemory, "id" | "createdAt" | "updatedAt"> & { id?: string }): Promise<VelvetCustomerMemory> {
  const now = new Date().toISOString();
  if (getStorageMode() !== "postgres") {
    const existing = memoryRows.find((row) => row.workspaceId === input.workspaceId && row.userId === input.userId && row.customerId === input.customerId);
    if (existing) {
      Object.assign(existing, input, { updatedAt: now });
      return existing;
    }
    const created: VelvetCustomerMemory = { id: input.id ?? makeId(), ...input, createdAt: now, updatedAt: now };
    memoryRows.push(created);
    return created;
  }

  const id = input.id ?? makeId();
  const rows = await dbQuery<MemoryRow>(
    `insert into velvet_customer_memories
      (id, workspace_id, user_id, customer_id, display_name_snapshot, personality_note, preference_note, caution_note,
       conversation_summary, last_interaction_summary, next_topic_hint, tags, pinned)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
     on conflict (workspace_id, user_id, customer_id) do update set
       display_name_snapshot=excluded.display_name_snapshot,
       personality_note=excluded.personality_note,
       preference_note=excluded.preference_note,
       caution_note=excluded.caution_note,
       conversation_summary=excluded.conversation_summary,
       last_interaction_summary=excluded.last_interaction_summary,
       next_topic_hint=excluded.next_topic_hint,
       tags=excluded.tags,
       pinned=excluded.pinned,
       updated_at=now()
     returning id, workspace_id, user_id, customer_id, display_name_snapshot, personality_note, preference_note, caution_note,
       conversation_summary, last_interaction_summary, next_topic_hint, tags, pinned, created_at::text, updated_at::text`,
    [id, input.workspaceId, input.userId, input.customerId, input.displayNameSnapshot ?? null, input.personalityNote ?? null,
      input.preferenceNote ?? null, input.cautionNote ?? null, input.conversationSummary ?? null, input.lastInteractionSummary ?? null,
      input.nextTopicHint ?? null, input.tags, input.pinned],
  );
  return mapRow(rows.rows[0]);
}
