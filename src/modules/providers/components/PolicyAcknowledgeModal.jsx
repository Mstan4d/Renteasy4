// src/modules/providers/components/PolicyAcknowledgeModal.jsx
import React, { useState } from 'react';
import './ComplianceModals.css';

const PolicyAcknowledgeModal = ({ item, onClose, onComplete }) => {
  const [acknowledged, setAcknowledged] = useState(false);
  const [signature, setSignature] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!acknowledged || !signature.trim()) {
      alert('Please acknowledge the policy and provide your signature.');
      return;
    }
    onComplete({ signature, acknowledged: true });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Acknowledge {item?.title}</h3>
          <button onClick={onClose} className="modal-close">×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <p>{item?.description}</p>
            <div className="agreement-text">
              <p>I have read and understood the Data Protection Policy.</p>
            </div>
            <label className="checkbox-label">
              <input type="checkbox" checked={acknowledged} onChange={(e) => setAcknowledged(e.target.checked)} />
              I acknowledge and agree
            </label>
            <div className="form-group">
              <label>Full Name (as signature)</label>
              <input
                type="text"
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary">Acknowledge</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PolicyAcknowledgeModal;