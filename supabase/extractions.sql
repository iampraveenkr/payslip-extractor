create table if not exists public.extractions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  file_names text[] not null default '{}',
  payslip_count integer not null default 0 check (payslip_count >= 0),
  status text not null default 'Processing' check (status in ('Completed', 'Processing', 'Failed')),
  result_json jsonb,
  created_at timestamptz not null default now()
);

create index if not exists extractions_user_created_idx on public.extractions (user_id, created_at desc);

alter table public.extractions enable row level security;

drop policy if exists "Users can read own extractions" on public.extractions;
drop policy if exists "Users can insert own extractions" on public.extractions;
drop policy if exists "Users can update own extractions" on public.extractions;

create policy "Users can read own extractions"
on public.extractions
for select
using (auth.uid() = user_id);

create policy "Users can insert own extractions"
on public.extractions
for insert
with check (auth.uid() = user_id);

create policy "Users can update own extractions"
on public.extractions
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
