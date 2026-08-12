-- Optional visit usage context: how the guest/group is using the venue.
alter table velvet_visits
  add column if not exists visit_context text;

create index if not exists velvet_visits_owner_context_idx
  on velvet_visits(owner_user_id, visit_context);
