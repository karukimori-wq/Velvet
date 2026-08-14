"use server";

import { redirect } from "next/navigation";
import { getRequestIdentity } from "@/lib/auth/request-identity";
import { getGrowthCustomer } from "@/lib/growth-engine-customer";
import { createScheduleEntry, type ScheduleKind } from "@/lib/schedule-repository";

export async function createScheduleAction(formData: FormData) {
  const { workspaceId, userId } = await getRequestIdentity();
  const kind = String(formData.get("kind") ?? "other") as ScheduleKind;
  const customerId = String(formData.get("customerId") ?? "").trim() || undefined;
  const startsAt = String(formData.get("startsAt") ?? "").trim() || undefined;
  const note = String(formData.get("note") ?? "").trim() || undefined;
  let title = String(formData.get("title") ?? "").trim();

  if (!startsAt) redirect("/schedule?error=datetime");

  if (kind === "visit") {
    if (!customerId) redirect("/schedule?error=customer");
    const customer = await getGrowthCustomer(workspaceId, userId, customerId);
    if (!title) title = `${customer?.displayName ?? "お客様"} 来店`;
  }

  if (!title) {
    const defaults: Partial<Record<ScheduleKind, string>> = {
      shift: "出勤",
      birthday: "誕生日",
      unavailable: "予定あり",
      self_investment: "自分の予定",
      other: "予定",
    };
    title = defaults[kind] ?? "予定";
  }

  await createScheduleEntry({ workspaceId, userId, kind, title, customerId, startsAt, note });
  redirect("/schedule?saved=1");
}
