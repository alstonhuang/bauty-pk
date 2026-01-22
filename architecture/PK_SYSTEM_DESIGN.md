# 美女 PK 系統 (Beauty PK System) 架構設計文件

## 1. 技術選型 (Technology Stack)

為了兼顧開發速度、效能、SEO（排行榜需求）以及未來的擴充性，建議採用以下架構：

### Frontend (前端)
*   **Framework**: **Next.js (React)**
    *   **理由**: 提供 Server-Side Rendering (SSR) 對排行榜的 SEO 友善，且內建 API Routes 可直接處理後端邏輯，簡化架構，不需額外架設獨立後端伺服器。
*   **Styling**: **Vanilla CSS (with CSS Modules)**
    *   **理由**: 根據專案需求，我們追求 "Premium" 與 "Dynamic" 的高度客製化視覺效果。原生 CSS 能提供最大的彈性來實現複雜的玻璃擬態 (Glassmorphism) 與微動畫，且效能最佳。
*   **State Management**: **React Context + Hooks** (對於中小型應用已足夠)

### Backend & Database (後端與資料庫)
*   **Platform**: **Supabase** (基於 PostgreSQL)
    *   **理由**:
        *   **關聯式資料庫 (SQL)**: 適合處理積分排名、投票交易紀錄 (Transaction) 等結構化數據，比 Firebase (NoSQL) 更容易進行複雜查詢（如：排行榜、歷史紀錄）。
        *   **Storage**: 內建檔案儲存，方便存放使用者上傳的照片。
        *   **Auth**: 內建使用者認證。
        *   **Realtime**: 同樣支援即時訂閱（如有即時對戰需求）。

---

## 2. 資料庫設計 (DB Schema)

使用 PostgreSQL 關聯式結構。

### 1. **users** (使用者)
| Column | Type | Constraint | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK | 使用者唯一識別 |
| `email` | String | Unique | 信箱 |
| `username` | String | | 顯示名稱 |
| `created_at` | Timestamp | | 註冊時間 |

### 2. **photos** (照片 - 參賽主體)
| Column | Type | Constraint | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK | 照片唯一識別 |
| `user_id` | UUID | FK -> users.id | 上傳者 |
| `url` | String | | 照片儲存路徑/URL |
| `score` | Integer | Default 1000 | 目前積分 (ELO Rating) |
| `wins` | Integer | Default 0 | 勝場數 |
| `losses` | Integer | Default 0 | 敗場數 |
| `matches` | Integer | Default 0 | 總場次 |
| `is_active` | Boolean | Default true | 是否上架中 |
| `created_at` | Timestamp | | 上傳時間 |

### 3. **votes** (投票紀錄)
記錄每一次的 PK 結果。
| Column | Type | Constraint | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK | 投票紀錄 ID |
| `winner_photo_id`| UUID | FK -> photos.id | 獲勝照片 ID |
| `loser_photo_id` | UUID | FK -> photos.id | 落敗照片 ID |
| `voter_id` | UUID | FK -> users.id | 投票者 (可為 Null，若允許匿名) |
| `created_at` | Timestamp | | 投票時間 |

### 4. **transactions** (積分流動紀錄)
用於稽核積分變動，每一場 PK 會產生兩筆紀錄（贏家加分、輸家扣分）。
| Column | Type | Constraint | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK | 交易 ID |
| `photo_id` | UUID | FK -> photos.id | 變動的照片 ID |
| `vote_id` | UUID | FK -> votes.id | 關聯的投票場次 |
| `delta` | Integer | | 積分變動量 (如: +16, -16) |
| `previous_score` | Integer | | 變動前積分 |
| `new_score` | Integer | | 變動後積分 |
| `reason` | String | | 原因 (e.g., 'match_win', 'match_loss') |
| `created_at` | Timestamp | | 時間 |

---

## 3. 核心演算法 (ELO Rating)

使用 ELO Rating System 標準公式。
假設 K-Factor 為 32 (變動係數，可依需求調整，數值越大分數波動越劇烈)。

### Python 虛擬碼

```python
def calculate_elo_change(winner_score, loser_score, k_factor=32):
    """
    計算 ELO 積分變動
    :param winner_score: 贏家當前積分
    :param loser_score: 輸家當前積分
    :param k_factor: 權重係數 (預設 32)
    :return: (winner_new_score, loser_new_score, score_delta)
    """
    
    # 1. 計算雙方 "期望勝率" (Expected Score)
    # E_a = 1 / (1 + 10 ^ ((R_b - R_a) / 400))
    expected_winner = 1 / (1 + 10 ** ((loser_score - winner_score) / 400))
    expected_loser = 1 / (1 + 10 ** ((winner_score - loser_score) / 400))
    
    # 2. 計算積分變動 (Delta)
    # 贏家實際拿 1 分，輸家 0 分
    # Delta = K * (Actual - Expected)
    delta = round(k_factor * (1 - expected_winner))
    
    # 3. 更新積分 (零和遊戲：贏家加的 = 輸家扣的)
    new_winner_score = winner_score + delta
    new_loser_score = loser_score - delta
    
    return new_winner_score, new_loser_score, delta

# 範例測試
w, l, d = calculate_elo_change(1000, 1000)
# 若雙方同分，勝率期望各 0.5，贏家獲得 32 * (1 - 0.5) = 16 分
# Output: (1016, 984, 16)
```

### JavaScript 虛擬碼

```javascript
/**
 * 計算新的 ELO 積分
 * @param {number} winnerRating - 贏家目前積分
 * @param {number} loserRating - 輸家目前積分
 * @param {number} kFactor - K值，預設 32
 * @returns {object} { winnerNew, loserNew, delta }
 */
function calculateElo(winnerRating, loserRating, kFactor = 32) {
  // 計算贏家的期望勝率
  // Math.pow(10, (loser - winner) / 400)
  const expectedWinProb = 1 / (1 + Math.pow(10, (loserRating - winnerRating) / 400));
  
  // 計算積分變動
  const delta = Math.round(kFactor * (1 - expectedWinProb));
  
  return {
    winnerNew: winnerRating + delta,
    loserNew: loserRating - delta,
    delta: delta
  };
}
```

---

## 4. 任務拆解 (Task Breakdown)

以下拆解為 4 個獨立 Ticket，可指派給不同 Agent 或開發階段。

### Ticket 1: 專案基建與資料庫設置 (Foundation & Schema)
*   **目標**: 完成 Next.js 專案初始化、Supabase 連接、資料表建置。
*   **細項**:
    1.  初始化 Next.js 專案 (App Router)。
    2.  設定 Global CSS 與基礎 Design System (變數、重置、字體)。
    3.  建立 Supabase 專案並執行 SQL 建表 (Users, Photos, Votes, Transactions)。
    4.  實作 Supabase Client 連接設定與基礎 Auth (使用者註冊/登入)。
*   **驗收條件**: 可在本地啟動專案，使用者可登入，資料庫有正確 Table 結構。

### Ticket 2: 照片上傳與展示 (Upload & Gallery)
*   **目標**: 讓使用者能上傳照片並建立 Photo 資料。
*   **細項**:
    1.  實作「上傳頁面」：包含圖片選擇、預覽、上傳按鈕。
    2.  整合 Supabase Storage：將圖片上傳至 Bucket。
    3.  寫入 Photo Table：建立照片紀錄，設定初始積分 1000。
    4.  實作「個人中心」：顯示使用者自己上傳的照片列表。
*   **驗收條件**: 成功上傳照片後，可在資料庫與個人頁面看到該照片。

### Ticket 3: 核心 PK 系統 (PK Logic & Voting)
*   **目標**: 實作隨機配對與投票積分計算。
*   **細項**:
    1.  開發後端 API (或 Server Action)：`GET /api/match/random`，隨機回傳兩張不同照片。
    2.  實作「PK 頁面」前端：左右展示兩張照片，加上與眾不同的互動動畫（Hover、點擊特效）。
    3.  開發投票 API：`POST /api/match/vote`，接收目前 `winner_id` 與 `loser_id`。
    4.  實作 ELO 演算法更新 `photos` 積分，並寫入 `votes` 與 `transactions` 紀錄。
*   **驗收條件**: 進入 PK 頁面能看到兩張圖，點擊後自動換下一組，且後端資料庫積分正確變動。

### Ticket 4: 排行榜與視覺優化 (Leaderboard & Polish)
*   **目標**: 展示最強美女排名與提升整體質感。
*   **細項**:
    1.  實作「排行榜頁面」：依 `score` 降序撈取前 20 名照片。
    2.  設計高級 UI 卡片：顯示排名、積分、勝率。
    3.  全站視覺優化：加入 Glassmorphism 背景、轉場動畫、Loading 骨架屏 (Skeleton)。
    4.  RWD 響應式調整 (Mobile 優先)。
*   **驗收條件**: 排行榜即時反映最高分照片，介面流暢且具現代感。
