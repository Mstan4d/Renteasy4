// src/modules/properties/components/CommissionNotice.jsx
import React from 'react';
import { Info, Building, Users, TrendingUp, DollarSign, Shield, Receipt } from 'lucide-react';
import './CommissionNotice.css';

const CommissionNotice = ({ price, userRole, extraFees = [] }) => {
  if (!price || parseFloat(price) <= 0) {
    return (
      <div className="commission-notice info">
        <div className="commission-header">
          <Info size={20} />
          <h3>Enter Annual Rent to See Commission</h3>
        </div>
        <p>Add a price above to see how much the tenant will pay.</p>
      </div>
    );
  }

  const baseRent = parseFloat(price) || 0;
  const isEstateFirm = userRole === 'estate-firm';

  // Commission breakdown (7.5% of base rent)
  const totalCommission = baseRent * 0.075;
  const managerShare = baseRent * 0.025;   // 2.5%
  const referrerShare = baseRent * 0.015;  // 1.5%
  const rentEasyShare = baseRent * 0.035;  // 3.5%

  // Extra fees
  const totalExtraFees = extraFees.reduce((sum, fee) => sum + (parseFloat(fee.amount) || 0), 0);

  // Total payable
  // CommissionNotice.jsx (excerpt)
const totalPayable = baseRent + (isEstateFirm ? 0 : totalCommission) + totalExtraFees;

  return (
    <div className={`commission-notice ${isEstateFirm ? 'estate' : 'regular'}`}>
      <div className="commission-header">
        <Shield size={20} />
        <h3>
          {isEstateFirm ? '🏢 Estate Firm Listing' : '💰 Commission & Fees Breakdown'}
        </h3>
      </div>

      <div className="commission-details">
        {/* Base Rent */}
        <div className="breakdown-item base-rent">
          <span>Annual Rent</span>
          <strong>₦{baseRent.toLocaleString()}</strong>
        </div>

        {!isEstateFirm && (
          <>
            {/* Commission (added) */}
            <div className="commission-addons">
              <div className="breakdown-item commission">
                <span>Commission (7.5%):</span>
                <div className="commission-split">
                  <span>Manager (2.5%) +₦{managerShare.toLocaleString()}</span>
                  <span>Referrer (1.5%) +₦{referrerShare.toLocaleString()}</span>
                  <span>RentEasy (3.5%) +₦{rentEasyShare.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Extra Fees Section */}
        {extraFees.length > 0 && (
          <div className="extra-fees-summary">
            <div className="extra-fees-header">
              <Receipt size={16} />
              <span>Additional Fees</span>
            </div>
            {extraFees.map((fee, idx) => (
              <div key={idx} className="extra-fee-item">
                <span>{fee.name}{fee.description && <small> ({fee.description})</small>}</span>
                <span>+₦{parseFloat(fee.amount || 0).toLocaleString()}</span>
              </div>
            ))}
            <div className="extra-fees-total">
              <span>Total Additional Fees</span>
              <span>₦{totalExtraFees.toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* Total Payable */}
        <div className="breakdown-item total">
          <span>Total Tenant Pays</span>
          <strong className="total-amount">₦{totalPayable.toLocaleString()}</strong>
        </div>

        {/* Poster Earnings */}
        {!isEstateFirm && (
          <div className="poster-earnings">
            <DollarSign size={16} />
            <span>
              <strong>You earn ₦{referrerShare.toLocaleString()}</strong> (1.5% referral commission)
              when this property rents.
            </span>
          </div>
        )}

        {isEstateFirm && (
          <div className="poster-earnings">
            <Building size={16} />
            <span>Estate firms pay 0% commission (subscription model). Additional fees still apply.</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommissionNotice;