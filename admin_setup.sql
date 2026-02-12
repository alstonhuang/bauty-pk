-- ADMIN SYSTEM SETUP: 管理員權限系統

-- 1. 為 user_profiles 增加 role 欄位
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- 2. 建立索引以優化權限查詢
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role);

-- 3. 設定預設管理員 (alston_huang)
UPDATE public.user_profiles 
SET role = 'admin' 
WHERE username = 'alston_huang';

-- 4. 設定 achievements 表的 RLS 政策
-- 允許所有人讀取，但只有管理員能更新
DO $$ BEGIN
    CREATE POLICY "Admins can update achievements" ON public.achievements 
    FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 5. 建立檢查管理員權限的輔助函式
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_profiles 
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. 確認設定
SELECT username, role FROM public.user_profiles WHERE role = 'admin';
