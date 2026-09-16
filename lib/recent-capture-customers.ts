import { getStorageMode } from "@/lib/storage/config";
import { getD1Database } from "@/lib/storage/d1";
import { dbQuery } from "@/lib/storage/postgres";
import { listCaptures } from "@/lib/capture-repository";

type RecentCustomerRow = { customer_id: string };

export async function listRecentCaptureCustomerIds(workspaceId: string, userId: string, limit = 6): Promise<string[]> {
  const safeLimit = Math.max(1, Math.min(12, Math.trunc(limit)));
  const mode = getStorageMode();
  if (mode === "d1") {
    const db = await getD1Database();
    if (!db) return [];
    const result = await db.prepare(
      "SELECT customer_id FROM velvet_professional_captures WHERE workspace_id=? AND user_id=? AND customer_id IS NOT NULL GROUP BY customer_id ORDER BY MAX(created_at) DESC LIMIT ?",
    ).bind(workspaceId, userId, safeLimit).all<RecentCustomerRow>();
    return result.results.map(row => row.customer_id).filter(Boolean);
  }
  if (mode === "postgres") {
    const rows = await dbQuery<RecentCustomerRow>(
      "select customer_id from velvet_professional_captures where workspace_id=$1 and user_id=$2 and customer_id is not null group by customer_id order by max(created_at) desc limit $3",
      [workspaceId, userId, safeLimit],
    );
    return rows.rows.map(row => row.customer_id).filter(Boolean);
  }
  const captures = await listCaptures(workspaceId, userId);
  return Array.from(new Set(captures.map(item => item.customerId).filter((value): value is string => Boolean(value)))).slice(0, safeLimit);
}
