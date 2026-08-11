-- Per-owner Velvet entitlement state.
-- Missing row means Free at application level; Pro must be explicitly granted.

create table if not exists velvet_owner_entitlements (
  owner_user_id text primary key,
  plan text not null default 'free' check (plan in ('free', 'pro')),
  status text not null default 'active' check (status in ('active', 'inactive', 'past_due', 'canceled')),
  current_period_end timestamptz,
  source text,
  updated_at timestamptz not null default now()
);

create index if not exists velvet_owner_entitlements_plan_idx
  on velvet_owner_entitlements(plan, status);
