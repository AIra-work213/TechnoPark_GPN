import React, { use, useEffect, useState } from 'react';
import FileUpload from './FileUpload';
// библиотека для хеширования имен файлов
import CryptoJS from "crypto-js";

function Analyzer() {
  const [coreFile, setCoreFile] = useState(null);
  const [coreFileText, setCoreFileText] = useState(null);
  const [additionalFiles, setAdditionalFiles] = useState([]);
  const [uploadedData, setUploadedData] = useState(false);

  const handleCoreFileChange = (file, text) => {
    setCoreFile(file);
    setCoreFileText(text);
    console.log("Загружен основной файл:", file?.name);
  };

  const handleAdditionalFilesChange = (files) => {
    setAdditionalFiles(Array.from(files));
    console.log("Загружены дополнительные файлы:", files);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!coreFile) {
      alert("Пожалуйста, загрузите основной файл.");
      return;
    }
    // меняю состояние для триггера useEffect
    else {
      setUploadedData(true)
    }
  };

  // Отправка файлов на сервер
  useEffect(() => {
    if (uploadedData) {
      try {
        // подготовка данных основного файла
        const coreFileData = {
          "id": CryptoJS.SHA256(coreFile.name).toString(CryptoJS.enc.Hex),
          "text": coreFileText,
          "is_root": true
        }
        fetch('http://localhost:8080/api/takeDocs', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(coreFileData),
        })
        .then(response => response.json())
        .then(data => {
          console.log('Успех:', data);
        })
        .catch((error) => {
          console.error('Ошибка:', error);
        });
        console.log(coreFileData);
      } catch (error) {
        console.error("Ошибка при отправке файлов:", error);
      }
    }
  }, [uploadedData]);

  return (
    <div className="analyzer-container">
      <div className="left-panel">
        <h3>Подробности инцидента</h3>
        <p className="description">Предоставьте информацию об инциденте для анализа ИИ</p>

        <div className="upload-section">
          <h4>Описание инцидента</h4>
          <FileUpload
            label="Загрузите сюда ваш корневой файл"
            onChange={handleCoreFileChange}
            accept=".pdf,.docx,.txt"
          />
          <FileUpload
            label="Загрузите сюда дополнительные файлы"
            onChange={handleAdditionalFilesChange}
            multiple={true}
            accept=".pdf,.docx,.txt,.jpg,.png"
          />
        </div>

        <button className="analyze-button" onClick={handleSubmit}>
          <span className="icon">🤖</span> Анализ с помощью ИИ
        </button>
      </div>

      <div className="right-panel">
        <div className="ready-state">
          <div className="icon-circle">
            <span className="loading-icon">⚙️</span>
          </div>
          <h4>Готов анализировать</h4>
          <p>
            Заполните сведения об инциденте и нажмите «Анализ с помощью ИИ», чтобы получить анализ переорганизации и рекомендации.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Analyzer;