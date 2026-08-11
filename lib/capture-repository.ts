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

const entries: CaptureEntry[] = [];

function makeId() {
  return `capture_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

type CaptureRow = {
  id: string;
  owner_user_id: string;
  person_id: string | null;
  kind: CaptureKind;
  raw_text: string;
  created_at: string;
};

function mapCapture(row: CaptureRow): CaptureEntry {
  return {
    id: row.id,
    ownerUserId: row.owner_user_id,
    personId: row.person_id ?? undefined,
    kind: row.kind,
    value: row.raw_text,
    createdAt: new Date(row.created_at).toISOString(),
  };
}

export async function listCaptures(ownerUserId: string, personId?: string): Promise<CaptureEntry[]> {
  if (getStorageMode() !== "postgres") {
    return entries.filter((entry) => entry.ownerUserId === ownerUserId && (!personId || entry.personId === personId));
  }
  const rows = await dbQuery<CaptureRow>(
    `select id, owner_user_id, person_id, kind, raw_text, created_at::text
     from velvet_captures
     where owner_user_id = $1 and ($2::text is null or person_id = $2)
     order by created_at desc`,
    [ownerUserId, personId ?? null],
  );
  return rows.rows.map(mapCapture);
}

export async function getCapture(id: string, ownerUserId: string): Promise<CaptureEntry | undefined> {
  if (getStorageMode() !== "postgres") return entries.find((entry) => entry.id === id && entry.ownerUserId === ownerUserId);
  const rows = await dbQuery<CaptureRow>(
    `select id, owner_user_id, person_id, kind, raw_text, created_at::text from velvet_captures where id = $1 and owner_user_id = $2 limit 1`,
    [id, ownerUserId],
  );
  return rows.rows[0] ? mapCapture(rows.rows[0]) : undefined;
}

export async function createCapture(input: { ownerUserId: string; personId?: string; kind?: CaptureKind; value: string }): Promise<CaptureEntry | undefined> {
  const value = input.value.trim();
  if (!value) return undefined;
  if (input.personId && !(await getPersonStore(input.personId, input.ownerUserId))) return undefined;

  const entry: CaptureEntry = {
    id: makeId(),
    ownerUserId: input.ownerUserId,
    personId: input.personId,
    kind: input.kind ?? "free_text",
    value,
    createdAt: new Date().toISOString(),
  };

  if (getStorageMode() !== "postgres") {
    entries.unshift(entry);
  } else {
    await dbQuery(
      `insert into velvet_captures (id, owner_user_id, person_id, raw_text, status, kind, created_at) values ($1,$2,$3,$4,'saved',$5,$6)`,
      [entry.id, entry.ownerUserId, entry.personId ?? null, entry.value, entry.kind, entry.createdAt],
    );
  }

  if (input.personId && entry.kind !== "free_text") {
    await addPersonKnowledgeStore(input.personId, value, input.ownerUserId);
  }

  return entry;
}
