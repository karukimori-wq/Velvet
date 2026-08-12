import { getPlanAccess, isWithinHistoryWindow } from "@/lib/plan-access";
import { getStorageMode } from "@/lib/storage/config";
import { dbQuery } from "@/lib/storage/postgres";
import { addPersonKnowledgeStore, getPersonStore, listPeopleStore } from "@/lib/person-store";

export type CaptureKind = "knowledge" | "drink" | "work" | "hobby" | "appearance" | "accessory" | "marital_status" | "free_text";
export type CaptureEntry = {
  id: string;
  ownerUserId: string;
  personId?: string;
  kind: CaptureKind;
  value: string;
  createdAt: string;
};

export type CaptureSuggestion = {
  value: string;
  source: "person" | "recent" | "default";
  score: number;
};

type ReadOptions = { includeArchived?: boolean };
const entries: CaptureEntry[] = [];
const makeId = () => `capture_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;

const defaultSuggestions = [
  "メガネ", "黒髪", "既婚", "未婚", "ロレックス", "ゴルフ", "犬", "響", "白州", "旅行", "会社経営", "甘いもの好き",
];

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

function splitCandidateValues(raw: string) {
  return raw.split(/[、,\n]/).map((value) => value.trim()).filter((value) => value.length > 0 && value.length <= 30);
}

export async function getCaptureSuggestions(ownerUserId: string, personId?: string, limit = 18): Promise<CaptureSuggestion[]> {
  const [captures, people, person] = await Promise.all([
    listCaptures(ownerUserId),
    listPeopleStore(ownerUserId),
    personId ? getPersonStore(personId, ownerUserId) : Promise.resolve(undefined),
  ]);
  const scores = new Map<string, CaptureSuggestion>();
  const now = Date.now();

  const add = (value: string, score: number, source: CaptureSuggestion["source"]) => {
    const normalized = value.trim();
    if (!normalized || normalized.length > 30) return;
    const existing = scores.get(normalized);
    if (!existing || score > existing.score) scores.set(normalized, { value: normalized, score, source });
  };

  // Person-specific memory wins. These are the most likely things the user wants to re-confirm quickly.
  for (const value of person?.personality ?? []) add(value, 100, "person");

  // Repeated/recent captures become the user's personal stamp dictionary.
  const usage = new Map<string, { count: number; latest: number; personCount: number }>();
  for (const capture of captures) {
    if (capture.kind === "free_text") continue;
    for (const value of splitCandidateValues(capture.value)) {
      const current = usage.get(value) ?? { count: 0, latest: 0, personCount: 0 };
      current.count += 1;
      current.latest = Math.max(current.latest, new Date(capture.createdAt).getTime());
      if (personId && capture.personId === personId) current.personCount += 1;
      usage.set(value, current);
    }
  }
  for (const [value, info] of usage) {
    const ageDays = Math.max(0, (now - info.latest) / 86_400_000);
    const recency = Math.max(0, 20 - Math.min(20, ageDays));
    const score = 35 + Math.min(25, info.count * 4) + recency + Math.min(30, info.personCount * 10);
    add(value, score, info.personCount > 0 ? "person" : "recent");
  }

  // Existing personality across all people also feeds the reusable dictionary.
  const personalityFrequency = new Map<string, number>();
  for (const item of people) for (const value of item.personality) personalityFrequency.set(value, (personalityFrequency.get(value) ?? 0) + 1);
  for (const [value, count] of personalityFrequency) add(value, 30 + Math.min(20, count * 3), "recent");

  for (const [index, value] of defaultSuggestions.entries()) add(value, 10 - index * 0.1, "default");

  return [...scores.values()].sort((a, b) => b.score - a.score || a.value.localeCompare(b.value, "ja")).slice(0, limit);
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
