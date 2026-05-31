-- Secure Public Record: Supabase policies for direct document uploads
-- This project writes document files to Storage path:
--   <auth.uid()>/<timestamp>-<filename>
-- Bucket:
--   documents

-- 1) Ensure the Storage bucket exists
insert into storage.buckets (id, name, public)
values ('documents', 'documents', true)
on conflict (id) do update
set public = excluded.public;

-- Optional: remove bucket file size limit (null = no explicit cap here)
update storage.buckets
set file_size_limit = null
where id = 'documents';

-- 2) Storage policies for bucket `documents`
-- NOTE:
-- Supabase-managed `storage.objects` cannot be altered by user SQL in many projects.
-- RLS is already enabled there by default, so we only manage policies below.

drop policy if exists "documents_insert_own_folder" on storage.objects;
create policy "documents_insert_own_folder"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'documents'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "documents_select_own_folder" on storage.objects;
create policy "documents_select_own_folder"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'documents'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "documents_update_own_folder" on storage.objects;
create policy "documents_update_own_folder"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'documents'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'documents'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "documents_delete_own_folder" on storage.objects;
create policy "documents_delete_own_folder"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'documents'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- 3) Table RLS policies for public.documents (used by direct upload fallback)
alter table public.documents enable row level security;

drop policy if exists "documents_table_select_own" on public.documents;
create policy "documents_table_select_own"
on public.documents
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "documents_table_insert_own" on public.documents;
create policy "documents_table_insert_own"
on public.documents
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "documents_table_update_own" on public.documents;
create policy "documents_table_update_own"
on public.documents
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "documents_table_delete_own" on public.documents;
create policy "documents_table_delete_own"
on public.documents
for delete
to authenticated
using (user_id = auth.uid());

-- Optional: public search reads only public documents
drop policy if exists "documents_table_select_public" on public.documents;
create policy "documents_table_select_public"
on public.documents
for select
to anon
using (is_public = true);
