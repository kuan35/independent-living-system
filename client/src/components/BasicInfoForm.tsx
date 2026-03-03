import React from 'react';
import { Input, Radio, Space, DatePicker, Checkbox, InputNumber, Select } from 'antd';
import './BasicInfoForm.css';

const { TextArea } = Input;

interface BasicInfoFormProps {
  data: any;
  onChange: (key: string, value: any) => void;
}

const BasicInfoForm: React.FC<BasicInfoFormProps> = ({ data, onChange }) => {
  
  // ========== 診斷用：顯示當前資料 ==========
  console.log('BasicInfoForm 收到的 data:', data);
  console.log('useAssistiveDevices 的值:', data.useAssistiveDevices);
  
  // 通用的單選點擊處理函數（可取消選擇）
  const handleRadioClick = (fieldName: string, value: string, currentValue: string) => {
    console.log('handleRadioClick 被調用:', { fieldName, value, currentValue });
    // 如果點擊的是已選中的項目，則取消選擇
    if (currentValue === value) {
      console.log('=> 取消選擇');
      onChange(fieldName, '');
    } else {
      console.log('=> 選擇項目:', value);
      onChange(fieldName, value);
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: '24px', marginBottom: '24px', color: '#333' }}>
        一、基本資料
      </h2>

      {/* 姓名 */}
      <FormField label="姓名" required>
        <Input 
          size="large"
          placeholder="請輸入姓名"
          value={data.name || ''}
          onChange={(e) => onChange('name', e.target.value)}
          style={{ fontSize: '18px' }}
        />
      </FormField>

      {/* 身分證字號 */}
      <FormField label="身分證統一編號" required>
        <Input 
          size="large"
          placeholder="請輸入身分證字號"
          value={data.idNumber || ''}
          onChange={(e) => onChange('idNumber', e.target.value)}
          style={{ fontSize: '18px' }}
        />
      </FormField>

      {/* 出生年月日 */}
      <FormField label="出生年月日" required>
        <DatePicker 
          size="large"
          placeholder="請選擇日期"
          value={data.birthday}
          onChange={(date) => onChange('birthday', date)}
          style={{ width: '100%', fontSize: '18px' }}
        />
      </FormField>

      {/* 個案來源 */}
      <FormField label="個案來源" required>
        <Radio.Group 
          value={data.caseSource || ''}
          onChange={(e) => onChange('caseSource', e.target.value)}
          style={{ width: '100%' }}
        >
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Radio 
              value="民眾自行尋得" 
              style={{ fontSize: '18px', padding: '10px' }}
              onClick={() => handleRadioClick('caseSource', '民眾自行尋得', data.caseSource)}
            >
              民眾自行尋得
            </Radio>
            <Radio 
              value="社會局轉介" 
              style={{ fontSize: '18px', padding: '10px' }}
              onClick={() => handleRadioClick('caseSource', '社會局轉介', data.caseSource)}
            >
              社會局轉介
            </Radio>
            <Radio 
              value="需求評估中心轉介" 
              style={{ fontSize: '18px', padding: '10px' }}
              onClick={() => handleRadioClick('caseSource', '需求評估中心轉介', data.caseSource)}
            >
              需求評估中心轉介
            </Radio>
            <Radio 
              value="其他" 
              style={{ fontSize: '18px', padding: '10px' }}
              onClick={() => handleRadioClick('caseSource', '其他', data.caseSource)}
            >
              其他
              {data.caseSource === '其他' && (
                <Input 
                  placeholder="請說明"
                  value={data.caseSourceOther || ''}
                  onChange={(e) => onChange('caseSourceOther', e.target.value)}
                  style={{ marginLeft: '12px', width: '300px' }}
                />
              )}
            </Radio>
          </Space>
        </Radio.Group>
      </FormField>

      {/* 開案日期 */}
      <FormField label="開案日期">
        <DatePicker 
          size="large"
          placeholder="請選擇開案日期"
          value={data.openingDate}
          onChange={(date) => onChange('openingDate', date)}
          style={{ width: '100%', fontSize: '18px' }}
        />
      </FormField>

      {/* 案號 */}
      <FormField label="案號">
        <Input 
          size="large"
          placeholder="請輸入案號"
          value={data.caseNumber || ''}
          onChange={(e) => onChange('caseNumber', e.target.value)}
          style={{ fontSize: '18px' }}
        />
      </FormField>

      <div style={{ 
        background: '#f0f0f0', 
        padding: '20px', 
        borderRadius: '8px',
        margin: '32px 0'
      }}>
        <h3 style={{ fontSize: '20px', marginBottom: '16px' }}>聯絡方式</h3>
        
        <FormField label="住家電話">
          <Input 
            size="large"
            placeholder="例：02-12345678"
            value={data.homePhone || ''}
            onChange={(e) => onChange('homePhone', e.target.value)}
            style={{ fontSize: '18px' }}
          />
        </FormField>

        <FormField label="手機">
          <Input 
            size="large"
            placeholder="例：0912-345678"
            value={data.mobile || ''}
            onChange={(e) => onChange('mobile', e.target.value)}
            style={{ fontSize: '18px' }}
          />
        </FormField>

        <FormField label="電子信箱">
          <Input 
            size="large"
            placeholder="例：example@email.com"
            value={data.email || ''}
            onChange={(e) => onChange('email', e.target.value)}
            style={{ fontSize: '18px' }}
          />
        </FormField>
      </div>

      {/* 聯絡人 */}
      <div style={{ 
        background: '#e3f2fd', 
        padding: '20px', 
        borderRadius: '8px',
        margin: '32px 0'
      }}>
        <h3 style={{ fontSize: '20px', marginBottom: '16px' }}>聯絡人資訊</h3>
        
        <FormField label="聯絡人姓名">
          <Input 
            size="large"
            placeholder="請輸入聯絡人姓名"
            value={data.contactName || ''}
            onChange={(e) => onChange('contactName', e.target.value)}
            style={{ fontSize: '18px' }}
          />
        </FormField>

        <FormField label="與申請人關係">
          <Select
            size="large"
            placeholder="請選擇關係"
            value={data.contactRelation || undefined}
            onChange={(value) => onChange('contactRelation', value)}
            style={{ width: '100%', fontSize: '18px' }}
            allowClear
            options={[
              { value: '父', label: '父' },
              { value: '母', label: '母' },
              { value: '配偶', label: '配偶' },
              { value: '子女', label: '子女' },
              { value: '兄弟', label: '兄弟' },
              { value: '姊妹', label: '姊妹' },
              { value: '其他親屬', label: '其他親屬' },
              { value: '朋友', label: '朋友' },
            ]}
          />
        </FormField>

        <FormField label="聯絡方式">
          <Input 
            size="large"
            placeholder="請輸入聯絡人的聯絡方式"
            value={data.contactInfo || ''}
            onChange={(e) => onChange('contactInfo', e.target.value)}
            style={{ fontSize: '18px' }}
          />
        </FormField>
      </div>

      {/* 居住地址 */}
      <FormField label="居住地址" required>
        <Input 
          size="large"
          placeholder="請輸入居住地址"
          value={data.address || ''}
          onChange={(e) => onChange('address', e.target.value)}
          style={{ fontSize: '18px' }}
        />
      </FormField>

      {/* 戶籍地址 */}
      <FormField label="戶籍地址">
        <Input 
          size="large"
          placeholder="請輸入戶籍地址（若與居住地址相同可不填）"
          value={data.registeredAddress || ''}
          onChange={(e) => onChange('registeredAddress', e.target.value)}
          style={{ fontSize: '18px' }}
        />
      </FormField>

      {/* 身心障礙證明 */}
      <FormField label="身心障礙證明">
        <Radio.Group 
          value={data.disabilityType || ''}
          onChange={(e) => onChange('disabilityType', e.target.value)}
          style={{ width: '100%' }}
        >
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Radio 
              value="type1" 
              style={{ fontSize: '18px', padding: '10px' }}
              onClick={() => handleRadioClick('disabilityType', 'type1', data.disabilityType)}
            >
              <div>身心障礙證明</div>
              {data.disabilityType === 'type1' && (
                <Space style={{ marginTop: '12px', marginLeft: '28px' }}>
                  <span>第</span>
                  <Input 
                    placeholder="類別"
                    value={data.disabilityCategory1 || ''}
                    onChange={(e) => onChange('disabilityCategory1', e.target.value)}
                    style={{ width: '80px' }}
                  />
                  <span>類（障別）</span>
                  <Input 
                    placeholder="等級"
                    value={data.disabilityLevel1 || ''}
                    onChange={(e) => onChange('disabilityLevel1', e.target.value)}
                    style={{ width: '120px' }}
                  />
                  <span>（等級）</span>
                </Space>
              )}
            </Radio>
            <Radio 
              value="type2" 
              style={{ fontSize: '18px', padding: '10px' }}
              onClick={() => handleRadioClick('disabilityType', 'type2', data.disabilityType)}
            >
              <div>身心障礙證明且核定有自立生活支持服務需求者</div>
              {data.disabilityType === 'type2' && (
                <Space style={{ marginTop: '12px', marginLeft: '28px' }}>
                  <Input 
                    placeholder="類別"
                    value={data.disabilityCategory2 || ''}
                    onChange={(e) => onChange('disabilityCategory2', e.target.value)}
                    style={{ width: '120px' }}
                  />
                  <span>（類別）</span>
                  <Input 
                    placeholder="等級"
                    value={data.disabilityLevel2 || ''}
                    onChange={(e) => onChange('disabilityLevel2', e.target.value)}
                    style={{ width: '120px' }}
                  />
                  <span>等級</span>
                </Space>
              )}
            </Radio>
          </Space>
        </Radio.Group>
      </FormField>

      {/* 身份別 */}
      <FormField label="身份別" required>
        <Radio.Group 
          value={data.identityType || ''}
          onChange={(e) => onChange('identityType', e.target.value)}
        >
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Radio 
              value="低收入戶" 
              style={{ fontSize: '18px', padding: '10px' }}
              onClick={() => handleRadioClick('identityType', '低收入戶', data.identityType)}
            >
              低收入戶
            </Radio>
            <Radio 
              value="中低收入戶及非列冊低收入戶領有身心障礙者生活補助者" 
              style={{ fontSize: '18px', padding: '10px' }}
              onClick={() => handleRadioClick('identityType', '中低收入戶及非列冊低收入戶領有身心障礙者生活補助者', data.identityType)}
            >
              中低收入戶及非列冊低收入戶領有身心障礙者生活補助者
            </Radio>
            <Radio 
              value="一般戶" 
              style={{ fontSize: '18px', padding: '10px' }}
              onClick={() => handleRadioClick('identityType', '一般戶', data.identityType)}
            >
              一般戶
            </Radio>
            <Radio 
              value="其他" 
              style={{ fontSize: '18px', padding: '10px' }}
              onClick={() => handleRadioClick('identityType', '其他', data.identityType)}
            >
              其他
              {data.identityType === '其他' && (
                <Input 
                  placeholder="請說明"
                  value={data.identityTypeOther || ''}
                  onChange={(e) => onChange('identityTypeOther', e.target.value)}
                  style={{ marginLeft: '12px', width: '300px' }}
                />
              )}
            </Radio>
          </Space>
        </Radio.Group>
      </FormField>

      {/* 經濟身分別 */}
      <FormField label="經濟身分別">
        <Radio.Group 
          value={data.economicStatus || ''}
          onChange={(e) => onChange('economicStatus', e.target.value)}
        >
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Radio 
              value="一般戶" 
              style={{ fontSize: '18px', padding: '10px' }}
              onClick={() => handleRadioClick('economicStatus', '一般戶', data.economicStatus)}
            >
              一般戶
            </Radio>
            <Radio 
              value="低收入戶" 
              style={{ fontSize: '18px', padding: '10px' }}
              onClick={() => handleRadioClick('economicStatus', '低收入戶', data.economicStatus)}
            >
              低收入戶
            </Radio>
            <Radio 
              value="中低收入戶及非列冊低收入戶領有身心障礙者生活補助者" 
              style={{ fontSize: '18px', padding: '10px' }}
              onClick={() => handleRadioClick('economicStatus', '中低收入戶及非列冊低收入戶領有身心障礙者生活補助者', data.economicStatus)}
            >
              中低收入戶及非列冊低收入戶領有身心障礙者生活補助者
            </Radio>
          </Space>
        </Radio.Group>
      </FormField>

      {/* 經濟來源 */}
      <FormField label="經濟來源（可複選）">
        <Checkbox.Group 
          value={data.incomeSource || []}
          onChange={(values) => onChange('incomeSource', values)}
          style={{ width: '100%' }}
        >
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Checkbox value="工作收入" style={{ fontSize: '18px', padding: '8px' }}>工作收入</Checkbox>
            <Checkbox value="政府救助或津貼" style={{ fontSize: '18px', padding: '8px' }}>政府救助或津貼</Checkbox>
            <Checkbox value="社會或親友救助" style={{ fontSize: '18px', padding: '8px' }}>社會或親友救助</Checkbox>
            <Checkbox value="子女奉養" style={{ fontSize: '18px', padding: '8px' }}>子女奉養</Checkbox>
            <Checkbox value="父母協助" style={{ fontSize: '18px', padding: '8px' }}>父母協助</Checkbox>
            <Checkbox value="退休金" style={{ fontSize: '18px', padding: '8px' }}>退休金</Checkbox>
            <Checkbox value="其他" style={{ fontSize: '18px', padding: '8px' }}>
              其他
              {data.incomeSource?.includes('其他') && (
                <Input 
                  placeholder="請說明"
                  value={data.incomeSourceOther || ''}
                  onChange={(e) => onChange('incomeSourceOther', e.target.value)}
                  style={{ marginLeft: '12px', width: '300px' }}
                />
              )}
            </Checkbox>
          </Space>
        </Checkbox.Group>
      </FormField>

      {/* 工作狀況 */}
      <div style={{ 
        background: '#fff3e0', 
        padding: '20px', 
        borderRadius: '8px',
        margin: '32px 0'
      }}>
        <h3 style={{ fontSize: '20px', marginBottom: '16px' }}>工作狀況</h3>
        
        <FormField label="是否就業">
          <Radio.Group 
            value={data.isEmployed || ''}
            onChange={(e) => onChange('isEmployed', e.target.value)}
          >
            <Space size="large">
              <Radio 
                value="是" 
                style={{ fontSize: '18px', padding: '10px' }}
                onClick={() => handleRadioClick('isEmployed', '是', data.isEmployed)}
              >
                是
              </Radio>
              <Radio 
                value="否" 
                style={{ fontSize: '18px', padding: '10px' }}
                onClick={() => handleRadioClick('isEmployed', '否', data.isEmployed)}
              >
                否
              </Radio>
            </Space>
          </Radio.Group>
        </FormField>

        <FormField label="月收入">
          <InputNumber 
            size="large"
            placeholder="請輸入月收入（元）"
            value={data.monthlyIncome}
            onChange={(value) => onChange('monthlyIncome', value)}
            style={{ width: '100%', fontSize: '18px' }}
            min={0}
            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          />
        </FormField>

        <FormField label="工作類型">
          <Input 
            size="large"
            placeholder="例：辦公室行政、服務業、自營商等"
            value={data.workType || ''}
            onChange={(e) => onChange('workType', e.target.value)}
            style={{ fontSize: '18px' }}
          />
        </FormField>
      </div>

      {/* 家庭成員 */}
      <FormField label="家庭成員（可複選）">
        <Checkbox.Group 
          value={data.familyMembers || []}
          onChange={(values) => onChange('familyMembers', values)}
          style={{ width: '100%' }}
        >
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Checkbox value="父" style={{ fontSize: '18px', padding: '8px' }}>父</Checkbox>
            <Checkbox value="母" style={{ fontSize: '18px', padding: '8px' }}>母</Checkbox>
            <Checkbox value="祖父（外）" style={{ fontSize: '18px', padding: '8px' }}>祖父（外）</Checkbox>
            <Checkbox value="祖母（外）" style={{ fontSize: '18px', padding: '8px' }}>祖母（外）</Checkbox>
            <Checkbox value="手足" style={{ fontSize: '18px', padding: '8px' }}>手足（兄弟姊妹）</Checkbox>
            <Checkbox value="配偶" style={{ fontSize: '18px', padding: '8px' }}>配偶</Checkbox>
            <Checkbox value="子女" style={{ fontSize: '18px', padding: '8px' }}>子女</Checkbox>
            <Checkbox value="其他" style={{ fontSize: '18px', padding: '8px' }}>
              其他
              {data.familyMembers?.includes('其他') && (
                <Input 
                  placeholder="請說明"
                  value={data.familyMembersOther || ''}
                  onChange={(e) => onChange('familyMembersOther', e.target.value)}
                  style={{ marginLeft: '12px', width: '300px' }}
                />
              )}
            </Checkbox>
          </Space>
        </Checkbox.Group>
      </FormField>

      {/* 婚姻狀況 */}
      <FormField label="婚姻狀況" required>
        <Radio.Group 
          value={data.maritalStatus || ''}
          onChange={(e) => onChange('maritalStatus', e.target.value)}
        >
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Radio 
              value="已婚" 
              style={{ fontSize: '18px', padding: '10px' }}
              onClick={() => handleRadioClick('maritalStatus', '已婚', data.maritalStatus)}
            >
              已婚
            </Radio>
            <Radio 
              value="未婚" 
              style={{ fontSize: '18px', padding: '10px' }}
              onClick={() => handleRadioClick('maritalStatus', '未婚', data.maritalStatus)}
            >
              未婚
            </Radio>
            <Radio 
              value="離婚" 
              style={{ fontSize: '18px', padding: '10px' }}
              onClick={() => handleRadioClick('maritalStatus', '離婚', data.maritalStatus)}
            >
              離婚
            </Radio>
            <Radio 
              value="鰥寡" 
              style={{ fontSize: '18px', padding: '10px' }}
              onClick={() => handleRadioClick('maritalStatus', '鰥寡', data.maritalStatus)}
            >
              鰥寡
            </Radio>
            <Radio 
              value="分居" 
              style={{ fontSize: '18px', padding: '10px' }}
              onClick={() => handleRadioClick('maritalStatus', '分居', data.maritalStatus)}
            >
              分居
            </Radio>
            <Radio 
              value="其他" 
              style={{ fontSize: '18px', padding: '10px' }}
              onClick={() => handleRadioClick('maritalStatus', '其他', data.maritalStatus)}
            >
              其他
              {data.maritalStatus === '其他' && (
                <Input 
                  placeholder="請說明"
                  value={data.maritalStatusOther || ''}
                  onChange={(e) => onChange('maritalStatusOther', e.target.value)}
                  style={{ marginLeft: '12px', width: '300px' }}
                />
              )}
            </Radio>
          </Space>
        </Radio.Group>
      </FormField>

      {/* 居住情形 */}
      <FormField label="居住情形" required>
        <Radio.Group 
          value={data.livingArrangement || ''}
          onChange={(e) => onChange('livingArrangement', e.target.value)}
        >
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Radio 
              value="獨居" 
              style={{ fontSize: '18px', padding: '10px' }}
              onClick={() => handleRadioClick('livingArrangement', '獨居', data.livingArrangement)}
            >
              獨居
            </Radio>
            <Radio 
              value="與父母同住" 
              style={{ fontSize: '18px', padding: '10px' }}
              onClick={() => handleRadioClick('livingArrangement', '與父母同住', data.livingArrangement)}
            >
              與父母同住
            </Radio>
            <Radio 
              value="與配偶同住" 
              style={{ fontSize: '18px', padding: '10px' }}
              onClick={() => handleRadioClick('livingArrangement', '與配偶同住', data.livingArrangement)}
            >
              與配偶同住
            </Radio>
            <Radio 
              value="與子女同住" 
              style={{ fontSize: '18px', padding: '10px' }}
              onClick={() => handleRadioClick('livingArrangement', '與子女同住', data.livingArrangement)}
            >
              與子女同住
            </Radio>
            <Radio 
              value="其他" 
              style={{ fontSize: '18px', padding: '10px' }}
              onClick={() => handleRadioClick('livingArrangement', '其他', data.livingArrangement)}
            >
              其他
              {data.livingArrangement === '其他' && (
                <Input 
                  placeholder="請說明"
                  value={data.livingArrangementOther || ''}
                  onChange={(e) => onChange('livingArrangementOther', e.target.value)}
                  style={{ marginLeft: '12px', width: '300px' }}
                />
              )}
            </Radio>
          </Space>
        </Radio.Group>
      </FormField>

      {/* 住所性質 */}
      <FormField label="住所性質">
        <Radio.Group 
          value={data.housingType || ''}
          onChange={(e) => onChange('housingType', e.target.value)}
        >
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Radio 
              value="自宅" 
              style={{ fontSize: '18px', padding: '10px' }}
              onClick={() => handleRadioClick('housingType', '自宅', data.housingType)}
            >
              自宅
            </Radio>
            <Radio 
              value="租屋" 
              style={{ fontSize: '18px', padding: '10px' }}
              onClick={() => handleRadioClick('housingType', '租屋', data.housingType)}
            >
              租屋
              {data.housingType === '租屋' && (
                <InputNumber 
                  size="large"
                  placeholder="月租金（元）"
                  value={data.monthlyRent}
                  onChange={(value) => onChange('monthlyRent', value)}
                  style={{ marginLeft: '12px', width: '200px' }}
                  min={0}
                />
              )}
            </Radio>
            <Radio 
              value="借住" 
              style={{ fontSize: '18px', padding: '10px' }}
              onClick={() => handleRadioClick('housingType', '借住', data.housingType)}
            >
              借住
            </Radio>
            <Radio 
              value="其他" 
              style={{ fontSize: '18px', padding: '10px' }}
              onClick={() => handleRadioClick('housingType', '其他', data.housingType)}
            >
              其他
              {data.housingType === '其他' && (
                <Input 
                  placeholder="請說明"
                  value={data.housingTypeOther || ''}
                  onChange={(e) => onChange('housingTypeOther', e.target.value)}
                  style={{ marginLeft: '12px', width: '300px' }}
                />
              )}
            </Radio>
          </Space>
        </Radio.Group>
      </FormField>

      {/* ========== 使用輔具 - 測試版本 ========== */}
      <FormField label="使用輔具">
        <div style={{ border: '1px solid #ddd', padding: '16px', borderRadius: '8px' }}>
          {/* 否 - 使用按鈕樣式測試 */}
          <div 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('========== 點擊了「否」==========');
              console.log('當前 useAssistiveDevices 值:', data.useAssistiveDevices);
              if (data.useAssistiveDevices === '否') {
                console.log('=> 取消選擇「否」，設為空字串');
                onChange('useAssistiveDevices', '');
              } else {
                console.log('=> 選擇「否」');
                onChange('useAssistiveDevices', '否');
                onChange('assistiveDevices', []);
              }
            }}
            style={{ 
              fontSize: '18px', 
              padding: '12px',
              marginBottom: '12px',
              cursor: 'pointer',
              border: '2px solid ' + (data.useAssistiveDevices === '否' ? '#1890ff' : '#d9d9d9'),
              borderRadius: '8px',
              backgroundColor: data.useAssistiveDevices === '否' ? '#e6f7ff' : 'white',
              userSelect: 'none'
            }}
          >
            <input 
              type="radio" 
              checked={data.useAssistiveDevices === '否'}
              readOnly
              style={{ marginRight: '8px' }}
            />
            否
          </div>

          {/* 是 - 使用按鈕樣式測試 */}
          <div>
            <div
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('========== 點擊了「是」==========');
                console.log('當前 useAssistiveDevices 值:', data.useAssistiveDevices);
                if (data.useAssistiveDevices === '是') {
                  console.log('=> 取消選擇「是」，設為空字串');
                  onChange('useAssistiveDevices', '');
                } else {
                  console.log('=> 選擇「是」');
                  onChange('useAssistiveDevices', '是');
                }
              }}
              style={{ 
                fontSize: '18px', 
                padding: '12px',
                cursor: 'pointer',
                border: '2px solid ' + (data.useAssistiveDevices === '是' ? '#1890ff' : '#d9d9d9'),
                borderRadius: '8px',
                backgroundColor: data.useAssistiveDevices === '是' ? '#e6f7ff' : 'white',
                userSelect: 'none'
              }}
            >
              <input 
                type="radio" 
                checked={data.useAssistiveDevices === '是'}
                readOnly
                style={{ marginRight: '8px' }}
              />
              是（可複選）
            </div>
            
            {data.useAssistiveDevices === '是' && (
              <div style={{ marginTop: '16px', marginLeft: '28px', padding: '12px', background: '#fafafa', borderRadius: '8px' }}>
                <Checkbox.Group 
                  value={data.assistiveDevices || []}
                  onChange={(values) => onChange('assistiveDevices', values)}
                  style={{ width: '100%' }}
                >
                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <Checkbox value="單手柺杖" style={{ fontSize: '18px', padding: '8px' }}>單手柺杖</Checkbox>
                    <Checkbox value="助行器" style={{ fontSize: '18px', padding: '8px' }}>助行器</Checkbox>
                    <Checkbox value="腋下柺杖" style={{ fontSize: '18px', padding: '8px' }}>腋下柺杖</Checkbox>
                    <Checkbox value="義肢" style={{ fontSize: '18px', padding: '8px' }}>義肢</Checkbox>
                    <Checkbox value="輪椅" style={{ fontSize: '18px', padding: '8px' }}>輪椅</Checkbox>
                    <Checkbox value="電動輪椅" style={{ fontSize: '18px', padding: '8px' }}>電動輪椅</Checkbox>
                    <Checkbox value="氧氣筒/氧氣製造機" style={{ fontSize: '18px', padding: '8px' }}>氧氣筒/氧氣製造機</Checkbox>
                    <Checkbox value="抽痰機" style={{ fontSize: '18px', padding: '8px' }}>抽痰機</Checkbox>
                    <Checkbox value="助聽器" style={{ fontSize: '18px', padding: '8px' }}>助聽器</Checkbox>
                    <Checkbox value="便盆椅" style={{ fontSize: '18px', padding: '8px' }}>便盆椅</Checkbox>
                    <Checkbox value="氣墊床" style={{ fontSize: '18px', padding: '8px' }}>氣墊床</Checkbox>
                    <Checkbox value="眼鏡" style={{ fontSize: '18px', padding: '8px' }}>眼鏡</Checkbox>
                    <Checkbox value="其他" style={{ fontSize: '18px', padding: '8px' }}>
                      其他
                      {data.assistiveDevices?.includes('其他') && (
                        <Input 
                          placeholder="請說明"
                          value={data.assistiveDevicesOther || ''}
                          onChange={(e) => onChange('assistiveDevicesOther', e.target.value)}
                          style={{ marginLeft: '12px', width: '300px' }}
                        />
                      )}
                    </Checkbox>
                  </Space>
                </Checkbox.Group>
              </div>
            )}
          </div>
        </div>
      </FormField>

      {/* 健康狀況 */}
      <div style={{ 
        background: '#ffebee', 
        padding: '20px', 
        borderRadius: '8px',
        margin: '32px 0'
      }}>
        <h3 style={{ fontSize: '20px', marginBottom: '16px' }}>健康狀況</h3>
        
        <FormField label="A. 重大傷病卡">
          <Radio.Group 
            value={data.majorIllnessCard || ''}
            onChange={(e) => onChange('majorIllnessCard', e.target.value)}
          >
            <Space size="large">
              <Radio 
                value="無" 
                style={{ fontSize: '18px', padding: '10px' }}
                onClick={() => handleRadioClick('majorIllnessCard', '無', data.majorIllnessCard)}
              >
                無
              </Radio>
              <Radio 
                value="曾經有" 
                style={{ fontSize: '18px', padding: '10px' }}
                onClick={() => handleRadioClick('majorIllnessCard', '曾經有', data.majorIllnessCard)}
              >
                曾經有
              </Radio>
            </Space>
          </Radio.Group>
        </FormField>

        <FormField label="B. 疾病（可複選）">
          <Checkbox.Group 
            value={data.diseases || []}
            onChange={(values) => onChange('diseases', values)}
            style={{ width: '100%' }}
          >
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Checkbox value="無" style={{ fontSize: '18px', padding: '8px' }}>無</Checkbox>
              <Checkbox value="中風" style={{ fontSize: '18px', padding: '8px' }}>中風</Checkbox>
              <Checkbox value="巴金森氏症" style={{ fontSize: '18px', padding: '8px' }}>巴金森氏症</Checkbox>
              <Checkbox value="高血壓" style={{ fontSize: '18px', padding: '8px' }}>高血壓</Checkbox>
              <Checkbox value="糖尿病" style={{ fontSize: '18px', padding: '8px' }}>糖尿病</Checkbox>
              <Checkbox value="心臟病" style={{ fontSize: '18px', padding: '8px' }}>心臟病</Checkbox>
              <Checkbox value="皮膚疾病" style={{ fontSize: '18px', padding: '8px' }}>皮膚疾病</Checkbox>
              <Checkbox value="腎臟、泌尿疾病" style={{ fontSize: '18px', padding: '8px' }}>腎臟、泌尿疾病</Checkbox>
              <Checkbox value="骨骼/關節" style={{ fontSize: '18px', padding: '8px' }}>骨骼/關節</Checkbox>
              <Checkbox value="眼疾" style={{ fontSize: '18px', padding: '8px' }}>眼疾</Checkbox>
              <Checkbox value="耳疾" style={{ fontSize: '18px', padding: '8px' }}>耳疾</Checkbox>
              <Checkbox value="癌症" style={{ fontSize: '18px', padding: '8px' }}>
                癌症
                {data.diseases?.includes('癌症') && (
                  <Input 
                    placeholder="請填寫癌症種類"
                    value={data.cancerType || ''}
                    onChange={(e) => onChange('cancerType', e.target.value)}
                    style={{ marginLeft: '12px', width: '200px' }}
                  />
                )}
              </Checkbox>
              <Checkbox value="呼吸系統" style={{ fontSize: '18px', padding: '8px' }}>呼吸系統</Checkbox>
              <Checkbox value="腸胃肝膽" style={{ fontSize: '18px', padding: '8px' }}>腸胃肝膽</Checkbox>
              <Checkbox value="精神疾病" style={{ fontSize: '18px', padding: '8px' }}>精神疾病</Checkbox>
              <Checkbox value="其他" style={{ fontSize: '18px', padding: '8px' }}>
                其他
                {data.diseases?.includes('其他') && (
                  <Input 
                    placeholder="請說明"
                    value={data.diseasesOther || ''}
                    onChange={(e) => onChange('diseasesOther', e.target.value)}
                    style={{ marginLeft: '12px', width: '300px' }}
                  />
                )}
              </Checkbox>
            </Space>
          </Checkbox.Group>
        </FormField>

        <FormField label="就醫情形（可複選）">
          <Checkbox.Group 
            value={data.medicalTreatment || []}
            onChange={(values) => onChange('medicalTreatment', values)}
            style={{ width: '100%' }}
          >
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Checkbox value="未治療" style={{ fontSize: '18px', padding: '8px' }}>未治療</Checkbox>
              <Checkbox value="就醫治療" style={{ fontSize: '18px', padding: '8px' }}>
                就醫治療，頻率
                {data.medicalTreatment?.includes('就醫治療') && (
                  <>
                    <InputNumber 
                      placeholder="次數"
                      value={data.medicalFrequency}
                      onChange={(value) => onChange('medicalFrequency', value)}
                      style={{ marginLeft: '12px', width: '80px' }}
                      min={0}
                    />
                    <span style={{ marginLeft: '8px' }}>次/月</span>
                  </>
                )}
              </Checkbox>
              <Checkbox value="不定期看診" style={{ fontSize: '18px', padding: '8px' }}>不定期看診</Checkbox>
              <Checkbox value="自己買藥" style={{ fontSize: '18px', padding: '8px' }}>自己買藥</Checkbox>
              <Checkbox value="民俗療法" style={{ fontSize: '18px', padding: '8px' }}>民俗療法</Checkbox>
              <Checkbox value="運動/練氣功" style={{ fontSize: '18px', padding: '8px' }}>運動/練氣功</Checkbox>
              <Checkbox value="就醫但不按醫囑用藥" style={{ fontSize: '18px', padding: '8px' }}>就醫但不按醫囑用藥</Checkbox>
              <Checkbox value="其他" style={{ fontSize: '18px', padding: '8px' }}>
                其他
                {data.medicalTreatment?.includes('其他') && (
                  <Input 
                    placeholder="請說明"
                    value={data.medicalTreatmentOther || ''}
                    onChange={(e) => onChange('medicalTreatmentOther', e.target.value)}
                    style={{ marginLeft: '12px', width: '300px' }}
                  />
                )}
              </Checkbox>
            </Space>
          </Checkbox.Group>
        </FormField>
      </div>

      {/* 溝通狀況 */}
      <FormField label="溝通狀況">
        <Radio.Group 
          value={data.communicationStatus || ''}
          onChange={(e) => onChange('communicationStatus', e.target.value)}
        >
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Radio 
              value="可理解他人話語並能充分表達需要、想法" 
              style={{ fontSize: '18px', padding: '10px' }}
              onClick={() => handleRadioClick('communicationStatus', '可理解他人話語並能充分表達需要、想法', data.communicationStatus)}
            >
              可理解他人話語並能充分表達需要、想法
            </Radio>
            <Radio 
              value="可理解他人話語，但需使用圖卡、其他輔具協助溝通" 
              style={{ fontSize: '18px', padding: '10px' }}
              onClick={() => handleRadioClick('communicationStatus', '可理解他人話語，但需使用圖卡、其他輔具協助溝通', data.communicationStatus)}
            >
              可理解他人話語，但需使用圖卡、其他輔具協助溝通
            </Radio>
            <Radio 
              value="可理解他人話語，但需由他人轉譯" 
              style={{ fontSize: '18px', padding: '10px' }}
              onClick={() => handleRadioClick('communicationStatus', '可理解他人話語，但需由他人轉譯', data.communicationStatus)}
            >
              可理解他人話語，但需由他人轉譯
            </Radio>
            <Radio 
              value="聽得懂簡單的日常話語，也可用簡易語言表達" 
              style={{ fontSize: '18px', padding: '10px' }}
              onClick={() => handleRadioClick('communicationStatus', '聽得懂簡單的日常話語，也可用簡易語言表達', data.communicationStatus)}
            >
              聽得懂簡單的日常話語，也可用簡易語言表達
            </Radio>
            <Radio 
              value="其他" 
              style={{ fontSize: '18px', padding: '10px' }}
              onClick={() => handleRadioClick('communicationStatus', '其他', data.communicationStatus)}
            >
              其他
              {data.communicationStatus === '其他' && (
                <Input 
                  placeholder="請說明"
                  value={data.communicationStatusOther || ''}
                  onChange={(e) => onChange('communicationStatusOther', e.target.value)}
                  style={{ marginLeft: '12px', width: '300px' }}
                />
              )}
            </Radio>
          </Space>
        </Radio.Group>
      </FormField>

      {/* 居服評估結果 */}
      <FormField label="居服評估結果">
        <Space>
          <span style={{ fontSize: '18px' }}>第</span>
          <Input 
            size="large"
            placeholder="級數"
            value={data.homeServiceLevel || ''}
            onChange={(e) => onChange('homeServiceLevel', e.target.value)}
            style={{ width: '100px', fontSize: '18px' }}
          />
          <span style={{ fontSize: '18px' }}>級</span>
        </Space>
      </FormField>

      {/* 備註 */}
      <FormField label="其他補充說明">
        <TextArea 
          rows={4}
          placeholder="如有其他需要補充的資訊，請在此填寫..."
          value={data.notes || ''}
          onChange={(e) => onChange('notes', e.target.value)}
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

export default BasicInfoForm;