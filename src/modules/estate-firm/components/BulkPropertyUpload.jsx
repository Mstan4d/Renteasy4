import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, XCircle, Download, FileSpreadsheet } from 'lucide-react';
import './BulkPropertyUpload.css';

const BulkPropertyUpload = ({ onUpload }) => {
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('idle'); // idle, uploading, success, error
  const [validationResults, setValidationResults] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      const validTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
      
      if (!validTypes.includes(selectedFile.type)) {
        alert('Please upload a CSV or Excel file');
        return;
      }

      if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
        alert('File size must be less than 5MB');
        return;
      }

      setFile(selectedFile);
      validateFile(selectedFile);
    }
  };

  const validateFile = (file) => {
    // Mock validation
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      // Simulate validation
      setTimeout(() => {
        const mockValidation = {
          valid: true,
          totalRows: 25,
          validRows: 22,
          invalidRows: 3,
          errors: [
            { row: 3, column: 'Rent Amount', error: 'Invalid number format' },
            { row: 7, column: 'Property Type', error: 'Missing required field' },
            { row: 15, column: 'Location', error: 'Invalid location format' }
          ],
          columns: [
            'Property Name',
            'Address',
            'Property Type',
            'Rent Amount',
            'Rent Frequency',
            'Client Name',
            'Commission Rate',
            'Status'
          ]
        };
        setValidationResults(mockValidation);
      }, 1000);
    };
    reader.readAsText(file.slice(0, 1024)); // Read first 1KB for validation
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploadStatus('uploading');
    setUploadProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploadStatus('success');
          onUpload(file);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const downloadTemplate = () => {
    const templateContent = [
      ['Property Name', 'Address', 'Property Type', 'Rent Amount', 'Rent Frequency', 'Client Name', 'Commission Rate', 'Status', 'Notes'],
      ['3-Bedroom Duplex, Lekki', 'Lekki Phase 1, Lagos', 'residential', '2500000', 'yearly', 'Mr. Johnson Ade', '10', 'occupied', 'Sample property'],
      ['2-Bedroom Flat, Ikeja', 'Ikeja GRA, Lagos', 'residential', '1200000', 'yearly', 'Mrs. Bola Ahmed', '8', 'occupied', ''],
      ['Office Space, VI', 'Adeola Odeku, VI, Lagos', 'commercial', '5000000', 'yearly', 'Tech Corp Ltd', '12', 'occupied', 'Corporate lease']
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([templateContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'property-import-template.csv';
    a.click();
  };

  const resetUpload = () => {
    setFile(null);
    setUploadProgress(0);
    setUploadStatus('idle');
    setValidationResults(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bulk-upload">
      <div className="upload-card">
        <div className="upload-header">
          <FileSpreadsheet size={24} />
          <h3>Bulk Property Upload</h3>
        </div>

        <div className="upload-body">
          {!file ? (
            <div className="upload-area" onClick={() => fileInputRef.current?.click()}>
              <Upload size={48} />
              <p>Drag & drop or click to upload</p>
              <small>Supports CSV, Excel files (Max 5MB)</small>
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
            </div>
          ) : uploadStatus === 'idle' && validationResults ? (
            <div className="validation-results">
              <div className="validation-header">
                <h4>File Validation Results</h4>
                <span className="validation-status">
                  {validationResults.valid ? '✓ Valid' : '✗ Invalid'}
                </span>
              </div>

              <div className="validation-stats">
                <div className="stat">
                  <span className="stat-label">Total Rows</span>
                  <span className="stat-value">{validationResults.totalRows}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Valid Rows</span>
                  <span className="stat-value success">{validationResults.validRows}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Invalid Rows</span>
                  <span className="stat-value error">{validationResults.invalidRows}</span>
                </div>
              </div>

              {validationResults.errors.length > 0 && (
                <div className="validation-errors">
                  <h5>Validation Errors:</h5>
                  <ul>
                    {validationResults.errors.map((error, index) => (
                      <li key={index}>
                        Row {error.row}: {error.column} - {error.error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="upload-actions">
                <button className="btn btn-primary" onClick={handleUpload}>
                  Upload {validationResults.validRows} Properties
                </button>
                <button className="btn btn-outline" onClick={resetUpload}>
                  Cancel
                </button>
              </div>
            </div>
          ) : uploadStatus === 'uploading' ? (
            <div className="upload-progress">
              <h4>Uploading Properties...</h4>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <span className="progress-text">{uploadProgress}% Complete</span>
            </div>
          ) : uploadStatus === 'success' ? (
            <div className="upload-success">
              <CheckCircle size={48} color="#10b981" />
              <h4>Upload Successful!</h4>
              <p>Properties have been added to your portfolio.</p>
              <button className="btn btn-primary" onClick={resetUpload}>
                Upload Another File
              </button>
            </div>
          ) : null}
        </div>

        <div className="upload-footer">
          <button className="btn btn-sm btn-outline" onClick={downloadTemplate}>
            <Download size={14} />
            Download Template
          </button>
          <div className="upload-help">
            <small>Required columns: Property Name, Address, Rent Amount, Client Name</small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkPropertyUpload;