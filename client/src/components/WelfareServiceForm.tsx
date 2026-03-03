// client/src/components/WelfareServiceForm.tsx
import React from 'react';
import { Input, Checkbox, Space } from 'antd';
import './WelfareServiceForm.css';

const { TextArea } = Input;

interface WelfareServiceFormProps {
  data: any;
  onChange: (key: string, value: any) => void;
}

const WelfareServiceForm: React.FC<WelfareServiceFormProps> = ({ data, onChange }) => {
  return (
    <div>
      <h2 style={{ fontSize: '24px', marginBottom: '24px', color: '#333' }}>
        二、福利服務使用情形
      </h2>

      {/* 居家服務 */}
      <div style={{ 
        background: '#f0f8ff', 
        padding: '20px', 
        borderRadius: '8px',
        margin: '32px 0'
      }}>
        <h3 style={{ fontSize: '20px', marginBottom: '16px' }}>居家服務</h3>
        
        <FormField label="居服單位名稱">
          <Input 
            size="large"
            placeholder="請輸入居服單位名稱"
            value={data.homeServiceProvider || ''}
            onChange={(e) => onChange('homeServiceProvider', e.target.value)}
            style={{ fontSize: '18px' }}
          />
        </FormField>

        <FormField label="使用項目">
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ fontSize: '18px', marginBottom: '12px', color: '#555' }}>
              1. 身體照顧（可複選）
            </h4>
            <Checkbox.Group 
              value={data.bodyCareServices || []}
              onChange={(values) => onChange('bodyCareServices', values)}
              style={{ width: '100%' }}
            >
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <Checkbox value="沐浴" style={{ fontSize: '18px', padding: '8px' }}>沐浴</Checkbox>
                <Checkbox value="如廁" style={{ fontSize: '18px', padding: '8px' }}>如廁</Checkbox>
                <Checkbox value="穿換衣服" style={{ fontSize: '18px', padding: '8px' }}>穿換衣服</Checkbox>
                <Checkbox value="口腔清潔" style={{ fontSize: '18px', padding: '8px' }}>口腔清潔</Checkbox>
                <Checkbox value="進食" style={{ fontSize: '18px', padding: '8px' }}>進食</Checkbox>
                <Checkbox value="服藥" style={{ fontSize: '18px', padding: '8px' }}>服藥</Checkbox>
                <Checkbox value="拍背" style={{ fontSize: '18px', padding: '8px' }}>拍背</Checkbox>
                <Checkbox value="翻身" style={{ fontSize: '18px', padding: '8px' }}>翻身</Checkbox>
                <Checkbox value="肢體活動" style={{ fontSize: '18px', padding: '8px' }}>肢體活動</Checkbox>
                <Checkbox value="上、下床" style={{ fontSize: '18px', padding: '8px' }}>上、下床</Checkbox>
                <Checkbox value="陪同散步" style={{ fontSize: '18px', padding: '8px' }}>陪同散步</Checkbox>
                <Checkbox value="運動" style={{ fontSize: '18px', padding: '8px' }}>運動</Checkbox>
                <Checkbox value="協助使用生活輔具" style={{ fontSize: '18px', padding: '8px' }}>協助使用生活輔具</Checkbox>
                <Checkbox value="其他身體照顧" style={{ fontSize: '18px', padding: '8px' }}>
                  其他
                  {data.bodyCareServices?.includes('其他身體照顧') && (
                    <Input 
                      placeholder="請說明"
                      value={data.bodyCareServicesOther || ''}
                      onChange={(e) => onChange('bodyCareServicesOther', e.target.value)}
                      style={{ marginLeft: '12px', width: '300px' }}
                    />
                  )}
                </Checkbox>
              </Space>
            </Checkbox.Group>
          </div>

          <div>
            <h4 style={{ fontSize: '18px', marginBottom: '12px', color: '#555' }}>
              2. 家務服務（可複選）
            </h4>
            <Checkbox.Group 
              value={data.householdServices || []}
              onChange={(values) => onChange('householdServices', values)}
              style={{ width: '100%' }}
            >
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <Checkbox value="洗修衣物" style={{ fontSize: '18px', padding: '8px' }}>洗修衣物</Checkbox>
                <Checkbox value="居家環境清潔" style={{ fontSize: '18px', padding: '8px' }}>居家環境清潔</Checkbox>
                <Checkbox value="家務服務" style={{ fontSize: '18px', padding: '8px' }}>家務服務</Checkbox>
                <Checkbox value="文書服務" style={{ fontSize: '18px', padding: '8px' }}>文書服務</Checkbox>
                <Checkbox value="餐飲服務" style={{ fontSize: '18px', padding: '8px' }}>餐飲服務</Checkbox>
                <Checkbox value="陪同或代購生活必需品" style={{ fontSize: '18px', padding: '8px' }}>陪同或代購生活必需品</Checkbox>
                <Checkbox value="陪同就醫或聯絡醫療機關" style={{ fontSize: '18px', padding: '8px' }}>陪同就醫或聯絡醫療機關（構）</Checkbox>
                <Checkbox value="其他家務服務" style={{ fontSize: '18px', padding: '8px' }}>
                  其他
                  {data.householdServices?.includes('其他家務服務') && (
                    <Input 
                      placeholder="請說明（例：倒垃圾、拿信件）"
                      value={data.householdServicesOther || ''}
                      onChange={(e) => onChange('householdServicesOther', e.target.value)}
                      style={{ marginLeft: '12px', width: '300px' }}
                    />
                  )}
                </Checkbox>
              </Space>
            </Checkbox.Group>
          </div>
        </FormField>

        <FormField label="使用情形">
          <div style={{ marginBottom: '16px' }}>
            <label style={{ 
              display: 'block', 
              fontSize: '16px',
              marginBottom: '8px',
              color: '#666'
            }}>
              1. 頻率及時數
            </label>
            <TextArea 
              rows={3}
              placeholder="例：每周一、四的17點到18點"
              value={data.homeServiceFrequency || ''}
              onChange={(e) => onChange('homeServiceFrequency', e.target.value)}
              style={{ fontSize: '16px' }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ 
              display: 'block', 
              fontSize: '16px',
              marginBottom: '8px',
              color: '#666'
            }}>
              2. 與居服員的互動情形（請描述）
            </label>
            <TextArea 
              rows={3}
              placeholder="請描述與居服員的互動情形..."
              value={data.homeServiceInteraction || ''}
              onChange={(e) => onChange('homeServiceInteraction', e.target.value)}
              style={{ fontSize: '16px' }}
            />
          </div>

          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '16px',
              marginBottom: '8px',
              color: '#666'
            }}>
              3. 居服不足部分（請描述）
            </label>
            <TextArea 
              rows={3}
              placeholder="例：整理資料、購物、就醫、運動、報讀、去銀行居服時數不夠"
              value={data.homeServiceLack || ''}
              onChange={(e) => onChange('homeServiceLack', e.target.value)}
              style={{ fontSize: '16px' }}
            />
          </div>
        </FormField>
      </div>

      {/* 其他福利 */}
      <div style={{ 
        background: '#fff8dc', 
        padding: '20px', 
        borderRadius: '8px',
        margin: '32px 0'
      }}>
        <h3 style={{ fontSize: '20px', marginBottom: '16px' }}>其他福利</h3>
        
        <FormField label="目前使用的其他福利服務（可複選）">
          <Checkbox.Group 
            value={data.otherWelfareServices || []}
            onChange={(values) => onChange('otherWelfareServices', values)}
            style={{ width: '100%' }}
          >
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Checkbox value="身心障礙者租賃房屋租金補助" style={{ fontSize: '18px', padding: '8px' }}>
                身心障礙者租賃房屋租金補助
              </Checkbox>
              <Checkbox value="身心障礙者生活重建及家庭支持服務" style={{ fontSize: '18px', padding: '8px' }}>
                身心障礙者生活重建及家庭支持服務
              </Checkbox>
              <Checkbox value="24小時手語翻譯服務" style={{ fontSize: '18px', padding: '8px' }}>
                24小時手語翻譯服務
              </Checkbox>
              <Checkbox value="身心障礙者輔具服務" style={{ fontSize: '18px', padding: '8px' }}>
                身心障礙者輔具服務
              </Checkbox>
              <Checkbox value="身心障礙者臨時及短期照顧服務" style={{ fontSize: '18px', padding: '8px' }}>
                身心障礙者臨時及短期照顧服務
              </Checkbox>
              <Checkbox value="身心障礙者個案管理及轉銜服務" style={{ fontSize: '18px', padding: '8px' }}>
                身心障礙者個案管理及轉銜服務
              </Checkbox>
              <Checkbox value="視障者服務" style={{ fontSize: '18px', padding: '8px' }}>
                視障者服務
              </Checkbox>
              <Checkbox value="其他福利服務" style={{ fontSize: '18px', padding: '8px' }}>
                其他
                {data.otherWelfareServices?.includes('其他福利服務') && (
                  <Input 
                    placeholder="請說明"
                    value={data.otherWelfareServicesOther || ''}
                    onChange={(e) => onChange('otherWelfareServicesOther', e.target.value)}
                    style={{ marginLeft: '12px', width: '400px' }}
                  />
                )}
              </Checkbox>
            </Space>
          </Checkbox.Group>
        </FormField>
      </div>

      {/* 補充說明 */}
      <FormField label="其他補充說明">
        <TextArea 
          rows={4}
          placeholder="如有其他需要補充的福利服務使用情形，請在此填寫..."
          value={data.welfareNotes || ''}
          onChange={(e) => onChange('welfareNotes', e.target.value)}
          style={{ fontSize: '16px' }}
        />
      </FormField>
    </div>
  );
};

// 表單欄位組件
const FormField: React.FC<{ 
  label: string; 
  required?: boolean; 
  children: React.ReactNode 
}> = ({ label, required, children }) => {
  return (
    <div style={{ marginBottom: '32px' }}>
      <label style={{ 
        display: 'block', 
        fontSize: '18px', 
        fontWeight: 'bold',
        marginBottom: '12px',
        color: '#555'
      }}>
        {label} {required && <span style={{ color: 'red' }}>*</span>}
      </label>
      {children}
    </div>
  );
};

export default WelfareServiceForm;