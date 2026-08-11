import { getPlanAccess, isWithinHistoryWindow } from "@/lib/plan-access";
import { getStorageMode } from "@/lib/storage/config";
import { dbQuery } from "@/lib/storage/postgres";
import { addPersonKnowledgeStore, getPersonStore } from "@/lib/person-store";

export type CaptureKind = "knowledge" | "drink" | "work" | "hobby" | "appearance" | "accessory" | "marital_status" | "free_text";
export type CaptureEntry = {
  id: string;
  ownerUserId: string;
  personId?: string;
  kind: CaptureKind;
  value: string;
  createdAt: string;
};

type ReadOptions = { includeArchived?: boolean };
const entries: CaptureEntry[] = [];
const makeId = () => `capture_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;

type CaptureRow = { id: string; owner_user_id: string; person_id: string | null; kind: CaptureKind; raw_text: string; created_at: string };
const mapCapture = (row: CaptureRow): CaptureEntry => ({
  id: row.id,
  ownerUserId: row.owner_user_id,
  personId: row.person_id ?? undefined,
  kind: row.kind,
  value: row.raw_text,
  createdAt: new Date(row.created_at).toISOString(),
});

export async function listCaptures(ownerUserId: string, personId?: string, options: ReadOptions = {}): Promise<CaptureEntry[]> {
  const access = await getPlanAccess(ownerUserId);
  if (getStorageMode() !== "postgres") {
    return entries.filter((entry) => entry.ownerUserId === ownerUserId && (!personId || entry.personId === personId) && (options.includeArchived || isWithinHistoryWindow(entry.createdAt, access)));
  }
  const cutoff = options.includeArchived || access.fullHistory ? null : access.historyCutoff?.toISOString() ?? null;
  const rows = await dbQuery<CaptureRow>(
    `select id, owner_user_id, person_id, kind, raw_text, created_at::text
     from velvet_captures
     where owner_user_id = $1 and ($2::text is null or person_id = $2) and ($3::timestamptz is null or created_at >= $3)
     order by created_at desc`,
    [ownerUserId, personId ?? null, cutoff],
  );
  return rows.rows.map(mapCapture);
}

export async function getCapture(id: string, ownerUserId: string, options: ReadOptions = {}): Promise<CaptureEntry | undefined> {
  const access = await getPlanAccess(ownerUserId);
  if (getStorageMode() !== "postgres") {
    const entry = entries.find((item) => item.id === id && item.ownerUserId === ownerUserId);
    return entry && (options.includeArchived || isWithinHistoryWindow(entry.createdAt, access)) ? entry : undefined;
  }
  const cutoff = options.includeArchived || access.fullHistory ? null : access.historyCutoff?.toISOString() ?? null;
  const rows = await dbQuery<CaptureRow>(
    `select id, owner_user_id, person_id, kind, raw_text, created_at::text from velvet_captures where id = $1 and owner_user_id = $2 and ($3::timestamptz is null or created_at >= $3) limit 1`,
    [id, ownerUserId, cutoff],
  );
  return rows.rows[0] ? mapCapture(rows.rows[0]) : undefined;
}

export async function createCapture(input: { ownerUserId: string; personId?: string; kind?: CaptureKind; value: string }): Promise<CaptureEntry | undefined> {
  const value = input.value.trim();
  if (!value) return undefined;
  if (input.personId && !(await getPersonStore(input.personId, input.ownerUserId))) return undefined;
  const entry: CaptureEntry = { id: makeId(), ownerUserId: input.ownerUserId, personId: input.personId, kind: input.kind ?? "free_text", value, createdAt: new Date().toISOString() };
  if (getStorageMode() !== "postgres") entries.unshift(entry);
  else await dbQuery(
    `insert into velvet_captures (id, owner_user_id, person_id, raw_text, status, kind, created_at) values ($1,$2,$3,$4,'saved',$5,$6)`,
    [entry.id, entry.ownerUserId, entry.personId ?? null, entry.value, entry.kind, entry.createdAt],
  );
  if (input.personId && entry.kind !== "free_text") await addPersonKnowledgeStore(input.personId, value, input.ownerUserId);
  return entry;
}
