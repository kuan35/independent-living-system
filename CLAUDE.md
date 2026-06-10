# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 專案概述

台灣身心障礙服務中心的數位化表單系統。將紙本「自立生活支持計畫表」轉為多步驟 Web 表單，支援語音輸入、AI 摘要整理、自動生成 Word 文件並上傳 Google Drive。另有管理員後台可查詢、編輯已送出的個案紀錄。

## 開發指令

```bash
# 前端（port 3000，proxy → 3001）
cd client && npm start

# 後端（port 3001）
cd server && npm run dev

# 生產建置
cd client && npm run build

# 重建管理員帳號（刪除 DB 後重啟即重建）
Remove-Item server/database.db
cd server && npm run dev
```

## 架構

```
independent-living-system/
├── client/src/
│   ├── pages/
│   │   ├── FormWizard.tsx        # 五步驟表單主控制器（支援 initialData/isEditMode props）
│   │   ├── AdminLogin.tsx        # 管理員登入頁 /admin
│   │   ├── AdminCases.tsx        # 個案列表頁 /admin/cases
│   │   └── AdminEditCase.tsx     # 個案編輯頁 /admin/cases/:id/edit
│   ├── components/
│   │   ├── VoiceInput.tsx        # 語音錄音 + 即時轉文字 + AI 整理
│   │   ├── BasicInfoForm.tsx     # Step 1
│   │   ├── WelfareServiceForm.tsx # Step 2
│   │   ├── LifeStatusForm.tsx    # Step 3（語音）
│   │   ├── FutureGoalsForm.tsx   # Step 4（語音，goals 為陣列）
│   │   └── AssistantPlanForm.tsx # Step 5（語音）
│   ├── utils/
│   │   └── adminAuth.ts          # getToken / isLoggedIn / logout / authHeader
│   └── App.tsx                   # BrowserRouter + 四條路由
│
└── server/
    ├── server.js                 # 主程式：所有 API inline 定義（含 submit-form）
    ├── routes/
    │   ├── admin.js              # /api/admin/* 路由（login/cases CRUD）
    │   └── submitForm.js         # ⚠️ 死碼，未被 import，勿修改此處
    └── utils/
        ├── database.js           # better-sqlite3 初始化、admins/cases 表、getUniqueCaseName()
        ├── wordGenerator.js      # docxtemplater 填入 Word 範本（民國年轉換在此）
        ├── driveUploader.js      # 打包 ZIP + 上傳 Google Drive，回傳 driveWebViewLink/driveFileId
        └── oauthSetup.js         # Google OAuth 2.0 授權流程（互動式 CLI）
```

## API 端點

| Method | Path | 說明 |
|--------|------|------|
| POST | /api/submit-form | 送出表單 → generateWord → packageAndUpload → 存 SQLite |
| POST | /api/ai-summary | GPT-4o-mini 整理語音逐字稿 |
| POST | /api/speech-to-text | 音檔上傳轉文字（multer，50MB） |
| POST | /api/save-draft | 草稿儲存 |
| GET | /api/health | 健康檢查 |
| POST | /api/admin/login | JWT 登入（8h 有效期）|
| GET | /api/admin/cases | 個案列表，支援 ?search= 姓名搜尋 |
| GET | /api/admin/cases/:id | 單一個案完整 form_data |
| PUT | /api/admin/cases/:id | 更新個案 → 重新產生 Word → 上傳 Drive |
| DELETE | /api/admin/cases/:id | 刪除個案 |

## 關鍵資料流

### 表單送出（新增）
`FormWizard.handleSubmit` → `POST /api/submit-form`（multipart）→ `generateWord()` → `packageAndUpload()` → 存入 SQLite `cases` 表

### 表單送出（編輯模式）
`FormWizard` 收到 `isEditMode=true` + `caseId` → `handleSubmit` 改呼叫 `PUT /api/admin/cases/:id`（JSON）→ 重新產生 Word → 更新 SQLite

### 語音 AI 整理
VoiceInput 錄音停止後顯示「AI 整理」按鈕 → `POST /api/ai-summary` → GPT-4o-mini → 摘要顯示在預覽 Card → 使用者選擇採用或略過

## 重要設計細節

### FormWizard props
```typescript
interface FormWizardProps {
  initialData?: { [key: string]: any }; // 編輯時預填資料
  isEditMode?: boolean;
  caseId?: number;
  onEditSuccess?: () => void;
}
```
`formData` 以 `initialData || {}` 初始化。FutureGoalsForm 是 controlled component，直接讀 `data.goals`（陣列），初始資料直接生效，不需另外處理。

### DatePicker 與日期字串
從資料庫載入的日期是 ISO 字串，所有 DatePicker 的 `value` 須包成 `dayjs()`：
```tsx
value={data.birthday ? dayjs(data.birthday) : null}
```
BasicInfoForm（birthday、openingDate）和 AssistantPlanForm（formDate）均已處理。

### SQLite 個案名稱唯一性
`getUniqueCaseName(baseName)` 在 `database.js` — 同名自動加 `_2`、`_3` 後綴。

### 路由架構
- `routes/admin.js` 透過 `app.use('/api/admin', require('./routes/admin'))` 掛載
- `routes/submitForm.js` 是死碼，實際 submit 邏輯在 `server.js` 的 `app.post('/api/admin')` inline handler

### JWT 驗證
`authMiddleware` 定義在 `routes/admin.js`，讀 `Authorization: Bearer <token>`，驗證失敗回 401。前端透過 `adminAuth.authHeader()` 自動帶入。

### 敏感檔案（.gitignore 已排除）
- `server/.env` — PORT, GOOGLE_DRIVE_FOLDER_ID, ADMIN_USERNAME, ADMIN_PASSWORD, JWT_SECRET, OPENAI_API_KEY
- `server/database.db` — SQLite 資料庫
- `server/oauth-credentials.json` — Google OAuth client secret
- `server/google-token.json` — 使用者授權 token

## 新增表單欄位的完整流程

1. 前端對應 Step 的 `*Form.tsx` 新增 UI
2. `wordGenerator.js` 新增範本變數對應
3. Word 範本 `templates/*.docx` 新增 `{fieldName}` 佔位符（需重存 DOCX）

## 常見問題

- **語音辨識失效**：僅支援 Chrome/Edge；需 HTTPS 或 localhost
- **Drive 上傳失敗**：執行 `node server/utils/oauthSetup.js` 重新授權
- **管理員密碼更新不生效**：刪除 `server/database.db` 後重啟後端（帳號在 DB 中，改 .env 不會自動更新）
- **編輯頁 DatePicker 報錯**：確認 `value` 有包 `dayjs()` 轉換
