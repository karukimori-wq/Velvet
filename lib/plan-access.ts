export type VelvetPlan = "free" | "pro";

export type PlanAccess = {
  plan: VelvetPlan;
  historyCutoff?: Date;
  fullHistory: boolean;
  imagesAllowed: boolean;
};

/**
 * Temporary entitlement seam. Production billing/session integration should
 * resolve plan per authenticated owner, not from client input.
 *
 * Until that provider is connected, defaulting to Free is the safe behavior.
 */
export function getPlanAccess(_ownerUserId: string, now = new Date()): PlanAccess {
  const configured = process.env.VELVET_PLAN?.trim().toLowerCase();
  const plan: VelvetPlan = configured === "pro" ? "pro" : "free";
  if (plan === "pro") {
    return { plan, fullHistory: true, imagesAllowed: true };
  }

  const cutoff = new Date(now);
  cutoff.setUTCFullYear(cutoff.getUTCFullYear() - 1);
  return {
    plan,
    historyCutoff: cutoff,
    fullHistory: false,
    imagesAllowed: false,
  };
}

export function isWithinHistoryWindow(dateLike: string | Date | undefined, access: PlanAccess) {
  if (access.fullHistory) return true;
  if (!dateLike || !access.historyCutoff) return true;
  const date = dateLike instanceof Date ? dateLike : new Date(dateLike);
  return Number.isFinite(date.getTime()) && date.getTime() >= access.historyCutoff.getTime();
}
