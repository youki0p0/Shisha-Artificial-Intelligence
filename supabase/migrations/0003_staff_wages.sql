-- ShishaOS — staff hourly-wage schedule + admin user management.
--
-- Adds an effective-dated wage schedule to profiles and lets admins (only)
-- edit other users' profiles (display name + wages). Curators are NOT admins,
-- so they cannot see or change payroll. Run after 0001_init_user_data.sql.

-- Effective-dated hourly wages: [{ id, effectiveFrom: "YYYY-MM", hourlyWage }].
alter table public.profiles
  add column if not exists wages jsonb not null default '[]'::jsonb;

-- Admin check (stricter than is_staff(), which also allows curators).
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

-- Admins may update any profile (rename, set wages). The existing
-- profiles_self_update policy still lets a user edit their own row.
drop policy if exists profiles_admin_update on public.profiles;
create policy profiles_admin_update on public.profiles
  for update using (public.is_admin()) with check (public.is_admin());
