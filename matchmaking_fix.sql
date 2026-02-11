-- Fair Matchmaking RPC
-- This function selects 2 distinct photos, prioritizing those with fewer matches
-- while maintaining randomness to ensure all photos get exposure.
CREATE OR REPLACE FUNCTION public.get_fair_match()
RETURNS SETOF public.photos AS $$
DECLARE
    v_avg_matches float;
BEGIN
    -- 1. Calculate average matches to scale our randomness "jitter"
    SELECT COALESCE(AVG(matches), 5) INTO v_avg_matches FROM public.photos WHERE is_active = true;

    -- 2. Select 2 distinct photos
    -- Logic: Order by (matches + random() * avg_matches)
    -- This means photos with 0 matches will always have a score between 0 and avg_matches.
    -- High match photos can still win if they get a low random number and others get high.
    RETURN QUERY
    SELECT *
    FROM public.photos
    WHERE is_active = true
    ORDER BY (matches + (random() * v_avg_matches)) ASC
    LIMIT 2;
END;
$$ LANGUAGE plpgsql STABLE;
