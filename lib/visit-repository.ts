import { getPlanAccess, isWithinHistoryWindow } from "@/lib/plan-access";
import { getStorageMode } from "@/lib/storage/config";
import { dbQuery, withTransaction } from "@/lib/storage/postgres";
import { addTimelineItemStore, getPersonStore } from "@/lib/person-store";

export type VisitContext = "solo" | "group" | "entertainment" | "business" | "accompaniment" | "other";

export type Visit = {
  id: string;
  ownerUserId: string;
  participantIds: string[];
  startedAt: string;
  endedAt?: string;
  durationMinutes?: number;
  salesAmount?: number;
  paymentMethod?: "cash" | "card" | "qr" | "receivable" | "other";
  seatingReason?: string;
  visitContext?: VisitContext;
};

type ReadOptions = { includeArchived?: boolean };
const visits: Visit[] = [];

function makeId() {
  return `visit_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

function formatPayment(method?: Visit["paymentMethod"]) {
  if (!method) return undefined;
  return { cash: "現金", card: "カード", qr: "QR", receivable: "売掛", other: "その他" }[method];
}

function formatContext(context?: VisitContext) {
  if (!context) return undefined;
  return { solo: "個人", group: "複数人", entertainment: "接待", business: "仕事", accompaniment: "同伴", other: "その他" }[context];
}

type VisitRow = {
  id: string;
  owner_user_id: string;
  started_at: string;
  ended_at: string | null;
  duration_minutes: number | null;
  sales_amount: number | null;
  payment_method: Visit["paymentMethod"] | null;
  seating_reason: string | null;
  visit_context: VisitContext | null;
};

type ParticipantRow = { visit_id: string; person_id: string };

function mapVisit(row: VisitRow, participantIds: string[]): Visit {
  return {
    id: row.id,
    ownerUserId: row.owner_user_id,
    participantIds,
    startedAt: new Date(row.started_at).toISOString(),
    endedAt: row.ended_at ? new Date(row.ended_at).toISOString() : undefined,
    durationMinutes: row.duration_minutes ?? undefined,
    salesAmount: row.sales_amount ?? undefined,
    paymentMethod: row.payment_method ?? undefined,
    seatingReason: row.seating_reason ?? undefined,
    visitContext: row.visit_context ?? undefined,
  };
}

const visitSelect = "id, owner_user_id, started_at::text, ended_at::text, duration_minutes, sales_amount, payment_method, seating_reason, visit_context";

export async function listVisits(ownerUserId: string, options: ReadOptions = {}): Promise<Visit[]> {
  const access = await getPlanAccess(ownerUserId);
  if (getStorageMode() !== "postgres") {
    return visits.filter((visit) => visit.ownerUserId === ownerUserId && (options.includeArchived || isWithinHistoryWindow(visit.startedAt, access)));
  }
  const cutoff = options.includeArchived || access.fullHistory ? null : access.historyCutoff?.toISOString() ?? null;
  const [visitRows, participantRows] = await Promise.all([
    dbQuery<VisitRow>(`select ${visitSelect} from velvet_visits where owner_user_id = $1 and ($2::timestamptz is null or started_at >= $2) order by started_at desc`, [ownerUserId, cutoff]),
    dbQuery<ParticipantRow>(`select vp.visit_id, vp.person_id from velvet_visit_participants vp join velvet_visits v on v.id = vp.visit_id and v.owner_user_id = vp.owner_user_id where vp.owner_user_id = $1 and ($2::timestamptz is null or v.started_at >= $2)`, [ownerUserId, cutoff]),
  ]);
  const participants = new Map<string, string[]>();
  for (const row of participantRows.rows) {
    const list = participants.get(row.visit_id) ?? [];
    list.push(row.person_id);
    participants.set(row.visit_id, list);
  }
  return visitRows.rows.map((row) => mapVisit(row, participants.get(row.id) ?? []));
}

export async function getVisit(id: string, ownerUserId: string, options: ReadOptions = {}): Promise<Visit | undefined> {
  const access = await getPlanAccess(ownerUserId);
  if (getStorageMode() !== "postgres") {
    const visit = visits.find((item) => item.id === id && item.ownerUserId === ownerUserId);
    return visit && (options.includeArchived || isWithinHistoryWindow(visit.startedAt, access)) ? visit : undefined;
  }
  const cutoff = options.includeArchived || access.fullHistory ? null : access.historyCutoff?.toISOString() ?? null;
  const [visitRows, participantRows] = await Promise.all([
    dbQuery<VisitRow>(`select ${visitSelect} from velvet_visits where id = $1 and owner_user_id = $2 and ($3::timestamptz is null or started_at >= $3) limit 1`, [id, ownerUserId, cutoff]),
    dbQuery<ParticipantRow>(`select visit_id, person_id from velvet_visit_participants where visit_id = $1 and owner_user_id = $2`, [id, ownerUserId]),
  ]);
  const row = visitRows.rows[0];
  return row ? mapVisit(row, participantRows.rows.map((item) => item.person_id)) : undefined;
}

export async function getActiveVisitForPerson(personId: string, ownerUserId: string): Promise<Visit | undefined> {
  if (getStorageMode() !== "postgres") {
    return visits.find((visit) => visit.ownerUserId === ownerUserId && !visit.endedAt && visit.participantIds.includes(personId));
  }
  const rows = await dbQuery<VisitRow & { participant_ids: string[] }>(
    `select v.id, v.owner_user_id, v.started_at::text, v.ended_at::text, v.duration_minutes, v.sales_amount, v.payment_method, v.seating_reason, v.visit_context,
      array_agg(vp2.person_id order by vp2.person_id) as participant_ids
     from velvet_visits v
     join velvet_visit_participants vp on vp.visit_id = v.id and vp.owner_user_id = v.owner_user_id and vp.person_id = $1
     join velvet_visit_participants vp2 on vp2.visit_id = v.id and vp2.owner_user_id = v.owner_user_id
     where v.owner_user_id = $2 and v.ended_at is null
     group by v.id
     order by v.started_at desc limit 1`,
    [personId, ownerUserId],
  );
  const row = rows.rows[0];
  return row ? mapVisit(row, row.participant_ids) : undefined;
}

export async function startVisit(personId: string, ownerUserId: string): Promise<Visit | undefined> {
  const person = await getPersonStore(personId, ownerUserId);
  if (!person) return undefined;
  const existing = await getActiveVisitForPerson(personId, ownerUserId);
  if (existing) return existing;

  const visit: Visit = { id: makeId(), ownerUserId, participantIds: [personId], startedAt: new Date().toISOString() };
  if (getStorageMode() !== "postgres") {
    visits.unshift(visit);
    return visit;
  }
  await withTransaction(async (client) => {
    await client.query(`insert into velvet_visits (id, owner_user_id, started_at) values ($1,$2,$3)`, [visit.id, ownerUserId, visit.startedAt]);
    await client.query(`insert into velvet_visit_participants (visit_id, owner_user_id, person_id) values ($1,$2,$3)`, [visit.id, ownerUserId, personId]);
  });
  return visit;
}

export async function addParticipant(visitId: string, personId: string, ownerUserId: string): Promise<Visit | undefined> {
  const [visit, person] = await Promise.all([getVisit(visitId, ownerUserId), getPersonStore(personId, ownerUserId)]);
  if (!visit || !person || visit.endedAt) return undefined;
  if (visit.participantIds.includes(personId)) return visit;

  if (getStorageMode() !== "postgres") {
    visit.participantIds.push(personId);
    if (!visit.visitContext || visit.visitContext === "solo") visit.visitContext = "group";
    return visit;
  }

  await withTransaction(async (client) => {
    await client.query(`insert into velvet_visit_participants (visit_id, owner_user_id, person_id) values ($1,$2,$3) on conflict do nothing`, [visitId, ownerUserId, personId]);
    if (!visit.visitContext || visit.visitContext === "solo") {
      await client.query(`update velvet_visits set visit_context = 'group' where id = $1 and owner_user_id = $2 and ended_at is null`, [visitId, ownerUserId]);
    }
  });
  return getVisit(visitId, ownerUserId);
}

export async function updateVisit(
  visitId: string,
  patch: Partial<Pick<Visit, "salesAmount" | "paymentMethod" | "seatingReason" | "visitContext">>,
  ownerUserId: string,
): Promise<Visit | undefined> {
  const visit = await getVisit(visitId, ownerUserId);
  if (!visit || visit.endedAt) return undefined;

  const next: Visit = {
    ...visit,
    salesAmount: patch.salesAmount ?? visit.salesAmount,
    paymentMethod: patch.paymentMethod ?? visit.paymentMethod,
    seatingReason: patch.seatingReason ?? visit.seatingReason,
    visitContext: patch.visitContext ?? visit.visitContext,
  };

  if (getStorageMode() !== "postgres") {
    Object.assign(visit, next);
    return visit;
  }
  await dbQuery(
    `update velvet_visits
     set sales_amount = $3, payment_method = $4, seating_reason = $5, visit_context = $6
     where id = $1 and owner_user_id = $2 and ended_at is null`,
    [visitId, ownerUserId, next.salesAmount ?? null, next.paymentMethod ?? null, next.seatingReason ?? null, next.visitContext ?? null],
  );
  return getVisit(visitId, ownerUserId);
}

export async function endVisit(visitId: string, ownerUserId: string): Promise<Visit | undefined> {
  const visit = await getVisit(visitId, ownerUserId);
  if (!visit) return undefined;
  if (visit.endedAt) return visit;

  const endedAt = new Date();
  const durationMinutes = Math.max(0, Math.round((endedAt.getTime() - new Date(visit.startedAt).getTime()) / 60000));
  visit.endedAt = endedAt.toISOString();
  visit.durationMinutes = durationMinutes;

  if (getStorageMode() === "postgres") {
    await dbQuery(`update velvet_visits set ended_at = $3, duration_minutes = $4 where id = $1 and owner_user_id = $2 and ended_at is null`, [visitId, ownerUserId, visit.endedAt, durationMinutes]);
  }

  const date = visit.startedAt.slice(0, 10);
  const titleParts = [visit.seatingReason, formatContext(visit.visitContext), formatPayment(visit.paymentMethod), typeof visit.salesAmount === "number" ? `¥${visit.salesAmount.toLocaleString("ja-JP")}` : undefined].filter(Boolean);
  const title = titleParts.length > 0 ? titleParts.join(" · ") : "来店";
  const body = `滞在 ${durationMinutes}分`;

  for (const personId of visit.participantIds) {
    await addTimelineItemStore(personId, { id: `${visit.id}_${personId}`, date, title, body, eventType: "visit", sourceRef: visit.id }, ownerUserId);
    if (getStorageMode() === "postgres") {
      await dbQuery(`update velvet_people set last_visit = $3, updated_at = now() where id = $1 and owner_user_id = $2`, [personId, ownerUserId, visit.startedAt]);
    }
  }
  return getStorageMode() === "postgres" ? getVisit(visitId, ownerUserId) : visit;
}
