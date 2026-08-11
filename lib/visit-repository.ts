import { getPerson } from "@/lib/demo-data";

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
};

const OWNER = "user_demo_owner";
const visits: Visit[] = [];

function makeId() {
  return `visit_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

function formatPayment(method?: Visit["paymentMethod"]) {
  if (!method) return undefined;
  return { cash: "現金", card: "カード", qr: "QR", receivable: "売掛", other: "その他" }[method];
}

export function listVisits(ownerUserId = OWNER) {
  return visits.filter((visit) => visit.ownerUserId === ownerUserId);
}

export function getVisit(id: string, ownerUserId = OWNER) {
  return visits.find((visit) => visit.id === id && visit.ownerUserId === ownerUserId);
}

export function getActiveVisitForPerson(personId: string, ownerUserId = OWNER) {
  return visits.find((visit) => visit.ownerUserId === ownerUserId && !visit.endedAt && visit.participantIds.includes(personId));
}

export function startVisit(personId: string, ownerUserId = OWNER) {
  const person = getPerson(personId, ownerUserId);
  if (!person) return undefined;
  const existing = getActiveVisitForPerson(personId, ownerUserId);
  if (existing) return existing;
  const visit: Visit = {
    id: makeId(),
    ownerUserId,
    participantIds: [personId],
    startedAt: new Date().toISOString(),
  };
  visits.unshift(visit);
  return visit;
}

export function addParticipant(visitId: string, personId: string, ownerUserId = OWNER) {
  const visit = getVisit(visitId, ownerUserId);
  const person = getPerson(personId, ownerUserId);
  if (!visit || !person || visit.endedAt) return undefined;
  if (!visit.participantIds.includes(personId)) visit.participantIds.push(personId);
  return visit;
}

export function updateVisit(visitId: string, patch: Partial<Pick<Visit, "salesAmount" | "paymentMethod" | "seatingReason">>, ownerUserId = OWNER) {
  const visit = getVisit(visitId, ownerUserId);
  if (!visit || visit.endedAt) return undefined;
  Object.assign(visit, patch);
  return visit;
}

export function endVisit(visitId: string, ownerUserId = OWNER) {
  const visit = getVisit(visitId, ownerUserId);
  if (!visit) return undefined;
  if (!visit.endedAt) {
    const endedAt = new Date();
    visit.endedAt = endedAt.toISOString();
    visit.durationMinutes = Math.max(0, Math.round((endedAt.getTime() - new Date(visit.startedAt).getTime()) / 60000));

    const date = visit.startedAt.slice(0, 10);
    const titleParts = [visit.seatingReason, formatPayment(visit.paymentMethod), typeof visit.salesAmount === "number" ? `¥${visit.salesAmount.toLocaleString("ja-JP")}` : undefined].filter(Boolean);
    const title = titleParts.length > 0 ? titleParts.join(" · ") : "来店";
    const body = typeof visit.durationMinutes === "number" ? `滞在 ${visit.durationMinutes}分` : undefined;

    for (const personId of visit.participantIds) {
      const person = getPerson(personId, ownerUserId);
      if (!person) continue;
      person.lastVisit = date;
      person.timeline.unshift({
        id: `${visit.id}_${personId}`,
        date,
        title,
        body,
      });
    }
  }
  return visit;
}
