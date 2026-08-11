import { getStorageMode } from "@/lib/storage/config";
import { dbQuery } from "@/lib/storage/postgres";

export type SelfInvestmentCategory = "beauty" | "fashion" | "photo_content" | "learning" | "maintenance" | "other";

export type SelfInvestment = {
  id: string;
  ownerUserId: string;
  occurredAt: string;
  category: SelfInvestmentCategory;
  amount: number;
  memo?: string;
  createdAt: string;
};

const entries: SelfInvestment[] = [];
const makeId = () => `selfinv_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;

type Row = {
  id: string;
  owner_user_id: string;
  occurred_at: string;
  category: SelfInvestmentCategory;
  amount: number;
  memo: string | null;
  created_at: string;
};

function mapRow(row: Row): SelfInvestment {
  return {
    id: row.id,
    ownerUserId: row.owner_user_id,
    occurredAt: new Date(row.occurred_at).toISOString(),
    category: row.category,
    amount: row.amount,
    memo: row.memo ?? undefined,
    createdAt: new Date(row.created_at).toISOString(),
  };
}

export async function listSelfInvestments(ownerUserId: string): Promise<SelfInvestment[]> {
  if (getStorageMode() !== "postgres") {
    return entries.filter((entry) => entry.ownerUserId === ownerUserId).sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
  }
  const result = await dbQuery<Row>(
    `select id, owner_user_id, occurred_at::text, category, amount, memo, created_at::text
     from velvet_self_investments
     where owner_user_id = $1
     order by occurred_at desc`,
    [ownerUserId],
  );
  return result.rows.map(mapRow);
}

export async function createSelfInvestment(input: {
  ownerUserId: string;
  category: SelfInvestmentCategory;
  amount: number;
  occurredAt?: string;
  memo?: string;
}): Promise<SelfInvestment | undefined> {
  if (!Number.isFinite(input.amount) || input.amount < 0) return undefined;
  const occurredAt = input.occurredAt ? new Date(input.occurredAt) : new Date();
  if (!Number.isFinite(occurredAt.getTime())) return undefined;

  const entry: SelfInvestment = {
    id: makeId(),
    ownerUserId: input.ownerUserId,
    occurredAt: occurredAt.toISOString(),
    category: input.category,
    amount: Math.round(input.amount),
    memo: input.memo?.trim() || undefined,
    createdAt: new Date().toISOString(),
  };

  if (getStorageMode() !== "postgres") entries.unshift(entry);
  else await dbQuery(
    `insert into velvet_self_investments (id, owner_user_id, occurred_at, category, amount, memo, created_at)
     values ($1,$2,$3,$4,$5,$6,$7)`,
    [entry.id, entry.ownerUserId, entry.occurredAt, entry.category, entry.amount, entry.memo ?? null, entry.createdAt],
  );
  return entry;
}
