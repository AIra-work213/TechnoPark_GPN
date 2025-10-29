import React, { useEffect, useState } from 'react';
// библиотека для чтения docx файлов
import mammoth from "mammoth";

function FileUpload({ label, onChange, multiple = false, accept }) {

  const [textContent, setTextContent] = useState("");

  const handleChange = (e) => {
    const files = e.target.files;

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
      <input
        type="file"
        onChange={handleChange}
        multiple={multiple}
        accept={accept}
        className="file-input"
      />
    </div>
  );
}

export default FileUpload;