const express = require('express');
const path = require('path');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const { generateWord } = require('./utils/wordGenerator');
const { packageAndUpload, uploadJsonRecord } = require('./utils/driveUploader');
require('dotenv').config({ override: true });
const { initDatabase, db, getUniqueCaseName, insertVersion } = require('./utils/database');
initDatabase();

const app = express();
const PORT = process.env.PORT || 3001;

// 中介軟體設定
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==================== 管理員路由 ====================
app.use('/api/admin', require('./routes/admin'));

// ==================== 設定資料夾路徑 ====================
const uploadsDir = path.join(__dirname, 'uploads');
const audioDir = path.join(uploadsDir, 'audio');
const documentsDir = path.join(uploadsDir, 'documents');
const archivesDir = path.join(uploadsDir, 'archives');

// 確保所有資料夾存在
[uploadsDir, audioDir, documentsDir, archivesDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✓ 資料夾已建立: ${dir}`);
  }
});

// ==================== 設定檔案上傳 ====================
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // 音檔暫時上傳到根目錄，稍後會移動到 audio 資料夾
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // 使用時間戳記避免檔名衝突
    const timestamp = Date.now();
    cb(null, `temp_${timestamp}_${file.originalname}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB 限制
  fileFilter: function (req, file, cb) {
    // 只接受音檔
    if (file.mimetype.startsWith('audio/') || file.originalname.endsWith('.webm')) {
      cb(null, true);
    } else {
      cb(new Error('只接受音檔格式'));
    }
  }
});

// ==================== API 路由 ====================
app.get('/api/test', (req, res) => {
  res.json({ 
    success: true, 
    message: '後端 API 運作正常！',
    timestamp: new Date().toISOString()
  });
});

app.post('/api/save-draft', (req, res) => {
  try {
    const { userId, formData } = req.body;
    
    console.log('\n========== 收到草稿儲存請求 ==========');
    console.log('使用者 ID:', userId);
    console.log('表單資料:', JSON.stringify(formData, null, 2));
    console.log('========================================\n');
    
    res.json({ 
      success: true, 
      message: '草稿已儲存',
      userId: userId
    });
  } catch (error) {
    console.error('儲存草稿錯誤：', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

app.post('/api/speech-to-text', upload.single('audio'), async (req, res) => {
  const filePath = req.file ? req.file.path : null;
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: '沒有收到音檔' });
    }

    console.log('\n========== Whisper 語音辨識 ==========');
    console.log('檔案:', req.file.filename, '大小:', req.file.size, 'bytes');

    const OpenAILib = require('openai');
    const client = new OpenAILib.OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const transcription = await client.audio.transcriptions.create({
      file: fs.createReadStream(filePath),
      model: 'whisper-1',
      language: 'zh',
    });

    console.log('辨識結果:', transcription.text);
    console.log('========================================\n');
    res.json({ success: true, text: transcription.text });
  } catch (error) {
    console.error('語音轉文字錯誤：', error);
    res.status(500).json({ success: false, error: error.message });
  } finally {
    if (filePath) try { fs.unlinkSync(filePath); } catch {}
  }
});

app.post('/api/submit-form', upload.array('audioFiles', 50), async (req, res) => {
  try {
    console.log('\n========================================');
    console.log('收到完整表單提交！');
    console.log('時間:', new Date().toLocaleString('zh-TW'));
    console.log('========================================');
    
    // 解析表單資料
    let formData;
    try {
      formData = JSON.parse(req.body.formData);
    } catch (e) {
      formData = req.body;
    }
    
    // 解析音檔對應表
    let audioFileMapping = {};
    try {
      audioFileMapping = JSON.parse(req.body.audioFileMapping || '{}');
    } catch (e) {
      console.log('無法解析音檔對應表');
    }
    
    const audioFiles = req.files || [];
    
    console.log('\n========== 接收狀態 ==========');
    console.log('✓ 表單資料已接收');
    console.log('✓ 音檔數量:', audioFiles.length);
    
    // ==================== 處理音檔 ====================
    const processedAudioMapping = {};
    
    if (audioFiles.length > 0) {
      console.log('\n========== 處理音檔 ==========');
      audioFiles.forEach((file, index) => {
        // 取得原始欄位名稱
        const fieldName = file.originalname.replace('temp_', '').replace(/^\d+_/, '').replace('.webm', '');
        const timestamp = Date.now() + index;
        const newFileName = `${formData.name || 'unknown'}_${fieldName}_${timestamp}.webm`;
        const newPath = path.join(audioDir, newFileName);
        
        // 移動檔案到 audio 資料夾
        fs.renameSync(file.path, newPath);
        processedAudioMapping[fieldName] = newFileName;
        
        const displayName = audioFileMapping[fieldName] || fieldName;
        console.log(`音檔 ${index + 1}:`);
        console.log('  欄位:', fieldName);
        console.log('  中文名稱:', displayName);
        console.log('  新檔名:', newFileName);
        console.log('  大小:', (file.size / 1024).toFixed(2), 'KB');
      });
    }
    
    // ==================== 顯示表單資料（保留原有的 console.log）====================
    console.log('\n========== 一、基本資料 ==========');
    console.log('姓名:', formData.name || '未填寫');
    console.log('身分證:', formData.idNumber || '未填寫');
    console.log('出生日期:', formData.birthday || '未填寫');
    console.log('個案來源:', formData.caseSource || '未填寫');
    if (formData.caseSourceOther) {
      console.log('  其他說明:', formData.caseSourceOther);
    }
    
    // ... 保留所有原有的 console.log（為了簡潔這裡省略，實際使用時保留）
    
    // ==================== 處理簽名 ====================
    const signaturesDir = path.join(uploadsDir, 'signatures');
    if (!fs.existsSync(signaturesDir)) fs.mkdirSync(signaturesDir, { recursive: true });

    const signatureFields = [
      { key: 'applicantSignature',     label: '申請人簽名' },
      { key: 'peerSupporterSignature', label: '同儕支持員簽名' },
      { key: 'socialWorkerSignature',  label: '社工員簽名' },
      { key: 'supervisorSignature',    label: '主管簽名' },
    ];
    const signatureMapping = {};
    const sigTimestamp = Date.now();

    signatureFields.forEach(({ key, label }) => {
      const dataUrl = formData[key];
      if (dataUrl && dataUrl.startsWith('data:image/')) {
        const base64 = dataUrl.replace(/^data:image\/png;base64,/, '');
        const fileName = `${formData.name || 'unknown'}_${label}_${sigTimestamp}.png`;
        const filePath = path.join(signaturesDir, fileName);
        fs.writeFileSync(filePath, Buffer.from(base64, 'base64'));
        signatureMapping[key] = filePath;
        console.log(`✓ 簽名已儲存: ${fileName}`);
      }
    });

    // 存 DB 前移除 base64（避免 DB 膨脹）
    const formDataForDB = { ...formData };
    signatureFields.forEach(({ key }) => delete formDataForDB[key]);

    // ==================== 生成 Word 文件 ====================
    console.log('\n========== 生成 Word 文件 ==========');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const wordFileName = `${formData.name || 'unknown'}_自立生活支持計畫_${timestamp}.docx`;
    const wordFilePath = path.join(documentsDir, wordFileName);

    await generateWord(formData, processedAudioMapping, wordFilePath, signatureMapping);
    console.log('✓ Word 文件已生成:', wordFilePath);

    // ==================== 打包並上傳到 Google Drive ====================
    console.log('\n========== 上傳到 Google Drive ==========');

    let uploadResult = null;
    try {
      uploadResult = await packageAndUpload(
        formData.name || 'unknown',
        wordFilePath,
        processedAudioMapping,
        audioDir,
        archivesDir,
        signatureMapping
      );
      console.log('✓ 上傳成功！');
      console.log('  Drive 檔案名稱:', uploadResult.driveFileName);
      console.log('  Drive 連結:', uploadResult.driveWebViewLink);
    } catch (uploadError) {
      console.error('⚠️  上傳到 Google Drive 失敗:', uploadError.message);
      console.log('⚠️  檔案已儲存在本地，但未上傳到雲端');
    }

    // ==================== 儲存個案到 SQLite ====================
    try {
      const caseName = getUniqueCaseName(formData.name || '未命名');
      const insertResult = db.prepare(`
        INSERT INTO cases (name, submit_date, form_data, audio_mapping, drive_link, drive_file_id)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        caseName,
        formDataForDB.formDate || new Date().toISOString().split('T')[0],
        JSON.stringify(formDataForDB),
        JSON.stringify(processedAudioMapping),
        uploadResult ? uploadResult.driveWebViewLink : null,
        uploadResult ? uploadResult.driveFileId : null
      );
      insertVersion(
        insertResult.lastInsertRowid,
        '初始版本',
        '首次送出',
        formData,
        uploadResult ? uploadResult.driveWebViewLink : null,
        uploadResult ? uploadResult.driveFileId : null
      );
      console.log('✓ 個案資料已存入資料庫，名稱：', caseName);
    } catch (dbError) {
      console.error('DB 儲存失敗（不影響表單送出）：', dbError.message);
    }

    // ==================== 非同步上傳 JSON 紀錄 ====================
    uploadJsonRecord(formDataForDB, formData.name || 'unknown').catch(err => {
      console.error('⚠️  JSON 紀錄上傳 Drive 失敗:', err.message);
    });

    // ==================== 回傳結果 ====================
    console.log('\n========== 處理完成 ==========');
    console.log('✓ Word 文件:', wordFileName);
    console.log('✓ 總欄位數:', Object.keys(formData).length);
    console.log('✓ 音檔數量:', audioFiles.length);
    if (uploadResult) {
      console.log('✓ 雲端連結:', uploadResult.driveWebViewLink);
    }
    console.log('========================================\n');
    
    res.json({ 
      success: true, 
      message: uploadResult 
        ? '表單已成功送出並上傳到雲端硬碟！' 
        : '表單已成功送出，但雲端上傳失敗，檔案已儲存在本地',
      data: {
        wordFile: wordFileName,
        audioFiles: processedAudioMapping,
        driveLink: uploadResult ? uploadResult.driveWebViewLink : null,
        driveFileId: uploadResult ? uploadResult.driveFileId : null,
        driveFileName: uploadResult ? uploadResult.driveFileName : null,
        localWordPath: wordFilePath,
        totalFields: Object.keys(formData).length,
        audioFilesCount: audioFiles.length
      }
    });

  } catch (error) {
    console.error('\n========================================');
    console.error('錯誤：提交表單失敗');
    console.error(error);
    console.error('========================================\n');
    
    res.status(500).json({ 
      success: false, 
      error: error.message,
      message: '表單提交失敗，請稍後再試'
    });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ==================== AI 整理路由 ====================
const OpenAI = require('openai');
const openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post('/api/ai-summary', async (req, res) => {
  try {
    const { transcript } = req.body;

    if (!transcript || typeof transcript !== 'string' || transcript.trim() === '') {
      return res.status(400).json({ success: false, error: '缺少 transcript 或內容為空' });
    }

    console.log('\n========== AI 整理請求 ==========');
    console.log('原始文字長度:', transcript.length);

    const completion = await openaiClient.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: '你是一個社工助理，以下是社工與個案的對話紀錄，請整理成第一人稱（個案角度）的重點摘要，去除對話中的問句與重複內容，保留重要資訊，使用繁體中文，100-200字以內。'
        },
        { role: 'user', content: transcript }
      ],
      max_tokens: 400,
      temperature: 0.3
    });

    const summary = completion.choices[0].message.content;
    console.log('AI 整理完成，摘要長度:', summary.length);
    console.log('========================================\n');

    res.json({ success: true, summary });
  } catch (error) {
    console.error('AI 整理失敗：', error);
    if (error.status === 401) {
      return res.status(500).json({ success: false, error: 'OpenAI API 金鑰無效，請確認 .env 設定' });
    }
    res.status(500).json({ success: false, error: error.message || 'AI 整理失敗，請稍後再試' });
  }
});

// ==================== 前端靜態檔案 ====================
app.use(express.static(path.join(__dirname, '../client/build')));
app.get('/*splat', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

// ==================== 404 處理 ====================
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    error: '找不到此 API 路徑' 
  });
});

app.listen(PORT, () => {
  console.log('\n========================================');
  console.log(' 後端伺服器已啟動！');
  console.log('========================================');
  console.log('位置：http://localhost:' + PORT);
  console.log('時間：' + new Date().toLocaleString('zh-TW'));
  console.log('\n 資料夾結構：');
  console.log('  ├─ uploads/audio/      (音檔)');
  console.log('  ├─ uploads/documents/  (Word 檔案)');
  console.log('  └─ uploads/archives/   (ZIP 檔案)');
  console.log('\n 可用的 API：');
  console.log('  GET  /api/test          - 測試 API');
  console.log('  POST /api/save-draft    - 儲存草稿');
  console.log('  POST /api/speech-to-text - 語音轉文字');
  console.log('  POST /api/submit-form   - 提交表單');
  console.log('\n  Google Drive 狀態：');
  if (process.env.GOOGLE_DRIVE_FOLDER_ID) {
    console.log('   已設定 GOOGLE_DRIVE_FOLDER_ID');
  } else {
    console.log('    未設定 GOOGLE_DRIVE_FOLDER_ID');
  }
  console.log('\n按 Ctrl+C 可停止伺服器');
  console.log('========================================\n');
});
