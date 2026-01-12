import React, { useState } from 'react';
import './EmergencyControls.css';

const EmergencyControls = () => {
  const [emergencyState, setEmergencyState] = useState({
    transactionsFrozen: false,
    newListingsDisabled: false,
    payoutsDisabled: false,
    chatsLocked: false,
    roleSuspended: null,
    systemAlertActive: false
  });

  const [confirmationMode, setConfirmationMode] = useState({
    active: false,
    action: null,
    password: '',
    reason: ''
  });

  const [emergencyLog, setEmergencyLog] = useState([
    { id: 1, action: 'System initialized', timestamp: '2024-01-15 10:00:00', user: 'system' },
    { id: 2, action: 'Regular operations started', timestamp: '2024-01-15 10:00:05', user: 'system' }
  ]);

  const emergencyActions = [
    {
      id: 'freeze_transactions',
      title: '❄️ FREEZE ALL TRANSACTIONS',
      description: 'Immediately halt all financial transactions platform-wide',
      severity: 'critical',
      requiresPassword: true,
      requiresReason: true,
      confirmationText: 'This will freeze ALL payments, withdrawals, and commission distributions. Are you absolutely sure?'
    },
    {
      id: 'disable_listings',
      title: '⛔ DISABLE NEW LISTINGS',
      description: 'Prevent creation of new property listings',
      severity: 'high',
      requiresPassword: true,
      requiresReason: true,
      confirmationText: 'New listings from all users will be blocked. Existing listings remain active.'
    },
    {
      id: 'disable_payouts',
      title: '💸 DISABLE PAYOUTS',
      description: 'Stop all commission and withdrawal payouts',
      severity: 'critical',
      requiresPassword: true,
      requiresReason: true,
      confirmationText: 'All scheduled and pending payouts will be halted immediately.'
    },
    {
      id: 'lock_chats',
      title: '🔒 LOCK CHATS PLATFORM-WIDE',
      description: 'Temporarily disable all chat communications',
      severity: 'high',
      requiresPassword: false,
      requiresReason: true,
      confirmationText: 'All tenant-landlord-manager communications will be frozen.'
    },
    {
      id: 'suspend_role',
      title: '🚫 SUSPEND ROLE TYPE',
      description: 'Temporarily suspend all users of a specific role',
      severity: 'critical',
      requiresPassword: true,
      requiresReason: true,
      confirmationText: 'Select which user role to suspend platform-wide'
    },
    {
      id: 'system_alert',
      title: '📢 SYSTEM-WIDE ALERT',
      description: 'Send emergency notification to all users',
      severity: 'medium',
      requiresPassword: false,
      requiresReason: true,
      confirmationText: 'Send an emergency alert to all active users'
    },
    {
      id: 'force_logout',
      title: '👥 FORCE USER LOGOUT',
      description: 'Log out all users immediately',
      severity: 'high',
      requiresPassword: true,
      requiresReason: true,
      confirmationText: 'All users will be logged out and need to re-authenticate.'
    },
    {
      id: 'reset_commissions',
      title: '🔄 RESET COMMISSION QUEUE',
      description: 'Clear and reset all pending commission calculations',
      severity: 'critical',
      requiresPassword: true,
      requiresReason: true,
      confirmationText: 'This will reset all pending commission distributions. Use only if calculations are corrupted.'
    },
    {
      id: 'backup_database',
      title: '💾 EMERGENCY BACKUP',
      description: 'Trigger immediate database backup',
      severity: 'medium',
      requiresPassword: false,
      requiresReason: false,
      confirmationText: 'Create an emergency backup of all system data'
    },
    {
      id: 'recovery_mode',
      title: '🚑 RECOVERY MODE',
      description: 'Enable system-wide recovery protocols',
      severity: 'critical',
      requiresPassword: true,
      requiresReason: true,
      confirmationText: 'Enter recovery mode. System will operate with minimal features for stability.'
    }
  ];

  const handleEmergencyAction = (action) => {
    if (action.requiresPassword || action.requiresReason) {
      setConfirmationMode({
        active: true,
        action: action,
        password: '',
        reason: ''
      });
    } else {
      executeAction(action);
    }
  };

  const executeAction = (action) => {
    // Update emergency state
    const newState = { ...emergencyState };
    const timestamp = new Date().toLocaleString();
    const user = 'superadmin@renteasy.com';

    switch(action.id) {
      case 'freeze_transactions':
        newState.transactionsFrozen = !newState.transactionsFrozen;
        logEmergencyAction(`Transactions ${newState.transactionsFrozen ? 'FROZEN' : 'UNFROZEN'}`, timestamp, user, confirmationMode.reason);
        break;
      case 'disable_listings':
        newState.newListingsDisabled = !newState.newListingsDisabled;
        logEmergencyAction(`New listings ${newState.newListingsDisabled ? 'DISABLED' : 'ENABLED'}`, timestamp, user, confirmationMode.reason);
        break;
      case 'disable_payouts':
        newState.payoutsDisabled = !newState.payoutsDisabled;
        logEmergencyAction(`Payouts ${newState.payoutsDisabled ? 'DISABLED' : 'ENABLED'}`, timestamp, user, confirmationMode.reason);
        break;
      case 'lock_chats':
        newState.chatsLocked = !newState.chatsLocked;
        logEmergencyAction(`Chats ${newState.chatsLocked ? 'LOCKED' : 'UNLOCKED'}`, timestamp, user, confirmationMode.reason);
        break;
      case 'system_alert':
        newState.systemAlertActive = !newState.systemAlertActive;
        logEmergencyAction(`System alert ${newState.systemAlertActive ? 'ACTIVATED' : 'DEACTIVATED'}`, timestamp, user, confirmationMode.reason);
        alert('Emergency alert sent to all users');
        break;
      case 'backup_database':
        logEmergencyAction('Emergency backup triggered', timestamp, user, confirmationMode.reason);
        alert('Emergency backup initiated');
        break;
    }

    setEmergencyState(newState);
    setConfirmationMode({ active: false, action: null, password: '', reason: '' });
  };

  const logEmergencyAction = (action, timestamp, user, reason) => {
    const logEntry = {
      id: Date.now(),
      action,
      timestamp,
      user,
      reason: reason || 'No reason provided'
    };
    setEmergencyLog(prev => [logEntry, ...prev.slice(0, 49)]); // Keep last 50 entries
  };

  const handleConfirmation = () => {
    if (confirmationMode.action.requiresPassword && confirmationMode.password !== 'renteasy2024') {
      alert('Incorrect password! Emergency action cancelled.');
      return;
    }

    if (confirmationMode.action.requiresReason && !confirmationMode.reason.trim()) {
      alert('Please provide a reason for this emergency action.');
      return;
    }

    executeAction(confirmationMode.action);
  };

  const getStatusColor = (status) => {
    return status ? '#ef4444' : '#10b981';
  };

  const getStatusText = (status) => {
    return status ? 'ACTIVE' : 'INACTIVE';
  };

  return (
    <div className="emergency-controls">
      {/* Header */}
      <div className="emergency-header">
        <div className="header-left">
          <h1 className="emergency-title">🚨 EMERGENCY CONTROLS</h1>
          <p className="emergency-subtitle">Nuclear Options • Use with Extreme Caution</p>
        </div>
        <div className="header-right">
          <div className="emergency-status">
            <div className="status-indicator active"></div>
            <span>EMERGENCY MODE: ARMED</span>
          </div>
          <div className="timestamp">
            {new Date().toLocaleString()}
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="system-status">
        <h3>🖥️ SYSTEM STATUS</h3>
        <div className="status-grid">
          <div className="status-item">
            <div className="status-label">Transactions</div>
            <div 
              className="status-value"
              style={{ color: getStatusColor(emergencyState.transactionsFrozen) }}
            >
              {getStatusText(emergencyState.transactionsFrozen)}
            </div>
          </div>
          <div className="status-item">
            <div className="status-label">New Listings</div>
            <div 
              className="status-value"
              style={{ color: getStatusColor(emergencyState.newListingsDisabled) }}
            >
              {getStatusText(!emergencyState.newListingsDisabled)}
            </div>
          </div>
          <div className="status-item">
            <div className="status-label">Payouts</div>
            <div 
              className="status-value"
              style={{ color: getStatusColor(emergencyState.payoutsDisabled) }}
            >
              {getStatusText(!emergencyState.payoutsDisabled)}
            </div>
          </div>
          <div className="status-item">
            <div className="status-label">Chats</div>
            <div 
              className="status-value"
              style={{ color: getStatusColor(emergencyState.chatsLocked) }}
            >
              {getStatusText(emergencyState.chatsLocked)}
            </div>
          </div>
          <div className="status-item">
            <div className="status-label">System Alert</div>
            <div 
              className="status-value"
              style={{ color: getStatusColor(emergencyState.systemAlertActive) }}
            >
              {getStatusText(emergencyState.systemAlertActive)}
            </div>
          </div>
          <div className="status-item">
            <div className="status-label">Security Level</div>
            <div className="status-value critical">MAXIMUM</div>
          </div>
        </div>
      </div>

      {/* Emergency Actions Grid */}
      <div className="emergency-grid">
        {emergencyActions.map(action => (
          <div 
            key={action.id} 
            className={`emergency-action ${action.severity}`}
            onClick={() => handleEmergencyAction(action)}
          >
            <div className="action-header">
              <div className="action-title">{action.title}</div>
              <div className="action-severity">{action.severity.toUpperCase()}</div>
            </div>
            <div className="action-description">{action.description}</div>
            <div className="action-requirements">
              {action.requiresPassword && <span className="req-tag">🔐 Password Required</span>}
              {action.requiresReason && <span className="req-tag">📝 Reason Required</span>}
              <span className="req-tag">👑 Super Admin Only</span>
            </div>
            <div className="action-footer">
              <button className="action-button">ACTIVATE</button>
            </div>
          </div>
        ))}
      </div>

      {/* Emergency Log */}
      <div className="emergency-log">
        <h3>📜 EMERGENCY ACTION LOG</h3>
        <div className="log-container">
          {emergencyLog.map(log => (
            <div key={log.id} className="log-entry">
              <div className="log-timestamp">{log.timestamp}</div>
              <div className="log-action">{log.action}</div>
              <div className="log-user">{log.user}</div>
              {log.reason && <div className="log-reason">Reason: {log.reason}</div>}
            </div>
          ))}
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmationMode.active && (
        <div className="confirmation-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>⚠️ CONFIRM EMERGENCY ACTION</h3>
              <button 
                className="modal-close"
                onClick={() => setConfirmationMode({ active: false, action: null, password: '', reason: '' })}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="warning-banner">
                <div className="warning-icon">🚨</div>
                <div className="warning-text">
                  <strong>WARNING: This is an irreversible emergency action</strong>
                  <p>{confirmationMode.action.confirmationText}</p>
                </div>
              </div>

              {confirmationMode.action.requiresPassword && (
                <div className="password-field">
                  <label>Super Admin Password:</label>
                  <input
                    type="password"
                    value={confirmationMode.password}
                    onChange={(e) => setConfirmationMode(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Enter emergency password"
                  />
                </div>
              )}

              {confirmationMode.action.requiresReason && (
                <div className="reason-field">
                  <label>Reason for Emergency Action:</label>
                  <textarea
                    value={confirmationMode.reason}
                    onChange={(e) => setConfirmationMode(prev => ({ ...prev, reason: e.target.value }))}
                    placeholder="Explain why this emergency action is necessary..."
                    rows={3}
                  />
                </div>
              )}

              <div className="confirmation-check">
                <input type="checkbox" id="understand" />
                <label htmlFor="understand">
                  I understand this action cannot be undone and may cause system-wide disruption
                </label>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="cancel-btn"
                onClick={() => setConfirmationMode({ active: false, action: null, password: '', reason: '' })}
              >
                CANCEL
              </button>
              <button 
                className="confirm-btn"
                onClick={handleConfirmation}
                disabled={!document.getElementById('understand')?.checked}
              >
                CONFIRM EMERGENCY ACTION
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Safety Instructions */}
      <div className="safety-instructions">
        <div className="safety-icon">⚠️</div>
        <div className="safety-content">
          <h4>SAFETY PROTOCOLS</h4>
          <ul>
            <li>Emergency controls are logged permanently and cannot be deleted</li>
            <li>All actions require Super Admin authentication</li>
            <li>System will notify all administrators of emergency actions</li>
            <li>Automatic rollback is not available - manual intervention required</li>
            <li>Contact technical support before using recovery mode</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default EmergencyControls;