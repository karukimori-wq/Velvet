-- Runtime fields added after the initial schema.

alter table velvet_gifts add column if not exists occasion text;
alter table velvet_captures add column if not exists kind text not null default 'free_text';

create index if not exists velvet_captures_owner_kind_idx on velvet_captures(owner_user_id, kind, created_at desc);
