// client/src/App.tsx
import React, { useState } from 'react';
import { ConfigProvider } from 'antd';
import zhTW from 'antd/locale/zh_TW';
import FormWizard from './pages/FormWizard';
import './App.css';

function App() {
  return (
    <ConfigProvider locale={zhTW}>
      <div className="App">
        <FormWizard />
      </div>
    </ConfigProvider>
  );
}

export default App;