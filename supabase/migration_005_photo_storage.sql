-- Knollside — migration 005: storage bucket for item photos.
-- Creates a public bucket and policies allowing any authenticated business
-- owner to upload/replace images, while the public (the widget) can read them.

-- 1. Create the bucket (public so widget <img> tags can load photos).
insert into storage.buckets (id, name, public)
values ('item-photos', 'item-photos', true)
on conflict (id) do nothing;

-- 2. Anyone can READ (the embedded widget loads these images unauthenticated).
create policy "public read item photos"
  on storage.objects for select
  using (bucket_id = 'item-photos');

-- 3. Authenticated users can upload to the bucket.
create policy "authenticated upload item photos"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'item-photos');

-- 4. Authenticated users can update/replace their uploads.
create policy "authenticated update item photos"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'item-photos');

-- 5. Authenticated users can delete photos.
create policy "authenticated delete item photos"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'item-photos');
