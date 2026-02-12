-- DATA RECOVERY & DEDUPLICATION: 勳章數據修復腳本 (修正版 v3)

DO $$
DECLARE
    r RECORD;
    v_keep_id UUID;
BEGIN
    -- 1. 對於每一組重複的成就名稱，找出要保留的 ID
    -- PostgreSQL 的 min() 不支援 UUID，所以先轉成 text 比較，再轉回 uuid
    FOR r IN (
        SELECT name, min(id::text)::uuid as keep_id 
        FROM public.achievements 
        GROUP BY name 
        HAVING count(*) > 1
    ) LOOP
        v_keep_id := r.keep_id;

        -- 2. 處理獲獎紀錄的合併
        
        -- A. 先刪除「如果更新後會導致重複」的獲獎紀錄 (避免 PK 衝突)
        DELETE FROM public.user_achievements ua1
        WHERE achievement_id IN (
            SELECT id FROM public.achievements 
            WHERE name = r.name AND id != v_keep_id
        )
        AND EXISTS (
            SELECT 1 FROM public.user_achievements ua2
            WHERE ua2.user_id = ua1.user_id 
            AND ua2.achievement_id = v_keep_id
        );

        -- B. 將剩餘的指向「錯誤 ID」的紀錄更新為指向「保留 ID」
        UPDATE public.user_achievements 
        SET achievement_id = v_keep_id 
        WHERE achievement_id IN (
            SELECT id FROM public.achievements 
            WHERE name = r.name AND id != v_keep_id
        );

        -- 3. 刪除多餘的成就定義
        DELETE FROM public.achievements 
        WHERE name = r.name AND id != v_keep_id;
    END LOOP;
    
    -- 確保唯一約束存在
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'achievements_name_key'
    ) THEN
        ALTER TABLE public.achievements ADD CONSTRAINT achievements_name_key UNIQUE (name);
    END IF;
END $$;

-- 4. 針對所有用戶重新觸發一次成就檢查，補全遺漏項目
-- 修正：這裡應該使用 user_profiles 或 auth.users 表
DO $$
DECLARE
    u_id UUID;
BEGIN
    FOR u_id IN SELECT id FROM public.user_profiles LOOP
        PERFORM public.check_user_achievements(u_id);
    END LOOP;
END $$;

-- 5. 確保「新人出道」至少會發放給所有有照片的人
INSERT INTO public.user_achievements (user_id, achievement_id)
SELECT DISTINCT p.user_id, a.id
FROM public.photos p
JOIN public.achievements a ON a.name = '新人出道'
WHERE NOT EXISTS (
    SELECT 1 FROM public.user_achievements ua WHERE ua.user_id = p.user_id AND ua.achievement_id = a.id
)
ON CONFLICT DO NOTHING;

-- 6. 確保「人氣之星」發放給最高分超過 2000 的人
INSERT INTO public.user_achievements (user_id, achievement_id)
SELECT DISTINCT p.user_id, a.id
FROM public.photos p
JOIN public.achievements a ON a.name = '人氣之星'
WHERE p.score >= 2000
AND NOT EXISTS (
    SELECT 1 FROM public.user_achievements ua WHERE ua.user_id = p.user_id AND ua.achievement_id = a.id
)
ON CONFLICT DO NOTHING;
