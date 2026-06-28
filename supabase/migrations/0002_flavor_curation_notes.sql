-- ShishaOS — internal flavor curation notes (staff-only).
--
-- A place for curators (or a later AI pass) to flag "this parameter looks wrong"
-- on a flavor. NEVER shown to end users — RLS restricts all access to staff
-- (curator/admin), so even a logged-in normal user can't read or write them.
-- Run this after 0001_init_user_data.sql.

create table if not exists public.flavor_curation_notes (
  id               text primary key,
  flavor_master_id text not null,
  status           text not null default 'open' check (status in ('open', 'resolved')),
  author_id        uuid references auth.users (id) on delete set null,
  data             jsonb not null,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists curation_notes_flavor_idx
  on public.flavor_curation_notes (flavor_master_id);
create index if not exists curation_notes_status_idx
  on public.flavor_curation_notes (status);

alter table public.flavor_curation_notes enable row level security;

-- Staff-only: relies on public.is_staff() from 0001_init_user_data.sql.
create policy curation_notes_staff on public.flavor_curation_notes
  for all using (public.is_staff()) with check (public.is_staff());

grant select, insert, update, delete on public.flavor_curation_notes to authenticated;
