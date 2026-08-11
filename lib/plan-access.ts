import { getStorageMode } from "./storage/config";
import { dbQuery } from "./storage/postgres";

export type VelvetPlan = "free" | "pro";

export type PlanAccess = {
  plan: VelvetPlan;
  historyCutoff?: Date;
  fullHistory: boolean;
  imagesAllowed: boolean;
};

type EntitlementRow = {
  plan: VelvetPlan;
  status: "active" | "inactive" | "past_due" | "canceled";
};

function buildAccess(plan: VelvetPlan, now: Date): PlanAccess {
  if (plan === "pro") return { plan, fullHistory: true, imagesAllowed: true };
  const cutoff = new Date(now);
  cutoff.setUTCFullYear(cutoff.getUTCFullYear() - 1);
  return { plan: "free", historyCutoff: cutoff, fullHistory: false, imagesAllowed: false };
}

/**
 * Production entitlement source is per-owner data in PostgreSQL.
 * Missing/inactive entitlement always falls back to Free.
 *
 * Memory mode keeps VELVET_PLAN only as a development convenience.
 */
export async function getPlanAccess(ownerUserId: string, now = new Date()): Promise<PlanAccess> {
  if (getStorageMode() !== "postgres") {
    const configured = process.env.VELVET_PLAN?.trim().toLowerCase();
    return buildAccess(configured === "pro" ? "pro" : "free", now);
  }

  const result = await dbQuery<EntitlementRow>(
    `select plan, status from velvet_owner_entitlements where owner_user_id = $1 limit 1`,
    [ownerUserId],
  );
  const row = result.rows[0];
  const plan: VelvetPlan = row?.plan === "pro" && row.status === "active" ? "pro" : "free";
  return buildAccess(plan, now);
}

export function isWithinHistoryWindow(dateLike: string | Date | undefined, access: PlanAccess) {
  if (access.fullHistory) return true;
  if (!dateLike || !access.historyCutoff) return true;
  const date = dateLike instanceof Date ? dateLike : new Date(dateLike);
  return Number.isFinite(date.getTime()) && date.getTime() >= access.historyCutoff.getTime();
}
