// src/modules/marketplace/components/ExportModal.jsx
import React, { useState } from 'react';
import { X, Download, FileText, FileSpreadsheet, File, Check, Clock, Info, AlertCircle, ExternalLink } from 'lucide-react';
import './ExportModal.css';

/**
 * ExportModal - Data Export Configuration Modal
 * 
 * Features:
 * - Multiple export format options (CSV, Excel, PDF, JSON)
 * - Customizable data columns selection
 * - Date range filtering for exports
 * - Export scope options (All, Filtered, Selected)
 * - File naming conventions with templates
 * - Export scheduling options
 * - Progress tracking for large exports
 * - Export history and status display
 * - Email notification options
 * - Format-specific configuration options
 * 
 * Props:
 * @param {boolean} isOpen - Modal open/close state
 * @param {Function} onClose - Close modal callback
 * @param {Function} onExport - Export execution callback
 * @param {number} dataCount - Number of items to export
 * @param {Array} selectedItems - Array of selected item IDs
 * @param {Object} filters - Current active filters
 * @param {string} exportType - Type of data to export
 * 
 * Data Structure:
 * selectedItems: string[] - IDs of selected providers
 * filters: Object - Current filter state
 * exportType: 'providers' | 'analytics' | 'leads' | 'reports'
 */
const ExportModal = ({ 
  isOpen = false, 
  onClose, 
  onExport, 
  dataCount = 0,
  selectedItems = [],
  filters = {},
  exportType = 'providers'
}) => {
  // Export configuration state
  const [exportConfig, setExportConfig] = useState({
    format: 'csv',
    scope: selectedItems.length > 0 ? 'selected' : 'filtered',
    dateRange: {
      start: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    },
    columns: getDefaultColumns(exportType),
    fileName: generateFileName(exportType),
    includeHeaders: true,
    compress: false,
    schedule: 'now',
    notifyEmail: '',
    emailWhenComplete: false
  });
  
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [step, setStep] = useState(1); // 1: Format, 2: Options, 3: Review
  
  // Export format options
  const formatOptions = [
    {
      id: 'csv',
      name: 'CSV',
      description: 'Comma-separated values, ideal for spreadsheets',
      icon: FileText,
      color: '#10b981',
      extensions: ['.csv'],
      maxSize: '100MB'
    },
    {
      id: 'excel',
      name: 'Excel',
      description: 'Microsoft Excel format with formatting',
      icon: FileSpreadsheet,
      color: '#3b82f6',
      extensions: ['.xlsx', '.xls'],
      maxSize: '50MB'
    },
    {
      id: 'pdf',
      name: 'PDF',
      description: 'Portable Document Format for reports',
      icon: File,
      color: '#ef4444',
      extensions: ['.pdf'],
      maxSize: '25MB'
    },
    {
      id: 'json',
      name: 'JSON',
      description: 'JavaScript Object Notation for APIs',
      icon: FileText,
      color: '#8b5cf6',
      extensions: ['.json'],
      maxSize: '200MB'
    }
  ];
  
  // Scope options
  const scopeOptions = [
    {
      id: 'all',
      name: 'All Data',
      description: 'Export all marketplace data',
      count: dataCount,
      disabled: dataCount > 10000
    },
    {
      id: 'filtered',
      name: 'Filtered Results',
      description: 'Export currently filtered results',
      count: dataCount,
      disabled: dataCount === 0
    },
    {
      id: 'selected',
      name: 'Selected Items',
      description: 'Export only selected items',
      count: selectedItems.length,
      disabled: selectedItems.length === 0
    }
  ];
  
  // Schedule options
  const scheduleOptions = [
    { id: 'now', name: 'Export Now', icon: Download },
    { id: 'hourly', name: 'Hourly', icon: Clock },
    { id: 'daily', name: 'Daily', icon: Clock },
    { id: 'weekly', name: 'Weekly', icon: Clock },
    { id: 'monthly', name: 'Monthly', icon: Clock }
  ];
  
  // Get default columns based on export type
  function getDefaultColumns(type) {
    const baseColumns = ['name', 'company', 'type', 'rating', 'location', 'verified', 'createdAt'];
    
    switch(type) {
      case 'providers':
        return [...baseColumns, 'services', 'responseTime', 'healthScore', 'contact'];
      case 'analytics':
        return ['metric', 'value', 'change', 'period', 'trend', 'lastUpdated'];
      case 'leads':
        return ['providerName', 'contactedBy', 'method', 'timestamp', 'status', 'notes'];
      case 'reports':
        return ['reportType', 'period', 'generatedAt', 'dataPoints', 'summary', 'insights'];
      default:
        return baseColumns;
    }
  }
  
  // Generate default filename
  function generateFileName(type) {
    const date = new Date().toISOString().split('T')[0];
    const time = new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
    
    switch(type) {
      case 'providers':
        return `service-providers-${date}-${time}`;
      case 'analytics':
        return `marketplace-analytics-${date}-${time}`;
      case 'leads':
        return `contact-leads-${date}-${time}`;
      case 'reports':
        return `marketplace-report-${date}-${time}`;
      default:
        return `export-${date}-${time}`;
    }
  }
  
  // Get available columns based on export type
  function getAvailableColumns(type) {
    const columns = {
      providers: [
        { id: 'name', name: 'Provider Name', category: 'Basic' },
        { id: 'company', name: 'Company', category: 'Basic' },
        { id: 'type', name: 'Service Type', category: 'Basic' },
        { id: 'tier', name: 'Tier Level', category: 'Basic' },
        { id: 'rating', name: 'Rating', category: 'Performance' },
        { id: 'reviews', name: 'Review Count', category: 'Performance' },
        { id: 'healthScore', name: 'Health Score', category: 'Performance' },
        { id: 'location', name: 'Location', category: 'Contact' },
        { id: 'state', name: 'State', category: 'Contact' },
        { id: 'lga', name: 'LGA', category: 'Contact' },
        { id: 'services', name: 'Services', category: 'Services' },
        { id: 'responseTime', name: 'Response Time', category: 'Services' },
        { id: 'monthlyRate', name: 'Monthly Rate', category: 'Financial' },
        { id: 'hourlyRate', name: 'Hourly Rate', category: 'Financial' },
        { id: 'verified', name: 'Verified Status', category: 'Verification' },
        { id: 'verifiedOn', name: 'Verification Date', category: 'Verification' },
        { id: 'contact.phone', name: 'Phone Number', category: 'Contact' },
        { id: 'contact.email', name: 'Email', category: 'Contact' },
        { id: 'contact.website', name: 'Website', category: 'Contact' },
        { id: 'createdAt', name: 'Created Date', category: 'Metadata' },
        { id: 'updatedAt', name: 'Updated Date', category: 'Metadata' }
      ],
      analytics: [
        { id: 'metric', name: 'Metric Name', category: 'Basic' },
        { id: 'value', name: 'Current Value', category: 'Basic' },
        { id: 'change', name: 'Change %', category: 'Performance' },
        { id: 'trend', name: 'Trend Direction', category: 'Performance' },
        { id: 'period', name: 'Time Period', category: 'Metadata' },
        { id: 'lastUpdated', name: 'Last Updated', category: 'Metadata' },
        { id: 'target', name: 'Target Value', category: 'Goals' },
        { id: 'variance', name: 'Variance', category: 'Goals' }
      ],
      leads: [
        { id: 'providerName', name: 'Provider Name', category: 'Basic' },
        { id: 'contactedBy', name: 'Contacted By', category: 'Basic' },
        { id: 'method', name: 'Contact Method', category: 'Basic' },
        { id: 'timestamp', name: 'Timestamp', category: 'Basic' },
        { id: 'status', name: 'Status', category: 'Status' },
        { id: 'notes', name: 'Notes', category: 'Status' },
        { id: 'followUp', name: 'Follow-up Date', category: 'Status' },
        { id: 'converted', name: 'Converted', category: 'Conversion' }
      ]
    };
    
    return columns[type] || columns.providers;
  }
  
  // Handle format selection
  const handleFormatSelect = (formatId) => {
    setExportConfig(prev => ({
      ...prev,
      format: formatId
    }));
  };
  
  // Handle scope selection
  const handleScopeSelect = (scopeId) => {
    setExportConfig(prev => ({
      ...prev,
      scope: scopeId
    }));
  };
  
  // Handle column toggle
  const handleColumnToggle = (columnId) => {
    setExportConfig(prev => {
      const newColumns = prev.columns.includes(columnId)
        ? prev.columns.filter(id => id !== columnId)
        : [...prev.columns, columnId];
      
      return { ...prev, columns: newColumns };
    });
  };
  
  // Handle select all columns in category
  const handleSelectCategory = (category) => {
    const availableColumns = getAvailableColumns(exportType);
    const categoryColumns = availableColumns
      .filter(col => col.category === category)
      .map(col => col.id);
    
    const allSelected = categoryColumns.every(col => 
      exportConfig.columns.includes(col)
    );
    
    setExportConfig(prev => {
      const newColumns = allSelected
        ? prev.columns.filter(id => !categoryColumns.includes(id))
        : [...prev.columns, ...categoryColumns.filter(id => !prev.columns.includes(id))];
      
      return { ...prev, columns: [...new Set(newColumns)] };
    });
  };
  
  // Handle date range change
  const handleDateRangeChange = (field, value) => {
    setExportConfig(prev => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [field]: value
      }
    }));
  };
  
  // Handle filename change
  const handleFilenameChange = (e) => {
    setExportConfig(prev => ({
      ...prev,
      fileName: e.target.value
    }));
  };
  
  // Handle schedule change
  const handleScheduleChange = (scheduleId) => {
    setExportConfig(prev => ({
      ...prev,
      schedule: scheduleId
    }));
  };
  
  // Handle email notification toggle
  const handleEmailToggle = () => {
    setExportConfig(prev => ({
      ...prev,
      emailWhenComplete: !prev.emailWhenComplete
    }));
  };
  
  // Handle email input change
  const handleEmailChange = (e) => {
    setExportConfig(prev => ({
      ...prev,
      notifyEmail: e.target.value
    }));
  };
  
  // Handle compress toggle
  const handleCompressToggle = () => {
    setExportConfig(prev => ({
      ...prev,
      compress: !prev.compress
    }));
  };
  
  // Handle headers toggle
  const handleHeadersToggle = () => {
    setExportConfig(prev => ({
      ...prev,
      includeHeaders: !prev.includeHeaders
    }));
  };
  
  // Get estimated file size
  const getEstimatedSize = () => {
    let sizePerRecord = 0;
    
    switch(exportConfig.format) {
      case 'csv':
        sizePerRecord = 2; // KB
        break;
      case 'excel':
        sizePerRecord = 5; // KB
        break;
      case 'pdf':
        sizePerRecord = 10; // KB
        break;
      case 'json':
        sizePerRecord = 3; // KB
        break;
      default:
        sizePerRecord = 2;
    }
    
    const recordCount = exportConfig.scope === 'selected' 
      ? selectedItems.length 
      : dataCount;
    
    const totalSize = (recordCount * sizePerRecord) / 1000; // MB
    return totalSize < 0.1 ? '< 0.1 MB' : `${totalSize.toFixed(1)} MB`;
  };
  
  // Get selected format
  const selectedFormat = formatOptions.find(f => f.id === exportConfig.format);
  
  // Get selected scope
  const selectedScope = scopeOptions.find(s => s.id === exportConfig.scope);
  
  // Get record count for export
  const getRecordCount = () => {
    switch(exportConfig.scope) {
      case 'selected':
        return selectedItems.length;
      case 'filtered':
        return dataCount;
      case 'all':
        return dataCount; // In reality, this would be total count
      default:
        return dataCount;
    }
  };
  
  // Validate export configuration
  const validateExport = () => {
    const errors = [];
    
    if (exportConfig.columns.length === 0) {
      errors.push('Select at least one column to export');
    }
    
    if (getRecordCount() === 0) {
      errors.push('No data available for export');
    }
    
    if (exportConfig.emailWhenComplete && !exportConfig.notifyEmail) {
      errors.push('Email address required for notifications');
    }
    
    return errors;
  };
  
  // Handle export submission
  const handleExportSubmit = async () => {
    const errors = validateExport();
    if (errors.length > 0) {
      alert(errors.join('\n'));
      return;
    }
    
    setIsExporting(true);
    setExportProgress(0);
    
    // Simulate export progress
    const progressInterval = setInterval(() => {
      setExportProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Call export callback
      if (onExport) {
        onExport(exportConfig);
      }
      
      // Close modal after successful export
      setTimeout(() => {
        setIsExporting(false);
        onClose();
      }, 500);
      
    } catch (error) {
      console.error('Export failed:', error);
      setIsExporting(false);
      alert('Export failed. Please try again.');
    }
  };
  
  // Handle modal close
  const handleClose = () => {
    if (!isExporting) {
      onClose();
    }
  };
  
  // Handle next step
  const handleNextStep = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };
  
  // Handle previous step
  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };
  
  // If modal is not open, don't render
  if (!isOpen) return null;
  
  return (
    <div className="export-modal-overlay" onClick={handleClose}>
      <div 
        className="export-modal" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="export-modal-title"
        aria-describedby="export-modal-description"
      >
        {/* Modal Header */}
        <div className="modal-header">
          <div className="header-content">
            <h2 id="export-modal-title" className="modal-title">
              <Download size={20} />
              Export Data
            </h2>
            <p id="export-modal-description" className="modal-subtitle">
              Configure and download your marketplace data
            </p>
          </div>
          
          <button
            className="close-button"
            onClick={handleClose}
            disabled={isExporting}
            aria-label="Close export modal"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Progress Steps */}
        <div className="progress-steps">
          <div className="steps-container">
            <div className={`step ${step >= 1 ? 'active' : ''}`}>
              <span className="step-number">1</span>
              <span className="step-label">Format</span>
            </div>
            <div className="step-connector"></div>
            <div className={`step ${step >= 2 ? 'active' : ''}`}>
              <span className="step-number">2</span>
              <span className="step-label">Options</span>
            </div>
            <div className="step-connector"></div>
            <div className={`step ${step >= 3 ? 'active' : ''}`}>
              <span className="step-number">3</span>
              <span className="step-label">Export</span>
            </div>
          </div>
        </div>
        
        {/* Export Progress (if exporting) */}
        {isExporting && (
          <div className="export-progress">
            <div className="progress-header">
              <h3>Exporting Data...</h3>
              <span className="progress-percent">{exportProgress}%</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${exportProgress}%` }}
                aria-valuenow={exportProgress}
                aria-valuemin="0"
                aria-valuemax="100"
              />
            </div>
            <p className="progress-text">
              Preparing {getRecordCount().toLocaleString()} records for export...
            </p>
          </div>
        )}
        
        {/* Step 1: Format Selection */}
        {step === 1 && !isExporting && (
          <div className="modal-step">
            <div className="step-content">
              <h3 className="step-title">Select Export Format</h3>
              <p className="step-description">
                Choose the file format that best suits your needs
              </p>
              
              <div className="format-options">
                {formatOptions.map(format => (
                  <button
                    key={format.id}
                    className={`format-option ${
                      exportConfig.format === format.id ? 'selected' : ''
                    }`}
                    onClick={() => handleFormatSelect(format.id)}
                    style={{ '--format-color': format.color }}
                    aria-pressed={exportConfig.format === format.id}
                    aria-label={`Select ${format.name} format`}
                  >
                    <div className="format-icon">
                      <format.icon size={24} />
                    </div>
                    <div className="format-info">
                      <h4 className="format-name">{format.name}</h4>
                      <p className="format-description">{format.description}</p>
                      <div className="format-details">
                        <span className="detail-item">
                          Extensions: {format.extensions.join(', ')}
                        </span>
                        <span className="detail-item">
                          Max size: {format.maxSize}
                        </span>
                      </div>
                    </div>
                    {exportConfig.format === format.id && (
                      <div className="selected-indicator">
                        <Check size={20} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
              
              <div className="scope-selection">
                <h4 className="scope-title">Export Scope</h4>
                <p className="scope-description">
                  Choose which data to include in the export
                </p>
                
                <div className="scope-options">
                  {scopeOptions.map(scope => (
                    <button
                      key={scope.id}
                      className={`scope-option ${
                        exportConfig.scope === scope.id ? 'selected' : ''
                      } ${scope.disabled ? 'disabled' : ''}`}
                      onClick={() => !scope.disabled && handleScopeSelect(scope.id)}
                      disabled={scope.disabled}
                      aria-pressed={exportConfig.scope === scope.id}
                      aria-label={`Export ${scope.name} (${scope.count} items)`}
                    >
                      <div className="scope-info">
                        <h5 className="scope-name">{scope.name}</h5>
                        <p className="scope-description">{scope.description}</p>
                      </div>
                      <div className="scope-count">
                        <span className="count-number">{scope.count}</span>
                        <span className="count-label">items</span>
                      </div>
                      {scope.disabled && (
                        <div className="scope-disabled">
                          <AlertCircle size={14} />
                          <span>Not available</span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Step 2: Column Selection & Options */}
        {step === 2 && !isExporting && (
          <div className="modal-step">
            <div className="step-content">
              <h3 className="step-title">Configure Export Options</h3>
              <p className="step-description">
                Select columns and configure export settings
              </p>
              
              <div className="columns-section">
                <div className="section-header">
                  <h4 className="section-title">Data Columns</h4>
                  <div className="selected-count">
                    {exportConfig.columns.length} of {getAvailableColumns(exportType).length} selected
                  </div>
                </div>
                
                <div className="columns-categories">
                  {['Basic', 'Performance', 'Contact', 'Services', 'Financial', 'Verification', 'Metadata']
                    .filter(category => 
                      getAvailableColumns(exportType).some(col => col.category === category)
                    )
                    .map(category => {
                      const categoryColumns = getAvailableColumns(exportType)
                        .filter(col => col.category === category);
                      const selectedCount = categoryColumns.filter(col => 
                        exportConfig.columns.includes(col.id)
                      ).length;
                      
                      return (
                        <div key={category} className="category-group">
                          <div className="category-header">
                            <h5 className="category-name">{category}</h5>
                            <button
                              className="category-select-all"
                              onClick={() => handleSelectCategory(category)}
                              aria-label={`${selectedCount === categoryColumns.length ? 'Deselect' : 'Select'} all ${category} columns`}
                            >
                              {selectedCount === categoryColumns.length ? 'Deselect All' : 'Select All'}
                            </button>
                          </div>
                          
                          <div className="category-columns">
                            {categoryColumns.map(column => (
                              <label
                                key={column.id}
                                className="column-option"
                                aria-label={`${column.name} column`}
                              >
                                <input
                                  type="checkbox"
                                  checked={exportConfig.columns.includes(column.id)}
                                  onChange={() => handleColumnToggle(column.id)}
                                  className="column-checkbox"
                                />
                                <span className="column-name">{column.name}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
              
              <div className="options-section">
                <h4 className="section-title">Export Settings</h4>
                
                <div className="settings-grid">
                  {/* File Name */}
                  <div className="setting-group">
                    <label className="setting-label">
                      File Name
                      <span className="setting-hint">(Without extension)</span>
                    </label>
                    <input
                      type="text"
                      value={exportConfig.fileName}
                      onChange={handleFilenameChange}
                      className="setting-input"
                      aria-label="Export file name"
                    />
                  </div>
                  
                  {/* Date Range */}
                  <div className="setting-group">
                    <label className="setting-label">Date Range</label>
                    <div className="date-range-inputs">
                      <div className="date-input-group">
                        <label className="date-label">From</label>
                        <input
                          type="date"
                          value={exportConfig.dateRange.start}
                          onChange={(e) => handleDateRangeChange('start', e.target.value)}
                          className="date-input"
                          aria-label="Export start date"
                        />
                      </div>
                      <div className="date-input-group">
                        <label className="date-label">To</label>
                        <input
                          type="date"
                          value={exportConfig.dateRange.end}
                          onChange={(e) => handleDateRangeChange('end', e.target.value)}
                          className="date-input"
                          aria-label="Export end date"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Schedule */}
                  <div className="setting-group">
                    <label className="setting-label">Schedule</label>
                    <div className="schedule-options">
                      {scheduleOptions.map(option => (
                        <button
                          key={option.id}
                          className={`schedule-option ${
                            exportConfig.schedule === option.id ? 'selected' : ''
                          }`}
                          onClick={() => handleScheduleChange(option.id)}
                          aria-pressed={exportConfig.schedule === option.id}
                          aria-label={`Schedule export ${option.name}`}
                        >
                          <option.icon size={16} />
                          <span>{option.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Toggle Options */}
                  <div className="toggle-group">
                    <label className="toggle-option">
                      <input
                        type="checkbox"
                        checked={exportConfig.includeHeaders}
                        onChange={handleHeadersToggle}
                        className="toggle-checkbox"
                        aria-label="Include column headers"
                      />
                      <span className="toggle-slider"></span>
                      <span className="toggle-label">
                        Include Column Headers
                      </span>
                    </label>
                    
                    <label className="toggle-option">
                      <input
                        type="checkbox"
                        checked={exportConfig.compress}
                        onChange={handleCompressToggle}
                        className="toggle-checkbox"
                        aria-label="Compress file"
                      />
                      <span className="toggle-slider"></span>
                      <span className="toggle-label">
                        Compress File (ZIP)
                      </span>
                    </label>
                  </div>
                  
                  {/* Email Notification */}
                  <div className="email-notification">
                    <label className="toggle-option">
                      <input
                        type="checkbox"
                        checked={exportConfig.emailWhenComplete}
                        onChange={handleEmailToggle}
                        className="toggle-checkbox"
                        aria-label="Email notification when complete"
                      />
                      <span className="toggle-slider"></span>
                      <span className="toggle-label">
                        Email When Complete
                      </span>
                    </label>
                    
                    {exportConfig.emailWhenComplete && (
                      <div className="email-input-group">
                        <input
                          type="email"
                          value={exportConfig.notifyEmail}
                          onChange={handleEmailChange}
                          placeholder="Enter email address"
                          className="email-input"
                          aria-label="Notification email address"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Step 3: Review & Export */}
        {step === 3 && !isExporting && (
          <div className="modal-step">
            <div className="step-content">
              <h3 className="step-title">Review & Export</h3>
              <p className="step-description">
                Review your export configuration before proceeding
              </p>
              
              <div className="review-summary">
                <div className="summary-card">
                  <h4 className="summary-title">Export Summary</h4>
                  
                  <div className="summary-details">
                    <div className="detail-row">
                      <span className="detail-label">Format:</span>
                      <span className="detail-value">
                        <span 
                          className="format-badge"
                          style={{ backgroundColor: selectedFormat.color }}
                        >
                          {selectedFormat.name}
                        </span>
                      </span>
                    </div>
                    
                    <div className="detail-row">
                      <span className="detail-label">Scope:</span>
                      <span className="detail-value">
                        {selectedScope.name} ({getRecordCount().toLocaleString()} records)
                      </span>
                    </div>
                    
                    <div className="detail-row">
                      <span className="detail-label">Date Range:</span>
                      <span className="detail-value">
                        {exportConfig.dateRange.start} to {exportConfig.dateRange.end}
                      </span>
                    </div>
                    
                    <div className="detail-row">
                      <span className="detail-label">Columns:</span>
                      <span className="detail-value">
                        {exportConfig.columns.length} columns selected
                      </span>
                    </div>
                    
                    <div className="detail-row">
                      <span className="detail-label">File Name:</span>
                      <span className="detail-value">
                        {exportConfig.fileName}
                        {selectedFormat.extensions[0]}
                        {exportConfig.compress ? '.zip' : ''}
                      </span>
                    </div>
                    
                    <div className="detail-row">
                      <span className="detail-label">Estimated Size:</span>
                      <span className="detail-value">
                        {getEstimatedSize()}
                      </span>
                    </div>
                    
                    {exportConfig.emailWhenComplete && exportConfig.notifyEmail && (
                      <div className="detail-row">
                        <span className="detail-label">Notification:</span>
                        <span className="detail-value">
                          Email to {exportConfig.notifyEmail}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="export-preview">
                  <h4 className="preview-title">Preview (First 5 columns)</h4>
                  <div className="preview-table">
                    <div className="preview-header">
                      {exportConfig.columns.slice(0, 5).map((colId, index) => {
                        const column = getAvailableColumns(exportType).find(c => c.id === colId);
                        return (
                          <div key={colId} className="preview-cell header">
                            {column ? column.name : colId}
                          </div>
                        );
                      })}
                    </div>
                    <div className="preview-row">
                      {exportConfig.columns.slice(0, 5).map((colId, index) => (
                        <div key={index} className="preview-cell">
                          {index === 0 ? 'Sample Data' : '...'}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="export-note">
                <div className="note-icon">
                  <Info size={16} />
                </div>
                <div className="note-content">
                  <strong>Note:</strong> Large exports may take several minutes to process.
                  You'll receive a notification when your export is ready.
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Modal Footer */}
        <div className="modal-footer">
          <div className="footer-info">
            <div className="info-item">
              <span className="info-label">Records:</span>
              <span className="info-value">{getRecordCount().toLocaleString()}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Format:</span>
              <span className="info-value">{selectedFormat.name}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Size:</span>
              <span className="info-value">{getEstimatedSize()}</span>
            </div>
          </div>
          
          <div className="footer-actions">
            <button
              className="btn-secondary"
              onClick={step === 1 ? handleClose : handlePrevStep}
              disabled={isExporting}
              aria-label={step === 1 ? 'Cancel export' : 'Go back to previous step'}
            >
              {step === 1 ? 'Cancel' : 'Back'}
            </button>
            
            {step < 3 ? (
              <button
                className="btn-primary"
                onClick={handleNextStep}
                disabled={isExporting}
                aria-label="Continue to next step"
              >
                Continue
                <ExternalLink size={16} />
              </button>
            ) : (
              <button
                className="btn-export"
                onClick={handleExportSubmit}
                disabled={isExporting || getRecordCount() === 0}
                aria-label="Start export process"
              >
                <Download size={16} />
                {exportConfig.schedule === 'now' ? 'Export Now' : 'Schedule Export'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Default props
ExportModal.defaultProps = {
  isOpen: false,
  onClose: () => {},
  onExport: () => {},
  dataCount: 0,
  selectedItems: [],
  filters: {},
  exportType: 'providers'
};

export default ExportModal;