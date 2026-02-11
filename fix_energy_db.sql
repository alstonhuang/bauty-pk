-- 1. Update the handle_new_user trigger function to populate both users and user_profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  base_username TEXT;
  final_username TEXT;
  counter INT := 0;
BEGIN
  -- Determine base username from email or metadata
  base_username := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    split_part(NEW.email, '@', 1),
    'user'
  );
  
  -- Clean username (remove special chars for basic safety)
  base_username := regexp_replace(base_username, '[^a-zA-Z0-9]', '', 'g');
  final_username := base_username;

  -- Ensure unique username
  WHILE EXISTS (SELECT 1 FROM public.user_profiles WHERE username = final_username) LOOP
    counter := counter + 1;
    final_username := base_username || counter::TEXT;
  END LOOP;

  -- Insert into public.users (Energy & System Core)
  INSERT INTO public.users (id, email, username)
  VALUES (NEW.id, NEW.email, final_username)
  ON CONFLICT (id) DO NOTHING;

  -- Insert into public.user_profiles (Social Data)
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
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create the add_energy function with overflow support
CREATE OR REPLACE FUNCTION public.add_energy(amount integer)
RETURNS json AS $$
DECLARE
    v_user_id uuid := auth.uid();
    v_new_energy integer;
BEGIN
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    UPDATE public.users
    SET energy = energy + amount
    WHERE id = v_user_id
    RETURNING energy INTO v_new_energy;

    RETURN json_build_object('success', true, 'energy', v_new_energy);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
