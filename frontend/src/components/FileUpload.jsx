import React, { useState } from 'react';
// библиотека для чтения docx файлов
import mammoth from "mammoth";

function FileUpload({ label, onChange, multiple = false, accept }) {
  const [textContent, setTextContent] = useState("");
  // (новая строка) состояние для имени файла
  const [fileName, setFileName] = useState('');

  const handleChange = (e) => {
    const files = e.target.files;

    if (files.length > 0) {
      // (новая строка) сохраняем имя файла
      setFileName(files[0].name);
    }

    // обработка текста в файле с помощью mammoth
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        // обработка текста
        const arrayBuffer = e.target.result;
        const { value } = await mammoth.extractRawText({ arrayBuffer });
        setTextContent(value);

        if (multiple) {
          onChange(files, value);
        } else {
          onChange(files[0] || null, value);
        }
      } catch (error) {
        console.error("Ошибка при чтении:", error);
      }
    };
    // Читаем как ArrayBuffer (типо текста)
    reader.readAsArrayBuffer(files[0]);
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