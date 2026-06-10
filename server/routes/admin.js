const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { db, insertVersion } = require('../utils/database');
const { generateWord } = require('../utils/wordGenerator');
const { packageAndUpload, uploadJsonRecord } = require('../utils/driveUploader');

const uploadsDir = path.join(__dirname, '../uploads');
const documentsDir = path.join(__dirname, '../uploads/documents');
const audioDir = path.join(__dirname, '../uploads/audio');
const archivesDir = path.join(__dirname, '../uploads/archives');
const signaturesDir = path.join(__dirname, '../uploads/signatures');
const tempDir = path.join(__dirname, '../uploads');

const SIGNATURE_FIELDS = [
  { key: 'applicantSignature',     label: '申請人簽名' },
  { key: 'peerSupporterSignature', label: '同儕支持員簽名' },
  { key: 'socialWorkerSignature',  label: '社工員簽名' },
  { key: 'supervisorSignature',    label: '主管簽名' },
];

const audioUpload = multer({
  dest: tempDir,
  limits: { fileSize: 50 * 1024 * 1024 },
});

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: '未授權，請先登入' });
  }
  try {
    req.admin = jwt.verify(auth.slice(7), process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Token 無效或已過期，請重新登入' });
  }
}

// POST /api/admin/login
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: '請輸入帳號和密碼' });
  }
  const admin = db.prepare('SELECT * FROM admins WHERE username = ?').get(username);
  if (!admin || !bcrypt.compareSync(password, admin.password_hash)) {
    return res.status(401).json({ error: '帳號或密碼錯誤' });
  }
  const token = jwt.sign(
    { id: admin.id, username: admin.username },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );
  res.json({ success: true, token });
});

// GET /api/admin/cases?search=姓名
router.get('/cases', authMiddleware, (req, res) => {
  const { search } = req.query;
  let rows;
  if (search) {
    rows = db.prepare(
      'SELECT id, name, submit_date, drive_link, created_at FROM cases WHERE name LIKE ? ORDER BY created_at DESC'
    ).all(`%${search}%`);
  } else {
    rows = db.prepare(
      'SELECT id, name, submit_date, drive_link, created_at FROM cases ORDER BY created_at DESC'
    ).all();
  }
  res.json({ success: true, cases: rows });
});

// GET /api/admin/cases/:id
router.get('/cases/:id', authMiddleware, (req, res) => {
  const row = db.prepare('SELECT * FROM cases WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: '找不到此個案' });
  try {
    res.json({ success: true, case: { ...row, form_data: JSON.parse(row.form_data) } });
  } catch {
    res.status(500).json({ error: '個案資料解析失敗' });
  }
});

// PUT /api/admin/cases/:id
router.put('/cases/:id', authMiddleware, audioUpload.array('audioFiles'), async (req, res) => {
  let form_data, version_name, commit_message;
  try {
    form_data = JSON.parse(req.body.form_data);
    version_name = req.body.version_name;
    commit_message = req.body.commit_message || null;
  } catch {
    return res.status(400).json({ error: '資料格式錯誤' });
  }
  if (!form_data) return res.status(400).json({ error: '缺少 form_data' });
  if (!version_name) return res.status(400).json({ error: '請輸入版本名稱' });

  const row = db.prepare('SELECT id, name, audio_mapping FROM cases WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: '找不到此個案' });

  try {
    const caseName = form_data.name || row.name;

    // 合併舊音檔 mapping + 新錄製的音檔
    let mergedAudioMapping = {};
    try { mergedAudioMapping = JSON.parse(row.audio_mapping || '{}'); } catch {}

    if (req.files && req.files.length > 0) {
      req.files.forEach((file, index) => {
        const fieldName = file.originalname.replace('.webm', '');
        const newFileName = `${caseName}_${fieldName}_${Date.now() + index}.webm`;
        const newPath = path.join(audioDir, newFileName);
        fs.renameSync(file.path, newPath);
        mergedAudioMapping[fieldName] = newFileName;
      });
    }

    // 處理簽名
    if (!fs.existsSync(signaturesDir)) fs.mkdirSync(signaturesDir, { recursive: true });
    const signatureMapping = {};
    const sigTimestamp = Date.now();
    SIGNATURE_FIELDS.forEach(({ key, label }) => {
      const dataUrl = form_data[key];
      if (dataUrl && dataUrl.startsWith('data:image/')) {
        const base64 = dataUrl.replace(/^data:image\/\w+;base64,/, '');
        const fileName = `${caseName}_${label}_${sigTimestamp}.png`;
        const filePath = path.join(signaturesDir, fileName);
        fs.writeFileSync(filePath, Buffer.from(base64, 'base64'));
        signatureMapping[key] = filePath;
      }
    });

    // 存 DB 前移除 base64（避免 DB 膨脹）
    const formDataForDB = { ...form_data };
    SIGNATURE_FIELDS.forEach(({ key }) => delete formDataForDB[key]);

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const wordFileName = `${caseName}_自立生活支持計畫_${timestamp}.docx`;
    const wordFilePath = path.join(documentsDir, wordFileName);

    await generateWord(form_data, mergedAudioMapping, wordFilePath, signatureMapping);

    let driveLink = null;
    let driveFileId = null;
    try {
      const uploadResult = await packageAndUpload(caseName, wordFilePath, mergedAudioMapping, audioDir, archivesDir, signatureMapping);
      driveLink = uploadResult.driveWebViewLink || null;
      driveFileId = uploadResult.driveFileId || null;
    } catch (uploadError) {
      console.error('編輯後上傳 Drive 失敗（不影響資料更新）：', uploadError.message);
    }

    db.prepare(`
      UPDATE cases SET
        form_data = ?,
        name = ?,
        audio_mapping = ?,
        drive_link = COALESCE(?, drive_link),
        drive_file_id = COALESCE(?, drive_file_id),
        updated_at = datetime('now','localtime')
      WHERE id = ?
    `).run(JSON.stringify(formDataForDB), caseName, JSON.stringify(mergedAudioMapping), driveLink, driveFileId, req.params.id);

    insertVersion(Number(req.params.id), version_name, commit_message, formDataForDB, driveLink, driveFileId);

    uploadJsonRecord(formDataForDB, caseName).catch(err => {
      console.error('⚠️  JSON 紀錄上傳 Drive 失敗:', err.message);
    });

    res.json({ success: true, driveLink });
  } catch (error) {
    if (req.files) req.files.forEach(f => { try { fs.unlinkSync(f.path); } catch {} });
    console.error('更新個案失敗：', error);
    res.status(500).json({ error: error.message || '更新失敗' });
  }
});

// GET /api/admin/cases/:id/versions
router.get('/cases/:id/versions', authMiddleware, (req, res) => {
  const versions = db.prepare(
    'SELECT id, version_name, commit_message, drive_link, created_at FROM case_versions WHERE case_id = ? ORDER BY created_at DESC'
  ).all(req.params.id);
  res.json({ success: true, versions });
});

// DELETE /api/admin/cases/:id
router.delete('/cases/:id', authMiddleware, (req, res) => {
  const info = db.prepare('DELETE FROM cases WHERE id = ?').run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: '找不到此個案' });
  res.json({ success: true });
});

module.exports = router;
