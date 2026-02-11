-- ==========================================================
-- BEAUTY-PK MASTER DATABASE SETUP
-- ==========================================================
-- This script consolidates all features:
-- 1. Tables & RLS Policies
-- 2. Energy System (with Overflow & Consumption Fixes)
-- 3. Matchmaking v5 (with Exclusion & Fairness)
-- 4. User Synchronization & Profiles
-- ==========================================================

-- 1. TABLES
CREATE TABLE IF NOT EXISTS public.users (
    id uuid REFERENCES auth.users NOT NULL PRIMARY KEY,
    email text,
    username text,
    energy integer DEFAULT 10,
    max_energy integer DEFAULT 10,
    regen_rate integer DEFAULT 1, -- minutes per point
    last_energy_update timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.user_profiles (
    id uuid REFERENCES public.users(id) NOT NULL PRIMARY KEY,
    username text UNIQUE,
    display_name text,
    avatar_url text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.photos (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.users(id) NOT NULL,
    url text NOT NULL,
    score integer DEFAULT 1000 NOT NULL,
    wins integer DEFAULT 0 NOT NULL,
    losses integer DEFAULT 0 NOT NULL,
    matches integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.votes (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    winner_photo_id uuid REFERENCES public.photos(id) NOT NULL,
    loser_photo_id uuid REFERENCES public.photos(id) NOT NULL,
    voter_id uuid REFERENCES public.users(id),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.transactions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    photo_id uuid REFERENCES public.photos(id) NOT NULL,
    vote_id uuid REFERENCES public.votes(id) NOT NULL,
    delta integer NOT NULL,
    previous_score integer NOT NULL,
    new_score integer NOT NULL,
    reason text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. RLS POLICIES
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Users viewable by everyone" ON public.users FOR SELECT USING (true);
    CREATE POLICY "Users update self" ON public.users FOR UPDATE WITH CHECK (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Photos viewable by everyone" ON public.photos FOR SELECT USING (true);
    CREATE POLICY "Users upload photos" ON public.photos FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Anyone can insert votes" ON public.votes FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 3. USER SYNC TRIGGER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  base_username TEXT;
  final_username TEXT;
  counter INT := 0;
BEGIN
  base_username := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1), 'user');
  base_username := regexp_replace(base_username, '[^a-zA-Z0-9]', '', 'g');
  final_username := base_username;

  WHILE EXISTS (SELECT 1 FROM public.user_profiles WHERE username = final_username) LOOP
    counter := counter + 1;
    final_username := base_username || counter::TEXT;
  END LOOP;

  INSERT INTO public.users (id, email, username)
  VALUES (NEW.id, NEW.email, final_username) ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_profiles (id, username, display_name, avatar_url)
  VALUES (NEW.id, final_username, COALESCE(NEW.raw_user_meta_data->>'full_name', final_username), NEW.raw_user_meta_data->>'avatar_url')
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4. ENERGY SYSTEM (v2 - Overflow & Regeneration Fix)
CREATE OR REPLACE FUNCTION public.add_energy(amount integer)
RETURNS json AS $$
DECLARE
    v_user_id uuid := auth.uid();
    v_new_energy integer;
BEGIN
    IF v_user_id IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
    UPDATE public.users SET energy = energy + amount WHERE id = v_user_id RETURNING energy INTO v_new_energy;
    RETURN json_build_object('success', true, 'energy', v_new_energy);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.consume_energy(cost integer DEFAULT 1)
RETURNS json AS $$
DECLARE
    v_user_id uuid := auth.uid();
    v_last_update timestamp with time zone;
    v_current_energy integer;
    v_max_energy integer;
    v_minutes_passed integer;
    v_points_to_add integer;
    v_regen_rate integer := 1;
BEGIN
    IF v_user_id IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
    SELECT last_energy_update, energy, max_energy INTO v_last_update, v_current_energy, v_max_energy FROM public.users WHERE id = v_user_id FOR UPDATE;
    v_minutes_passed := EXTRACT(EPOCH FROM (now() - v_last_update)) / 60;
    v_points_to_add := FLOOR(v_minutes_passed / v_regen_rate);

    IF v_points_to_add > 0 THEN
        IF v_current_energy >= v_max_energy THEN v_last_update := now();
        ELSE
            v_current_energy := LEAST(v_max_energy, v_current_energy + v_points_to_add);
            IF v_current_energy = v_max_energy THEN v_last_update := now();
            ELSE v_last_update := v_last_update + (v_points_to_add * v_regen_rate * interval '1 minute');
            END IF;
        END IF;
    END IF;

    IF v_current_energy >= cost THEN
        v_current_energy := v_current_energy - cost;
        UPDATE public.users SET energy = v_current_energy, last_energy_update = v_last_update WHERE id = v_user_id;
        RETURN json_build_object('success', true, 'energy', v_current_energy);
    ELSE
        RETURN json_build_object('success', false, 'energy', v_current_energy);
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. MATCHMAKING v6 (Exclusion & Variety - Best Effort)
CREATE OR REPLACE FUNCTION public.get_fair_match(exclude_ids uuid[] DEFAULT '{}')
RETURNS SETOF public.photos AS $$
DECLARE
  v_rand float := random();
  v_pool_count integer;
BEGIN
    -- Check if exclusion is possible
    SELECT count(*) INTO v_pool_count FROM public.photos WHERE is_active = true AND id != ALL(exclude_ids);

    -- If pool is too small to find a match with exclusions, ignore the exclusion list
    IF v_pool_count < 2 THEN
        exclude_ids := '{}';
    END IF;

    RETURN QUERY
    WITH p1 AS (
      SELECT * FROM (
        SELECT * FROM public.photos WHERE is_active = true AND id != ALL(exclude_ids)
        ORDER BY CASE WHEN v_rand > 0.5 THEN matches ELSE 0 END ASC, random() ASC LIMIT 30
      ) sub1 ORDER BY random() LIMIT 1
    ),
    p2 AS (
      SELECT * FROM public.photos WHERE is_active = true AND id NOT IN (SELECT id FROM p1) AND id != ALL(exclude_ids)
      ORDER BY random() LIMIT 1
    )
    SELECT * FROM p1 UNION ALL SELECT * FROM p2;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- 6. RETROACTIVE SYNC (Apply fixes to existing users)
INSERT INTO public.users (id, email) SELECT id, email FROM auth.users ON CONFLICT (id) DO NOTHING;
UPDATE public.users SET energy = 10 WHERE energy IS NULL;
INSERT INTO public.user_profiles (id, username, display_name, avatar_url)
SELECT id, COALESCE(raw_user_meta_data->>'username', 'user_' || substr(id::text, 1, 8)), COALESCE(raw_user_meta_data->>'full_name', 'Player'), raw_user_meta_data->>'avatar_url'
FROM auth.users ON CONFLICT (id) DO NOTHING;
