import { getStorageMode } from "./storage/config";
import { dbQuery } from "./storage/postgres";
import { getD1Database } from "./storage/d1";

export type VelvetPlan = "free" | "pro" | "business";
export type VelvetFeature =
  | "customer.manage"
  | "history.basic"
  | "history.unlimited"
  | "timeline.integrated"
  | "history.by_event"
  | "history.gifts"
  | "history.life_events"
  | "history.search"
  | "promise.manage"
  | "followup.manage"
  | "reminder.manage"
  | "attachment.manage"
  | "export.data"
  | "ai.assist.basic"
  | "ai.assist.advanced"
  | "business.integrations";

export type PlanAccess = {
  plan: VelvetPlan;
  historyCutoff?: Date;
  fullHistory: boolean;
  customerLimit?: number;
  integratedTimeline: boolean;
  eventViews: boolean;
  attachmentsAllowed: boolean;
  exportAllowed: boolean;
  businessAvailable: boolean;
  aiAssistLevel: "small" | "advanced";
};

type EntitlementRow = { plan: VelvetPlan; status: "trialing" | "active" | "past_due" | "canceled" | "expired" | "inactive" };

const PRO_FEATURES = new Set<VelvetFeature>([
  "customer.manage","history.basic","history.unlimited","timeline.integrated","history.by_event","history.gifts","history.life_events","history.search","promise.manage","followup.manage","reminder.manage","attachment.manage","export.data","ai.assist.basic","ai.assist.advanced",
]);
const FREE_FEATURES = new Set<VelvetFeature>(["customer.manage","history.basic","ai.assist.basic"]);

function buildAccess(plan: VelvetPlan, now: Date): PlanAccess {
  if (plan === "pro") return { plan, fullHistory:true, integratedTimeline:true, eventViews:true, attachmentsAllowed:true, exportAllowed:true, businessAvailable:false, aiAssistLevel:"advanced" };
  if (plan === "business") return { plan, fullHistory:true, integratedTimeline:true, eventViews:true, attachmentsAllowed:true, exportAllowed:true, businessAvailable:false, aiAssistLevel:"advanced" };
  const cutoff = new Date(now); cutoff.setUTCMonth(cutoff.getUTCMonth() - 3);
  return { plan:"free", historyCutoff:cutoff, fullHistory:false, customerLimit:30, integratedTimeline:false, eventViews:false, attachmentsAllowed:false, exportAllowed:false, businessAvailable:false, aiAssistLevel:"small" };
}

function normalizePlan(plan: unknown, status: unknown): VelvetPlan {
  if (status !== "active" && status !== "trialing") return "free";
  if (plan === "pro") return "pro";
  if (plan === "business") return "business";
  return "free";
}

export async function getPlanAccess(ownerUserId: string, now = new Date()): Promise<PlanAccess> {
  const mode = getStorageMode();
  if (mode === "d1") {
    const db = await getD1Database();
    const row = await db?.prepare("select plan,status from velvet_owner_entitlements where owner_user_id=? limit 1").bind(ownerUserId).first<EntitlementRow>();
    return buildAccess(normalizePlan(row?.plan,row?.status),now);
  }
  if (mode !== "postgres") {
    const configured = process.env.VELVET_PLAN?.trim().toLowerCase();
    return buildAccess(configured === "pro" ? "pro" : configured === "business" ? "business" : "free", now);
  }
  const result = await dbQuery<EntitlementRow>(`select plan,status from velvet_owner_entitlements where owner_user_id=$1 limit 1`,[ownerUserId]);
  return buildAccess(normalizePlan(result.rows[0]?.plan,result.rows[0]?.status),now);
}

export function hasVelvetFeature(access: PlanAccess, feature: VelvetFeature) {
  if (feature === "business.integrations") return false;
  if (access.plan === "pro" || access.plan === "business") return PRO_FEATURES.has(feature);
  return FREE_FEATURES.has(feature);
}

export function isWithinHistoryWindow(dateLike: string | Date | undefined, access: PlanAccess) {
  if (access.fullHistory) return true;
  if (!dateLike || !access.historyCutoff) return true;
  const date = dateLike instanceof Date ? dateLike : new Date(dateLike);
  return Number.isFinite(date.getTime()) && date.getTime() >= access.historyCutoff.getTime();
}
