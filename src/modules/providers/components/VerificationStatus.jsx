// src/modules/providers/components/VerificationStatus.jsx
import React from 'react';
import { Shield, ShieldOff, Clock, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import './VerificationStatus.css';

const VerificationStatus = ({ status, kycStatus }) => {
  const getVerificationInfo = () => {
    switch (kycStatus) {
      case 'approved':
        return {
          icon: <Shield size={20} color="#10b981" />,
          title: 'Verified Provider',
          description: 'KYC approved by admin',
          badge: 'verified',
          color: '#10b981'
        };
      case 'pending':
        return {
          icon: <Clock size={20} color="#f59e0b" />,
          title: 'Verification Pending',
          description: 'Under review by admin',
          badge: 'pending',
          color: '#f59e0b'
        };
      case 'rejected':
        return {
          icon: <ShieldOff size={20} color="#ef4444" />,
          title: 'Verification Rejected',
          description: 'Please update your information',
          badge: 'rejected',
          color: '#ef4444'
        };
      default:
        return {
          icon: <ShieldOff size={20} color="#6b7280" />,
          title: 'Not Verified',
          description: 'Optional for marketplace',
          badge: 'unverified',
          color: '#6b7280'
        };
    }
  };
  
  const info = getVerificationInfo();
  
  return (
    <div className={`verification-status ${info.badge}`}>
      <div className="verification-content">
        {info.icon}
        <div className="verification-text">
          <h4>{info.title}</h4>
          <p>{info.description}</p>
        </div>
      </div>
      
      {kycStatus === 'not_submitted' && (
        <Link to="/verify" className="btn btn-small btn-outline">
          Apply for Verification
        </Link>
      )}
      
      {kycStatus === 'rejected' && (
        <Link to="/verify" className="btn btn-small btn-outline">
          Re-apply
        </Link>
      )}
    </div>
  );
};

export default VerificationStatus;