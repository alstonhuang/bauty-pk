-- ========================================
-- User Profile System v1
-- ========================================

-- 1. Create user_profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  banner_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
-- Anyone can view profiles
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.user_profiles
  FOR SELECT
  USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.user_profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON public.user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 4. Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  base_username TEXT;
  final_username TEXT;
  counter INT := 0;
BEGIN
  -- Extract username from email (before @)
  base_username := split_part(NEW.email, '@', 1);
  final_username := base_username;
  
  -- Check if username exists and add number if needed
  WHILE EXISTS (SELECT 1 FROM public.user_profiles WHERE username = final_username) LOOP
    counter := counter + 1;
    final_username := base_username || counter::TEXT;
  END LOOP;
  
  -- Insert new profile
  INSERT INTO public.user_profiles (
    id,
    username,
    display_name,
    avatar_url
  ) VALUES (
    NEW.id,
    final_username,
    COALESCE(NEW.raw_user_meta_data->>'full_name', final_username),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 5. Update timestamp function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS on_user_profile_updated ON public.user_profiles;

-- Create trigger
CREATE TRIGGER on_user_profile_updated
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 6. Create Storage Bucket for user content
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-content', 'user-content', true)
ON CONFLICT (id) DO NOTHING;

-- 7. Storage Policies
-- Anyone can view
CREATE POLICY "Public user content is viewable by everyone"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'user-content');

-- Users can upload their own content
CREATE POLICY "Users can upload own content"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'user-content' AND
    (storage.foldername(name))[1] = auth.uid()::TEXT
  );

-- Users can update their own content
CREATE POLICY "Users can update own content"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'user-content' AND
    (storage.foldername(name))[1] = auth.uid()::TEXT
  );

-- Users can delete their own content
CREATE POLICY "Users can delete own content"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'user-content' AND
    (storage.foldername(name))[1] = auth.uid()::TEXT
  );

-- 8. Add user_id to photos table (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'photos' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.photos ADD COLUMN user_id UUID REFERENCES auth.users(id);
  END IF;
END $$;

-- 9. Create index for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON public.user_profiles(username);
CREATE INDEX IF NOT EXISTS idx_photos_user_id ON public.photos(user_id);

-- 10. Function to check username availability
CREATE OR REPLACE FUNCTION public.check_username_available(check_username TEXT, current_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE username = check_username
    AND id != current_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- Setup Complete!
-- ========================================
-- Next steps:
-- 1. Run this SQL in Supabase SQL Editor
-- 2. Verify user_profiles table is created
-- 3. Test by logging in with Google
-- ========================================
