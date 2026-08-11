-- Structured contacts and media metadata

create table if not exists velvet_person_contacts (
  id text primary key,
  owner_user_id text not null,
  person_id text not null references velvet_people(id) on delete cascade,
  contact_type text not null check (contact_type in ('phone','email','line','instagram','x','tiktok','other')),
  label text,
  value text not null,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists velvet_person_contacts_owner_person_idx on velvet_person_contacts(owner_user_id, person_id);
create index if not exists velvet_person_contacts_owner_value_idx on velvet_person_contacts(owner_user_id, value);

create table if not exists velvet_media_assets (
  id text primary key,
  owner_user_id text not null,
  person_id text references velvet_people(id) on delete cascade,
  asset_type text not null check (asset_type in ('profile','business_card','gift','other')),
  storage_key text not null,
  mime_type text not null,
  byte_size integer not null check (byte_size >= 0),
  created_at timestamptz not null default now()
);
create index if not exists velvet_media_assets_owner_person_idx on velvet_media_assets(owner_user_id, person_id, created_at desc);
