import { getStorageMode } from "@/lib/storage/config";
import { dbQuery } from "@/lib/storage/postgres";
import { getCustomerMemory, upsertCustomerMemory } from "@/lib/customer-memory-repository";
import { addProfessionalTimelineItem } from "@/lib/professional-timeline-repository";

export type CaptureKind = "knowledge" | "drink" | "work" | "hobby" | "appearance" | "accessory" | "marital_status" | "conversation_note" | "free_text";
export type CaptureEntry = { id: string; workspaceId: string; userId: string; customerId?: string; kind: CaptureKind; value: string; createdAt: string };
export type CaptureSuggestion = { value: string; source: "customer" | "recent" | "default"; score: number };

const entries: CaptureEntry[] = [];
const makeId = () => `capture_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
const defaults = ["メガネ", "黒髪", "既婚", "未婚", "ロレックス", "ゴルフ", "犬", "響", "白州", "旅行", "会社経営", "甘いもの好き"];
type CaptureRow = { id: string; workspace_id: string; user_id: string; customer_id: string | null; kind: CaptureKind; raw_text: string; created_at: string };
const mapRow = (row: CaptureRow): CaptureEntry => ({ id: row.id, workspaceId: row.workspace_id, userId: row.user_id, customerId: row.customer_id ?? undefined, kind: row.kind, value: row.raw_text, createdAt: new Date(row.created_at).toISOString() });

export async function listCaptures(workspaceId: string, userId: string, customerId?: string): Promise<CaptureEntry[]> {
  if (getStorageMode() !== "postgres") return entries.filter((entry) => entry.workspaceId === workspaceId && entry.userId === userId && (!customerId || entry.customerId === customerId));
  const rows = await dbQuery<CaptureRow>(`select id, workspace_id, user_id, customer_id, kind, raw_text, created_at::text from velvet_professional_captures where workspace_id=$1 and user_id=$2 and ($3::text is null or customer_id=$3) order by created_at desc`, [workspaceId, userId, customerId ?? null]);
  return rows.rows.map(mapRow);
}

export async function getCapture(id: string, workspaceId: string, userId: string): Promise<CaptureEntry | undefined> {
  if (getStorageMode() !== "postgres") return entries.find((entry) => entry.id === id && entry.workspaceId === workspaceId && entry.userId === userId);
  const rows = await dbQuery<CaptureRow>(`select id, workspace_id, user_id, customer_id, kind, raw_text, created_at::text from velvet_professional_captures where id=$1 and workspace_id=$2 and user_id=$3 limit 1`, [id, workspaceId, userId]);
  return rows.rows[0] ? mapRow(rows.rows[0]) : undefined;
}

export async function getCaptureSuggestions(workspaceId: string, userId: string, customerId?: string, limit = 18): Promise<CaptureSuggestion[]> {
  const [captures, memory] = await Promise.all([listCaptures(workspaceId, userId), customerId ? getCustomerMemory(workspaceId, userId, customerId) : Promise.resolve(undefined)]);
  const scores = new Map<string, CaptureSuggestion>();
  const add = (value: string, score: number, source: CaptureSuggestion["source"]) => { const v = value.trim(); if (!v || v.length > 30) return; const old = scores.get(v); if (!old || score > old.score) scores.set(v, { value: v, score, source }); };
  for (const value of memory?.tags ?? []) add(value, 100, "customer");
  const usage = new Map<string, number>();
  for (const capture of captures) if (!['free_text','conversation_note'].includes(capture.kind)) for (const raw of capture.value.split(/[、,\n]/)) { const v = raw.trim(); if (v) usage.set(v, (usage.get(v) ?? 0) + (capture.customerId === customerId ? 5 : 1)); }
  for (const [value, count] of usage) add(value, 30 + count * 5, customerId && captures.some((c) => c.customerId === customerId && c.value.includes(value)) ? "customer" : "recent");
  defaults.forEach((value, index) => add(value, 10 - index * 0.1, "default"));
  return [...scores.values()].sort((a,b) => b.score-a.score).slice(0, limit);
}

export async function createCapture(input: { workspaceId: string; userId: string; customerId?: string; kind?: CaptureKind; value: string }): Promise<CaptureEntry | undefined> {
  const value = input.value.trim(); if (!value) return undefined;
  const entry: CaptureEntry = { id: makeId(), workspaceId: input.workspaceId, userId: input.userId, customerId: input.customerId, kind: input.kind ?? "free_text", value, createdAt: new Date().toISOString() };
  if (getStorageMode() !== "postgres") entries.unshift(entry); else await dbQuery(`insert into velvet_professional_captures (id, workspace_id, user_id, customer_id, kind, raw_text, created_at) values ($1,$2,$3,$4,$5,$6,$7)`, [entry.id, entry.workspaceId, entry.userId, entry.customerId ?? null, entry.kind, entry.value, entry.createdAt]);
  if (entry.customerId && entry.kind === "conversation_note") await addProfessionalTimelineItem({ workspaceId: entry.workspaceId, userId: entry.userId, customerId: entry.customerId, eventType: "conversation", title: "会話メモ", body: value, sourceRef: entry.id });
  else if (entry.customerId && entry.kind !== "free_text") { const memory = await getCustomerMemory(entry.workspaceId, entry.userId, entry.customerId); const tags = Array.from(new Set([...(memory?.tags ?? []), ...value.split(/[、,\n]/).map(v=>v.trim()).filter(Boolean)])); await upsertCustomerMemory(entry.workspaceId, entry.userId, entry.customerId, { tags }); }
  return entry;
}
