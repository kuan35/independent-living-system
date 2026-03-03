import React, { useState, useRef } from 'react';
import { Button, message, Switch } from 'antd';
import { AudioOutlined, StopOutlined, ReloadOutlined, SaveOutlined } from '@ant-design/icons';
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
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [autoPunctuation, setAutoPunctuation] = useState(true);
  const [isSupported, setIsSupported] = useState(true);
  
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

  const startRecording = async () => {
    try {
      console.log('開始錄音...');
      
      const recognition = initRecognition();
      if (!recognition) {
        return;
      }
      
      recognitionRef.current = recognition;
      finalTranscriptRef.current = '';
      setTranscript('');
      setInterimTranscript('');
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('麥克風權限已獲得');
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      console.log('音檔錄製已開始');
      
      setIsRecording(true);
      recognition.start();
      
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
    
    if (pauseTimeoutRef.current) {
      clearTimeout(pauseTimeoutRef.current);
    }
    
    message.info('已清除語音辨識內容');
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
              className="record-btn"
            >
              開始語音輸入
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