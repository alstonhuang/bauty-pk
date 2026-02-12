-- MIGRATION: 多重標籤系統與成就機制 v8

-- 1. 照片資料表升級：新增標籤陣列
ALTER TABLE public.photos ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- 2. 資料遷移：將舊有的單一分類轉換為標籤陣列的第一個元素
UPDATE public.photos 
SET tags = ARRAY[category] 
WHERE (tags IS NULL OR cardinality(tags) = 0) 
AND category IS NOT NULL;

-- 建立標籤索引以優化搜尋效能
CREATE INDEX IF NOT EXISTS idx_photos_tags ON public.photos USING GIN (tags);

-- 3. 成就系統資料表
CREATE TABLE IF NOT EXISTS public.achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,      
    description TEXT,
    icon_type TEXT DEFAULT 'Award', 
    badge_url TEXT,                 
    criteria_type TEXT NOT NULL,    
    criteria_value INTEGER,         
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 關鍵修正：清理重複數據並強制加入唯一約束
DO $$
BEGIN
    -- 1. 刪除名稱重複的項，保留 ID 較小的一個
    DELETE FROM public.achievements a
    USING public.achievements b
    WHERE a.id > b.id AND a.name = b.name;

    -- 2. 嘗試加入唯一約束
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'achievements_name_key'
    ) THEN
        ALTER TABLE public.achievements ADD CONSTRAINT achievements_name_key UNIQUE (name);
    END IF;
END $$;

-- 用戶成就關聯表
CREATE TABLE IF NOT EXISTS public.user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    achievement_id UUID REFERENCES public.achievements(id) ON DELETE CASCADE,
    earned_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, achievement_id)
);

-- 4. 插入初始成就項目
INSERT INTO public.achievements (name, description, icon_type, criteria_type, criteria_value)
VALUES 
('新人出道', '上傳第一張照片', 'Camera', 'upload_count', 1),
('競技達人', '參與 50 次 PK 對決', 'Swords', 'match_count', 50),
('人氣之星', '單張照片分數超過 2000 分', 'Star', 'score_threshold', 2000),
('連勝王', '個人勝率超過 60%', 'Trophy', 'win_rate_threshold', 60),
('貓奴領袖', '在「寵物」標籤獲得 10 次勝利', 'Heart', 'tag_win_count:寵物', 10)
ON CONFLICT (name) DO NOTHING;

-- 5. 自動化成就檢查函數 (擴充性核心)
CREATE OR REPLACE FUNCTION public.check_user_achievements(p_user_id UUID)
RETURNS TABLE (achievement_name TEXT) AS $$
BEGIN
    RETURN QUERY
    INSERT INTO public.user_achievements (user_id, achievement_id)
    SELECT p_user_id, a.id
    FROM public.achievements a
    WHERE NOT EXISTS (
        SELECT 1 FROM public.user_achievements ua 
        WHERE ua.user_id = p_user_id AND ua.achievement_id = a.id
    )
    AND (
        (a.criteria_type = 'upload_count' AND (SELECT count(*) FROM public.photos WHERE user_id = p_user_id) >= a.criteria_value)
        OR
        (a.criteria_type = 'match_count' AND (SELECT COALESCE(sum(matches), 0) FROM public.photos WHERE user_id = p_user_id) >= a.criteria_value)
        OR
        (a.criteria_type = 'score_threshold' AND (SELECT MAX(score) FROM public.photos WHERE user_id = p_user_id) >= a.criteria_value)
        OR
        (a.criteria_type = 'win_rate_threshold' AND (
            SELECT CASE WHEN sum(matches) > 0 THEN (sum(wins)::float / sum(matches)::float) * 100 ELSE 0 END 
            FROM public.photos WHERE user_id = p_user_id
        ) >= a.criteria_value)
        OR
        (a.criteria_type LIKE 'tag_win_count:%' AND (
            SELECT COALESCE(sum(wins), 0) FROM public.photos 
            WHERE user_id = p_user_id 
            AND split_part(a.criteria_type, ':', 2) = ANY(tags)
        ) >= a.criteria_value)
    )
    RETURNING (SELECT name FROM public.achievements WHERE id = achievement_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. 配對邏輯 v8 (支援多重標籤交集)
CREATE OR REPLACE FUNCTION public.get_fair_match_v8(
  exclude_ids uuid[] DEFAULT '{}',
  p_tags TEXT[] DEFAULT NULL
)
RETURNS SETOF public.photos AS $$
DECLARE
  v_rand float := random();
  v_pool_count integer;
BEGIN
    SELECT count(*) INTO v_pool_count 
    FROM public.photos 
    WHERE is_active = true 
    AND (p_tags IS NULL OR tags && p_tags)
    AND id != ALL(exclude_ids);

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
