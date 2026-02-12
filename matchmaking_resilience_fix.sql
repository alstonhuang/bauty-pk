-- MATCHMAKING RESILIENCE FIX: 修復候選池不足導致的卡死問題

-- 1. 更新 get_fair_match (v6 - 無分類版本)
CREATE OR REPLACE FUNCTION public.get_fair_match(exclude_ids uuid[] DEFAULT '{}')
RETURNS SETOF public.photos AS $$
DECLARE
  v_rand float := random();
  v_total_count integer;
  v_pool_count integer;
BEGIN
    -- 檢查全局照片總數
    SELECT count(*) INTO v_total_count FROM public.photos WHERE is_active = true;
    
    -- 如果全局照片少於 2 張，直接返回空集
    IF v_total_count < 2 THEN
        RETURN;
    END IF;

    -- 檢查排除後的候選池
    SELECT count(*) INTO v_pool_count 
    FROM public.photos 
    WHERE is_active = true AND id != ALL(exclude_ids);

    -- 如果排除後不足 2 人，清除排除名單
    IF v_pool_count < 2 THEN
        exclude_ids := '{}';
    END IF;

    RETURN QUERY
    WITH p1 AS (
      SELECT * FROM (
        SELECT * FROM public.photos WHERE is_active = true AND id != ALL(exclude_ids)
        ORDER BY CASE WHEN v_rand > 0.5 THEN matches ELSE 0 END ASC, random() ASC LIMIT 30
      ) sub1 ORDER BY random() LIMIT 1
    ),
    p2 AS (
      SELECT * FROM public.photos WHERE is_active = true AND id NOT IN (SELECT id FROM p1) AND id != ALL(exclude_ids)
      ORDER BY random() LIMIT 1
    )
    SELECT * FROM p1 UNION ALL SELECT * FROM p2;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- 2. 更新 get_fair_match_v7 (支援 category)
CREATE OR REPLACE FUNCTION public.get_fair_match_v7(
  exclude_ids uuid[] DEFAULT '{}',
  p_category TEXT DEFAULT NULL
)
RETURNS SETOF public.photos AS $$
DECLARE
  v_rand float := random();
  v_total_count integer;
  v_pool_count integer;
BEGIN
    -- 檢查該分類的照片總數
    SELECT count(*) INTO v_total_count 
    FROM public.photos 
    WHERE is_active = true 
    AND (p_category IS NULL OR category = p_category);
    
    -- 如果該分類照片少於 2 張，直接返回空集
    IF v_total_count < 2 THEN
        RETURN;
    END IF;

    -- 檢查排除後的候選池
    SELECT count(*) INTO v_pool_count 
    FROM public.photos 
    WHERE is_active = true 
    AND (p_category IS NULL OR category = p_category)
    AND id != ALL(exclude_ids);

    -- 如果排除後不足 2 人，清除排除名單
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

-- 3. 更新 get_fair_match_v8 (支援多重標籤)
CREATE OR REPLACE FUNCTION public.get_fair_match_v8(
  exclude_ids uuid[] DEFAULT '{}',
  p_tags TEXT[] DEFAULT NULL
)
RETURNS SETOF public.photos AS $$
DECLARE
  v_rand float := random();
  v_total_count integer;
  v_pool_count integer;
BEGIN
    -- 檢查該標籤組合的照片總數
    SELECT count(*) INTO v_total_count 
    FROM public.photos 
    WHERE is_active = true 
    AND (p_tags IS NULL OR tags && p_tags);
    
    -- 如果該標籤組合照片少於 2 張，直接返回空集
    IF v_total_count < 2 THEN
        RETURN;
    END IF;

    -- 檢查排除後的候選池
    SELECT count(*) INTO v_pool_count 
    FROM public.photos 
    WHERE is_active = true 
    AND (p_tags IS NULL OR tags && p_tags)
    AND id != ALL(exclude_ids);

    -- 如果排除後不足 2 人，清除排除名單
    IF v_pool_count < 2 THEN
        exclude_ids := '{}';
    END IF;

    RETURN QUERY
    WITH p1 AS (
      SELECT * FROM (
        SELECT * FROM public.photos 
        WHERE is_active = true 
        AND (p_tags IS NULL OR tags && p_tags)
        AND id != ALL(exclude_ids)
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
      AND (p_tags IS NULL OR tags && p_tags)
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
