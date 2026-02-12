-- ACHIEVEMENT BADGE STORAGE SETUP

-- 1. 建立 achievement_badges bucket (如果尚未存在)
-- 請在 Supabase Dashboard > Storage 手動建立 bucket: achievement_badges
-- 設定為 Public bucket

-- 2. 設定 Storage 政策
-- 允許所有人讀取徽章圖片
INSERT INTO storage.policies (name, bucket_id, definition)
VALUES (
  'Public Access',
  'achievement_badges',
  'bucket_id = ''achievement_badges'''
)
ON CONFLICT DO NOTHING;

-- 允許管理員上傳徽章圖片
INSERT INTO storage.policies (name, bucket_id, definition)
VALUES (
  'Admin Upload',
  'achievement_badges',
  '(bucket_id = ''achievement_badges'') AND (EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = ''admin''))'
)
ON CONFLICT DO NOTHING;

-- 允許管理員刪除徽章圖片
INSERT INTO storage.policies (name, bucket_id, definition)
VALUES (
  'Admin Delete',
  'achievement_badges',
  '(bucket_id = ''achievement_badges'') AND (EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = ''admin''))'
)
ON CONFLICT DO NOTHING;
