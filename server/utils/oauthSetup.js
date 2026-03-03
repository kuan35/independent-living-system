const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const open = require('open');
const readline = require('readline');

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];
const TOKEN_PATH = path.join(__dirname, '../google-token.json');
const CREDENTIALS_PATH = path.join(__dirname, '../oauth-credentials.json');

async function authorize() {
  try {
    // 檢查是否已有 token
    if (fs.existsSync(TOKEN_PATH)) {
      const token = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf-8'));
      const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf-8'));
      const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
      const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
      oAuth2Client.setCredentials(token);
      return oAuth2Client;
    }

    // 需要重新授權
    return await getNewToken();
  } catch (error) {
    console.error('授權失敗:', error);
    throw error;
  }
}

async function getNewToken() {
  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf-8'));
  const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });

  console.log('\n========================================');
  console.log('🔐 需要授權存取 Google Drive');
  console.log('========================================');
  console.log('請在瀏覽器中授權應用程式...');
  console.log('授權網址:', authUrl);
  console.log('\n正在開啟瀏覽器...');
  
  await open(authUrl);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve, reject) => {
    rl.question('\n請輸入授權頁面提供的授權碼: ', async (code) => {
      rl.close();
      try {
        const { tokens } = await oAuth2Client.getToken(code);
        oAuth2Client.setCredentials(tokens);
        
        // 儲存 token
        fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
        console.log('✓ Token 已儲存至:', TOKEN_PATH);
        console.log('========================================\n');
        
        resolve(oAuth2Client);
      } catch (error) {
        console.error('取得 token 失敗:', error);
        reject(error);
      }
    });
  });
}

module.exports = { authorize };