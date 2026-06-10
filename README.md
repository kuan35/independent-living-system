# 自立生活支持計畫系統

機構委託辦理之身心障礙者自立生活支持服務中心專用表單系統。

將傳統紙本表單數位化，提供友善的填寫介面，特別針對年長者與身心障礙者設計。

---

## 功能

### 表單填寫

- 五步驟表單精靈，分段引導填寫
- 大字體、大按鈕介面，適合年長者與身心障礙者操作
- 單選／複選題以按鈕方式呈現，減少打字需求
- 語音輸入功能，錄音後自動辨識轉換為文字
- AI 整理功能（GPT-4o-mini），將語音逐字稿整理為第一人稱摘要
- 電子簽名欄位（申請人、同儕支持員、社工員、受託單位主管）

### 文件產生與儲存

- 自動產生 Word 文件（.docx），含簽名圖片嵌入
- 音檔與簽名圖片自動打包為 ZIP 上傳至 Google Drive
- 表單資料同步備份為 JSON 檔案，依個案姓名分資料夾存放於 Google Drive
- 個案資料存入本地 SQLite 資料庫

### 管理員後台

- 帳號密碼登入（JWT 驗證，8 小時有效期）
- 個案列表，支援姓名搜尋
- 個案資料編輯，修改後重新產生 Word 並上傳 Drive
- 版本控制：每次編輯自動建立版本紀錄，可查看各版本的 Drive 連結

---

## 表單步驟

| 步驟 | 內容 |
|------|------|
| 一 | 基本資料（姓名、身分證、聯絡方式、身心障礙資訊等） |
| 二 | 福利服務使用情形（居家服務、其他福利） |
| 三 | 關於我的生活（語音輸入） |
| 四 | 我想要改變的事（語音輸入，支援多目標） |
| 五 | 個人助理／同儕支持員運用規劃（語音輸入、電子簽名） |

---

## 技術架構

**前端**
- React 19 + TypeScript
- Ant Design 6
- Web Speech API（語音辨識）
- react-signature-canvas（電子簽名）

**後端**
- Node.js + Express
- better-sqlite3（本地資料庫）
- docxtemplater + docxtemplater-image-module-free（Word 文件產生含圖片）
- archiver（ZIP 打包）
- Google Drive API + OAuth 2.0（雲端上傳）
- OpenAI API（語音 AI 整理）
- jsonwebtoken + bcryptjs（管理員驗證）

---

## 專案結構

```
independent-living-system/
├── client/src/
│   ├── pages/
│   │   ├── FormWizard.tsx       # 五步驟表單主控制器
│   │   ├── AdminLogin.tsx       # 管理員登入
│   │   ├── AdminCases.tsx       # 個案列表
│   │   └── AdminEditCase.tsx    # 個案編輯
│   └── components/
│       ├── VoiceInput.tsx       # 語音輸入與 AI 整理
│       ├── SignaturePad.tsx     # 電子簽名
│       ├── BasicInfoForm.tsx    # 步驟一
│       ├── WelfareServiceForm.tsx # 步驟二
│       ├── LifeStatusForm.tsx   # 步驟三
│       ├── FutureGoalsForm.tsx  # 步驟四
│       └── AssistantPlanForm.tsx # 步驟五
└── server/
    ├── server.js                # 主程式與 API
    ├── routes/
    │   └── admin.js             # 管理員 API
    ├── utils/
    │   ├── database.js          # SQLite 初始化與查詢
    │   ├── wordGenerator.js     # Word 文件產生
    │   ├── driveUploader.js     # Google Drive 上傳
    │   └── oauthSetup.js        # Google OAuth 授權
    └── templates/               # Word 範本檔案
```

---

## 環境設定

### 前置需求

- Node.js 18 以上
- Google Cloud Console 專案（需開啟 Google Drive API）
- OpenAI API 金鑰（語音 AI 整理功能）

### 安裝步驟

**1. 複製專案**

```bash
git clone https://github.com/kuan35/independent-living-system.git
cd independent-living-system
```

**2. 安裝套件**

```bash
cd client && npm install
cd ../server && npm install
```

**3. 設定環境變數**

在 `server/` 建立 `.env`：

```env
PORT=3001
GOOGLE_DRIVE_FOLDER_ID=你的_Google_Drive_資料夾_ID
ADMIN_USERNAME=管理員帳號
ADMIN_PASSWORD=管理員密碼
JWT_SECRET=自訂的隨機字串
OPENAI_API_KEY=你的_OpenAI_API_金鑰
```

**4. 設定 Google OAuth 憑證**

將從 Google Cloud Console 下載的 OAuth 用戶端憑證放到 `server/`，檔名為 `oauth-credentials.json`。

**5. 執行 Google Drive 授權**

```bash
cd server
node utils/oauthSetup.js
```

完成後會自動產生 `google-token.json`。

### 啟動

```bash
# 後端（port 3001）
cd server && npm run dev

# 前端（port 3000）
cd client && npm start
```

前端開發時 proxy 至 `localhost:3001`。正式部署時執行 `cd client && npm run build`，由後端統一 serve 靜態檔案。

---

## Google Drive 資料夾結構

上傳後 Drive 內會有兩個獨立區域：

```
指定資料夾（GOOGLE_DRIVE_FOLDER_ID）/
└── 姓名_自立生活支持計畫_日期.zip   # Word + 音檔 + 簽名

個案JSON紀錄/
└── 個案姓名/
    └── 姓名_自立生活支持計畫_日期時間.json   # 完整表單資料備份
```

---

## 注意事項

- `server/.env`、`oauth-credentials.json`、`google-token.json` 含有敏感資訊，已列入 `.gitignore`，請勿手動加入版本控制
- 語音辨識僅支援 Chrome 與 Edge，需在 HTTPS 或 localhost 環境下使用
- 管理員密碼修改後重啟後端即自動生效，無需刪除資料庫
- 首次執行需完成 Google OAuth 授權，之後 token 自動續期

---

## 授權

僅供機構內部使用
