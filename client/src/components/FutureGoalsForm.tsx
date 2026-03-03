import React from 'react';
import { Input, Button, Alert } from 'antd';
import VoiceInput from './VoiceInput';
import './FutureGoalsForm.css';

const { TextArea } = Input;

interface GoalItem {
  id: number;
  theme: string;
  goal: string;
  implementation: string;
}

interface FutureGoalsFormProps {
  data: any;
  onChange: (key: string, value: any) => void;
  onAudioSave?: (audioBlob: Blob, fieldName: string) => void; // 新增
}

const FutureGoalsForm: React.FC<FutureGoalsFormProps> = ({ data, onChange, onAudioSave }) => {
  const goals: GoalItem[] = data.goals || [{ id: 1, theme: '', goal: '', implementation: '' }];

  const handleAddGoal = () => {
    const maxId = goals.length > 0 ? Math.max(...goals.map(g => g.id)) : 0;
    const newGoal: GoalItem = {
      id: maxId + 1,
      theme: '',
      goal: '',
      implementation: ''
    };
    onChange('goals', [...goals, newGoal]);
  };

  const handleRemoveGoal = (id: number) => {
    if (goals.length <= 1) {
      alert('至少需要保留一個目標項目');
      return;
    }
    const updatedGoals = goals.filter(goal => goal.id !== id);
    onChange('goals', updatedGoals);
  };

  const handleFieldChange = (id: number, field: keyof GoalItem, value: string) => {
    const updatedGoals = goals.map(goal =>
      goal.id === id ? { ...goal, [field]: value } : goal
    );
    onChange('goals', updatedGoals);
  };

  return (
    <div className="future-goals-form">
      <h2 style={{ fontSize: '24px', marginBottom: '24px', color: '#333' }}>
        四、我想要改變的事（未來）
      </h2>

      <Alert 
        message="目標規劃說明" 
        description="請列出您想要改善的生活面向，並設定具體可達成的目標與實施方式。可以添加多個目標項目。您可以打字或使用語音輸入。"
        type="info" 
        showIcon 
        style={{ marginBottom: '24px' }}
      />

      <div className="goals-container">
        {goals.map((goal, index) => (
          <div key={goal.id} className="goal-card">
            <div className="goal-header">
              <h3>目標 {index + 1}</h3>
              {goals.length > 1 && (
                <Button 
                  danger
                  onClick={() => handleRemoveGoal(goal.id)}
                >
                  刪除此項目
                </Button>
              )}
            </div>

            {/* 主題 */}
            <FormField 
              label="主題" 
              hint="著重能改善的關鍵生活面向"
            >
              <TextArea
                rows={2}
                placeholder="例如：能夠使生活處在無障礙的環境、提升生活品質和便利性"
                value={goal.theme}
                onChange={(e) => handleFieldChange(goal.id, 'theme', e.target.value)}
                style={{ fontSize: '16px' }}
              />
              <VoiceInput 
                currentText={goal.theme}
                onTranscriptChange={(text) => handleFieldChange(goal.id, 'theme', text)}
                fieldName={`goal_${index}_theme`}
                onAudioSave={onAudioSave}  // 新增這行
              />
            </FormField>

            {/* 目標 */}
            <FormField 
              label="目標" 
              hint="具體、可達成的目標，可分短期、中期、長期目標"
            >
              <TextArea
                rows={5}
                placeholder={'請列出具體可達成的目標，例如：\n1. 每周的掛號、專業書信可以即時回應。\n2. 生病、跌倒、緊急事故可對外求援。\n3. 可以幫助更多人，到監獄做公益演講。'}
                value={goal.goal}
                onChange={(e) => handleFieldChange(goal.id, 'goal', e.target.value)}
                style={{ fontSize: '16px' }}
              />
              <VoiceInput 
                currentText={goal.goal}
                onTranscriptChange={(text) => handleFieldChange(goal.id, 'goal', text)}
                fieldName={`goal_${index}_goal`}
                onAudioSave={onAudioSave}  // 新增這行
              />
            </FormField>

            {/* 實施方式 */}
            <FormField 
              label="實施方式" 
              hint="分析現有正式/非正式資源、執行內容、執行期間規劃、執行時需要注意的事情"
            >
              <TextArea
                rows={4}
                placeholder="請說明如何實施這些目標，包括可運用的資源、執行計畫等"
                value={goal.implementation}
                onChange={(e) => handleFieldChange(goal.id, 'implementation', e.target.value)}
                style={{ fontSize: '16px' }}
              />
              <VoiceInput 
                currentText={goal.implementation}
                onTranscriptChange={(text) => handleFieldChange(goal.id, 'implementation', text)}
                fieldName={`goal_${index}_implementation`}
                onAudioSave={onAudioSave}  // 新增這行
              />
            </FormField>
          </div>
        ))}
      </div>

      <Button
        type="primary"
        size="large"
        onClick={handleAddGoal}
        className="add-goal-btn"
      >
        + 新增目標項目
      </Button>

      <div style={{ 
        background: '#e8f5e9', 
        padding: '16px', 
        borderRadius: '8px',
        marginTop: '32px'
      }}>
        <p style={{ fontSize: '16px', margin: 0, color: '#2e7d32' }}>
          小提示：您可以添加多個目標，每個目標都可以使用語音輸入或打字填寫。
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
    <div style={{ marginBottom: '20px' }}>
      <label style={{ 
        display: 'block', 
        fontSize: '16px', 
        fontWeight: 'bold',
        marginBottom: '8px',
        color: '#2d3748'
      }}>
        {label} {required && <span style={{ color: 'red' }}>*</span>}
      </label>
      {hint && (
        <div style={{ 
          fontSize: '13px', 
          color: '#718096',
          marginBottom: '8px',
          fontStyle: 'italic'
        }}>
          {hint}
        </div>
      )}
      {children}
    </div>
  );
};

export default FutureGoalsForm;