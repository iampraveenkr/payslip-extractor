insert into storage.buckets (id, name, public)
values ('payslips', 'payslips', false)
on conflict (id) do nothing;

drop policy if exists "Authenticated users can upload own payslips" on storage.objects;
drop policy if exists "Authenticated users can read own payslips" on storage.objects;
drop policy if exists "Authenticated users can delete own payslips" on storage.objects;

create policy "Authenticated users can upload own payslips"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'payslips'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Authenticated users can read own payslips"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'payslips'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Authenticated users can delete own payslips"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'payslips'
  and (storage.foldername(name))[1] = auth.uid()::text
);
