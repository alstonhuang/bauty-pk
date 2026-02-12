-- NUCLEAR RLS FIX & DATA SYNC (終極修復版)

-- 1. 手動開放資料表讀取權限 (確保 Anon/Auth 角色能 SELECT)
GRANT SELECT ON public.achievements TO anon, authenticated;
GRANT SELECT ON public.user_achievements TO anon, authenticated;

-- 2. 徹底重置 RLS 政策
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- 刪除所有可能的舊政策
DROP POLICY IF EXISTS "Achievements are viewable by everyone" ON public.achievements;
DROP POLICY IF EXISTS "Public Read Achievements" ON public.achievements;
DROP POLICY IF EXISTS "Allow public read access on achievements" ON public.achievements;

DROP POLICY IF EXISTS "User achievements are viewable by everyone" ON public.user_achievements;
DROP POLICY IF EXISTS "Public Read User Achievements" ON public.user_achievements;
DROP POLICY IF EXISTS "Allow public read access on user_achievements" ON public.user_achievements;

-- 建立最寬鬆的讀取政策
CREATE POLICY "Wide Open Achievements Read" ON public.achievements FOR SELECT USING (true);
CREATE POLICY "Wide Open User Achievements Read" ON public.user_achievements FOR SELECT USING (true);

-- 3. 確保 alston_huang 的數據完整性
DO $$
DECLARE
    v_user_id UUID;
BEGIN
    SELECT id INTO v_user_id FROM public.user_profiles WHERE username = 'alston_huang';
    
    IF v_user_id IS NOT NULL THEN
        -- 強制補發「新人出道」
        INSERT INTO public.user_achievements (user_id, achievement_id)
        SELECT v_user_id, id FROM public.achievements WHERE name = '新人出道'
        ON CONFLICT DO NOTHING;

        -- 強制補發「競技達人」 (若滿足條件)
        INSERT INTO public.user_achievements (user_id, achievement_id)
        SELECT v_user_id, id FROM public.achievements WHERE name = '競技達人'
        AND (SELECT COALESCE(sum(matches), 0) FROM public.photos WHERE user_id = v_user_id) >= 1
        ON CONFLICT DO NOTHING;
        
        -- 強制補發「貓奴領袖」
        INSERT INTO public.user_achievements (user_id, achievement_id)
        SELECT v_user_id, id FROM public.achievements WHERE name = '貓奴領袖'
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- 4. 刷新快取
NOTIFY pgrst, 'reload schema';

-- 5. 檢視最終結果 (執行後請看下方 Results)
SELECT u.username, a.name as achievement
FROM public.user_achievements ua
JOIN public.user_profiles u ON u.id = ua.user_id
JOIN public.achievements a ON a.id = ua.achievement_id
WHERE u.username = 'alston_huang';
