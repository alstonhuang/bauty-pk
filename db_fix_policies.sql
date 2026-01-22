-- FIX RLS Policies: Allow ALL access for development
-- (Run this in Supabase SQL Editor to unblock 'violates row-level security policy' errors)

-- 1. Photos Table: Allow anyone to insert, update, select
drop policy if exists "Photos are viewable by everyone" on public.photos;
drop policy if exists "Users can upload photos" on public.photos;

create policy "Enable all access for photos" on public.photos
for all using (true) with check (true);

-- 2. Storage Objects: Allow anyone to upload to 'photos' bucket
-- Note: 'storage.objects' is a system table, be careful.
drop policy if exists "Public Access" on storage.objects;
drop policy if exists "Auth Upload" on storage.objects;

create policy "Enable all access for storage" on storage.objects
for all using (bucket_id = 'photos') with check (bucket_id = 'photos');

-- 3. Users Table (Just in case)
drop policy if exists "Users are viewable by everyone" on public.users;
drop policy if exists "Users can insert their own profile" on public.users;

create policy "Enable all access for users" on public.users
for all using (true) with check (true);

-- 4. Votes & Transactions (Just in case)
drop policy if exists "Anyone can insert votes" on public.votes;
create policy "Enable all access for votes" on public.votes
for all using (true) with check (true);

drop policy if exists "Anyone can insert transactions" on public.transactions;
create policy "Enable all access for transactions" on public.transactions
for all using (true) with check (true);
