import React, { useEffect, useState, useCallback } from 'react';
import { Table, Button, Input, message, Space, Typography, Popconfirm, Modal } from 'antd';
import { LogoutOutlined, EditOutlined, FileWordOutlined, SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { authHeader, logout } from '../utils/adminAuth';

const { Title } = Typography;

interface CaseRow {
  id: number;
  name: string;
  submit_date: string | null;
  drive_link: string | null;
  created_at: string;
}

interface VersionRow {
  id: number;
  version_name: string;
  commit_message: string | null;
  drive_link: string | null;
  created_at: string;
}

export default function AdminCases() {
  const navigate = useNavigate();
  const [cases, setCases] = useState<CaseRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [versionModalCaseId, setVersionModalCaseId] = useState<number | null>(null);
  const [versions, setVersions] = useState<VersionRow[]>([]);
  const [versionsLoading, setVersionsLoading] = useState(false);

  const fetchCases = useCallback(async (keyword = '') => {
    setLoading(true);
    try {
      const url = keyword
        ? `/api/admin/cases?search=${encodeURIComponent(keyword)}`
        : '/api/admin/cases';
      const response = await fetch(url, { headers: authHeader() });
      if (response.status === 401) {
        message.error('登入已過期，請重新登入');
        logout();
        return;
      }
      const result = await response.json();
      if (result.success) {
        setCases(result.cases);
      } else {
        message.error(result.error || '載入失敗');
      }
    } catch {
      message.error('無法連線至伺服器');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  // debounce search
  useEffect(() => {
    const timer = setTimeout(() => fetchCases(search), 500);
    return () => clearTimeout(timer);
  }, [search, fetchCases]);

  const openVersionModal = async (caseId: number) => {
    setVersionModalCaseId(caseId);
    setVersionsLoading(true);
    setVersions([]);
    try {
      const response = await fetch(`/api/admin/cases/${caseId}/versions`, { headers: authHeader() });
      const result = await response.json();
      if (result.success) setVersions(result.versions);
    } catch {
      message.error('無法載入版本記錄');
    } finally {
      setVersionsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/admin/cases/${id}`, {
        method: 'DELETE',
        headers: authHeader(),
      });
      const result = await response.json();
      if (result.success) {
        message.success('已刪除');
        setCases(prev => prev.filter(c => c.id !== id));
      } else {
        message.error(result.error || '刪除失敗');
      }
    } catch {
      message.error('刪除失敗');
    }
  };

  const columns = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      width: 140,
    },
    {
      title: '填寫日期',
      dataIndex: 'submit_date',
      key: 'submit_date',
      width: 120,
      render: (v: string | null) => v || '—',
    },
    {
      title: '建立時間',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 170,
    },
    {
      title: '操作',
      key: 'actions',
      width: 220,
      render: (_: unknown, record: CaseRow) => (
        <Space>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => navigate(`/admin/cases/${record.id}/edit`)}
          >
            編輯
          </Button>
          <Button
            size="small"
            icon={<FileWordOutlined />}
            onClick={() => openVersionModal(record.id)}
          >
            查看 Word
          </Button>
          <Popconfirm
            title="確定要刪除這筆個案嗎？"
            onConfirm={() => handleDelete(record.id)}
            okText="刪除"
            cancelText="取消"
            okButtonProps={{ danger: true }}
          >
            <Button size="small" danger>刪除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px', maxWidth: 960, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0 }}>個案資料庫</Title>
        <Button icon={<LogoutOutlined />} onClick={logout}>登出</Button>
      </div>

      <Input
        prefix={<SearchOutlined />}
        placeholder="搜尋姓名..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        allowClear
        size="large"
        style={{ marginBottom: 16 }}
      />

      <Table
        rowKey="id"
        dataSource={cases}
        columns={columns}
        loading={loading}
        pagination={{ pageSize: 20, showTotal: total => `共 ${total} 筆` }}
      />

      <Modal
        title="版本記錄"
        open={versionModalCaseId !== null}
        onCancel={() => setVersionModalCaseId(null)}
        footer={null}
        width={700}
      >
        <Table
          rowKey="id"
          dataSource={versions}
          loading={versionsLoading}
          size="small"
          pagination={false}
          columns={[
            { title: '版本名稱', dataIndex: 'version_name', width: 140 },
            { title: '提交說明', dataIndex: 'commit_message', render: (v: string | null) => v || '—' },
            { title: '時間', dataIndex: 'created_at', width: 170 },
            {
              title: '操作',
              width: 100,
              render: (_: unknown, v: VersionRow) => (
                <Button
                  size="small"
                  type="link"
                  disabled={!v.drive_link}
                  onClick={() => v.drive_link && window.open(v.drive_link, '_blank')}
                >
                  開啟 Word
                </Button>
              ),
            },
          ]}
        />
      </Modal>
    </div>
  );
}
