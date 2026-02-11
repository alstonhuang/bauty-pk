-- MIGRATION: Category System & Matchmaking v7
-- 1. Add Category column
ALTER TABLE public.photos ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'General';
CREATE INDEX IF NOT EXISTS idx_photos_category ON public.photos(category);

-- 2. Update Matchmaking v7 (Category Support)
CREATE OR REPLACE FUNCTION public.get_fair_match_v7(
  exclude_ids uuid[] DEFAULT '{}',
  p_category TEXT DEFAULT NULL
)
RETURNS SETOF public.photos AS $$
DECLARE
  v_rand float := random();
  v_pool_count integer;
BEGIN
    -- 1. Determine the candidate pool based on category
    -- If p_category is NULL, we pick from all photos (General/Global mode)
    -- If p_category is provided, we filter by that category
    
    -- Check if exclusion is possible within that category
    SELECT count(*) INTO v_pool_count 
    FROM public.photos 
    WHERE is_active = true 
    AND (p_category IS NULL OR category = p_category)
    AND id != ALL(exclude_ids);

    -- If pool is too small to find a match with exclusions, ignore the exclusion list
    IF v_pool_count < 2 THEN
        exclude_ids := '{}';
    END IF;

    RETURN QUERY
    WITH p1 AS (
      SELECT * FROM (
        SELECT * FROM public.photos 
        WHERE is_active = true 
        AND (p_category IS NULL OR category = p_category)
        AND id != ALL(exclude_ids)
        -- Variety mix: balance between least played and randomness
        ORDER BY 
          CASE WHEN v_rand > 0.5 THEN matches ELSE 0 END ASC,
          random() ASC
        LIMIT 20
      ) sub1
      ORDER BY random() 
      LIMIT 1
    ),
    p2 AS (
      SELECT * FROM public.photos 
      WHERE is_active = true 
      AND (p_category IS NULL OR category = p_category)
      AND id NOT IN (SELECT id FROM p1)
      AND id != ALL(exclude_ids)
      ORDER BY random() 
      LIMIT 1
    )
    SELECT * FROM p1
    UNION ALL
    SELECT * FROM p2;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
