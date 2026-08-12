import { getStorageMode } from "@/lib/storage/config";
import { dbQuery } from "@/lib/storage/postgres";

export type DictionaryEntry = {
  id: string;
  workspaceId: string;
  userId: string;
  category: string;
  normalizedValue: string;
  displayValue: string;
  useCount: number;
  lastUsedAt: string;
};

const entries: DictionaryEntry[] = [];
const makeId = () => `dict_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
const normalize = (value: string) => value.trim().normalize("NFKC").toLocaleLowerCase("ja-JP");

type Row = {
  id: string;
  workspace_id: string;
  user_id: string;
  category: string;
  normalized_value: string;
  display_value: string;
  use_count: number;
  last_used_at: string;
};

const mapRow = (row: Row): DictionaryEntry => ({
  id: row.id,
  workspaceId: row.workspace_id,
  userId: row.user_id,
  category: row.category,
  normalizedValue: row.normalized_value,
  displayValue: row.display_value,
  useCount: row.use_count,
  lastUsedAt: new Date(row.last_used_at).toISOString(),
});

export async function listDictionaryEntries(workspaceId: string, userId: string, limit = 100) {
  if (getStorageMode() !== "postgres") {
    return entries.filter((entry) => entry.workspaceId === workspaceId && entry.userId === userId).sort((a, b) => b.useCount - a.useCount || b.lastUsedAt.localeCompare(a.lastUsedAt)).slice(0, limit);
  }
  const rows = await dbQuery<Row>(
    `select id, workspace_id, user_id, category, normalized_value, display_value, use_count, last_used_at::text
     from velvet_capture_dictionary
     where workspace_id=$1 and user_id=$2
     order by use_count desc, last_used_at desc
     limit $3`,
    [workspaceId, userId, limit],
  );
  return rows.rows.map(mapRow);
}

export async function recordDictionaryUse(workspaceId: string, userId: string, value: string, category = "knowledge") {
  const displayValue = value.trim();
  const normalizedValue = normalize(displayValue);
  if (!normalizedValue || displayValue.length > 60) return;
  const now = new Date().toISOString();
  if (getStorageMode() !== "postgres") {
    const existing = entries.find((entry) => entry.workspaceId === workspaceId && entry.userId === userId && entry.category === category && entry.normalizedValue === normalizedValue);
    if (existing) { existing.displayValue = displayValue; existing.useCount += 1; existing.lastUsedAt = now; return; }
    entries.push({ id: makeId(), workspaceId, userId, category, normalizedValue, displayValue, useCount: 1, lastUsedAt: now });
    return;
  }
  await dbQuery(
    `insert into velvet_capture_dictionary (id, workspace_id, user_id, category, normalized_value, display_value, use_count, last_used_at)
     values ($1,$2,$3,$4,$5,$6,1,$7)
     on conflict (workspace_id, user_id, category, normalized_value)
     do update set display_value=excluded.display_value, use_count=velvet_capture_dictionary.use_count+1, last_used_at=excluded.last_used_at, updated_at=now()`,
    [makeId(), workspaceId, userId, category, normalizedValue, displayValue, now],
  );
}

export async function deleteDictionaryEntry(id: string, workspaceId: string, userId: string) {
  if (getStorageMode() !== "postgres") {
    const index = entries.findIndex((entry) => entry.id === id && entry.workspaceId === workspaceId && entry.userId === userId);
    if (index >= 0) entries.splice(index, 1);
    return;
  }
  await dbQuery(`delete from velvet_capture_dictionary where id=$1 and workspace_id=$2 and user_id=$3`, [id, workspaceId, userId]);
}
