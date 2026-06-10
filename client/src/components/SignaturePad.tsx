import React, { useRef, useState, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Button, Card, Space } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';

interface SignaturePadProps {
  label: string;
  required?: boolean;
  value: string | null;
  onChange: (value: string | null) => void;
}

const SignaturePad: React.FC<SignaturePadProps> = ({ label, required, value, onChange }) => {
  const sigRef = useRef<SignatureCanvas>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [confirmed, setConfirmed] = useState(!!value);

  // 同步 canvas 內部寬度與 CSS 渲染寬度，避免繪圖偏移
  useEffect(() => {
    if (confirmed) return;
    const sync = () => {
      if (containerRef.current && sigRef.current) {
        const canvas = sigRef.current.getCanvas();
        const w = containerRef.current.clientWidth;
        if (w > 0 && canvas.width !== w) {
          canvas.width = w;
          canvas.height = 120;
        }
      }
    };
    sync();
    window.addEventListener('resize', sync);
    return () => window.removeEventListener('resize', sync);
  }, [confirmed]);

  const handleClear = () => {
    sigRef.current?.clear();
    setConfirmed(false);
    onChange(null);
  };

  const handleConfirm = () => {
    if (!sigRef.current || sigRef.current.isEmpty()) return;
    // 使用 getCanvas() 取代 getTrimmedCanvas()（trim-canvas 與 React 19 相容性問題）
    const dataUrl = sigRef.current.getCanvas().toDataURL('image/png');
    setConfirmed(true);
    onChange(dataUrl);
  };

  const handleReSign = () => {
    setConfirmed(false);
    onChange(null);
    setTimeout(() => sigRef.current?.clear(), 0);
  };

  return (
    <Card
      size="small"
      title={
        <span style={{ fontSize: 15, fontWeight: 600 }}>
          {label}
          {required && <span style={{ color: 'red', marginLeft: 4 }}>*</span>}
        </span>
      }
      style={{
        border: confirmed ? '2px solid #52c41a' : '1px solid #d9d9d9',
        borderRadius: 8,
        marginTop: 12,
      }}
    >
      {confirmed ? (
        <div>
          <img
            src={value!}
            alt="簽名"
            style={{ maxWidth: '100%', height: 80, border: '1px solid #f0f0f0', borderRadius: 4 }}
          />
          <div style={{ marginTop: 8 }}>
            <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 6 }} />
            <span style={{ color: '#52c41a', fontWeight: 600 }}>已確認簽名</span>
            <Button size="small" style={{ marginLeft: 16 }} onClick={handleReSign}>
              重新簽名
            </Button>
          </div>
        </div>
      ) : (
        <div ref={containerRef} style={{ width: '100%' }}>
          <div style={{ border: '1px solid #d9d9d9', borderRadius: 4, background: '#fff' }}>
            <SignatureCanvas
              ref={sigRef}
              penColor="black"
              canvasProps={{
                style: { width: '100%', height: 120, display: 'block' },
              }}
            />
          </div>
          <div style={{ color: '#aaa', fontSize: 13, marginTop: 4 }}>
            請用手指或滑鼠在上方框內簽名
          </div>
          <Space style={{ marginTop: 8 }}>
            <Button size="small" onClick={handleClear}>清除</Button>
            <Button size="small" type="primary" onClick={handleConfirm}>確認簽名</Button>
          </Space>
        </div>
      )}
    </Card>
  );
};

export default SignaturePad;
