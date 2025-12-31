// src/modules/properties/components/CommissionNotice.jsx
import React from 'react';
import { Info, Building, Users, TrendingUp } from 'lucide-react';
import './CommissionNotice.css';

const CommissionNotice = ({ price, userRole, hasReferral = false }) => {
  const listingPrice = parseFloat(price) || 0;
  
  // Commission Breakdown
  const commissionRate = 7.5; // Total commission
  const commissionAmount = listingPrice * (commissionRate / 100);
  
  const breakdown = {
    rentEasy: commissionAmount * 0.5333, // 4% of total (4/7.5 = 0.5333)
    manager: commissionAmount * 0.3333,  // 2.5% of total (2.5/7.5 = 0.3333)
    referral: hasReferral ? commissionAmount * 0.1333 : 0 // 1% of total (1/7.5 = 0.1333)
  };
  
  const totalAmount = listingPrice + commissionAmount;

  return (
    <div className="commission-notice">
      <div className="commission-header">
        <Info size={20} />
        <h3>Commission Structure (7.5%)</h3>
      </div>
      
      <div className="commission-details">
        <p className="commission-description">
          A <strong>7.5% commission</strong> will be added to all listings. 
          This ensures professional service delivery and platform maintenance.
        </p>
        
        <div className="commission-breakdown">
          <div className="breakdown-item">
            <div className="breakdown-label">
              <Building size={16} />
              <span>Listing Price</span>
            </div>
            <strong className="price">₦{listingPrice.toLocaleString()}</strong>
          </div>
          
          <div className="breakdown-separator">+</div>
          
          {/* RentEasy Commission */}
          <div className="breakdown-item commission-item">
            <div className="breakdown-label">
              <TrendingUp size={16} />
              <span>RentEasy (4%)</span>
            </div>
            <strong className="commission-renteasy">₦{breakdown.rentEasy.toLocaleString()}</strong>
          </div>
          
          {/* Manager Commission */}
          <div className="breakdown-item commission-item">
            <div className="breakdown-label">
              <Users size={16} />
              <span>Manager (2.5%)</span>
            </div>
            <strong className="commission-manager">₦{breakdown.manager.toLocaleString()}</strong>
          </div>
          
          {/* Referral Commission */}
          {hasReferral && (
            <div className="breakdown-item commission-item">
              <div className="breakdown-label">
                <Users size={16} />
                <span>Referral (1%)</span>
              </div>
              <strong className="commission-referral">₦{breakdown.referral.toLocaleString()}</strong>
            </div>
          )}
          
          <div className="breakdown-separator">=</div>
          
          {/* Total Amount */}
          <div className="breakdown-item total-item">
            <div className="breakdown-label">
              <span>Total Payable</span>
            </div>
            <strong className="total-amount">₦{totalAmount.toLocaleString()}</strong>
          </div>
        </div>
        
        {/* Special Note for Outgoing Tenants */}
        {userRole === 'tenant' && (
          <div className="tenant-bonus-notice">
            <Info size={16} />
            <div>
              <strong>Outgoing Tenant Bonus:</strong> 
              <p>If you referred someone to RentEasy, you may qualify for a 1% referral bonus upon successful tenant takeover.</p>
            </div>
          </div>
        )}
        
        <div className="commission-note">
          <small>
            Commission is only charged upon successful tenant placement. 
            If no placement occurs, no commission is charged.
          </small>
        </div>
      </div>
    </div>
  );
};

export default CommissionNotice;