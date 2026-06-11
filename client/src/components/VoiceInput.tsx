import React, { useState, useRef } from 'react';
import { Button, message, Switch, Card } from 'antd';
import { AudioOutlined, StopOutlined, ReloadOutlined, SaveOutlined, RobotOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import './VoiceInput.css';

interface VoiceInputProps {
  onTranscriptChange: (text: string) => void;
  currentText: string;
  placeholder?: string;
  fieldName?: string;
  onAudioSave?: (audioBlob: Blob, fieldName: string) => void; // 新增
}

const VoiceInput: React.FC<VoiceInputProps> = ({ 
  onTranscriptChange, 
  currentText,
  placeholder = "點擊麥克風按鈕開始語音輸入",
  fieldName = "語音輸入",
  onAudioSave  // 新增：從 props 解構
}) => {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [autoPunctuation, setAutoPunctuation] = useState(true);
  const [isSupported, setIsSupported] = useState(true);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const restartTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pauseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const finalTranscriptRef = useRef<string>('');

  const initRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setIsSupported(false);
      message.error('您的瀏覽器不支援語音辨識功能，請使用 Chrome 或 Edge 瀏覽器');
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'zh-TW';

    recognition.onstart = () => {
      console.log('語音辨識已啟動');
    };

    recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptPart = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcriptPart;
        } else {
          interim += transcriptPart;
        }
      }

      if (final) {
        console.log('最終辨識結果:', final);
        
        // 清除暫停計時器
        if (pauseTimeoutRef.current) {
          clearTimeout(pauseTimeoutRef.current);
        }

        // 添加到累積文字
        finalTranscriptRef.current += final;
        
        // 自動標點：停頓1.5秒後加逗號
        if (autoPunctuation) {
          pauseTimeoutRef.current = setTimeout(() => {
            const current = finalTranscriptRef.current;
            if (current && !current.endsWith('，') && !current.endsWith('。') && 
                !current.endsWith('！') && !current.endsWith('？')) {
              finalTranscriptRef.current += '，';
              setTranscript(finalTranscriptRef.current);
            }
          }, 1500);
        }
        
        setTranscript(finalTranscriptRef.current);
      }
      
      setInterimTranscript(interim);
    };

    recognition.onerror = (event: any) => {
      console.error('語音辨識錯誤:', event.error);
      
      if (event.error === 'not-allowed') {
        message.error('麥克風權限被拒絕，請在瀏覽器設定中允許麥克風使用');
        stopRecording();
      } else if (event.error === 'no-speech') {
        console.log('暫時沒有偵測到語音');
      } else if (event.error === 'aborted') {
        console.log('語音辨識被中止');
      } else {
        console.error('其他錯誤:', event.error);
      }
    };

    recognition.onend = () => {
      console.log('語音辨識結束，isRecording:', isRecording);
      
      if (isRecording) {
        restartTimeoutRef.current = setTimeout(() => {
          if (isRecording && recognitionRef.current) {
            try {
              console.log('自動重啟語音辨識');
              recognitionRef.current.start();
            } catch (error) {
              console.error('重啟失敗:', error);
            }
          }
        }, 100);
      }
    };

    return recognition;
  };

  const transcribeWithWhisper = async () => {
    if (audioChunksRef.current.length === 0) return;
    setIsTranscribing(true);
    try {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      const response = await fetch('/api/speech-to-text', {
        method: 'POST',
        headers: { 'ngrok-skip-browser-warning': 'true' },
        body: formData,
      });
      const result = await response.json();
      if (result.success && result.text) {
        finalTranscriptRef.current = result.text;
        setTranscript(result.text);
        message.success('語音辨識完成');
      } else {
        message.error('語音辨識失敗，請重試');
      }
    } catch {
      message.error('無法連接伺服器');
    } finally {
      setIsTranscribing(false);
    }
  };

  const startRecording = async () => {
    try {
      console.log('開始錄音...');

      finalTranscriptRef.current = '';
      setTranscript('');
      setInterimTranscript('');

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('麥克風權限已獲得');

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach(track => track.stop());
        // 手機：MediaRecorder 停止後自動送 Whisper 辨識
        if (isMobile) transcribeWithWhisper();
      };

      mediaRecorder.start();
      console.log('音檔錄製已開始');

      setIsRecording(true);

      // 桌機：同時啟動 Web Speech API 做即時文字預覽
      if (!isMobile) {
        const recognition = initRecognition();
        if (recognition) {
          recognitionRef.current = recognition;
          recognition.start();
        }
      }

      message.success('開始錄音，請開始說話...');
    } catch (error: any) {
      console.error('錄音啟動失敗:', error);
      
      if (error.name === 'NotAllowedError') {
        message.error('麥克風權限被拒絕，請允許使用麥克風');
      } else if (error.name === 'NotFoundError') {
        message.error('找不到麥克風設備');
      } else {
        message.error('無法啟動錄音：' + error.message);
      }
      
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    console.log('停止錄音...');
    
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }
    
    if (pauseTimeoutRef.current) {
      clearTimeout(pauseTimeoutRef.current);
      pauseTimeoutRef.current = null;
    }
    
    setIsRecording(false);
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        recognitionRef.current = null;
        console.log('語音辨識已停止');
      } catch (error) {
        console.error('停止語音辨識失敗:', error);
      }
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
        console.log('音檔錄製已停止');
      } catch (error) {
        console.error('停止音檔錄製失敗:', error);
      }
    }

    if (autoPunctuation && finalTranscriptRef.current) {
      const text = finalTranscriptRef.current;
      
      const isQuestion = text.includes('嗎') || text.includes('呢') || 
                        text.includes('什麼') || text.includes('怎麼') ||
                        text.includes('為什麼') || text.includes('哪裡') ||
                        text.includes('誰') || text.includes('哪');
      
      if (!text.endsWith('，') && !text.endsWith('。') && 
          !text.endsWith('！') && !text.endsWith('？')) {
        finalTranscriptRef.current += isQuestion ? '？' : '。';
        setTranscript(finalTranscriptRef.current);
      }
    }
    
    setInterimTranscript('');
    message.success('錄音已停止');
  };

  const handleSaveTranscript = () => {
  if (!transcript) {
    message.warning('沒有可儲存的內容');
    return;
  }
  
  const fullText = currentText ? currentText + '\n\n' + transcript : transcript;
  onTranscriptChange(fullText);
  
  if (audioChunksRef.current.length > 0 && onAudioSave) {
    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
    
    // 直接使用 fieldName，不加時間戳
    console.log('保存音檔:', fieldName, '大小:', audioBlob.size, 'bytes');
    onAudioSave(audioBlob, fieldName);
  }
  
  setTranscript('');
  setInterimTranscript('');
  finalTranscriptRef.current = '';
  message.success('語音內容已添加到文字框');
};

  const handleReset = () => {
    setTranscript('');
    setInterimTranscript('');
    finalTranscriptRef.current = '';
    setAiSummary(null);

    if (pauseTimeoutRef.current) {
      clearTimeout(pauseTimeoutRef.current);
    }

    message.info('已清除語音辨識內容');
  };

  const handleAiSummary = async () => {
    if (!transcript) return;
    setIsSummarizing(true);
    setAiSummary(null);
    try {
      const response = await fetch('/api/ai-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ transcript })
      });
      const result = await response.json();
      if (result.success) {
        setAiSummary(result.summary);
      } else {
        message.error('AI 整理失敗：' + (result.error || '請稍後再試'));
      }
    } catch {
      message.error('無法連接伺服器，請確認後端是否正常運作');
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleUseSummary = () => {
    if (!aiSummary) return;
    setTranscript(aiSummary);
    finalTranscriptRef.current = aiSummary;
    setAiSummary(null);
    message.success('已使用 AI 整理後的內容');
  };

  if (!isSupported) {
    return (
      <div className="voice-input-container">
        <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
          您的瀏覽器不支援語音辨識功能，請使用 Chrome 或 Edge 瀏覽器
        </div>
      </div>
    );
  }

  const displayText = transcript + (interimTranscript ? ` ${interimTranscript}` : '');

  return (
    <div className="voice-input-container">
      <div className="voice-header">
        <div className="voice-controls">
          {!isRecording ? (
            <Button
              type="primary"
              size="large"
              icon={<AudioOutlined />}
              onClick={startRecording}
              loading={isTranscribing}
              disabled={isTranscribing}
              className="record-btn"
            >
              {isTranscribing ? '辨識中...' : '開始語音輸入'}
            </Button>
          ) : (
            <Button
              danger
              size="large"
              icon={<StopOutlined />}
              onClick={stopRecording}
              className="stop-btn"
            >
              停止錄音
            </Button>
          )}

          {transcript && !isRecording && (
            <>
              <Button
                size="large"
                icon={<SaveOutlined />}
                onClick={handleSaveTranscript}
                className="save-btn"
              >
                添加到內容
              </Button>
              <Button
                size="large"
                icon={isSummarizing ? undefined : <RobotOutlined />}
                onClick={handleAiSummary}
                loading={isSummarizing}
                style={{ background: '#1677ff', borderColor: '#1677ff', color: 'white' }}
              >
                {isSummarizing ? '整理中...' : 'AI 整理'}
              </Button>
              <Button
                size="large"
                icon={<ReloadOutlined />}
                onClick={handleReset}
              >
                重新錄製
              </Button>
            </>
          )}
        </div>

        <div className="punctuation-toggle">
          <Switch 
            checked={autoPunctuation}
            onChange={setAutoPunctuation}
            disabled={isRecording}
          />
          <span style={{ marginLeft: '8px' }}>自動標點符號</span>
        </div>
      </div>

      {isRecording && (
        <div className="recording-indicator">
          <div className="recording-dot"></div>
          <span>正在錄音中，請說話...</span>
        </div>
      )}

      {isTranscribing && (
        <div className="recording-indicator" style={{ background: '#e6f4ff', borderColor: '#1677ff' }}>
          <div className="recording-dot" style={{ background: '#1677ff', animation: 'none', opacity: 0.8 }}></div>
          <span style={{ color: '#1677ff' }}>語音辨識中，請稍候...</span>
        </div>
      )}

      {displayText && (
        <div className="transcript-preview">
          <div className="preview-label">語音辨識結果：</div>
          <div className="preview-text">
            {transcript}
            {interimTranscript && (
              <span className="interim-text"> {interimTranscript} (辨識中...)</span>
            )}
          </div>
        </div>
      )}

      {aiSummary && (
        <Card
          style={{ marginTop: '16px', borderColor: '#1677ff', borderWidth: '2px' }}
          title={
            <span style={{ color: '#1677ff' }}>
              <RobotOutlined style={{ marginRight: '8px' }} />
              AI 整理結果
            </span>
          }
        >
          <p style={{ fontSize: '15px', lineHeight: '1.8', whiteSpace: 'pre-wrap', color: '#333' }}>
            {aiSummary}
          </p>
          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <Button
              type="primary"
              icon={<CheckOutlined />}
              onClick={handleUseSummary}
              style={{ background: '#1677ff', borderColor: '#1677ff' }}
            >
              使用整理後內容
            </Button>
            <Button icon={<CloseOutlined />} onClick={() => setAiSummary(null)}>
              保留原始內容
            </Button>
          </div>
        </Card>
      )}

      {!isRecording && !transcript && (
        <div className="voice-hint">
          <p> 使用說明：</p>
          <ul>
            <li>點擊「開始語音輸入」後開始說話</li>
            <li>系統會即時顯示辨識結果</li>
            <li>說完後點擊「停止錄音」</li>
            <li>確認內容後點擊「添加到內容」</li>
            <li>如需重新錄製，點擊「重新錄製」</li>
            <li>「自動標點符號」會在停頓處自動添加標點</li>
          </ul>
          <p style={{ marginTop: '12px', fontSize: '13px', color: '#666' }}>
             建議使用 Chrome 或 Edge 瀏覽器以獲得最佳體驗
          </p>
        </div>
      )}
    </div>
  );
};

export default VoiceInput;