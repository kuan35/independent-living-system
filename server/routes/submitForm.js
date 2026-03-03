const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { generateWord } = require('../utils/wordGenerator');
const { packageAndUpload } = require('../utils/driveUploader');

router.post('/submit-form', async (req, res) => {
  try {
    const formData = req.body;
    const audioFiles = req.files || {};

    console.log('收到表單提交');
    console.log('表單資料:', formData);
    console.log('音檔檔案:', Object.keys(audioFiles));

    // ==================== 設置資料夾路徑 ====================
    const uploadsDir = path.join(__dirname, '../uploads');
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

    // ==================== 處理音檔 ====================
    const audioFileMapping = {};
    Object.keys(audioFiles).forEach(fieldName => {
      const file = audioFiles[fieldName][0];
      const timestamp = Date.now();
      const newFileName = `${formData.name || 'unknown'}_${fieldName}_${timestamp}.webm`;
      const newPath = path.join(audioDir, newFileName);
      
      fs.renameSync(file.path, newPath);
      audioFileMapping[fieldName] = newFileName;
      
      console.log(`✓ 音檔已儲存: ${fieldName} -> ${newFileName}`);
    });

    // ==================== 生成 Word 文件 ====================
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const wordFileName = `${formData.name || 'unknown'}_自立生活支持計畫_${timestamp}.docx`;
    const wordFilePath = path.join(documentsDir, wordFileName);

    await generateWord(formData, audioFileMapping, wordFilePath);
    console.log('✓ Word 文件已生成:', wordFilePath);

    // ==================== 打包並上傳到 Google Drive ====================
    const uploadResult = await packageAndUpload(
      formData.name || 'unknown',
      wordFilePath,
      audioFileMapping,
      audioDir,
      archivesDir  // 傳入 archives 資料夾路徑
    );

    console.log('✓ 上傳完成:', uploadResult);

    // ==================== 回傳結果 ====================
    res.json({
      success: true,
      message: '表單提交成功，檔案已上傳到雲端硬碟',
      data: {
        wordFile: wordFileName,
        audioFiles: audioFileMapping,
        driveLink: uploadResult.driveWebViewLink,
        driveFileId: uploadResult.driveFileId,
        driveFileName: uploadResult.driveFileName
      }
    });

  } catch (error) {
    console.error('表單提交失敗:', error);
    res.status(500).json({
      success: false,
      message: '表單提交失敗',
      error: error.message
    });
  }
});

module.exports = router;