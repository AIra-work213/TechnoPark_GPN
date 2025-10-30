import React, { useState } from 'react';
// библиотека для чтения docx файлов
import mammoth from "mammoth";

const getFileLabel = (files) => {
  if (!files.length) {
    return '';
  }
  if (files.length === 1) {
    return files[0].name;
  }
  return `${files.length} файлов`;
};

const extractTextFromFile = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();

    const fallback = () => resolve('');

    if (file.name.toLowerCase().endsWith('.docx')) {
      reader.onload = async (event) => {
        try {
          const { value } = await mammoth.extractRawText({ arrayBuffer: event.target.result });
          resolve(value || '');
        } catch (error) {
          console.error('Ошибка при чтении docx:', error);
          fallback();
        }
      };
      reader.onerror = (error) => {
        console.error('Ошибка чтения файла:', error);
        fallback();
      };
      reader.readAsArrayBuffer(file);
    } else {
      reader.onload = (event) => {
        resolve(event.target?.result?.toString() || '');
      };
      reader.onerror = (error) => {
        console.error('Ошибка чтения файла:', error);
        fallback();
      };
      reader.readAsText(file);
    }
  });
};

function FileUpload({ label, onChange, multiple = false, accept }) {
  const [fileLabel, setFileLabel] = useState('');

  const handleChange = async (event) => {
    const files = Array.from(event.target.files || []);

    if (!files.length) {
      setFileLabel('');
      onChange(multiple ? [] : null);
      return;
    }

    setFileLabel(getFileLabel(files));

    try {
      if (multiple) {
        const processed = await Promise.all(
          files.map(async (file) => ({
            file,
            text: await extractTextFromFile(file),
          }))
        );
        onChange(processed);
      } else {
        const file = files[0];
        const text = await extractTextFromFile(file);
        onChange({ file, text });
      }
    } catch (error) {
      console.error('Ошибка при обработке файлов:', error);
      onChange(multiple ? [] : null);
    }
  };

  return (
    <div className="file-upload">
      <label className="upload-label">{label}</label>
      {/* (изменённая строка) добавлено условие для отображения имени файла и стилизации */}
      <div className={`file-input-container ${fileLabel ? 'loaded' : ''}`}>
        <input
          type="file"
          onChange={handleChange}
          multiple={multiple}
          accept={accept}
          className="file-input"
        />
        {fileLabel && <span className="file-name">{fileLabel}</span>}
      </div>
    </div>
  );
}

export default FileUpload;