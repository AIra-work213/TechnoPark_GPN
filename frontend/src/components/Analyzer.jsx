import React, { useEffect, useMemo, useState } from 'react';
import FileUpload from './FileUpload';
import CryptoJS from "crypto-js";

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

function Analyzer() {
  const [coreDocument, setCoreDocument] = useState(null);
  const [supportingDocuments, setSupportingDocuments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [jobId, setJobId] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);

  const hasFilesForAnalysis = useMemo(
    () => Boolean(coreDocument?.file) || supportingDocuments.length > 0,
    [coreDocument, supportingDocuments]
  );

  const buildDocumentPayload = (entry, isRoot) => {
    const { file, text } = entry;
    return {
      id: CryptoJS.SHA256(`${file.name}-${file.size}-${file.lastModified}-${isRoot}`).toString(CryptoJS.enc.Hex),
      doc_name: file.name,
      summary: "",
      extrainfo: "",
      text: text || "",
      is_root: isRoot,
      is_visited: false,
    };
  };

  const handleCoreFileChange = (entry) => {
    if (!entry || !entry.file) {
      setCoreDocument(null);
      return;
    }
    setCoreDocument(entry);
    console.log("Загружен основной файл:", entry.file.name);
  };

  const handleAdditionalFilesChange = (entries) => {
    const list = entries || [];
    setSupportingDocuments(list);
    console.log("Загружены дополнительные файлы:", list.map((item) => item.file.name));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!coreDocument?.file) {
      alert("Пожалуйста, загрузите основной файл.");
      return;
    }

    setErrorMessage('');
    setStatusMessage('Отправляем документы на анализ...');
    setAnalysisResult(null);
    setIsSubmitting(true);

    const payload = [
      buildDocumentPayload(coreDocument, true),
      ...supportingDocuments.map((entry) => buildDocumentPayload(entry, false)),
    ];

    try {
      const response = await fetch(`${API_BASE_URL}/api/takeDocs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documents: payload }),
      });

      if (!response.ok) {
        throw new Error(`Сервер вернул статус ${response.status}`);
      }

      const data = await response.json();
      if (!data?.jobId) {
        throw new Error('Не удалось получить идентификатор задачи');
      }

      setJobId(data.jobId);
      setStatusMessage('Документы отправлены. Ожидаем результат...');
    } catch (error) {
      console.error('Ошибка при отправке файлов:', error);
      setErrorMessage('Не удалось отправить данные на сервер. Попробуйте позже.');
      setIsSubmitting(false);
      setStatusMessage('');
    }
  };

  useEffect(() => {
    if (!jobId) {
      return undefined;
    }

    let isCancelled = false;

    const pollIntervalMs = 4000;

    const fetchStatus = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/takeDocs/${jobId}`);
        if (!response.ok) {
          throw new Error(`Сервер вернул статус ${response.status}`);
        }

        const data = await response.json();

        if (isCancelled) {
          return;
        }

        if (data.status === 'completed') {
          setAnalysisResult(data.result);
          setStatusMessage('Анализ завершен');
          setIsSubmitting(false);
          setJobId(null);
        } else if (data.status === 'error') {
          setErrorMessage(data.error || 'Во время анализа произошла ошибка.');
          setStatusMessage('Анализ завершен с ошибкой');
          setIsSubmitting(false);
          setJobId(null);
        } else {
          const statusText = data.status === 'processing'
            ? 'Анализ выполняется...'
            : 'Задача ожидает обработки...';
          setStatusMessage(statusText);
        }
      } catch (error) {
        if (!isCancelled) {
          console.error('Ошибка при получении статуса задачи:', error);
          setErrorMessage('Не удалось получить статус анализа. Попробуйте позже.');
          setIsSubmitting(false);
          setJobId(null);
          setStatusMessage('');
        }
      }
    };

    const intervalId = setInterval(fetchStatus, pollIntervalMs);
    fetchStatus();

    return () => {
      isCancelled = true;
      clearInterval(intervalId);
    };
  }, [jobId]);

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

        <button
          className={`analyze-button ${hasFilesForAnalysis ? 'loaded' : ''}`}
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          <span className="icon">🤖</span> {isSubmitting ? 'Анализируем...' : 'Анализ с помощью ИИ'}
        </button>

        {errorMessage && <p className="error-message">{errorMessage}</p>}
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
          {jobId && <p className="status-message">ID задачи: {jobId}</p>}
          {statusMessage && <p className="status-message">{statusMessage}</p>}
          {analysisResult && (
            <div className="analysis-result">
              <h5>Результат анализа</h5>
              <pre>{JSON.stringify(analysisResult, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Analyzer;