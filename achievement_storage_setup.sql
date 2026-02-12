-- ACHIEVEMENT BADGE STORAGE SETUP GUIDE
-- 
-- 由於 Supabase Storage 政策無法透過 SQL 直接設定，
-- 請按照以下步驟在 Supabase Dashboard 手動設定：

-- ============================================
-- 步驟 1: 建立 Storage Bucket
-- ============================================
-- 1. 前往 Supabase Dashboard > Storage
-- 2. 點擊 "New bucket"
-- 3. Bucket name: achievement_badges
-- 4. 勾選 "Public bucket" (允許公開讀取)
-- 5. 點擊 "Create bucket"

-- ============================================
-- 步驟 2: 設定 Storage 政策
-- ============================================
-- 在 achievement_badges bucket 的設定頁面中，新增以下政策：

-- 政策 1: 允許所有人讀取 (SELECT)
-- Name: Public Read
-- Allowed operation: SELECT
-- Policy definition: true

-- 政策 2: 允許管理員上傳 (INSERT)
-- Name: Admin Upload
-- Allowed operation: INSERT
-- Policy definition:
-- (bucket_id = 'achievement_badges') AND (
--   EXISTS (
--     SELECT 1 FROM public.user_profiles 
--     WHERE id = auth.uid() AND role = 'admin'
--   )
-- )

-- 政策 3: 允許管理員刪除 (DELETE)
-- Name: Admin Delete
-- Allowed operation: DELETE
-- Policy definition:
-- (bucket_id = 'achievement_badges') AND (
--   EXISTS (
--     SELECT 1 FROM public.user_profiles 
--     WHERE id = auth.uid() AND role = 'admin'
--   )
-- )

-- ============================================
-- 完成！
-- ============================================
-- 設定完成後，管理員後台的圖片上傳功能就可以正常使用了。
