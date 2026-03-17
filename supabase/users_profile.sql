create table if not exists public.users_profile (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  company_name text,
  plan text default 'trial',
  credits_used integer default 0,
  credits_limit integer default 10,
  created_at timestamptz default now()
);

alter table public.users_profile enable row level security;

create policy "Users can read own profile"
on public.users_profile
for select
using (auth.uid() = id);

create policy "Users can insert own profile"
on public.users_profile
for insert
with check (auth.uid() = id);

create policy "Users can update own profile"
on public.users_profile
for update
using (auth.uid() = id)
with check (auth.uid() = id);
