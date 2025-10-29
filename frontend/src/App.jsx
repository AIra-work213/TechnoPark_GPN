import React, { useState } from 'react';
import './styles/App.css';
import Analyzer from './components/Analyzer';
import History from './components/History';

function App() {
  const [activeTab, setActiveTab] = useState('analyzer'); // 'analyzer' или 'history'

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>AI-детектив</h1>
        <p className="subtitle">
          Анализируйте документы, содержащие информацию о провокациях, для выявления коренных причин и получения практических знаний.
        </p>
      </header>

      <div className="tab-container">
        <button
          className={`tab-button ${activeTab === 'analyzer' ? 'active' : ''}`}
          onClick={() => setActiveTab('analyzer')}
        >
          <span className="icon">📄</span> Анализатор
        </button>
        <button
          className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <span className="icon">🕒</span> История
        </button>
      </div>

      <main className="content-container">
        {activeTab === 'analyzer' && <Analyzer />}
        {activeTab === 'history' && <History />}
      </main>
    </div>
  );
}

export default App;