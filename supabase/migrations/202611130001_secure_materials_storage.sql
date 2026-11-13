-- Keep study PDFs private. Application routes issue short-lived signed URLs
-- only after checking admin, free-material, or verified ownership access.
update storage.buckets
set public = false
where id = 'materials';

-- Remove existing policies that explicitly target this bucket so an older
-- public-read rule cannot override the private-storage design.
do $$
declare
  policy_record record;
begin
  for policy_record in
    select policyname
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and (
        coalesce(qual, '') ilike '%materials%'
        or coalesce(with_check, '') ilike '%materials%'
      )
  loop
    execute format('drop policy if exists %I on storage.objects', policy_record.policyname);
  end loop;
end
$$;

create policy "Yaza admins can upload study materials"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'materials'
  and exists (
    select 1
    from public.profiles
    where profiles.id = (select auth.uid())
      and profiles.is_admin = true
  )
);

create policy "Yaza admins can delete study materials"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'materials'
  and exists (
    select 1
    from public.profiles
    where profiles.id = (select auth.uid())
      and profiles.is_admin = true
  )
);
