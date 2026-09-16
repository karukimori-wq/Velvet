"use server";

import { redirect } from "next/navigation";
import { getRequestIdentity } from "@/lib/auth/request-identity";
import { getGrowthCustomer } from "@/lib/growth-engine-customer";
import { createScheduleEntry, type ScheduleKind } from "@/lib/schedule-repository";
import { INPUT_LIMITS } from "@/lib/input-limits";

const allowedKinds = new Set<ScheduleKind>(["shift", "visit", "birthday", "unavailable", "self_investment", "other"]);

export async function createScheduleAction(formData: FormData) {
  const rawKind = String(formData.get("kind") ?? "other");
  if (!allowedKinds.has(rawKind as ScheduleKind)) redirect("/schedule?error=kind");
  const kind = rawKind as ScheduleKind;
  const customerId = String(formData.get("customerId") ?? "").trim() || undefined;
  const startsAt = String(formData.get("startsAt") ?? "").trim() || undefined;
  const note = String(formData.get("note") ?? "").trim() || undefined;
  let title = String(formData.get("title") ?? "").trim();
  if (customerId && customerId.length > INPUT_LIMITS.customerId) redirect("/schedule?error=customer");
  if (title.length > INPUT_LIMITS.scheduleTitle || (note?.length ?? 0) > INPUT_LIMITS.scheduleNote) redirect("/schedule?error=too_long");
  if (!startsAt || !Number.isFinite(new Date(startsAt).getTime())) redirect("/schedule?error=datetime");

  const { workspaceId, userId } = await getRequestIdentity();
  if (kind === "visit") {
    if (!customerId) redirect("/schedule?error=customer");
    const customer = await getGrowthCustomer(workspaceId, userId, customerId);
    if (!title) title = `${customer?.displayName ?? "お客様"} 来店`;
  }

  if (!title) {
    const defaults: Partial<Record<ScheduleKind, string>> = { shift: "出勤", birthday: "誕生日", unavailable: "予定あり", self_investment: "自分の予定", other: "予定" };
    title = defaults[kind] ?? "予定";
  }
  await createScheduleEntry({ workspaceId, userId, kind, title, customerId, startsAt, note });
  redirect("/schedule?saved=1");
}
