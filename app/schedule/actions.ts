"use server";

import { redirect } from "next/navigation";
import { getCurrentOwnerUserId } from "@/lib/current-owner";
import { createScheduleEntry, type ScheduleKind } from "@/lib/schedule-repository";

export async function createScheduleAction(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;
  const ownerUserId = getCurrentOwnerUserId();
  const kind = String(formData.get("kind") ?? "other") as ScheduleKind;
  const personId = String(formData.get("personId") ?? "").trim() || undefined;
  const startsAt = String(formData.get("startsAt") ?? "").trim() || undefined;
  const note = String(formData.get("note") ?? "").trim() || undefined;
  await createScheduleEntry({ kind, title, personId, startsAt, note }, ownerUserId);
  redirect("/schedule");
}
