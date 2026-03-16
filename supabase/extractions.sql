create table if not exists public.extractions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  file_names text[] not null default '{}',
  payslip_count integer not null default 0,
  status text not null default 'Processing',
  result_json jsonb,
  created_at timestamptz not null default now()
);

alter table public.extractions enable row level security;

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
