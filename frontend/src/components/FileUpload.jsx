import React, { useEffect, useState } from 'react';
// библиотека для чтения docx файлов
import mammoth from "mammoth";

function FileUpload({ label, onChange, multiple = false, accept }) {
  // (новая строка) состояние для имени файла
  const [fileName, setFileName] = useState('');
  const [fileText, setFileText] = useState('');

  const handleChange = async (e) => {
    const files = Array.from(e.target.files);
    console.log("Выбранные файлы:", files);

    if (files.length > 0) {
      setFileName(files.map(f => f.name).join(", "));
    }

    try {
      // создаём массив промисов для чтения всех файлов
      const readPromises = files.map(file => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();

          reader.onload = async (event) => {
            try {
              const arrayBuffer = event.target.result;
              const { value } = await mammoth.extractRawText({ arrayBuffer });
              resolve(value);
            } catch (error) {
              reject(error);
            }
          };

          reader.onerror = reject;
          reader.readAsArrayBuffer(file);
        });
      });

      // ждём, пока все файлы обработаются
      const allTexts = await Promise.all(readPromises);
      setFileText(allTexts);
      console.log("Все тексты:", allTexts);

      // передаём дальше в родительский компонент
      if (multiple) {
        onChange(files, allTexts);
      } else {
        onChange(files[0] || null, allTexts[0] || "");
      }

    } catch (error) {
      console.error("Ошибка при чтении файлов:", error);
    }
  };

  return (
    <div className="file-upload">
      <label className="upload-label">{label}</label>
      {/* (изменённая строка) добавлено условие для отображения имени файла и стилизации */}
      <div className={`file-input-container ${fileName ? 'loaded' : ''}`}>
        <input
          type="file"
          onChange={handleChange}
          multiple={multiple}
          accept={accept}
          className="file-input"
        />
        {fileName && <span className="file-name">{fileName}</span>}
      </div>
    </div>
  );
}

export default FileUpload;