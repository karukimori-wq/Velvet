-- Velvet initial PostgreSQL schema
-- Canonical owner scope is owner_user_id on every private row.

create table if not exists velvet_people (
  id text primary key,
  owner_user_id text not null,
  name text not null,
  rank text,
  last_visit timestamptz,
  next_visit timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists velvet_people_owner_name_idx on velvet_people(owner_user_id, name);

create table if not exists velvet_knowledge (
  id text primary key,
  owner_user_id text not null,
  person_id text not null references velvet_people(id) on delete cascade,
  category text,
  value text not null,
  created_at timestamptz not null default now()
);
create index if not exists velvet_knowledge_owner_person_idx on velvet_knowledge(owner_user_id, person_id);
create index if not exists velvet_knowledge_owner_value_idx on velvet_knowledge(owner_user_id, value);

create table if not exists velvet_visits (
  id text primary key,
  owner_user_id text not null,
  started_at timestamptz not null,
  ended_at timestamptz,
  duration_minutes integer,
  sales_amount integer,
  payment_method text,
  seating_reason text,
  created_at timestamptz not null default now()
);
create index if not exists velvet_visits_owner_started_idx on velvet_visits(owner_user_id, started_at desc);

create table if not exists velvet_visit_participants (
  visit_id text not null references velvet_visits(id) on delete cascade,
  owner_user_id text not null,
  person_id text not null references velvet_people(id) on delete cascade,
  primary key (visit_id, person_id)
);
create index if not exists velvet_visit_participants_owner_person_idx on velvet_visit_participants(owner_user_id, person_id);

create table if not exists velvet_gifts (
  id text primary key,
  owner_user_id text not null,
  person_id text not null references velvet_people(id) on delete cascade,
  direction text not null check (direction in ('received','given')),
  item text not null,
  estimated_value integer,
  occurred_at timestamptz not null default now(),
  memo text,
  created_at timestamptz not null default now()
);
create index if not exists velvet_gifts_owner_person_idx on velvet_gifts(owner_user_id, person_id, occurred_at desc);

create table if not exists velvet_relationships (
  id text primary key,
  owner_user_id text not null,
  person_a_id text not null references velvet_people(id) on delete cascade,
  person_b_id text not null references velvet_people(id) on delete cascade,
  relation_type text not null,
  label text,
  created_at timestamptz not null default now(),
  check (person_a_id <> person_b_id)
);
create index if not exists velvet_relationships_owner_a_idx on velvet_relationships(owner_user_id, person_a_id);
create index if not exists velvet_relationships_owner_b_idx on velvet_relationships(owner_user_id, person_b_id);

create table if not exists velvet_schedule_entries (
  id text primary key,
  owner_user_id text not null,
  person_id text references velvet_people(id) on delete cascade,
  entry_type text not null,
  title text not null,
  starts_at timestamptz not null,
  ends_at timestamptz,
  note text,
  created_at timestamptz not null default now()
);
create index if not exists velvet_schedule_owner_starts_idx on velvet_schedule_entries(owner_user_id, starts_at);

create table if not exists velvet_captures (
  id text primary key,
  owner_user_id text not null,
  person_id text references velvet_people(id) on delete cascade,
  raw_text text not null,
  status text not null default 'saved',
  created_at timestamptz not null default now()
);
create index if not exists velvet_captures_owner_person_idx on velvet_captures(owner_user_id, person_id, created_at desc);

create table if not exists velvet_timeline_items (
  id text primary key,
  owner_user_id text not null,
  person_id text not null references velvet_people(id) on delete cascade,
  occurred_at timestamptz not null,
  event_type text not null,
  title text not null,
  body text,
  source_ref text,
  created_at timestamptz not null default now()
);
create index if not exists velvet_timeline_owner_person_idx on velvet_timeline_items(owner_user_id, person_id, occurred_at desc);

-- Application queries must always include owner_user_id. Row-level security may be added
-- when the final authentication provider and database platform are selected.
