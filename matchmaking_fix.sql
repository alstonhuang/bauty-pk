-- RECREATED: Mixed Probability Matchmaking RPC (v4)
-- This version addresses the "Photo A feels repetitive" issue.
-- Strategy:
-- 50% of the time: Pick Photo A from the 20 least-played (Fairness)
-- 50% of the time: Pick Photo A purely at random (Variety)
-- Photo B is always purely random (and not Photo A).
CREATE OR REPLACE FUNCTION public.get_fair_match()
RETURNS SETOF public.photos AS $$
DECLARE
  v_rand float := random();
BEGIN
    RETURN QUERY
    WITH p1 AS (
      -- 1. Randomized Strategy for Photo A
      SELECT * FROM (
        SELECT * FROM public.photos 
        WHERE is_active = true 
        ORDER BY 
          CASE WHEN v_rand > 0.5 THEN matches ELSE 0 END ASC,
          random() ASC
        LIMIT 20
      ) sub1
      ORDER BY random() 
      LIMIT 1
    ),
    p2 AS (
      -- 2. Pure Random for Photo B
      SELECT * FROM public.photos 
      WHERE is_active = true 
      AND id NOT IN (SELECT id FROM p1)
      ORDER BY random() 
      LIMIT 1
    )
    SELECT * FROM p1
    UNION ALL
    SELECT * FROM p2;
END;
$$ LANGUAGE plpgsql VOLATILE;
