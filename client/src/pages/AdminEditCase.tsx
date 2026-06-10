import React, { useEffect, useState } from 'react';
import { Alert, Spin, message } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import FormWizard from './FormWizard';
import { authHeader, logout } from '../utils/adminAuth';

export default function AdminEditCase() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState<{ [key: string]: any } | null>(null);
  const [caseName, setCaseName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const response = await fetch(`/api/admin/cases/${id}`, { headers: authHeader() });
        if (response.status === 401) {
          message.error('登入已過期，請重新登入');
          logout();
          return;
        }
        const result = await response.json();
        if (result.success) {
          setCaseData(result.case.form_data);
          setCaseName(result.case.name || result.case.form_data?.name || '');
        } else {
          message.error(result.error || '載入個案失敗');
          navigate('/admin/cases');
        }
      } catch {
        message.error('無法連線至伺服器');
        navigate('/admin/cases');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, navigate]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Spin size="large" tip="載入個案資料中..." />
      </div>
    );
  }

  if (!caseData) return null;

  return (
    <div>
      <Alert
        message={`編輯模式 — ${caseName}`}
        type="info"
        showIcon
        style={{ borderRadius: 0, fontSize: 16 }}
      />
      <FormWizard
        initialData={caseData}
        isEditMode={true}
        caseId={Number(id)}
        onEditSuccess={() => navigate('/admin/cases')}
      />
    </div>
  );
}
