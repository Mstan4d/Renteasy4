// src/modules/providers/components/AgreementSignModal.jsx
import React, { useState } from 'react';
import { FaCheckCircle } from 'react-icons/fa';
import './ComplianceModals.css';

const AgreementSignModal = ({ item, onClose, onComplete }) => {
  const [agreed, setAgreed] = useState(false);
  const [signature, setSignature] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!agreed || !signature.trim()) {
      alert('Please agree to the terms and provide your signature.');
      return;
    }
    onComplete({ signature });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Sign {item.title}</h3>
          <button onClick={onClose} className="modal-close">×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <p>{item.description}</p>
            <div className="agreement-text">
              <p>I have read and agree to the terms and conditions of the Service Provider Agreement.</p>
            </div>
            <label className="checkbox-label">
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
              I agree to the terms
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
            <button type="submit" className="btn-primary">Sign & Confirm</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AgreementSignModal;