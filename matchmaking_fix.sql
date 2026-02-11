-- RECREATED: Mixed Probability Matchmaking RPC (v5)
-- This version adds supports for excluding IDs to prevent immediate repeats.
CREATE OR REPLACE FUNCTION public.get_fair_match(exclude_ids uuid[] DEFAULT '{}')
RETURNS SETOF public.photos AS $$
DECLARE
  v_rand float := random();
BEGIN
    RETURN QUERY
    WITH p1 AS (
      -- 1. Mixed Strategy for Photo A
      SELECT * FROM (
        SELECT * FROM public.photos 
        WHERE is_active = true 
        AND id != ALL(exclude_ids) -- Exclude specific photos (e.g., from last match)
        ORDER BY 
          CASE WHEN v_rand > 0.5 THEN matches ELSE 0 END ASC,
          random() ASC
        LIMIT 30 -- Increased pool size for more variety
      ) sub1
      ORDER BY random() 
      LIMIT 1
    ),
    p2 AS (
      -- 2. Pure Random for Photo B
      SELECT * FROM public.photos 
      WHERE is_active = true 
      AND id NOT IN (SELECT id FROM p1)
      AND id != ALL(exclude_ids) -- Also exclude from the second slot if possible
      ORDER BY random() 
      LIMIT 1
    )
    SELECT * FROM p1
    UNION ALL
    SELECT * FROM p2;
END;
$$ LANGUAGE plpgsql VOLATILE;
