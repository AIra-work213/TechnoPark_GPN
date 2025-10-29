import React, { useState } from 'react';

function History() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="history-container">
      <h3>История инцидентов</h3>
      <p className="description">Просмотр и поиск анализов прошлых инцидентов</p>

      <div className="search-bar">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          placeholder="Поиск инцидентов..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="empty-state">
        <div className="icon-circle">
          <span className="info-icon">❗</span>
        </div>
        <h4>Инцидентов не обнаружено</h4>
        <p>Начните анализировать инциденты, чтобы создать свою историю</p>
      </div>
    </div>
  );
}

export default History;