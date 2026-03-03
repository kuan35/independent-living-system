import React from 'react';
import { Input, Alert, DatePicker } from 'antd';
import VoiceInput from './VoiceInput';
import dayjs from 'dayjs';

const { TextArea } = Input;

interface AssistantPlanFormProps {
  data: any;
  onChange: (key: string, value: any) => void;
  onAudioSave?: (audioBlob: Blob, fieldName: string) => void; // 新增
}

const AssistantPlanForm: React.FC<AssistantPlanFormProps> = ({ data, onChange, onAudioSave }) => {
  return (
    <div>
      <h2 style={{ fontSize: '24px', marginBottom: '24px', color: '#333' }}>
        五、個人助理/同儕支持員運用規劃
      </h2>

      <Alert 
        message="規劃說明" 
        description="請敘明個人助理/同儕支持員協助項目、頻率及時數。最後填寫申請人資訊，其他欄位為選填。您可以打字或使用語音輸入。"
        type="info" 
        showIcon 
        style={{ marginBottom: '24px' }}
      />

      {/* 一、個助服務 */}
      <FormField 
        label="（一）個助服務" 
        hint="請敘明個人助理協助項目、頻率及時數"
      >
        <TextArea
          rows={8}
          placeholder={'請詳細說明個人助理服務的內容，例如：\n\n1. 使用頻率：\n   (1) 每周5次，每次1到2小時，每月共40小時。協助內容包含：整理客戶資料、報讀書信及專業書籍、到天母圖書館及郵局銀行、愛心卡到期要到捷運展延儲值、採購日常生活物品、不定期2型血糖檢驗(新光醫院)及牙醫治療(陽明醫院)、買麵包、蛋糕(約2個月1次)、運動到戶外爬樓梯或爬古道或健行、到圖書館借書及還書及報讀重點資料、教會聚會。到國家劇院聽歌劇，及電影觀賞。\n\n   (2) 每月30小時。協助內容：六、日若有緊急事件、跌倒受傷、國內旅遊、宜蘭返鄉，每月1次，希望每月有再多30小時。\n\n   (3) 每月申請個人助理總時數共計70小時。'}
          value={data.personalAssistantService || ''}
          onChange={(e) => onChange('personalAssistantService', e.target.value)}
          style={{ fontSize: '16px' }}
        />
        <VoiceInput 
          currentText={data.personalAssistantService || ''}
          onTranscriptChange={(text) => onChange('personalAssistantService', text)}
          fieldName="personalAssistantService"
          onAudioSave={onAudioSave}  // 新增這行
        />
        <CharCount text={data.personalAssistantService || ''} />
      </FormField>

      {/* 二、同儕支持員協助內容 */}
      <FormField 
        label="（二）同儕支持員協助內容" 
        hint="請說明同儕支持員提供的協助"
      >
        <TextArea
          rows={6}
          placeholder={'請說明同儕支持員協助的內容，例如：\n\n約視障的同儕支持員袁佳娣，能夠一個月有幾個小時的諮商，詢問視障者的相關問題，以及不定時電話關心。'}
          value={data.peerSupportService || ''}
          onChange={(e) => onChange('peerSupportService', e.target.value)}
          style={{ fontSize: '16px' }}
        />
        <VoiceInput 
          currentText={data.peerSupportService || ''}
          onTranscriptChange={(text) => onChange('peerSupportService', text)}
          fieldName="peerSupportService"
          onAudioSave={onAudioSave}  // 新增這行
        />
        <CharCount text={data.peerSupportService || ''} />
      </FormField>

      {/* 分隔線 */}
      <div style={{ 
        borderTop: '3px solid #e2e8f0',
        margin: '40px 0 30px 0'
      }} />

      {/* 填表日期 */}
      <FormField 
        label="填表日期" 
        required
      >
        <DatePicker
          value={data.formDate ? dayjs(data.formDate) : null}
          onChange={(date) => onChange('formDate', date ? date.format('YYYY-MM-DD') : null)}
          style={{ width: '100%', fontSize: '16px', height: '45px' }}
          placeholder="請選擇填表日期"
          format="YYYY年MM月DD日"
        />
      </FormField>

      {/* 申請人 */}
      <FormField 
        label="申請人" 
        hint="必填"
        required
      >
        <Input
          size="large"
          placeholder="請輸入申請人姓名"
          value={data.applicant || ''}
          onChange={(e) => onChange('applicant', e.target.value)}
          style={{ fontSize: '16px' }}
        />
      </FormField>

      {/* 同儕支持員 */}
      <FormField 
        label="同儕支持員" 
        hint="選填"
      >
        <Input
          size="large"
          placeholder="請輸入同儕支持員姓名（選填）"
          value={data.peerSupporter || ''}
          onChange={(e) => onChange('peerSupporter', e.target.value)}
          style={{ fontSize: '16px' }}
        />
      </FormField>

      {/* 社工員 */}
      <FormField 
        label="社工員" 
        hint="選填"
      >
        <Input
          size="large"
          placeholder="請輸入社工員姓名（選填）"
          value={data.socialWorker || ''}
          onChange={(e) => onChange('socialWorker', e.target.value)}
          style={{ fontSize: '16px' }}
        />
      </FormField>

      {/* 受託單位主管 */}
      <FormField 
        label="受託單位主管" 
        hint="選填"
      >
        <Input
          size="large"
          placeholder="請輸入受託單位主管姓名（選填）"
          value={data.supervisor || ''}
          onChange={(e) => onChange('supervisor', e.target.value)}
          style={{ fontSize: '16px' }}
        />
      </FormField>

      <div style={{ 
        background: '#fff3cd', 
        padding: '16px', 
        borderRadius: '8px',
        marginTop: '32px',
        border: '1px solid #ffc107'
      }}>
        <p style={{ fontSize: '16px', margin: 0, color: '#856404', fontWeight: 'bold' }}>
          重要提醒：填寫完畢後，請點擊下方「送出表單」按鈕完成提交。
        </p>
      </div>
    </div>
  );
};

// 表單欄位組件
const FormField: React.FC<{ 
  label: string; 
  hint?: string;
  required?: boolean; 
  children: React.ReactNode 
}> = ({ label, hint, required, children }) => {
  return (
    <div style={{ marginBottom: '32px' }}>
      <label style={{ 
        display: 'block', 
        fontSize: '18px', 
        fontWeight: 'bold',
        marginBottom: '8px',
        color: '#555'
      }}>
        {label} {required && <span style={{ color: 'red' }}>*</span>}
      </label>
      {hint && (
        <div style={{ 
          fontSize: '14px', 
          color: '#888',
          marginBottom: '12px'
        }}>
          {hint}
        </div>
      )}
      {children}
    </div>
  );
};

// 字數統計組件
const CharCount: React.FC<{ text: string }> = ({ text }) => {
  const count = text ? text.length : 0;
  return (
    <div style={{ 
      textAlign: 'right', 
      fontSize: '14px', 
      color: '#999',
      marginTop: '8px'
    }}>
      已輸入 {count} 字
    </div>
  );
};

export default AssistantPlanForm;