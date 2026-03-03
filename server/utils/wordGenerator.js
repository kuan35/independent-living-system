const Docxtemplater = require('docxtemplater');
const PizZip = require('pizzip');
const fs = require('fs');
const path = require('path');

// 格式化日期（民國年月日）
function formatDate(dateString) {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    const year = date.getFullYear() - 1911;
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}年${month}月${day}日`;
  } catch (e) {
    return '';
  }
}

// 格式化年份（只有民國年）
function formatYear(dateString) {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    const year = date.getFullYear() - 1911;
    return `${year}`;
  } catch (e) {
    return '';
  }
}

// 勾選框處理
function checkbox(condition) {
  return condition ? '☑' : '□';
}

// 準備模板資料
function prepareTemplateData(formData) {
  return {
    // ==================== 一、基本資料 ====================
    
    // 基本個人資訊
    name: formData.name || '',
    idNumber: formData.idNumber || '',
    birthday: formatDate(formData.birthday),
    
    // 個案來源
    caseSource1: checkbox(formData.caseSource === '民眾自行尋得'),
    caseSource2: checkbox(formData.caseSource === '社會局轉介'),
    caseSource3: checkbox(formData.caseSource === '其他'),
    caseSourceOther: formData.caseSourceOther || '',
    
    openingYear: formatYear(formData.openingDate),
    caseNumber: formData.caseNumber || '',
    
    // 聯絡方式
    homePhone: formData.homePhone || '',
    mobile: formData.mobile || '',
    email: formData.email || '',
    
    // 聯絡人
    contactName: formData.contactName || '',
    contactRelation: formData.contactRelation || '',
    contactInfo: formData.contactInfo || '',
    
    // 地址
    address: formData.address || '',
    registeredAddress: formData.registeredAddress || '',
    
    // 身心障礙證明
    disability1: checkbox(formData.disabilityType === 'type1'),
    disabilityCategory1: formData.disabilityCategory1 || '',
    disabilityLevel1: formData.disabilityLevel1 || '',
    disability2: checkbox(formData.disabilityType === 'type2'),
    disabilityCategory2: formData.disabilityCategory2 || '',
    disabilityLevel2: formData.disabilityLevel2 || '',
    
    // 身份別
    identity1: checkbox(formData.identityType === '低收入戶'),
    identity2: checkbox(formData.identityType === '中低收入戶及非列冊低收入戶領有身心障礙者生活補助者'),
    identity3: checkbox(formData.identityType === '一般戶'),
    identity4: checkbox(formData.identityType === '其他'),
    identityOther: formData.identityTypeOther || '',
    
    // 經濟身分別
    economic1: checkbox(formData.economicStatus === '一般戶'),
    economic2: checkbox(formData.economicStatus === '低收入戶'),
    economic3: checkbox(formData.economicStatus === '中低收入戶及非列冊低收入戶領有身心障礙者生活補助者'),
    
    // 經濟來源
    income1: checkbox(formData.incomeSource?.includes('工作收入')),
    income2: checkbox(formData.incomeSource?.includes('政府救助或津貼')),
    income3: checkbox(formData.incomeSource?.includes('社會或親友救助')),
    income4: checkbox(formData.incomeSource?.includes('子女奉養')),
    income5: checkbox(formData.incomeSource?.includes('父母協助')),
    income6: checkbox(formData.incomeSource?.includes('退休金')),
    income7: checkbox(formData.incomeSourceOther),
    incomeOther: formData.incomeSourceOther || '',
    
    // 工作狀況
    employed1: checkbox(formData.isEmployed === '是'),
    employed2: checkbox(formData.isEmployed === '否'),
    monthlyIncome: formData.monthlyIncome || '',
    workType: formData.workType || '',
    
    // 家庭成員
    family1: checkbox(formData.familyMembers?.includes('母')),
    family2: checkbox(formData.familyMembers?.includes('父')),
    family3: checkbox(formData.familyMembers?.includes('祖母(外)')),
    family4: checkbox(formData.familyMembers?.includes('祖父(外)')),
    family5: checkbox(formData.familyMembers?.includes('手足')),
    family6: checkbox(formData.familyMembers?.includes('配偶')),
    family7: checkbox(formData.familyMembers?.includes('子女')),
    family8: checkbox(formData.familyMembersOther),
    familyOther: formData.familyMembersOther || '',
    
    // 婚姻狀況
    marital1: checkbox(formData.maritalStatus === '已婚'),
    marital2: checkbox(formData.maritalStatus === '未婚'),
    marital3: checkbox(formData.maritalStatus === '離婚'),
    marital4: checkbox(formData.maritalStatus === '鰥寡'),
    marital5: checkbox(formData.maritalStatus === '分居'),
    marital6: checkbox(formData.maritalStatusOther),
    maritalOther: formData.maritalStatusOther || '',
    
    // 居住情形
    living1: checkbox(formData.livingArrangement === '獨居'),
    living2: checkbox(formData.livingArrangement === '與父母同住'),
    living3: checkbox(formData.livingArrangement === '與配偶同住'),
    living4: checkbox(formData.livingArrangement === '與子女同住'),
    living5: checkbox(formData.livingArrangementOther),
    livingOther: formData.livingArrangementOther || '',
    
    // 住所性質
    housing1: checkbox(formData.housingType === '自宅'),
    housing2: checkbox(formData.housingType === '租屋'),
    monthlyRent: formData.monthlyRent || '',
    housing3: checkbox(formData.housingType === '借住'),
    housing4: checkbox(formData.housingTypeOther),
    housingOther: formData.housingTypeOther || '',
    
    // 使用輔具
    device0: checkbox(formData.useAssistiveDevices === '否'),
    device1: checkbox(formData.useAssistiveDevices === '是'),
    deviceA: checkbox(formData.assistiveDevices?.includes('單手柺杖')),
    deviceB: checkbox(formData.assistiveDevices?.includes('助行器')),
    deviceC: checkbox(formData.assistiveDevices?.includes('腋下柺杖')),
    deviceD: checkbox(formData.assistiveDevices?.includes('義肢')),
    deviceE: checkbox(formData.assistiveDevices?.includes('輪椅')),
    deviceF: checkbox(formData.assistiveDevices?.includes('電動輪椅')),
    deviceG: checkbox(formData.assistiveDevices?.includes('氧氣筒/氧氣製造機')),
    deviceH: checkbox(formData.assistiveDevices?.includes('抽痰機')),
    deviceI: checkbox(formData.assistiveDevices?.includes('助聽器')),
    deviceJ: checkbox(formData.assistiveDevices?.includes('便盆椅')),
    deviceK: checkbox(formData.assistiveDevices?.includes('氣墊床')),
    deviceL: checkbox(formData.assistiveDevices?.includes('眼鏡')),
    deviceM: checkbox(formData.assistiveDevicesOther),
    deviceOther: formData.assistiveDevicesOther || '',
    
    // 健康狀況
    illness1: checkbox(formData.majorIllnessCard === '無'),
    illness2: checkbox(formData.majorIllnessCard === '曾經有'),
    
    // 疾病
    disease1: checkbox(formData.diseases?.includes('無')),
    disease2: checkbox(formData.diseases?.includes('中風')),
    disease3: checkbox(formData.diseases?.includes('巴金森氏症')),
    disease4: checkbox(formData.diseases?.includes('高血壓')),
    disease5: checkbox(formData.diseases?.includes('糖尿病')),
    disease6: checkbox(formData.diseases?.includes('心臟病')),
    disease7: checkbox(formData.diseases?.includes('皮膚疾病')),
    disease8: checkbox(formData.diseases?.includes('腎臟、泌尿疾病')),
    disease9: checkbox(formData.diseases?.includes('骨骼/關節')),
    disease10: checkbox(formData.diseases?.includes('眼疾')),
    disease11: checkbox(formData.diseases?.includes('耳疾')),
    cancerType: formData.cancerType || '',
    disease12: checkbox(formData.diseases?.includes('呼吸系統')),
    disease13: checkbox(formData.diseases?.includes('腸胃肝膽')),
    disease14: checkbox(formData.diseases?.includes('精神疾病')),
    disease15: checkbox(formData.diseasesOther),
    diseaseOther: formData.diseasesOther || '',
    
    // 就醫情形
    medical1: checkbox(formData.medicalTreatment?.includes('未治療')),
    medical2: checkbox(formData.medicalTreatment?.includes('就醫治療')),
    medicalFrequency: formData.medicalFrequency || '',
    medical3: checkbox(formData.medicalTreatment?.includes('不定期看診')),
    medical4: checkbox(formData.medicalTreatment?.includes('自己買藥')),
    medical5: checkbox(formData.medicalTreatment?.includes('民俗療法')),
    medical6: checkbox(formData.medicalTreatment?.includes('運動/練氣功')),
    medical7: checkbox(formData.medicalTreatment?.includes('就醫但不按醫囑用藥')),
    medical8: checkbox(formData.medicalTreatmentOther),
    medicalOther: formData.medicalTreatmentOther || '',
    
    // 溝通狀況
    comm1: checkbox(formData.communicationStatus === '可理解他人話語並能充分表達需要、想法'),
    comm2: checkbox(formData.communicationStatus === '可理解他人話語，但需使用圖卡、其他輔具協助溝通'),
    comm3: checkbox(formData.communicationStatus === '可理解他人話語，但需由他人轉譯'),
    comm4: checkbox(formData.communicationStatus === '聽得懂簡單的日常話語，也可用簡易語言表達'),
    comm5: checkbox(formData.communicationStatusOther),
    commOther: formData.communicationStatusOther || '',
    
    // 居服評估
    homeServiceLevel: formData.homeServiceLevel || '',
    
    // ==================== 二、福利服務使用情形 ====================
    
    // 居服單位
    homeServiceProvider: formData.homeServiceProvider || '',
    
    // 身體照顧服務（詳細選項）
    bodyCare1: checkbox(formData.bodyCareServices?.includes('沐浴')),
    bodyCare2: checkbox(formData.bodyCareServices?.includes('如廁')),
    bodyCare3: checkbox(formData.bodyCareServices?.includes('穿換衣服')),
    bodyCare4: checkbox(formData.bodyCareServices?.includes('口腔清潔')),
    bodyCare5: checkbox(formData.bodyCareServices?.includes('進食')),
    bodyCare6: checkbox(formData.bodyCareServices?.includes('服藥')),
    bodyCare7: checkbox(formData.bodyCareServices?.includes('拍背')),
    bodyCare8: checkbox(formData.bodyCareServices?.includes('翻身')),
    bodyCare9: checkbox(formData.bodyCareServices?.includes('肢體活動')),
    bodyCare10: checkbox(formData.bodyCareServices?.includes('上、下床')),
    bodyCare11: checkbox(formData.bodyCareServices?.includes('陪同散步')),
    bodyCare12: checkbox(formData.bodyCareServices?.includes('運動')),
    bodyCare13: checkbox(formData.bodyCareServices?.includes('協助使用生活輔具')),
    bodyCare14: checkbox(formData.bodyCareServicesOther),
    bodyCareOther: formData.bodyCareServicesOther || '',
    
    // 家務服務（詳細選項）
    household1: checkbox(formData.householdServices?.includes('洗修衣物')),
    household2: checkbox(formData.householdServices?.includes('居家環境清潔')),
    household3: checkbox(formData.householdServices?.includes('家務服務')),
    household4: checkbox(formData.householdServices?.includes('文書服務')),
    household5: checkbox(formData.householdServices?.includes('餐飲服務')),
    household6: checkbox(formData.householdServices?.includes('陪同或代購生活必需品')),
    household7: checkbox(formData.householdServices?.includes('陪同就醫或聯絡醫療機關（構）')),
    household8: checkbox(formData.householdServicesOther),
    householdOther: formData.householdServicesOther || '',
    
    // 使用情形
    homeServiceFrequency: formData.homeServiceFrequency || '',
    homeServiceInteraction: formData.homeServiceInteraction || '',
    homeServiceLack: formData.homeServiceLack || '',
    
    // 其他福利服務（詳細選項）
    welfare1: checkbox(formData.otherWelfareServices?.includes('身心障礙者租賃房屋租金補助')),
    welfare2: checkbox(formData.otherWelfareServices?.includes('身心障礙者生活重建及家庭支持服務')),
    welfare3: checkbox(formData.otherWelfareServices?.includes('24小時手語翻譯服務')),
    welfare4: checkbox(formData.otherWelfareServices?.includes('身心障礙者輔具服務')),
    welfare5: checkbox(formData.otherWelfareServices?.includes('身心障礙者臨時及短期照顧服務')),
    welfare6: checkbox(formData.otherWelfareServices?.includes('身心障礙者個案管理及轉銜服務')),
    welfare7: checkbox(formData.otherWelfareServices?.includes('視障者服務')),
    welfare8: checkbox(formData.otherWelfareServicesOther),
    welfareOther: formData.otherWelfareServicesOther || '',
    
    // ==================== 三、關於我的生活 ====================
    
    disabilityCause: formData.disabilityCause || '',
    lifeStatus: formData.lifeStatus || '',
    employmentStatus: formData.employmentStatus || '',
    serviceUsage: formData.serviceUsage || '',
    assistantNeed: formData.assistantNeed || '',
    
    // ==================== 四、我想要改變的事 ====================
    
    goals: (formData.goals || []).map(goal => ({
      theme: goal.theme || '',
      goal: goal.goal || '',
      implementation: goal.implementation || ''
    })),
    
    // ==================== 五、個人助理規劃 ====================
    
    personalAssistantService: formData.personalAssistantService || '',
    peerSupportService: formData.peerSupportService || '',
    
    // 簽名欄
    formDate: formatDate(formData.formDate),
    applicant: formData.applicant || '',
    peerSupporter: formData.peerSupporter || '',
    socialWorker: formData.socialWorker || '',
    supervisor: formData.supervisor || ''
  };
}

// 生成 Word 文件
async function generateWord(formData, audioFileMapping, outputPath) {
  try {
    console.log('開始生成 Word 文件...');
    
    // 讀取模板檔案
    const templatePath = path.join(__dirname, '../templates/空_自立生活支持服務計畫表-112.02修.docx');
    
    if (!fs.existsSync(templatePath)) {
      throw new Error('模板檔案不存在: ' + templatePath);
    }
    
    console.log('讀取模板檔案:', templatePath);
    const content = fs.readFileSync(templatePath, 'binary');
    
    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });
    
    // 準備資料
    console.log('準備模板資料...');
    const templateData = prepareTemplateData(formData);
    
    console.log('填入資料到模板...');
    
    // 填入資料
    doc.render(templateData);
    
    // 生成文件
    console.log('生成文件...');
    const buf = doc.getZip().generate({
      type: 'nodebuffer',
      compression: 'DEFLATE',
    });
    
    // 確保輸出目錄存在
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // 寫入檔案
    fs.writeFileSync(outputPath, buf);
    
    console.log('✓ Word 文件已生成:', outputPath);
    return outputPath;
    
  } catch (error) {
    console.error('生成 Word 文件失敗:', error);
    if (error.properties && error.properties.errors) {
      console.error('錯誤詳情:', JSON.stringify(error.properties.errors, null, 2));
    }
    throw error;
  }
}

module.exports = { generateWord };