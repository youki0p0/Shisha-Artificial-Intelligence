-- ShishaOS — staff work shifts (timecard) for payroll.
--
-- One row per worked shift. Combined with profiles.wages (migration 0003) the
-- admin screen computes monthly hours × hourly wage. Admins manage all rows;
-- a staff member may read their own. Run after 0003_staff_wages.sql.

create table if not exists public.staff_shifts (
  id         text primary key,
  user_id    uuid not null references auth.users (id) on delete cascade,
  date       date not null,
  data       jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists staff_shifts_user_idx
  on public.staff_shifts (user_id);
create index if not exists staff_shifts_date_idx
  on public.staff_shifts (date);

alter table public.staff_shifts enable row level security;

-- Admins manage everyone's shifts; a user can read their own.
create policy staff_shifts_admin on public.staff_shifts
  for all using (public.is_admin()) with check (public.is_admin());
create policy staff_shifts_self_read on public.staff_shifts
  for select using (user_id = auth.uid());

grant select, insert, update, delete on public.staff_shifts to authenticated;
