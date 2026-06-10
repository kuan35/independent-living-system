import React from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);

  const onFinish = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify(values),
      });
      const result = await response.json();
      if (result.success && result.token) {
        localStorage.setItem('admin_token', result.token);
        message.success('登入成功');
        navigate('/admin/cases');
      } else {
        message.error(result.error || '登入失敗');
      }
    } catch {
      message.error('無法連線至伺服器');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f0f2f5',
    }}>
      <Card
        title="個案資料庫管理系統"
        style={{ width: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
      >
        <Form onFinish={onFinish} layout="vertical" size="large">
          <Form.Item
            name="username"
            rules={[{ required: true, message: '請輸入帳號' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="管理員帳號" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: '請輸入密碼' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="密碼" />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" block loading={loading}>
              登入
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
