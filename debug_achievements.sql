-- DEBUG: 檢查成就條件與獲獎狀態

-- 1. 查看系統中有哪些成就與條件
SELECT id, name, criteria_type, criteria_value, badge_url FROM public.achievements;

-- 2. 測試：找出應該獲得「新人出道」但還沒拿到的用戶
SELECT u.id, u.username, 
       (SELECT count(*) FROM public.photos p WHERE p.user_id = u.id) as photo_count
FROM public.user_profiles u
WHERE (SELECT count(*) FROM public.photos p WHERE p.user_id = u.id) >= 1
AND NOT EXISTS (
    SELECT 1 FROM public.user_achievements ua
    JOIN public.achievements a ON a.id = ua.achievement_id
    WHERE ua.user_id = u.id AND a.name = '新人出道'
);

-- 3. 檢查當前用戶是否真的被授予了勳章
SELECT ua.earned_at, a.name 
FROM public.user_achievements ua
JOIN public.achievements a ON a.id = ua.achievement_id
WHERE ua.user_id = (SELECT id FROM public.user_profiles WHERE username LIKE 'ua507063%');
