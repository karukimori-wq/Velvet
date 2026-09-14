import { getStorageMode } from "@/lib/storage/config";
import { dbQuery } from "@/lib/storage/postgres";
import { getD1Database } from "@/lib/storage/d1";

export type OwnerPreferences = {
  ownerUserId: string;
  soonAlertsEnabled: boolean;
};

type PreferenceRow = {
  owner_user_id: string;
  soon_alerts_enabled: number | boolean;
};

const defaults = (ownerUserId: string): OwnerPreferences => ({ ownerUserId, soonAlertsEnabled: true });
const inMemory = new Map<string, OwnerPreferences>();

function mapRow(row: PreferenceRow): OwnerPreferences {
  return {
    ownerUserId: row.owner_user_id,
    soonAlertsEnabled: row.soon_alerts_enabled === true || row.soon_alerts_enabled === 1,
  };
}

export async function getOwnerPreferences(ownerUserId: string): Promise<OwnerPreferences> {
  const db = await getD1Database();
  if (db) {
    const row = await db
      .prepare("select owner_user_id,soon_alerts_enabled from velvet_owner_preferences where owner_user_id=? limit 1")
      .bind(ownerUserId)
      .first<PreferenceRow>();
    return row ? mapRow(row) : defaults(ownerUserId);
  }

  if (getStorageMode() !== "postgres") return inMemory.get(ownerUserId) ?? defaults(ownerUserId);

  const result = await dbQuery<PreferenceRow>(
    "select owner_user_id,soon_alerts_enabled from velvet_owner_preferences where owner_user_id=$1 limit 1",
    [ownerUserId],
  );
  return result.rows[0] ? mapRow(result.rows[0]) : defaults(ownerUserId);
}

export async function setSoonAlertsEnabled(ownerUserId: string, enabled: boolean) {
  const next: OwnerPreferences = { ownerUserId, soonAlertsEnabled: enabled };
  const db = await getD1Database();
  if (db) {
    await db
      .prepare(
        "insert into velvet_owner_preferences(owner_user_id,soon_alerts_enabled,updated_at) values(?,?,strftime('%Y-%m-%dT%H:%M:%fZ','now')) on conflict(owner_user_id) do update set soon_alerts_enabled=excluded.soon_alerts_enabled,updated_at=excluded.updated_at",
      )
      .bind(ownerUserId, enabled ? 1 : 0)
      .run();
    return next;
  }

  if (getStorageMode() !== "postgres") {
    inMemory.set(ownerUserId, next);
    return next;
  }

  await dbQuery(
    "insert into velvet_owner_preferences(owner_user_id,soon_alerts_enabled,updated_at) values($1,$2,now()) on conflict(owner_user_id) do update set soon_alerts_enabled=excluded.soon_alerts_enabled,updated_at=excluded.updated_at",
    [ownerUserId, enabled],
  );
  return next;
}
