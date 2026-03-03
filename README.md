# 自立生活支持計畫系統

機構委託辦理之身心障礙者自立生活支持服務中心專用表單系統

將傳統 Word 紙本表單數位化，提供友善的填寫介面，特別針對年長者與身心障礙者設計，支援語音輸入與自動產生文件

---

## 功能特色

- 五步驟表單精靈，分段引導填寫
- 大字體、大按鈕，適合年長者操作
- 單選／複選題以按鈕方式呈現，減少打字需求
- 語音輸入功能，自動將語音轉換為文字
- 自動產生 Word 文件（.docx）
- 音檔自動儲存並與文件一同打包為 ZIP
- 自動上傳至 Google Drive 指定資料夾

---

## 表單內容

| 步驟 | 內容 |
|------|------|
| 一 | 基本資料（姓名、身分證、聯絡方式、健康狀況等） |
| 二 | 福利服務使用情形（居家服務、其他福利） |
| 三 | 關於我的生活（語音輸入） |
| 四 | 我想要改變的事（語音輸入） |
| 五 | 個人助理／同儕支持員運用規劃（語音輸入） |

---

## 技術架構

**前端**
- React + TypeScript
- Ant Design
- Web Speech API（語音輸入）

**後端**
- Node.js + Express
- docxtemplater（Word 文件產生）
- archiver（ZIP 打包）
- Google Drive API + OAuth 2.0（雲端上傳）

---

## 專案結構

```
independent-living-system/
├── client/                  # React 前端
│   └── src/
│       ├── components/      # 表單步驟元件
│       └── index.tsx
├── server/                  # Node.js 後端
│   ├── routes/              # API 路由
│   ├── services/            # 業務邏輯（文件產生、Drive 上傳）
│   ├── templates/           # Word 模板檔案
│   ├── uploads/             # 暫存檔案
│   │   ├── audio/           # 使用者音檔
│   │   ├── documents/       # 產生的 Word 文件
│   │   └── archives/        # ZIP 壓縮檔
│   └── server.js
└── .gitignore
```

---

## 環境設定

### 前置需求

- Node.js 18 以上
- Google Cloud Console 專案（需開啟 Google Drive API）

### 安裝步驟

**1. 複製專案**

```bash
git clone https://github.com/kuan35/independent-living-system.git
cd independent-living-system
```

**2. 安裝前端套件**

```bash
cd client
npm install
```

**3. 安裝後端套件**

```bash
cd ../server
npm install
```

**4. 設定環境變數**

在 `server/` 資料夾建立 `.env` 檔案：

```env
PORT=5000
GOOGLE_DRIVE_FOLDER_ID=你的_Google_Drive_資料夾_ID
```

**5. 設定 Google OAuth 憑證**

將從 Google Cloud Console 下載的 OAuth 用戶端憑證放到 `server/` 資料夾，檔名為：

```
oauth-credentials.json
```

**6. 執行 Google Drive 授權**

首次使用需執行授權，完成後會自動產生 `google-token.json`：

```bash
cd server
node utils/oauthSetup.js
```

### 啟動系統

**啟動後端**

```bash
cd server
npm start
```

**啟動前端**

```bash
cd client
npm start
```

前端預設執行於 `http://localhost:3000`，後端預設執行於 `http://localhost:5000`。

---

## 注意事項

- `oauth-credentials.json` 與 `google-token.json` 含有敏感資訊，請勿上傳至版本控制
- 每位使用者的資料會以獨立 ZIP 壓縮後上傳，ZIP 內包含 Word 文件與所有音檔
- 檔案命名格式：`姓名_自立生活支持計畫_日期時間.zip`

---

## 授權

僅供機構內部使用
