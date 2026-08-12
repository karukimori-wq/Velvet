-- Night-work performance fields attached to a visit.
alter table velvet_visits add column if not exists nomination_type text;
alter table velvet_visits add column if not exists receivable_amount integer;
alter table velvet_visits add column if not exists receivable_status text;
alter table velvet_visits add column if not exists drink_count integer;
alter table velvet_visits add column if not exists bottle_count integer;
alter table velvet_visits add column if not exists bottle_note text;

create index if not exists velvet_visits_owner_nomination_idx on velvet_visits(owner_user_id, nomination_type, started_at desc);
create index if not exists velvet_visits_owner_receivable_idx on velvet_visits(owner_user_id, receivable_status, started_at desc);
