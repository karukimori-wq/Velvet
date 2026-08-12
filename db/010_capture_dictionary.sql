create table if not exists velvet_capture_dictionary (
  id text primary key,
  workspace_id text not null,
  user_id text not null,
  category text not null default 'knowledge',
  normalized_value text not null,
  display_value text not null,
  use_count integer not null default 1,
  last_used_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, user_id, category, normalized_value)
);

create index if not exists velvet_capture_dictionary_user_idx
  on velvet_capture_dictionary (workspace_id, user_id, last_used_at desc);
