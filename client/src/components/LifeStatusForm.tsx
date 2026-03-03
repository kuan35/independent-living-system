import React from 'react';
import { Input, Alert } from 'antd';
import VoiceInput from './VoiceInput';
import './LifeStatusForm.css';

const { TextArea } = Input;

interface LifeStatusFormProps {
  data: any;
  onChange: (key: string, value: any) => void;
  onAudioSave?: (audioBlob: Blob, fieldName: string) => void; // 新增
}

const LifeStatusForm: React.FC<LifeStatusFormProps> = ({ data, onChange, onAudioSave }) => {
  return (
    <div>
      <h2 style={{ fontSize: '24px', marginBottom: '24px', color: '#333' }}>
        三、關於我的生活（以前及現在）
      </h2>

      <Alert 
        message="提示" 
        description="以下問題可以詳細描述您的生活經歷，您可以直接打字，或使用語音輸入功能用說的方式填寫。"
        type="info" 
        showIcon 
        style={{ marginBottom: '24px' }}
      />

      {/* 問題一：造成身心障礙原因 */}
      <FormField 
        label="一、造成身心障礙原因" 
        hint="例如：何時造成、演變過程等"
      >
        <TextArea 
          rows={6}
          placeholder="請描述造成身心障礙的原因、時間、經過等...&#10;&#10;例如：民國85年遭受重傷害，因為雙眼全盲無法指認兇手無法破案。"
          value={data.disabilityCause || ''}
          onChange={(e: any) => onChange('disabilityCause', e.target.value)}
          style={{ fontSize: '16px' }}
        />
        <VoiceInput 
          currentText={data.disabilityCause || ''}
          onTranscriptChange={(text) => onChange('disabilityCause', text)}
          fieldName="disabilityCause"
          onAudioSave={onAudioSave}  // 新增這行
        />
        <CharCount text={data.disabilityCause || ''} />
      </FormField>

      {/* 問題二：今昔生活狀況 */}
      <FormField 
        label="二、今昔生活狀況" 
        hint="例如：自我身理或心理變化、與家人/照顧者關係、生活起居等"
      >
        <TextArea 
          rows={6}
          placeholder="請描述您的生活狀況變化...&#10;&#10;例如：獨居，只有和妹妹保持往來，但妹妹住在桃園，過來不方便，每個月大約1到2次，大多時間都是靠自己生活。平時日常生活及餐食大部分我都可以自理，但像是日常生活用品因為我全盲無行動能力，還有我家附近的環境屬於山坡地型凹凸不平，就會需要有人偕同去買。"
          value={data.lifeStatus || ''}
          onChange={(e: any) => onChange('lifeStatus', e.target.value)}
          style={{ fontSize: '16px' }}
        />
        <VoiceInput 
          currentText={data.lifeStatus || ''}
          onTranscriptChange={(text) => onChange('lifeStatus', text)}
          fieldName="lifeStatus"
          onAudioSave={onAudioSave}  // 新增這行
        />
        <CharCount text={data.lifeStatus || ''} />
      </FormField>

      {/* 問題三：今昔就業狀況 */}
      <FormField 
        label="三、今昔就業狀況" 
        hint="例如：曾經就業與否、未能就業原因、就業情形等"
      >
        <TextArea 
          rows={6}
          placeholder="請描述您的就業經歷與現況...&#10;&#10;例如：現在做預約保健按摩及復健按摩。偶爾去演講和去大學兼課，也有在大學生命研究所兼課，我有空大講師的資格。我在出版社有出版書籍，並且有5、6項醫療器材專利。"
          value={data.employmentStatus || ''}
          onChange={(e: any) => onChange('employmentStatus', e.target.value)}
          style={{ fontSize: '16px' }}
        />
        <VoiceInput 
          currentText={data.employmentStatus || ''}
          onTranscriptChange={(text) => onChange('employmentStatus', text)}
          fieldName="employmentStatus"
          onAudioSave={onAudioSave}  // 新增這行
        />
        <CharCount text={data.employmentStatus || ''} />
      </FormField>

      {/* 問題四：使用相關服務情形 */}
      <FormField 
        label="四、使用相關服務情形" 
        hint="例如：使用輔具、居服等服務的情況"
      >
        <TextArea 
          rows={6}
          placeholder="請描述您目前使用的各種服務...&#10;&#10;例如：1. 居家照顧服務：每周一、四的17點到18點服務居家環境清潔、倒垃圾、拿信件、備餐、去德行東路菜市場、全聯等。2. 視障者家長協會導盲志工(申請過一次)。"
          value={data.serviceUsage || ''}
          onChange={(e: any) => onChange('serviceUsage', e.target.value)}
          style={{ fontSize: '16px' }}
        />
        <VoiceInput 
          currentText={data.serviceUsage || ''}
          onTranscriptChange={(text) => onChange('serviceUsage', text)}
          fieldName="serviceUsage" 
          onAudioSave={onAudioSave}  // 新增這行
        />
        <CharCount text={data.serviceUsage || ''} />
      </FormField>

      {/* 問題五：尚須使用個人助理原因 */}
      <FormField 
        label="五、尚須使用個人助理原因" 
        hint="目前資源不足之處，承上點說明"
      >
        <TextArea 
          rows={8}
          placeholder="請說明為什麼需要個人助理服務，目前哪些需求無法被滿足...&#10;&#10;例如：日常生活瑣事無行動能力，因全盲不方便養導盲犬，且住在山坡地，沒人引導的話舉步維艱，因此需要有人協助：&#10;1. 整理客戶資料&#10;2. 報讀書信及專業書籍&#10;3. 到天母圖書館、郵局、銀行&#10;4. 愛心卡到期要到捷運站展延、儲值&#10;5. 採購日常生活物品..."
          value={data.assistantNeed || ''}
          onChange={(e: any) => onChange('assistantNeed', e.target.value)}
          style={{ fontSize: '16px' }}
        />
        <VoiceInput 
          currentText={data.assistantNeed || ''}
          onTranscriptChange={(text) => onChange('assistantNeed', text)}
          fieldName="assistantNeed"
          onAudioSave={onAudioSave}  // 新增這行
        />
        <CharCount text={data.assistantNeed || ''} />
      </FormField>

      <div style={{ 
        background: '#e8f5e9', 
        padding: '16px', 
        borderRadius: '8px',
        marginTop: '32px'
      }}>
        <p style={{ fontSize: '16px', margin: 0, color: '#2e7d32' }}>
          小提示：您可以使用上方的語音輸入功能，用說的方式更輕鬆地填寫這些問題。
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

export default LifeStatusForm;