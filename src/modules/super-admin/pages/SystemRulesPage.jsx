import React, { useState, useEffect } from 'react';
import './SystemRulesPage.css';

const SystemRulesPage = () => {
  const [systemRules, setSystemRules] = useState([
    {
      id: 1,
      category: 'commission',
      key: 'default_commission_percentage',
      label: 'Default Commission Percentage',
      description: 'Base commission rate for all tenant/landlord listings',
      value: 7.5,
      defaultValue: 7.5,
      type: 'percentage',
      min: 0,
      max: 100,
      step: 0.1,
      lastModifiedBy: 'Super Admin',
      lastModifiedAt: '2024-01-15 14:30:00',
      requiresRestart: false,
      locked: true
    },
    {
      id: 2,
      category: 'commission',
      key: 'manager_share_percentage',
      label: 'Manager Share Percentage',
      description: 'Manager commission share from total commission',
      value: 2.5,
      defaultValue: 2.5,
      type: 'percentage',
      min: 0,
      max: 100,
      step: 0.1,
      lastModifiedBy: 'Super Admin',
      lastModifiedAt: '2024-01-15 14:30:00',
      requiresRestart: false,
      locked: true
    },
    {
      id: 3,
      category: 'commission',
      key: 'referrer_share_percentage',
      label: 'Referrer Share Percentage',
      description: 'Referrer commission share from total commission',
      value: 1.0,
      defaultValue: 1.0,
      type: 'percentage',
      min: 0,
      max: 100,
      step: 0.1,
      lastModifiedBy: 'Super Admin',
      lastModifiedAt: '2024-01-15 14:30:00',
      requiresRestart: false,
      locked: true
    },
    {
      id: 4,
      category: 'referral',
      key: 'referral_signup_bonus',
      label: 'Referral Signup Bonus',
      description: 'Bonus amount when referral signs up and rents',
      value: 5000,
      defaultValue: 5000,
      type: 'currency',
      min: 0,
      max: 100000,
      step: 1000,
      lastModifiedBy: 'Super Admin',
      lastModifiedAt: '2024-01-10 10:15:00',
      requiresRestart: false,
      locked: false
    },
    {
      id: 5,
      category: 'payout',
      key: 'manager_payout_threshold',
      label: 'Manager Payout Threshold',
      description: 'Minimum amount before manager can withdraw earnings',
      value: 10000,
      defaultValue: 10000,
      type: 'currency',
      min: 0,
      max: 1000000,
      step: 1000,
      lastModifiedBy: 'Super Admin',
      lastModifiedAt: '2024-01-12 11:20:00',
      requiresRestart: false,
      locked: false
    },
    {
      id: 6,
      category: 'proximity',
      key: 'manager_proximity_radius_km',
      label: 'Manager Proximity Radius (km)',
      description: 'Maximum distance for manager notifications',
      value: 10,
      defaultValue: 10,
      type: 'number',
      min: 1,
      max: 100,
      step: 1,
      lastModifiedBy: 'Super Admin',
      lastModifiedAt: '2024-01-08 09:45:00',
      requiresRestart: true,
      locked: false
    },
    {
      id: 7,
      category: 'marketplace',
      key: 'estate_firm_subscription_fee',
      label: 'Estate Firm Subscription Fee',
      description: 'Monthly fee for estate firms to appear in marketplace',
      value: 10000,
      defaultValue: 10000,
      type: 'currency',
      min: 0,
      max: 100000,
      step: 1000,
      lastModifiedBy: 'Super Admin',
      lastModifiedAt: '2024-01-05 16:30:00',
      requiresRestart: false,
      locked: false
    },
    {
      id: 8,
      category: 'feature_toggles',
      key: 'enable_marketplace',
      label: 'Enable Marketplace',
      description: 'Toggle marketplace functionality',
      value: true,
      defaultValue: true,
      type: 'boolean',
      lastModifiedBy: 'Super Admin',
      lastModifiedAt: '2024-01-01 00:00:00',
      requiresRestart: true,
      locked: false
    },
    {
      id: 9,
      category: 'feature_toggles',
      key: 'enable_referral_system',
      label: 'Enable Referral System',
      description: 'Toggle referral program',
      value: true,
      defaultValue: true,
      type: 'boolean',
      lastModifiedBy: 'Super Admin',
      lastModifiedAt: '2024-01-01 00:00:00',
      requiresRestart: true,
      locked: false
    },
    {
      id: 10,
      category: 'feature_toggles',
      key: 'enable_auto_verification',
      label: 'Enable Auto-Verification',
      description: 'Automatic verification for trusted partners',
      value: false,
      defaultValue: false,
      type: 'boolean',
      lastModifiedBy: 'Super Admin',
      lastModifiedAt: '2024-01-03 14:20:00',
      requiresRestart: true,
      locked: false
    },
    {
      id: 11,
      category: 'security',
      key: 'session_timeout_minutes',
      label: 'Session Timeout (minutes)',
      description: 'User session timeout duration',
      value: 15,
      defaultValue: 15,
      type: 'number',
      min: 1,
      max: 1440,
      step: 1,
      lastModifiedBy: 'Super Admin',
      lastModifiedAt: '2024-01-10 13:45:00',
      requiresRestart: true,
      locked: false
    },
    {
      id: 12,
      category: 'security',
      key: 'require_2fa_admin',
      label: 'Require 2FA for Admins',
      description: 'Force two-factor authentication for admin accounts',
      value: true,
      defaultValue: true,
      type: 'boolean',
      lastModifiedBy: 'Super Admin',
      lastModifiedAt: '2024-01-01 00:00:00',
      requiresRestart: false,
      locked: false
    }
  ]);

  const [selectedRule, setSelectedRule] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [changeLog, setChangeLog] = useState([]);

  const categories = {
    commission: { label: 'Commission Rules', icon: '💰', color: '#3182ce' },
    referral: { label: 'Referral System', icon: '👥', color: '#805ad5' },
    payout: { label: 'Payout Logic', icon: '💳', color: '#38a169' },
    proximity: { label: 'Proximity Rules', icon: '📍', color: '#dd6b20' },
    marketplace: { label: 'Marketplace', icon: '🏪', color: '#319795' },
    feature_toggles: { label: 'Feature Toggles', icon: '⚙️', color: '#718096' },
    security: { label: 'Security', icon: '🔒', color: '#e53e3e' }
  };

  const formatValue = (rule) => {
    if (rule.type === 'percentage') return `${rule.value}%`;
    if (rule.type === 'currency') return `₦${rule.value.toLocaleString()}`;
    if (rule.type === 'boolean') return rule.value ? 'Enabled' : 'Disabled';
    return rule.value;
  };

  const getCategoryStats = () => {
    const stats = {};
    Object.keys(categories).forEach(category => {
      stats[category] = systemRules.filter(rule => rule.category === category).length;
    });
    return stats;
  };

  const handleEditRule = (ruleId, newValue) => {
    const rule = systemRules.find(r => r.id === ruleId);
    
    setSystemRules(systemRules.map(r => 
      r.id === ruleId 
        ? { 
            ...r, 
            value: newValue,
            lastModifiedBy: 'Super Admin',
            lastModifiedAt: new Date().toLocaleString('en-NG')
          }
        : r
    ));

    // Add to change log
    setChangeLog(prev => [{
      id: Date.now(),
      ruleId,
      ruleLabel: rule.label,
      oldValue: formatValue(rule),
      newValue: formatValue({ ...rule, value: newValue }),
      changedBy: 'Super Admin',
      changedAt: new Date().toLocaleString('en-NG')
    }, ...prev]);

    setShowEditModal(false);
    setShowConfirmModal(false);
    
    if (rule.requiresRestart) {
      alert(`⚠️ Rule "${rule.label}" changed. System restart required for changes to take effect.`);
    }
  };

  const handleResetToDefault = (ruleId) => {
    const rule = systemRules.find(r => r.id === ruleId);
    if (window.confirm(`Reset "${rule.label}" to default value?`)) {
      handleEditRule(ruleId, rule.defaultValue);
    }
  };

  const renderEditField = (rule) => {
    switch(rule.type) {
      case 'percentage':
      case 'number':
        return (
          <div className="edit-field">
            <input
              type="number"
              value={editValue}
              onChange={(e) => setEditValue(parseFloat(e.target.value))}
              min={rule.min}
              max={rule.max}
              step={rule.step}
              className="edit-input number"
            />
            {rule.type === 'percentage' && <span className="input-suffix">%</span>}
          </div>
        );
      
      case 'currency':
        return (
          <div className="edit-field">
            <span className="input-prefix">₦</span>
            <input
              type="number"
              value={editValue}
              onChange={(e) => setEditValue(parseInt(e.target.value))}
              min={rule.min}
              max={rule.max}
              step={rule.step}
              className="edit-input currency"
            />
          </div>
        );
      
      case 'boolean':
        return (
          <div className="toggle-field">
            <button
              className={`toggle-btn ${editValue ? 'active' : ''}`}
              onClick={() => setEditValue(!editValue)}
            >
              <span className="toggle-slider"></span>
              <span className="toggle-label">{editValue ? 'Enabled' : 'Disabled'}</span>
            </button>
          </div>
        );
      
      default:
        return (
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="edit-input"
          />
        );
    }
  };

  const filteredRules = systemRules.filter(rule => {
    if (filter !== 'all' && rule.category !== filter) return false;
    if (search && !rule.label.toLowerCase().includes(search.toLowerCase())) {
      if (!rule.description.toLowerCase().includes(search.toLowerCase())) return false;
    }
    return true;
  });

  return (
    <div className="system-rules">
      {/* Header */}
      <div className="page-header">
        <div className="header-left">
          <h1 className="page-title">System Rules & Configuration</h1>
          <p className="page-subtitle">AWS Console-like configuration panel. Only you can touch these settings.</p>
        </div>
        <div className="header-actions">
          <button className="export-btn">
            ⚙️ Export Configuration
          </button>
          <button className="backup-btn">
            💾 Backup Settings
          </button>
        </div>
      </div>

      {/* Critical Warning */}
      <div className="critical-warning">
        <div className="warning-content">
          <span className="warning-icon">⚠️</span>
          <div className="warning-text">
            <strong>SUPER ADMIN EXCLUSIVE:</strong> These settings control the core business logic of RentEasy.
            Changes here affect all users and transactions. Use with extreme caution.
          </div>
        </div>
      </div>

      {/* Categories Overview */}
      <div className="categories-overview">
        <h3>Configuration Categories</h3>
        <div className="categories-grid">
          {Object.entries(categories).map(([key, category]) => {
            const stats = getCategoryStats();
            return (
              <div key={key} className="category-card" style={{ borderTopColor: category.color }}>
                <div className="category-header">
                  <span className="category-icon">{category.icon}</span>
                  <div className="category-info">
                    <h4>{category.label}</h4>
                    <p>{stats[key]} rules</p>
                  </div>
                </div>
                <button 
                  className="category-btn"
                  onClick={() => setFilter(key)}
                  style={{ background: category.color }}
                >
                  View Rules
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Controls */}
      <div className="controls-bar">
        <div className="controls-left">
          <div className="filter-group">
            <label>Filter by Category</label>
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Categories</option>
              {Object.entries(categories).map(([key, category]) => (
                <option key={key} value={key}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="controls-right">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search rules..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>
          <button 
            className="reset-filter-btn"
            onClick={() => {
              setFilter('all');
              setSearch('');
            }}
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Rules Grid */}
      <div className="rules-grid">
        {filteredRules.map(rule => (
          <div key={rule.id} className="rule-card">
            <div className="rule-header">
              <div className="rule-title-section">
                <h4 className="rule-title">{rule.label}</h4>
                <span className={`rule-category ${rule.category}`}>
                  {categories[rule.category].icon} {categories[rule.category].label}
                </span>
              </div>
              <div className="rule-value-display">
                <span className="current-value">{formatValue(rule)}</span>
                {rule.value !== rule.defaultValue && (
                  <span className="default-badge" title="Modified from default">
                    Modified
                  </span>
                )}
              </div>
            </div>

            <div className="rule-description">
              {rule.description}
            </div>

            <div className="rule-details">
              <div className="detail-row">
                <span className="detail-label">Key:</span>
                <span className="detail-value">{rule.key}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Type:</span>
                <span className="detail-value type-badge">{rule.type}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Last Modified:</span>
                <span className="detail-value">
                  {rule.lastModifiedAt} by {rule.lastModifiedBy}
                </span>
              </div>
              {rule.requiresRestart && (
                <div className="detail-row warning">
                  <span className="detail-label">⚠️ Requires Restart:</span>
                  <span className="detail-value">System restart required</span>
                </div>
              )}
            </div>

            <div className="rule-actions">
              <button 
                className="action-btn edit"
                onClick={() => {
                  setSelectedRule(rule);
                  setEditValue(rule.value);
                  setShowEditModal(true);
                }}
                disabled={rule.locked}
              >
                <span className="btn-icon">✏️</span>
                {rule.locked ? 'Locked' : 'Edit'}
              </button>
              <button 
                className="action-btn reset"
                onClick={() => handleResetToDefault(rule.id)}
                disabled={rule.value === rule.defaultValue}
              >
                <span className="btn-icon">↩️</span>
                Reset
              </button>
              <button 
                className="action-btn history"
                onClick={() => {
                  const ruleLogs = changeLog.filter(log => log.ruleId === rule.id);
                  alert(`Change history for ${rule.label}:\n\n${
                    ruleLogs.length > 0 
                      ? ruleLogs.map(log => `${log.changedAt}: ${log.oldValue} → ${log.newValue}`).join('\n')
                      : 'No changes recorded'
                  }`);
                }}
              >
                <span className="btn-icon">📜</span>
                History
              </button>
            </div>

            {rule.locked && (
              <div className="lock-notice">
                <span className="lock-icon">🔒</span>
                This rule is locked and cannot be modified
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Change Log */}
      <div className="change-log-section">
        <div className="section-header">
          <h3>Recent Configuration Changes</h3>
          <span className="log-count">{changeLog.length} changes</span>
        </div>
        <div className="change-log">
          {changeLog.length > 0 ? (
            changeLog.slice(0, 10).map(log => (
              <div key={log.id} className="log-entry">
                <div className="log-icon">⚡</div>
                <div className="log-content">
                  <div className="log-action">
                    <strong>{log.ruleLabel}</strong> changed from 
                    <span className="old-value">{log.oldValue}</span> to
                    <span className="new-value">{log.newValue}</span>
                  </div>
                  <div className="log-meta">
                    <span className="log-by">{log.changedBy}</span>
                    <span className="log-time">{log.changedAt}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-changes">
              <span className="no-changes-icon">📋</span>
              No configuration changes recorded
            </div>
          )}
        </div>
      </div>

      {/* Edit Rule Modal */}
      {showEditModal && selectedRule && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header warning">
              <h3>Edit System Rule</h3>
              <button 
                className="close-modal"
                onClick={() => setShowEditModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="edit-warning">
                <span className="warning-icon">⚠️</span>
                <p>
                  You are editing <strong>{selectedRule.label}</strong>. 
                  This affects the entire RentEasy platform.
                </p>
              </div>

              <div className="rule-info">
                <div className="info-row">
                  <span className="info-label">Key:</span>
                  <span className="info-value">{selectedRule.key}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Category:</span>
                  <span className="info-value">{categories[selectedRule.category].label}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Current Value:</span>
                  <span className="info-value current">{formatValue(selectedRule)}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Default Value:</span>
                  <span className="info-value default">{formatValue({...selectedRule, value: selectedRule.defaultValue})}</span>
                </div>
              </div>

              <div className="edit-form">
                <div className="form-group">
                  <label>New Value</label>
                  {renderEditField(selectedRule)}
                  {selectedRule.type !== 'boolean' && selectedRule.min !== undefined && (
                    <div className="value-range">
                      Range: {selectedRule.min} - {selectedRule.max}
                      {selectedRule.type === 'percentage' && '%'}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label>Change Reason (Optional)</label>
                  <textarea 
                    className="reason-input"
                    placeholder="Explain why you're changing this rule..."
                    rows="3"
                  />
                </div>

                {selectedRule.requiresRestart && (
                  <div className="restart-warning">
                    <span className="warning-icon">🔄</span>
                    <p>This rule requires a system restart to take effect.</p>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-secondary"
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn-primary"
                onClick={() => {
                  if (editValue !== selectedRule.value) {
                    setShowConfirmModal(true);
                  } else {
                    setShowEditModal(false);
                  }
                }}
                disabled={editValue === selectedRule.value}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && selectedRule && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header danger">
              <h3>Confirm Rule Change</h3>
              <button 
                className="close-modal"
                onClick={() => setShowConfirmModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="confirmation-warning">
                <span className="warning-icon">🚨</span>
                <div className="warning-content">
                  <h4>CRITICAL SYSTEM CHANGE</h4>
                  <p>
                    You are about to change <strong>{selectedRule.label}</strong> from 
                    <span className="old-value"> {formatValue(selectedRule)} </span> to 
                    <span className="new-value"> {formatValue({...selectedRule, value: editValue})}</span>
                  </p>
                  <div className="confirmation-details">
                    <p><strong>Impact:</strong> This change will affect all users and transactions.</p>
                    <p><strong>Audit:</strong> This action will be logged permanently.</p>
                    {selectedRule.requiresRestart && (
                      <p><strong>⚠️ System restart required for changes to take effect.</strong></p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-secondary"
                onClick={() => setShowConfirmModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn-primary danger"
                onClick={() => handleEditRule(selectedRule.id, editValue)}
              >
                Confirm Change
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemRulesPage;