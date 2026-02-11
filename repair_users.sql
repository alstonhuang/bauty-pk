-- 1. REPAIR & IMPROVE Trigger Function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into public.users (Energy & Core Data)
  -- We use ON CONFLICT to avoid errors if the record was manually created
  INSERT INTO public.users (id, email)
  VALUES (new.id, new.email)
  ON CONFLICT (id) DO NOTHING;

  -- Insert into public.user_profiles (Display Data)
  INSERT INTO public.user_profiles (id, username, display_name, avatar_url)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'username', 'user_' || substr(new.id::text, 1, 8)),
    COALESCE(new.raw_user_meta_data->>'full_name', 'Player'),
    new.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. ENSURE TRIGGER EXISTS
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. RETROACTIVE SYNC (The "Magic Fix" for existing users)
-- This adds missing records to public.users for everyone in auth.users
INSERT INTO public.users (id, email)
SELECT id, email FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- This adds missing records to public.user_profiles for everyone in auth.users
INSERT INTO public.user_profiles (id, username, display_name, avatar_url)
SELECT 
  id, 
  COALESCE(raw_user_meta_data->>'username', 'user_' || substr(id::text, 1, 8)),
  COALESCE(raw_user_meta_data->>'full_name', 'Player'),
  raw_user_meta_data->>'avatar_url'
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- 4. FIX ENERGY (Ensure everyone has at least 10 energy)
UPDATE public.users SET energy = 10 WHERE energy IS NULL;
