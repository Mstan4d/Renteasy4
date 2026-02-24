import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, XCircle, Download, FileSpreadsheet } from 'lucide-react';
import { supabase } from '../../../shared/lib/supabaseClient';
import { useAuth } from '../../../shared/context/AuthContext';
import './BulkPropertyUpload.css';

const BulkPropertyUpload = ({ onUpload }) => {
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('idle');
  const [validationResults, setValidationResults] = useState(null);
  const [parsedData, setParsedData] = useState([]);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      const validTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
      
      if (!validTypes.includes(selectedFile.type)) {
        alert('Please upload a CSV or Excel file');
        return;
      }

      if (selectedFile.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      setFile(selectedFile);
      await validateAndParseFile(selectedFile);
    }
  };

  const validateAndParseFile = async (file) => {
    try {
      const text = await file.text();
      const rows = text.split('\n').map(row => row.split(','));
      const headers = rows[0].map(h => h.trim().toLowerCase());
      
      // Check required columns
      const requiredColumns = ['property name', 'address', 'property type', 'rent amount', 'client name'];
      const missingColumns = requiredColumns.filter(col => !headers.includes(col));
      
      if (missingColumns.length > 0) {
        setValidationResults({
          valid: false,
          totalRows: rows.length - 1,
          validRows: 0,
          invalidRows: rows.length - 1,
          errors: [{ row: 0, column: 'File Structure', error: `Missing columns: ${missingColumns.join(', ')}` }]
        });
        return;
      }

      // Parse data rows
      const dataRows = [];
      const errors = [];
      
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (row.length < 5) continue;
        
        const rowData = {
          rowNumber: i + 1,
          title: row[headers.indexOf('property name')]?.trim() || '',
          address: row[headers.indexOf('address')]?.trim() || '',
          property_type: row[headers.indexOf('property type')]?.trim() || 'residential',
          price: parseFloat(row[headers.indexOf('rent amount')]?.trim()) || 0,
          client_name: row[headers.indexOf('client name')]?.trim() || '',
          description: row[headers.indexOf('description')]?.trim() || '',
          category: row[headers.indexOf('category')]?.trim() || 'residential',
          status: (row[headers.indexOf('status')]?.trim() || 'available').toLowerCase(),
          bedrooms: parseInt(row[headers.indexOf('bedrooms')]?.trim()) || 0,
          bathrooms: parseInt(row[headers.indexOf('bathrooms')]?.trim()) || 0,
          area_sqm: parseFloat(row[headers.indexOf('area')]?.trim()) || 0,
          rent_frequency: (row[headers.indexOf('rent frequency')]?.trim() || 'monthly').toLowerCase(),
          commission_rate: parseFloat(row[headers.indexOf('commission rate')]?.trim()) || 0
        };

        // Validate row
        const rowErrors = [];
        if (!rowData.title) rowErrors.push('Property name is required');
        if (!rowData.address) rowErrors.push('Address is required');
        if (rowData.price <= 0) rowErrors.push('Rent amount must be greater than 0');
        
        if (rowErrors.length === 0) {
          dataRows.push(rowData);
        } else {
          errors.push({
            row: i + 1,
            column: 'Multiple',
            error: rowErrors.join(', ')
          });
        }
      }

      setParsedData(dataRows);
      setValidationResults({
        valid: errors.length === 0,
        totalRows: rows.length - 1,
        validRows: dataRows.length,
        invalidRows: errors.length,
        errors: errors,
        columns: headers
      });

    } catch (error) {
      console.error('Error parsing file:', error);
      setValidationResults({
        valid: false,
        totalRows: 0,
        validRows: 0,
        invalidRows: 0,
        errors: [{ row: 0, column: 'File', error: 'Error parsing file. Please check the format.' }]
      });
    }
  };

  const handleUpload = async () => {
    if (!parsedData.length || !user) return;

    setUploadStatus('uploading');
    setUploadProgress(0);

    try {
      const totalRows = parsedData.length;
      let successfulUploads = 0;

      for (let i = 0; i < parsedData.length; i++) {
        const property = parsedData[i];
        
        // Upload property to Supabase
        const { error } = await supabase
          .from('listings')
          .insert({
            title: property.title,
            description: property.description || `Property at ${property.address}`,
            address: property.address,
            category: property.property_type,
            property_type: property.property_type,
            price: property.price,
            status: property.status,
            bedrooms: property.bedrooms,
            bathrooms: property.bathrooms,
            area_sqm: property.area_sqm,
            rent_frequency: property.rent_frequency,
            commission_rate: property.commission_rate,
            user_id: user.id,
            estate_firm_id: user.id,
            source: 'estate-firm-bulk-upload',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (error) {
          console.error('Error uploading property:', error);
          // Continue with other properties
        } else {
          successfulUploads++;
        }

        // Update progress
        const progress = Math.round(((i + 1) / totalRows) * 100);
        setUploadProgress(progress);
      }

      // Log activity
      await supabase.from('activities').insert({
        user_id: user.id,
        type: 'bulk_upload',
        action: 'upload',
        description: `Bulk uploaded ${successfulUploads} properties`,
        details: { total: parsedData.length, successful: successfulUploads },
        created_at: new Date().toISOString()
      });

      setUploadStatus('success');
      
      if (onUpload) {
        onUpload(successfulUploads);
      }

      alert(`Successfully uploaded ${successfulUploads} out of ${parsedData.length} properties`);

    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('error');
      alert('Error uploading properties. Please try again.');
    }
  };

  const downloadTemplate = () => {
    const templateContent = [
      ['Property Name', 'Address', 'Property Type', 'Rent Amount', 'Rent Frequency', 'Client Name', 'Commission Rate', 'Status', 'Bedrooms', 'Bathrooms', 'Area (sqm)', 'Description'],
      ['3-Bedroom Duplex, Lekki', 'Lekki Phase 1, Lagos', 'residential', '2500000', 'yearly', 'Mr. Johnson Ade', '0', 'available', '3', '3', '300', 'Luxury duplex with swimming pool'],
      ['2-Bedroom Flat, Ikeja', 'Ikeja GRA, Lagos', 'residential', '1200000', 'yearly', 'Mrs. Bola Ahmed', '0', 'available', '2', '2', '150', 'Modern flat in secure estate'],
      ['Office Space, VI', 'Adeola Odeku, VI, Lagos', 'commercial', '5000000', 'yearly', 'Tech Corp Ltd', '0', 'available', '0', '5', '500', 'Corporate office space']
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
    setParsedData([]);
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
                <span className={`validation-status ${validationResults.valid ? 'valid' : 'invalid'}`}>
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
                <button 
                  className="btn btn-primary" 
                  onClick={handleUpload}
                  disabled={validationResults.validRows === 0}
                >
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
          ) : uploadStatus === 'error' ? (
            <div className="upload-error">
              <XCircle size={48} color="#ef4444" />
              <h4>Upload Failed</h4>
              <p>There was an error uploading your properties.</p>
              <button className="btn btn-primary" onClick={resetUpload}>
                Try Again
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
            <small>Commission rate is 0% for estate firms</small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkPropertyUpload;