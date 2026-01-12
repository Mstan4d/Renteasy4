import React from 'react';
import AuditTrail from '../components/AuditTrail';
import './AuditLogsPage.css';

const AuditLogsPage = () => {
  return (
    <div className="audit-logs-page">
      <div className="page-header">
        <div className="header-content">
          <h1>📜 AUDIT LOGS</h1>
          <p className="page-subtitle">
            Immutable Record of All System Activities • Non-Deletable • Time-Stamped
          </p>
          <div className="header-stats">
            <div className="stat-card">
              <div className="stat-number">24/7</div>
              <div className="stat-label">Logging Active</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">100%</div>
              <div className="stat-label">Complete Records</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">256-bit</div>
              <div className="stat-label">Encryption</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">0</div>
              <div className="stat-label">Logs Deleted</div>
            </div>
          </div>
        </div>
        <div className="header-warning">
          <div className="warning-icon">⚠️</div>
          <div className="warning-text">
            <strong>SECURITY NOTICE:</strong> Audit logs are immutable and cannot be modified or deleted.
            All access is logged for security purposes.
          </div>
        </div>
      </div>

      <div className="page-content">
        <AuditTrail />
      </div>

      <div className="page-footer">
        <div className="footer-info">
          <div className="info-item">
            <div className="info-icon">🔒</div>
            <div className="info-text">
              <div className="info-title">Immutable Storage</div>
              <div className="info-desc">Logs stored in write-once-read-many storage</div>
            </div>
          </div>
          <div className="info-item">
            <div className="info-icon">⏰</div>
            <div className="info-text">
              <div className="info-title">7-Year Retention</div>
              <div className="info-desc">All logs retained for compliance period</div>
            </div>
          </div>
          <div className="info-item">
            <div className="info-icon">👁️</div>
            <div className="info-text">
              <div className="info-title">Access Logged</div>
              <div className="info-desc">Every view of this page is recorded</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditLogsPage;