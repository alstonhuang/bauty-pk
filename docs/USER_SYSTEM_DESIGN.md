# 模組化使用者系統設計文件

## 🎯 設計理念

建立一個**高度模組化、可配置**的使用者個人資料系統，可以輕鬆移植到其他專案，並根據需求啟用/停用特定功能。

---

## 📦 系統架構

### **1. 核心模組（必需）**
```
lib/user-system/
├── core/
│   ├── types.ts              # 型別定義
│   ├── config.ts             # 配置檔案
│   └── hooks/
│       ├── useUserProfile.ts # 使用者資料 Hook
│       └── useUserUpdate.ts  # 更新資料 Hook
```

### **2. 功能模組（可選）**
```
lib/user-system/
├── modules/
│   ├── avatar/               # 頭像模組
│   │   ├── AvatarUpload.tsx
│   │   └── useAvatar.ts
│   ├── bio/                  # 自述模組
│   │   ├── BioEditor.tsx
│   │   └── useBio.ts
│   ├── banner/               # 背景圖模組
│   │   ├── BannerUpload.tsx
│   │   └── useBanner.ts
│   ├── social/               # 社交連結模組
│   │   ├── SocialLinks.tsx
│   │   └── useSocialLinks.ts
│   └── stats/                # 統計資料模組
│       ├── UserStats.tsx
│       └── useUserStats.ts
```

### **3. UI 元件（可選）**
```
lib/user-system/
├── components/
│   ├── UserProfilePage.tsx   # 完整個人頁面
│   ├── UserCard.tsx          # 使用者卡片
│   ├── UserBadge.tsx         # 使用者徽章
│   └── EditProfileModal.tsx  # 編輯模態框
```

---

## ⚙️ 配置系統

### **config.ts - 功能開關**
```typescript
export const USER_SYSTEM_CONFIG = {
  // 核心功能
  core: {
    displayName: true,      // 顯示名稱
    username: true,         // 使用者名稱
    email: false,           // 顯示 Email（隱私）
  },
  
  // 可選模組
  modules: {
    avatar: true,           // 頭像上傳
    banner: true,           // 背景圖
    bio: true,              // 個人簡介
    socialLinks: true,      // 社交連結
    stats: true,            // 統計資料
    badges: false,          // 徽章系統
    achievements: false,    // 成就系統
  },
  
  // UI 配置
  ui: {
    theme: 'glassmorphism',  // 主題風格
    layout: 'modern',        // 佈局樣式
    showEditButton: true,    // 顯示編輯按鈕
  },
  
  // 資料來源配置
  data: {
    provider: 'supabase',    // 資料提供者
    tableName: 'user_profiles',
    storageFolder: 'avatars',
  }
};
```

---

## 🗄️ 資料庫設計（模組化）

### **核心表（必需）**
```sql
-- user_profiles (核心)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  username TEXT UNIQUE,
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### **擴展表（按需啟用）**
```sql
-- user_profile_avatar (頭像模組)
CREATE TABLE user_profile_avatar (
  user_id UUID PRIMARY KEY REFERENCES user_profiles(id),
  avatar_url TEXT,
  avatar_updated_at TIMESTAMPTZ
);

-- user_profile_bio (自述模組)
CREATE TABLE user_profile_bio (
  user_id UUID PRIMARY KEY REFERENCES user_profiles(id),
  bio TEXT,
  bio_updated_at TIMESTAMPTZ
);

-- user_profile_banner (背景圖模組)
CREATE TABLE user_profile_banner (
  user_id UUID PRIMARY KEY REFERENCES user_profiles(id),
  banner_url TEXT,
  banner_updated_at TIMESTAMPTZ
);

-- user_profile_social (社交連結模組)
CREATE TABLE user_profile_social (
  user_id UUID PRIMARY KEY REFERENCES user_profiles(id),
  links JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ
);
```

---

## 🔧 使用方式

### **1. 基礎配置**
```typescript
// app/config/user-system.ts
import { USER_SYSTEM_CONFIG } from '@/lib/user-system/core/config';

export const myAppConfig = {
  ...USER_SYSTEM_CONFIG,
  modules: {
    avatar: true,
    banner: true,
    bio: true,
    socialLinks: false,  // 不需要社交連結
    stats: true,
    badges: false,       // 不需要徽章
  }
};
```

### **2. 使用 Hook**
```typescript
// 在元件中使用
import { useUserProfile } from '@/lib/user-system/core/hooks/useUserProfile';
import { useAvatar } from '@/lib/user-system/modules/avatar/useAvatar';

function UserPage({ userId }) {
  const { profile, loading } = useUserProfile(userId);
  const { avatar, uploadAvatar } = useAvatar(userId);
  
  // 只有啟用的模組才會載入
  return (
    <UserProfilePage 
      profile={profile}
      config={myAppConfig}
    />
  );
}
```

### **3. 自動渲染**
```typescript
// UserProfilePage 會根據 config 自動渲染
<UserProfilePage config={config}>
  {/* 只渲染啟用的模組 */}
  {config.modules.avatar && <AvatarSection />}
  {config.modules.bio && <BioSection />}
  {config.modules.banner && <BannerSection />}
</UserProfilePage>
```

---

## 🎨 模組範例

### **Avatar 模組**
```typescript
// lib/user-system/modules/avatar/useAvatar.ts
export function useAvatar(userId: string) {
  const [avatar, setAvatar] = useState<string | null>(null);
  
  const uploadAvatar = async (file: File) => {
    // 上傳邏輯
  };
  
  const deleteAvatar = async () => {
    // 刪除邏輯
  };
  
  return { avatar, uploadAvatar, deleteAvatar };
}
```

### **Bio 模組**
```typescript
// lib/user-system/modules/bio/useBio.ts
export function useBio(userId: string) {
  const [bio, setBio] = useState<string>('');
  
  const updateBio = async (newBio: string) => {
    // 更新邏輯
  };
  
  return { bio, updateBio };
}
```

---

## 📋 安裝步驟（其他專案）

### **步驟 1：複製模組**
```bash
cp -r lib/user-system /path/to/new-project/lib/
```

### **步驟 2：配置**
```typescript
// 在新專案中配置
export const config = {
  modules: {
    avatar: true,
    bio: false,      // 不需要
    banner: false,   // 不需要
    socialLinks: true,
  }
};
```

### **步驟 3：執行 SQL**
```sql
-- 只執行需要的表
-- 核心表（必需）
\i user_profiles_core.sql

-- 啟用的模組
\i user_profile_avatar.sql  -- 因為 avatar: true
\i user_profile_social.sql  -- 因為 socialLinks: true
```

### **步驟 4：使用**
```typescript
import { UserProfilePage } from '@/lib/user-system';

<UserProfilePage userId={id} config={config} />
```

---

## 🔌 擴展性

### **新增自訂模組**
```typescript
// lib/user-system/modules/custom/
export function useCustomModule(userId: string) {
  // 你的自訂邏輯
}

// 在 config 中註冊
modules: {
  custom: true,
}
```

---

## ✅ 優勢

1. **高度模組化** - 每個功能獨立，可單獨啟用/停用
2. **易於移植** - 複製資料夾即可用於其他專案
3. **配置驅動** - 透過 config 控制所有功能
4. **型別安全** - 完整的 TypeScript 支援
5. **資料庫優化** - 只建立需要的表
6. **UI 一致** - 統一的設計系統
7. **易於維護** - 清晰的檔案結構

---

## 🚀 下一步

1. 建立核心模組
2. 實作基礎功能（avatar, bio, banner）
3. 建立配置系統
4. 實作 UI 元件
5. 撰寫文件和範例

**要開始實作嗎？** 🎯
