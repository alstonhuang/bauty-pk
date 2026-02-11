-- RECREATED: High-Variety Fair Matchmaking RPC (v3)
-- This version picks from a "Newcomer Pool" (top 10 least played)
-- and matches it against a "Global Challenger" (top 30 random).
-- This ensures Photo A doesn't just loop between 2rd-3th newest photos.
CREATE OR REPLACE FUNCTION public.get_fair_match()
RETURNS SETOF public.photos AS $$
BEGIN
    RETURN QUERY
    WITH p1 AS (
      -- 1. Wide Newcomer Pool: Pick 1 randomly from the 10 least-played photos
      SELECT * FROM (
        SELECT * FROM public.photos 
        WHERE is_active = true 
        ORDER BY matches ASC 
        LIMIT 10
      ) sub1
      ORDER BY random() 
      LIMIT 1
    ),
    p2 AS (
      -- 2. Challenger Pool: Pick 1 randomly from a diverse set of 30 photos
      -- (Excluding p1 to avoid self-pk)
      SELECT * FROM (
        SELECT * FROM public.photos 
        WHERE is_active = true 
        AND id NOT IN (SELECT id FROM p1)
        ORDER BY random() 
        LIMIT 30
      ) sub2
      ORDER BY random() 
      LIMIT 1
    )
    SELECT * FROM p1
    UNION ALL
    SELECT * FROM p2;
END;
$$ LANGUAGE plpgsql VOLATILE;
