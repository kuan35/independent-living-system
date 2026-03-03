import React, { useState } from 'react';
import { Card, Button, Progress, message } from 'antd';
import { RightOutlined, LeftOutlined, CheckCircleOutlined } from '@ant-design/icons';
import BasicInfoForm from '../components/BasicInfoForm';
import WelfareServiceForm from '../components/WelfareServiceForm';
import LifeStatusForm from '../components/LifeStatusForm';
import FutureGoalsForm from '../components/FutureGoalsForm';
import AssistantPlanForm from '../components/AssistantPlanForm';
import './FormWizard.css';

interface FormData {
  [key: string]: any;
}

interface AudioFile {
  blob: Blob;
  fieldName: string;
  displayName: string;
}

const FormWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({});
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([]);

  const steps = [
    { title: '基本資料', key: 'basic' },
    { title: '福利服務', key: 'welfare' },
    { title: '生活狀況', key: 'life' },
    { title: '改變目標', key: 'goals' },
    { title: '助理規劃', key: 'assistant' }
  ];

  // 欄位名稱對應表
  const fieldNameMapping: { [key: string]: string } = {
    // 第三步：生活狀況
    'disabilityCause': '造成身心障礙原因',
    'lifeStatus': '今昔生活狀況',
    'employmentStatus': '今昔就業狀況',
    'serviceUsage': '使用相關服務情形',
    'assistantNeed': '尚須使用個人助理原因',
    
    // 第四步：改變目標
    'goal_0_theme': '目標1-主題',
    'goal_0_goal': '目標1-目標內容',
    'goal_0_implementation': '目標1-實施方式',
    'goal_1_theme': '目標2-主題',
    'goal_1_goal': '目標2-目標內容',
    'goal_1_implementation': '目標2-實施方式',
    'goal_2_theme': '目標3-主題',
    'goal_2_goal': '目標3-目標內容',
    'goal_2_implementation': '目標3-實施方式',
    
    // 第五步：助理規劃
    'personalAssistantService': '個助服務',
    'peerSupportService': '同儕支持員協助內容'
  };

  const validateStep1 = () => {
    const requiredFields = [
      { key: 'name', label: '姓名' },
      { key: 'idNumber', label: '身分證字號' },
      { key: 'birthday', label: '出生年月日' },
      { key: 'caseSource', label: '個案來源' },
      { key: 'address', label: '居住地址' },
      { key: 'identityType', label: '身份別' },
      { key: 'maritalStatus', label: '婚姻狀況' },
      { key: 'livingArrangement', label: '居住情形' }
    ];

    for (const field of requiredFields) {
      if (!formData[field.key]) {
        message.warning(`請填寫「${field.label}」`);
        return false;
      }
    }
    return true;
  };

  const validateStep5 = () => {
    const requiredFields = [
      { key: 'formDate', label: '填表日期' },
      { key: 'applicant', label: '申請人' }
    ];

    for (const field of requiredFields) {
      if (!formData[field.key]) {
        message.warning(`請填寫「${field.label}」`);
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep === 0) {
      if (!validateStep1()) return;
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep5()) {
      return;
    }

    try {
      console.log('========== 準備送出表單 ==========');
      console.log('表單資料:', formData);
      console.log('音檔數量:', audioFiles.length);
      
      const loadingMessage = message.loading('正在送出表單...', 0);
      
      const submitData = new FormData();
      
      // 建立音檔對應表
      const audioFileMapping: { [key: string]: string } = {};
      audioFiles.forEach((audioFile) => {
        audioFileMapping[audioFile.fieldName] = audioFile.displayName;
      });
      
      // 將表單資料和音檔對應表一起送出
      submitData.append('formData', JSON.stringify(formData));
      submitData.append('audioFileMapping', JSON.stringify(audioFileMapping));
      
      // 使用英文欄位名稱作為檔名
      audioFiles.forEach((audioFile, index) => {
        const fileName = `${audioFile.fieldName}.webm`;
        console.log(`加入音檔 ${index + 1}:`, fileName, '(', audioFile.displayName, ')', audioFile.blob.size, 'bytes');
        submitData.append('audioFiles', audioFile.blob, fileName);
      });
      
      console.log('音檔對應表:', audioFileMapping);
      console.log('開始發送請求到後端...');
      
      const response = await fetch('http://localhost:3001/api/submit-form', {
        method: 'POST',
        body: submitData
      });

      console.log('後端回應狀態:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('後端回應內容:', result);
      
      loadingMessage();

      if (result.success) {
        message.success({
          content: `表單已成功送出！共上傳 ${audioFiles.length} 個音檔`,
          duration: 5
        });
        console.log('✓ 送出成功！');
        console.log('✓ 檔案名稱:', result.fileName);
        console.log('✓ 收到的資料:', result.dataReceived);
        
        // 顯示音檔列表
        console.log('\n音檔列表:');
        audioFiles.forEach((audioFile, index) => {
          console.log(`  ${index + 1}. ${audioFile.fieldName}.webm (${audioFile.displayName})`);
        });
      } else {
        message.error('送出失敗：' + (result.error || '未知錯誤'));
        console.error('送出失敗:', result.error);
      }
    } catch (error) {
      message.error('網路錯誤，請檢查後端是否正在運作');
      console.error('送出錯誤：', error);
    }
  };

  const updateFormData = (
    keyOrPatch: string | Record<string, any>,
    value?: any
  ) => {
    if (typeof keyOrPatch === 'object') {
      setFormData(prev => ({
        ...prev,
        ...keyOrPatch
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      [keyOrPatch]: value
    }));
  };

  const handleAudioSave = (audioBlob: Blob, fieldName: string) => {
    // 獲取對應的中文名稱
    const displayName = fieldNameMapping[fieldName] || fieldName;
    
    console.log('收到音檔:', fieldName, '->', displayName, audioBlob.size, 'bytes');
    
    setAudioFiles(prev => {
      const existingIndex = prev.findIndex(item => item.fieldName === fieldName);
      if (existingIndex !== -1) {
        const newAudioFiles = [...prev];
        newAudioFiles[existingIndex] = { blob: audioBlob, fieldName, displayName };
        console.log('替換現有音檔:', displayName);
        return newAudioFiles;
      }
      console.log('新增音檔:', displayName);
      return [...prev, { blob: audioBlob, fieldName, displayName }];
    });
    
    message.success(`音檔「${displayName}」已保存`);
  };

  const getFilledFieldsCount = () => {
    return Object.keys(formData).filter(key => {
      const value = formData[key];
      if (Array.isArray(value)) return value.length > 0;
      return value !== undefined && value !== null && value !== '';
    }).length;
  };

  return (
    <div style={{ 
      maxWidth: '900px', 
      margin: '0 auto', 
      padding: '40px 20px',
      background: 'linear-gradient(to bottom, #e3f2fd, #ffffff)',
      minHeight: '100vh'
    }}>
      <Card style={{ borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <h1 style={{ 
          textAlign: 'center', 
          fontSize: '32px', 
          color: '#1976d2',
          marginBottom: '30px'
        }}>
          自立生活支持計畫
        </h1>

        <div style={{ marginBottom: '40px' }}>
          <Progress 
            percent={Math.round((currentStep / (steps.length - 1)) * 100)} 
            strokeColor="#1976d2"
            style={{ fontSize: '18px' }}
          />
          
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            marginTop: '20px',
            flexWrap: 'wrap'
          }}>
            {steps.map((step, idx) => (
              <div 
                key={idx}
                style={{
                  textAlign: 'center',
                  opacity: idx <= currentStep ? 1 : 0.4,
                  fontSize: '16px',
                  flex: '1',
                  minWidth: '100px'
                }}
              >
                <div style={{ 
                  fontSize: '24px', 
                  marginBottom: '8px',
                  fontWeight: idx === currentStep ? 'bold' : 'normal'
                }}>
                  {idx + 1}
                </div>
                <div style={{ fontWeight: idx === currentStep ? 'bold' : 'normal' }}>
                  {step.title}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ 
          background: '#f5f5f5', 
          padding: '16px', 
          borderRadius: '8px',
          marginBottom: '20px',
          fontSize: '14px'
        }}>
          <strong>目前填寫狀態：</strong>
          <div style={{ marginTop: '8px' }}>
            已填寫 {getFilledFieldsCount()} 個欄位 | 
            目前步驟：{steps[currentStep].title} | 
            已錄製 {audioFiles.length} 個音檔
          </div>
          {audioFiles.length > 0 && (
            <div style={{ marginTop: '12px', fontSize: '12px', color: '#666' }}>
              <strong>已錄製音檔：</strong>
              <div style={{ marginTop: '4px' }}>
                {audioFiles.map((audio, index) => (
                  <div key={index}>• {audio.displayName}</div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={{ minHeight: '400px', padding: '20px' }}>
          {currentStep === 0 && <BasicInfoForm data={formData} onChange={updateFormData} />}
          {currentStep === 1 && <WelfareServiceForm data={formData} onChange={updateFormData} />}
          {currentStep === 2 && <LifeStatusForm data={formData} onChange={updateFormData} onAudioSave={handleAudioSave} />}
          {currentStep === 3 && <FutureGoalsForm data={formData} onChange={updateFormData} onAudioSave={handleAudioSave} />}
          {currentStep === 4 && <AssistantPlanForm data={formData} onChange={updateFormData} onAudioSave={handleAudioSave} />}
        </div>

        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          marginTop: '40px' 
        }}>
          <Button 
            size="large"
            disabled={currentStep === 0}
            onClick={handlePrev}
            style={{ fontSize: '18px', height: '50px', minWidth: '120px' }}
          >
            <LeftOutlined /> 上一步
          </Button>
          
          {currentStep < steps.length - 1 ? (
            <Button 
              type="primary"
              size="large"
              onClick={handleNext}
              style={{ fontSize: '18px', height: '50px', minWidth: '120px' }}
            >
              下一步 <RightOutlined />
            </Button>
          ) : (
            <Button 
              type="primary"
              size="large"
              onClick={handleSubmit}
              style={{ 
                fontSize: '18px', 
                height: '50px', 
                minWidth: '120px',
                background: '#4caf50'
              }}
            >
              <CheckCircleOutlined /> 送出表單
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default FormWizard;