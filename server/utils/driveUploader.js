const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const { authorize } = require('./oauthSetup');

/**
 * 建立 ZIP 壓縮檔
 */
async function createZipFile(userName, wordFilePath, audioFileMapping, audioDir, archivesDir) {
  return new Promise((resolve, reject) => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const zipFileName = `${userName}_自立生活支持計畫_${timestamp}.zip`;
    const zipFilePath = path.join(archivesDir, zipFileName);

    const output = fs.createWriteStream(zipFilePath);
    const archive = archiver('zip', {
      zlib: { level: 9 }
    });

    output.on('close', () => {
      console.log(`✓ ZIP 檔案已建立: ${zipFilePath} (${archive.pointer()} bytes)`);
      resolve(zipFilePath);
    });

    archive.on('error', (err) => {
      reject(err);
    });

    archive.pipe(output);

    // 加入 Word 檔案
    const wordFileName = path.basename(wordFilePath);
    archive.file(wordFilePath, { name: wordFileName });
    console.log(`  ├─ ${wordFileName}`);

    // 加入音檔
    if (audioFileMapping && Object.keys(audioFileMapping).length > 0) {
      Object.entries(audioFileMapping).forEach(([fieldName, fileName]) => {
        const audioFilePath = path.join(audioDir, fileName);
        if (fs.existsSync(audioFilePath)) {
          archive.file(audioFilePath, { name: `audio/${fileName}` });
          console.log(`  ├─ audio/${fileName}`);
        }
      });
    }

    archive.finalize();
  });
}

/**
 * 上傳檔案到 Google Drive（使用 OAuth）
 */
async function uploadToDrive(filePath, fileName, folderId) {
  try {
    const auth = await authorize();
    const drive = google.drive({ version: 'v3', auth });

    const fileMetadata = {
      name: fileName,
      parents: [folderId]
    };

    const media = {
      mimeType: 'application/zip',
      body: fs.createReadStream(filePath)
    };

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, name, webViewLink'
    });

    console.log('✓ 檔案已上傳到 Google Drive:', response.data.name);
    return response.data;
  } catch (error) {
    console.error('上傳到 Google Drive 失敗:', error.message);
    throw error;
  }
}

/**
 * 刪除本地檔案
 */
function cleanupLocalFiles(filePaths) {
  filePaths.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log('✓ 已刪除本地檔案:', path.basename(filePath));
    }
  });
}

/**
 * 完整流程：打包並上傳
 */
async function packageAndUpload(userName, wordFilePath, audioFileMapping, audioDir, archivesDir) {
  try {
    console.log('==================== 開始打包並上傳 ====================');

    // 1. 建立 ZIP 檔案
    console.log('步驟 1/3: 建立 ZIP 檔案...');
    const zipFilePath = await createZipFile(userName, wordFilePath, audioFileMapping, audioDir, archivesDir);

    // 2. 上傳到 Google Drive
    console.log('步驟 2/3: 上傳到 Google Drive...');
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    if (!folderId) {
      throw new Error('未設置 GOOGLE_DRIVE_FOLDER_ID 環境變數');
    }

    const uploadResult = await uploadToDrive(zipFilePath, path.basename(zipFilePath), folderId);

    // 3. 清理本地檔案（可選）
    console.log('步驟 3/3: 完成');
    
    console.log('==================== 上傳完成 ====================');

    return {
      success: true,
      driveFileId: uploadResult.id,
      driveFileName: uploadResult.name,
      driveWebViewLink: uploadResult.webViewLink,
      localZipPath: zipFilePath,
      localWordPath: wordFilePath
    };
  } catch (error) {
    console.error('打包並上傳失敗:', error.message);
    throw error;
  }
}

module.exports = {
  createZipFile,
  uploadToDrive,
  cleanupLocalFiles,
  packageAndUpload
};