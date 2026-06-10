const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const db = new Database(path.join(__dirname, '../database.db'));

function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS cases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      submit_date TEXT,
      form_data TEXT NOT NULL,
      audio_mapping TEXT,
      drive_link TEXT,
      drive_file_id TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS case_versions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      case_id INTEGER NOT NULL,
      version_name TEXT NOT NULL,
      commit_message TEXT,
      form_data TEXT NOT NULL,
      drive_link TEXT,
      drive_file_id TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),
      FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
    );
  `);

  // Migration: 為舊資料庫加上新欄位（若已存在會靜默忽略）
  try { db.exec(`ALTER TABLE cases ADD COLUMN audio_mapping TEXT`); } catch {}

  if (process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD) {
    const existing = db.prepare('SELECT id, password_hash FROM admins WHERE username = ?')
                       .get(process.env.ADMIN_USERNAME);
    if (!existing) {
      const hash = bcrypt.hashSync(process.env.ADMIN_PASSWORD, 10);
      db.prepare('INSERT INTO admins (username, password_hash) VALUES (?, ?)')
        .run(process.env.ADMIN_USERNAME, hash);
      console.log('✓ 管理員帳號已建立：', process.env.ADMIN_USERNAME);
    } else if (!bcrypt.compareSync(process.env.ADMIN_PASSWORD, existing.password_hash)) {
      const hash = bcrypt.hashSync(process.env.ADMIN_PASSWORD, 10);
      db.prepare('UPDATE admins SET password_hash = ? WHERE username = ?')
        .run(hash, process.env.ADMIN_USERNAME);
      console.log('✓ 管理員密碼已更新：', process.env.ADMIN_USERNAME);
    }
  }
}

function getUniqueCaseName(baseName) {
  let name = baseName;
  let counter = 2;
  while (db.prepare('SELECT id FROM cases WHERE name = ?').get(name)) {
    name = `${baseName}_${counter}`;
    counter++;
  }
  return name;
}

function insertVersion(caseId, versionName, commitMessage, formData, driveLink, driveFileId) {
  return db.prepare(`
    INSERT INTO case_versions (case_id, version_name, commit_message, form_data, drive_link, drive_file_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(caseId, versionName, commitMessage || null, JSON.stringify(formData), driveLink || null, driveFileId || null);
}

module.exports = { db, initDatabase, getUniqueCaseName, insertVersion };
