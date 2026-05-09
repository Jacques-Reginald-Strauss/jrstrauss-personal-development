-- JRStrauss Personal Development App - Supabase Schema
-- Run this in Supabase Dashboard > SQL Editor > New Query.

create table if not exists public.daily_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  unique(user_id, log_date)
);

alter table public.daily_logs enable row level security;

drop policy if exists "Users can read own logs" on public.daily_logs;
create policy "Users can read own logs"
on public.daily_logs
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert own logs" on public.daily_logs;
create policy "Users can insert own logs"
on public.daily_logs
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own logs" on public.daily_logs;
create policy "Users can update own logs"
on public.daily_logs
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own logs" on public.daily_logs;
create policy "Users can delete own logs"
on public.daily_logs
for delete
to authenticated
using (auth.uid() = user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_daily_logs_updated_at on public.daily_logs;
create trigger set_daily_logs_updated_at
before update on public.daily_logs
for each row execute procedure public.set_updated_at();
