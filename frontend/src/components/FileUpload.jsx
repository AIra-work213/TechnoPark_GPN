import React from 'react';

function FileUpload({ label, onChange, multiple = false, accept }) {
  const handleChange = (e) => {
    const files = e.target.files;
    if (multiple) {
      onChange(files);
    } else {
      onChange(files[0] || null);
    }
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