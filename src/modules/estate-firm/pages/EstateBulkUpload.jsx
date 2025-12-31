import React from 'react';
import BulkPropertyUpload from '../components/BulkPropertyUpload';

const EstateBulkUpload = () => {
  const handleUpload = (file) => {
    console.log('Uploading file:', file);
    // Add your upload logic here
  };

  return (
    <div className="estate-bulk-upload">
      <div className="page-header">
        <h1>Bulk Property Upload</h1>
        <p>Upload multiple properties at once using CSV or Excel files</p>
      </div>
      <BulkPropertyUpload onUpload={handleUpload} />
    </div>
  );
};

export default EstateBulkUpload;