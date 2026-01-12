// src/modules/manager/components/ManagerKYCStatus.jsx
import React from 'react'
import { useNavigate } from 'react-router-dom'
import './ManagerKYCStatus.css'

const ManagerKYCStatus = ({ status }) => {
  const navigate = useNavigate()
  
  const getStatusConfig = (status) => {
    switch(status) {
      case 'approved':
        return {
          icon: '✅',
          text: 'KYC Verified',
          color: '#28a745',
          bgColor: '#d4edda'
        }
      case 'pending':
        return {
          icon: '⏳',
          text: 'KYC Pending',
          color: '#ffc107',
          bgColor: '#fff3cd'
        }
      case 'rejected':
        return {
          icon: '❌',
          text: 'KYC Rejected',
          color: '#dc3545',
          bgColor: '#f8d7da'
        }
      default:
        return {
          icon: '⚠️',
          text: 'KYC Required',
          color: '#856404',
          bgColor: '#fff3cd'
        }
    }
  }
  
  const config = getStatusConfig(status)
  
  return (
    <div 
      className="kyc-status"
      style={{
        backgroundColor: config.bgColor,
        borderColor: config.color,
        color: config.color
      }}
      onClick={() => navigate('/dashboard/manager/kyc')}
    >
      <span className="kyc-icon">{config.icon}</span>
      <span className="kyc-text">{config.text}</span>
      {status !== 'approved' && (
        <span className="kyc-action">Complete →</span>
      )}
    </div>
  )
}

export default ManagerKYCStatus