-- FIX: RLS POLICIES & ACHIEVEMENT RE-SYNC

-- 1. 啟用並設定 RLS 政策 (確保前端讀得到)
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Achievements are viewable by everyone" ON public.achievements FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "User achievements are viewable by everyone" ON public.user_achievements FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2. 針對「新人出道」等核心成就，強制進行數據補齊
-- 有些時候 RPC 可能因為權限或環境問題沒跑，我們直接用 SQL 補
INSERT INTO public.user_achievements (user_id, achievement_id)
SELECT DISTINCT p.user_id, a.id
FROM public.photos p
JOIN public.achievements a ON a.name = '新人出道'
WHERE NOT EXISTS (
    SELECT 1 FROM public.user_achievements ua WHERE ua.user_id = p.user_id AND ua.achievement_id = a.id
)
ON CONFLICT DO NOTHING;

-- 3. 補發「連勝王」 (勝率 > 60% 且至少有 10 場比賽)
INSERT INTO public.user_achievements (user_id, achievement_id)
SELECT u.id, a.id
FROM public.user_profiles u
CROSS JOIN public.achievements a
WHERE a.name = '連勝王'
AND (
    SELECT CASE WHEN sum(matches) >= 10 THEN (sum(wins)::float / sum(matches)::float) * 100 ELSE 0 END 
    FROM public.photos p WHERE p.user_id = u.id
) >= 60
AND NOT EXISTS (
    SELECT 1 FROM public.user_achievements ua WHERE ua.user_id = u.id AND ua.achievement_id = a.id
)
ON CONFLICT DO NOTHING;

-- 4. 偵錯資訊：執行完後顯示當前有哪些人獲得了什麼
SELECT u.username, a.name as achievement
FROM public.user_achievements ua
JOIN public.user_profiles u ON u.id = ua.user_id
JOIN public.achievements a ON a.id = ua.achievement_id;
