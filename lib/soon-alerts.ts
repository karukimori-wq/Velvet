import type { ProfessionalTimelineItem } from "@/lib/professional-timeline-repository";

export type SoonVisitAlert = {
  customerId: string;
  lastVisitedAt: string;
  visitCount: number;
  averageIntervalDays: number;
  daysSinceLastVisit: number;
  overdueDays: number;
  status: "soon" | "overdue";
};

const DAY = 24 * 60 * 60 * 1000;

function dayDiff(later: Date, earlier: Date) {
  return Math.max(0, Math.floor((later.getTime() - earlier.getTime()) / DAY));
}

export function buildSoonVisitAlert(customerId: string, timeline: ProfessionalTimelineItem[], now = new Date()): SoonVisitAlert | undefined {
  const visits = timeline
    .filter((item) => item.eventType === "visit")
    .map((item) => new Date(item.occurredAt))
    .filter((date) => Number.isFinite(date.getTime()))
    .sort((a, b) => a.getTime() - b.getTime());

  if (visits.length < 2) return undefined;

  const intervals = visits
    .slice(1)
    .map((visit, index) => dayDiff(visit, visits[index]))
    .filter((days) => days > 0);
  if (!intervals.length) return undefined;

  const averageIntervalDays = Math.max(1, Math.round(intervals.reduce((sum, days) => sum + days, 0) / intervals.length));
  const lastVisit = visits[visits.length - 1];
  const daysSinceLastVisit = dayDiff(now, lastVisit);
  const noticeFromDays = Math.max(1, averageIntervalDays - Math.min(2, Math.ceil(averageIntervalDays * 0.2)));

  if (daysSinceLastVisit < noticeFromDays) return undefined;

  const overdueDays = Math.max(0, daysSinceLastVisit - averageIntervalDays);
  return {
    customerId,
    lastVisitedAt: lastVisit.toISOString(),
    visitCount: visits.length,
    averageIntervalDays,
    daysSinceLastVisit,
    overdueDays,
    status: overdueDays > 0 ? "overdue" : "soon",
  };
}

export function sortSoonVisitAlerts(alerts: SoonVisitAlert[]) {
  return [...alerts].sort((a, b) => b.overdueDays - a.overdueDays || b.daysSinceLastVisit - a.daysSinceLastVisit || a.customerId.localeCompare(b.customerId));
}
