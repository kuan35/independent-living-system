const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { generateWord } = require('./utils/wordGenerator');
const { packageAndUpload } = require('./utils/driveUploader');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// 中介軟體設定
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

app.post('/api/speech-to-text', upload.single('audio'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: '沒有收到音檔' 
      });
    }
    
    console.log('\n========== 收到音檔 ==========');
    console.log('檔案名稱:', req.file.filename);
    console.log('檔案大小:', req.file.size, 'bytes');
    console.log('================================\n');
    
    res.json({ 
      success: true, 
      text: '這是模擬的語音辨識結果(之後會改為真實的語音轉文字)',
      audioFile: req.file.filename
    });
  } catch (error) {
    console.error('語音轉文字錯誤：', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
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
    
    // ==================== 生成 Word 文件 ====================
    console.log('\n========== 生成 Word 文件 ==========');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const wordFileName = `${formData.name || 'unknown'}_自立生活支持計畫_${timestamp}.docx`;
    const wordFilePath = path.join(documentsDir, wordFileName);

    await generateWord(formData, processedAudioMapping, wordFilePath);
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
        archivesDir
      );
      console.log('✓ 上傳成功！');
      console.log('  Drive 檔案名稱:', uploadResult.driveFileName);
      console.log('  Drive 連結:', uploadResult.driveWebViewLink);
    } catch (uploadError) {
      console.error('⚠️  上傳到 Google Drive 失敗:', uploadError.message);
      console.log('⚠️  檔案已儲存在本地，但未上傳到雲端');
    }

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

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

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