-- RECREATED: Mixed Probability Matchmaking RPC (v6)
-- Adds "Best Effort" exclusion: if the pool is too small (<2) with exclusions, 
-- it automatically falls back to full library to prevent "No competitors found".
CREATE OR REPLACE FUNCTION public.get_fair_match(exclude_ids uuid[] DEFAULT '{}')
RETURNS SETOF public.photos AS $$
DECLARE
  v_rand float := random();
  v_pool_count integer;
BEGIN
    -- Check if exclusion is possible
    SELECT count(*) INTO v_pool_count 
    FROM public.photos 
    WHERE is_active = true AND id != ALL(exclude_ids);

    -- If pool is too small to find a match with exclusions, ignore the exclusion list
    IF v_pool_count < 2 THEN
        exclude_ids := '{}';
    END IF;

    RETURN QUERY
    WITH p1 AS (
      -- 1. Mixed Strategy for Photo A
      SELECT * FROM (
        SELECT * FROM public.photos 
        WHERE is_active = true 
        AND id != ALL(exclude_ids)
        ORDER BY 
          CASE WHEN v_rand > 0.5 THEN matches ELSE 0 END ASC,
          random() ASC
        LIMIT 30
      ) sub1
      ORDER BY random() 
      LIMIT 1
    ),
    p2 AS (
      -- 2. Pure Random for Photo B
      SELECT * FROM public.photos 
      WHERE is_active = true 
      AND id NOT IN (SELECT id FROM p1)
      AND id != ALL(exclude_ids)
      ORDER BY random() 
      LIMIT 1
    )
    SELECT * FROM p1
    UNION ALL
    SELECT * FROM p2;
END;
$$ LANGUAGE plpgsql VOLATILE;
