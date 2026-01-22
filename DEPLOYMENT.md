# 部署檢查清單

## ✅ 部署前必做事項

### 1. 環境變數設定
確保以下環境變數已在 Vercel 設定：
- `NEXT_PUBLIC_SUPABASE_URL` - 你的 Supabase 專案 URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - 你的 Supabase Anon Key

### 2. Supabase 設定

#### A. 執行資料庫腳本
在 Supabase Dashboard → SQL Editor 執行以下腳本：
1. `db_setup.sql` - 基礎資料表
2. `energy_setup.sql` - 能量系統

#### B. 設定 Google OAuth
1. 前往 Supabase Dashboard → Authentication → Providers
2. 啟用 Google Provider
3. 設定 Google Cloud Console：
   - 建立 OAuth 2.0 Client ID
   - 設定 Authorized redirect URIs：
     ```
     https://<your-project>.supabase.co/auth/v1/callback
     ```
4. 將 Client ID 和 Secret 填入 Supabase

#### C. 設定 Storage
1. 前往 Supabase Dashboard → Storage
2. 建立 bucket：`photos`
3. 設定 Public Access（或使用 RLS policies）

### 3. 更新支持連結
編輯 `app/components/Footer.tsx`：
- 第 29 行：更新 Buy Me a Coffee 連結
- 第 42 行：更新 PayPal 連結

### 4. 測試功能
- [ ] 登入/登出
- [ ] 上傳照片
- [ ] PK 投票
- [ ] 能量系統
- [ ] Leaderboard
- [ ] My Photos

---

## 🚀 Vercel 部署步驟

### 方法 1：使用 Vercel CLI（推薦）

1. 安裝 Vercel CLI：
   ```bash
   npm i -g vercel
   ```

2. 登入 Vercel：
   ```bash
   vercel login
   ```

3. 部署：
   ```bash
   vercel
   ```

4. 設定環境變數：
   ```bash
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   ```

5. 重新部署：
   ```bash
   vercel --prod
   ```

### 方法 2：使用 Vercel Dashboard

1. 前往 https://vercel.com
2. 點擊 "New Project"
3. 連接你的 Git Repository（GitHub/GitLab/Bitbucket）
4. 設定環境變數：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. 點擊 "Deploy"

---

## 🔒 安全性建議

### 1. 啟用 Row Level Security (RLS)
確保所有資料表都有正確的 RLS policies（`db_setup.sql` 已包含）

### 2. 設定 Rate Limiting
在 Supabase 或 Vercel 設定 API rate limiting

### 3. 環境變數
- ✅ 使用 `.env.local`（已在 `.gitignore`）
- ✅ 不要將敏感資訊提交到 Git

### 4. CORS 設定
如果需要，在 Supabase 設定允許的來源

---

## 📊 監控與維護

### Vercel Analytics
- 啟用 Vercel Analytics 追蹤使用情況
- 監控效能和錯誤

### Supabase Dashboard
- 定期檢查資料庫使用量
- 監控 Storage 容量
- 查看 Auth 使用情況

---

## 🎯 上線後檢查

- [ ] 測試所有功能
- [ ] 檢查 Google OAuth 是否正常
- [ ] 確認照片上傳正常
- [ ] 測試能量系統
- [ ] 確認 Footer 連結正確
- [ ] 檢查手機版顯示
- [ ] 測試不同瀏覽器

---

## 🔗 有用的連結

- Vercel Dashboard: https://vercel.com/dashboard
- Supabase Dashboard: https://app.supabase.com
- Next.js 文件: https://nextjs.org/docs
- Supabase 文件: https://supabase.com/docs
