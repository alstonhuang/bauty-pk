-- 1. Create Tables

-- Users table (extends Supabase Auth)
create table public.users (
  id uuid references auth.users not null primary key,
  email text,
  username text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Photos table
create table public.photos (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) not null,
  url text not null,
  score integer default 1000 not null,
  wins integer default 0 not null,
  losses integer default 0 not null,
  matches integer default 0 not null,
  is_active boolean default true not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Votes table
create table public.votes (
  id uuid default gen_random_uuid() primary key,
  winner_photo_id uuid references public.photos(id) not null,
  loser_photo_id uuid references public.photos(id) not null,
  voter_id uuid references public.users(id), -- Nullable for anonymous voting
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Transactions table (Score history)
create table public.transactions (
  id uuid default gen_random_uuid() primary key,
  photo_id uuid references public.photos(id) not null,
  vote_id uuid references public.votes(id) not null,
  delta integer not null,
  previous_score integer not null,
  new_score integer not null,
  reason text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable Row Level Security (RLS)
alter table public.users enable row level security;
alter table public.photos enable row level security;
alter table public.votes enable row level security;
alter table public.transactions enable row level security;

-- 3. Create Policies (Simplified for MVP)

-- Users: Read all, Update self
create policy "Users are viewable by everyone" on public.users for select using (true);
create policy "Users can insert their own profile" on public.users for insert with check (auth.uid() = id);

-- Photos: Read all, Upload (Insert) authenticated only
create policy "Photos are viewable by everyone" on public.photos for select using (true);
create policy "Users can upload photos" on public.photos for insert with check (auth.uid() = user_id);

-- Votes: Everyone can vote (Insert only)
-- Note: Ideally you want to restrict this, but for open PK, allow anon insert
create policy "Anyone can insert votes" on public.votes for insert with check (true);
create policy "Votes are viewable by everyone" on public.votes for select using (true);

-- Transactions: Viewable by everyone, Insert specific to system (service role) or via procedure
-- For MVP frontend logic, we'll allow authenticated users to insert (insecure, but fast for dev)
create policy "Anyone can insert transactions" on public.transactions for insert with check (true);
create policy "Transactions are viewable" on public.transactions for select using (true);

-- 4. Storage Bucket Setup (You must also create a bucket named 'photos' in the dashboard)
-- This SQL just sets up the policy if the bucket exists
-- insert into storage.buckets (id, name) values ('photos', 'photos'); -- Uncomment if running as superuser

-- Storage Policy: Public Read, Auth Upload
create policy "Public Access" on storage.objects for select using ( bucket_id = 'photos' );
create policy "Auth Upload" on storage.objects for insert with check ( bucket_id = 'photos' and auth.role() = 'authenticated' );

-- 5. Auto-create User Trigger (Optional but recommended)
-- This automatically adds a row to public.users when a user signs up via Supabase Auth
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
