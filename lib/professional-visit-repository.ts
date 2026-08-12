import { getStorageMode } from "@/lib/storage/config";
import { dbQuery } from "@/lib/storage/postgres";

export type VelvetProfessionalVisit = {
  id: string;
  workspaceId: string;
  userId: string;
  customerId: string;
  reservationId?: string;
  visitScheduleId?: string;
  visitedAt: string;
  endedAt?: string;
  durationMinutes?: number;
  serviceContext?: string;
  seatingReason?: string;
  conversationMemo?: string;
  preferenceMemo?: string;
  cautionMemo?: string;
  nextActionMemo?: string;
  summary?: string;
  createdAt: string;
  updatedAt: string;
};

const visits: VelvetProfessionalVisit[] = [];
const makeId = () => `visit_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

type VisitRow = {
  id: string;
  workspace_id: string;
  user_id: string;
  customer_id: string;
  reservation_id: string | null;
  visit_schedule_id: string | null;
  visited_at: string;
  ended_at: string | null;
  duration_minutes: number | null;
  service_context: string | null;
  seating_reason: string | null;
  conversation_memo: string | null;
  preference_memo: string | null;
  caution_memo: string | null;
  next_action_memo: string | null;
  summary: string | null;
  created_at: string;
  updated_at: string;
};

function mapRow(row: VisitRow): VelvetProfessionalVisit {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    userId: row.user_id,
    customerId: row.customer_id,
    reservationId: row.reservation_id ?? undefined,
    visitScheduleId: row.visit_schedule_id ?? undefined,
    visitedAt: new Date(row.visited_at).toISOString(),
    endedAt: row.ended_at ? new Date(row.ended_at).toISOString() : undefined,
    durationMinutes: row.duration_minutes ?? undefined,
    serviceContext: row.service_context ?? undefined,
    seatingReason: row.seating_reason ?? undefined,
    conversationMemo: row.conversation_memo ?? undefined,
    preferenceMemo: row.preference_memo ?? undefined,
    cautionMemo: row.caution_memo ?? undefined,
    nextActionMemo: row.next_action_memo ?? undefined,
    summary: row.summary ?? undefined,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  };
}

export async function startProfessionalVisit(input: {
  workspaceId: string;
  userId: string;
  customerId: string;
  reservationId?: string;
  visitScheduleId?: string;
  serviceContext?: string;
  seatingReason?: string;
}): Promise<VelvetProfessionalVisit> {
  const now = new Date().toISOString();
  const visit: VelvetProfessionalVisit = {
    id: makeId(), workspaceId: input.workspaceId, userId: input.userId, customerId: input.customerId,
    reservationId: input.reservationId, visitScheduleId: input.visitScheduleId, serviceContext: input.serviceContext,
    seatingReason: input.seatingReason, visitedAt: now, createdAt: now, updatedAt: now,
  };
  if (getStorageMode() !== "postgres") { visits.unshift(visit); return visit; }
  const rows = await dbQuery<VisitRow>(
    `insert into velvet_professional_visits
      (id, workspace_id, user_id, customer_id, reservation_id, visit_schedule_id, visited_at, service_context, seating_reason)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9)
     returning id, workspace_id, user_id, customer_id, reservation_id, visit_schedule_id, visited_at::text, ended_at::text,
       duration_minutes, service_context, seating_reason, conversation_memo, preference_memo, caution_memo, next_action_memo,
       summary, created_at::text, updated_at::text`,
    [visit.id, input.workspaceId, input.userId, input.customerId, input.reservationId ?? null, input.visitScheduleId ?? null,
      now, input.serviceContext ?? null, input.seatingReason ?? null],
  );
  return mapRow(rows.rows[0]);
}

export async function getProfessionalVisit(id: string, workspaceId: string, userId: string): Promise<VelvetProfessionalVisit | undefined> {
  if (getStorageMode() !== "postgres") return visits.find((visit) => visit.id === id && visit.workspaceId === workspaceId && visit.userId === userId);
  const rows = await dbQuery<VisitRow>(
    `select id, workspace_id, user_id, customer_id, reservation_id, visit_schedule_id, visited_at::text, ended_at::text,
      duration_minutes, service_context, seating_reason, conversation_memo, preference_memo, caution_memo, next_action_memo,
      summary, created_at::text, updated_at::text
     from velvet_professional_visits where id=$1 and workspace_id=$2 and user_id=$3 limit 1`,
    [id, workspaceId, userId],
  );
  return rows.rows[0] ? mapRow(rows.rows[0]) : undefined;
}

export async function updateProfessionalVisit(id: string, workspaceId: string, userId: string, patch: Partial<Pick<VelvetProfessionalVisit,
  "serviceContext" | "seatingReason" | "conversationMemo" | "preferenceMemo" | "cautionMemo" | "nextActionMemo" | "summary"
>>): Promise<VelvetProfessionalVisit | undefined> {
  const current = await getProfessionalVisit(id, workspaceId, userId);
  if (!current || current.endedAt) return current;
  const next = { ...current, ...Object.fromEntries(Object.entries(patch).filter(([, value]) => value !== undefined)) };
  if (getStorageMode() !== "postgres") { Object.assign(current, next, { updatedAt: new Date().toISOString() }); return current; }
  const rows = await dbQuery<VisitRow>(
    `update velvet_professional_visits set service_context=$4, seating_reason=$5, conversation_memo=$6, preference_memo=$7,
      caution_memo=$8, next_action_memo=$9, summary=$10, updated_at=now()
     where id=$1 and workspace_id=$2 and user_id=$3
     returning id, workspace_id, user_id, customer_id, reservation_id, visit_schedule_id, visited_at::text, ended_at::text,
      duration_minutes, service_context, seating_reason, conversation_memo, preference_memo, caution_memo, next_action_memo,
      summary, created_at::text, updated_at::text`,
    [id, workspaceId, userId, next.serviceContext ?? null, next.seatingReason ?? null, next.conversationMemo ?? null,
      next.preferenceMemo ?? null, next.cautionMemo ?? null, next.nextActionMemo ?? null, next.summary ?? null],
  );
  return rows.rows[0] ? mapRow(rows.rows[0]) : undefined;
}

export async function endProfessionalVisit(id: string, workspaceId: string, userId: string): Promise<VelvetProfessionalVisit | undefined> {
  const current = await getProfessionalVisit(id, workspaceId, userId);
  if (!current) return undefined;
  if (current.endedAt) return current;
  const endedAt = new Date();
  const durationMinutes = Math.max(0, Math.round((endedAt.getTime() - new Date(current.visitedAt).getTime()) / 60000));
  if (getStorageMode() !== "postgres") {
    current.endedAt = endedAt.toISOString(); current.durationMinutes = durationMinutes; current.updatedAt = endedAt.toISOString(); return current;
  }
  const rows = await dbQuery<VisitRow>(
    `update velvet_professional_visits set ended_at=$4, duration_minutes=$5, updated_at=now()
     where id=$1 and workspace_id=$2 and user_id=$3
     returning id, workspace_id, user_id, customer_id, reservation_id, visit_schedule_id, visited_at::text, ended_at::text,
      duration_minutes, service_context, seating_reason, conversation_memo, preference_memo, caution_memo, next_action_memo,
      summary, created_at::text, updated_at::text`,
    [id, workspaceId, userId, endedAt.toISOString(), durationMinutes],
  );
  return rows.rows[0] ? mapRow(rows.rows[0]) : undefined;
}
