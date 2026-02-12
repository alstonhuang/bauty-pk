-- MIGRATION: 分標籤統計系統 v9

-- 1. 建立分標籤統計資料表
CREATE TABLE IF NOT EXISTS public.photo_tag_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    photo_id UUID REFERENCES public.photos(id) ON DELETE CASCADE,
    tag TEXT NOT NULL,
    score INTEGER DEFAULT 1000 NOT NULL,
    wins INTEGER DEFAULT 0 NOT NULL,
    losses INTEGER DEFAULT 0 NOT NULL,
    matches INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(photo_id, tag)
);

-- 2. 建立索引加速查詢
CREATE INDEX IF NOT EXISTS idx_photo_tag_stats_tag ON public.photo_tag_stats(tag);
CREATE INDEX IF NOT EXISTS idx_photo_tag_stats_photo_id ON public.photo_tag_stats(photo_id);

-- 3. 安全性策略 (RLS)
ALTER TABLE public.photo_tag_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to tag stats"
ON public.photo_tag_stats FOR SELECT
USING (true);

-- 4. 初始化現有數據
-- 為現有 photos 的每一個標籤建立一條統計紀錄
INSERT INTO public.photo_tag_stats (photo_id, tag, score, wins, losses, matches)
SELECT 
    id as photo_id, 
    unnest(tags) as tag,
    1000 as score,
    0 as wins,
    0 as losses,
    0 as matches
FROM public.photos
ON CONFLICT (photo_id, tag) DO NOTHING;

-- 5. 如果之前有 category (v7) 的舊資料，也可以補齊
INSERT INTO public.photo_tag_stats (photo_id, tag, score, wins, losses, matches)
SELECT 
    id as photo_id, 
    category as tag,
    score, -- 繼承當時的分數作為初始標籤分
    wins,
    losses,
    matches
FROM public.photos
WHERE category IS NOT NULL
ON CONFLICT (photo_id, tag) DO UPDATE 
SET 
    score = EXCLUDED.score,
    wins = EXCLUDED.wins,
    losses = EXCLUDED.losses,
    matches = EXCLUDED.matches
WHERE photo_tag_stats.matches = 0; -- 僅在尚未有對決紀錄時覆寫
