-- 1. Add Energy Columns to public.users
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS energy integer DEFAULT 10,
ADD COLUMN IF NOT EXISTS max_energy integer DEFAULT 10,
ADD COLUMN IF NOT EXISTS last_energy_update timestamp with time zone DEFAULT now();

-- 2. Create the Energy Management Function
-- This function calculates pending regeneration, updates the user record, and attempts to deduct cost.
-- It returns the new energy level and whether the operation was successful.
CREATE OR REPLACE FUNCTION public.consume_energy(cost integer DEFAULT 1)
RETURNS json AS $$
DECLARE
    v_user_id uuid := auth.uid();
    v_last_update timestamp with time zone;
    v_current_energy integer;
    v_max_energy integer;
    
    v_minutes_passed integer;
    v_points_to_add integer;
    v_regen_rate integer := 1; -- Minutes per point (Regen 1 energy every 1 minute for fast testing)
    v_final_energy integer;
BEGIN
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- Lock the row for update
    SELECT last_energy_update, energy, max_energy
    INTO v_last_update, v_current_energy, v_max_energy
    FROM public.users
    WHERE id = v_user_id
    FOR UPDATE;

    -- 1. Calculate Regeneration
    v_minutes_passed := EXTRACT(EPOCH FROM (now() - v_last_update)) / 60;
    v_points_to_add := FLOOR(v_minutes_passed / v_regen_rate);

    IF v_points_to_add > 0 THEN
        v_current_energy := LEAST(v_max_energy, v_current_energy + v_points_to_add);
        -- Update time base to now roughly, but keeping track of intervals is better
        -- For simplicity in MVP: Reset time base if we hit max, otherwise increment
        IF v_current_energy = v_max_energy THEN
            v_last_update := now();
        ELSE
            v_last_update := v_last_update + (v_points_to_add * v_regen_rate * interval '1 minute');
        END IF;
    END IF;

    -- 2. Check Cost and Deduct
    IF v_current_energy >= cost THEN
        v_current_energy := v_current_energy - cost;
        
        -- 3. Commit Updates (Consumption + Regen)
        UPDATE public.users
        SET energy = v_current_energy,
            last_energy_update = CASE 
                WHEN v_points_to_add > 0 OR v_current_energy = (v_max_energy - cost) THEN v_last_update 
                ELSE last_energy_update -- No regen happened, keep old time
            END
        WHERE id = v_user_id;
        
        RETURN json_build_object('success', true, 'energy', v_current_energy);
    ELSE
        -- Update regeneration even if we fail to consume, so the user sees proper current value
        IF v_points_to_add > 0 THEN
             UPDATE public.users
             SET energy = v_current_energy,
                 last_energy_update = v_last_update
             WHERE id = v_user_id;
        END IF;
        
        RETURN json_build_object('success', false, 'energy', v_current_energy);
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Helper to just get synced energy without consuming
CREATE OR REPLACE FUNCTION public.get_synced_energy()
RETURNS json AS $$
DECLARE
    v_result json;
BEGIN
    -- Just consume 0 to trigger the sync logic
    SELECT public.consume_energy(0) INTO v_result;
    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
