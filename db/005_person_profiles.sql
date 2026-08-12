-- Structured optional profile fields. Person detail renders only populated values.
create table if not exists velvet_person_profiles (
  owner_user_id text not null,
  person_id text not null references velvet_people(id) on delete cascade,
  birth_date date,
  occupation text,
  company text,
  area text,
  marital_status text check (marital_status in ('unmarried','married','unknown')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (owner_user_id, person_id)
);

create index if not exists velvet_person_profiles_owner_idx
  on velvet_person_profiles(owner_user_id);
