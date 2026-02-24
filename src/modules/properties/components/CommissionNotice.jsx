// src/modules/properties/components/CommissionNotice.jsx - UPDATED
import React from 'react';
import { Info, Building, Users, TrendingUp, DollarSign, Shield } from 'lucide-react';

const CommissionNotice = ({ price, userRole, commission }) => {
  if (!price || parseFloat(price) <= 0) {
    return (
      <div className="commission-notice info">
        <div className="commission-header">
          <Info size={20} />
          <h3>Enter Annual Rent to See Commission</h3>
        </div>
        <p>Add a price above to see how much you'll earn</p>
      </div>
    );
  }

  const listingPrice = parseFloat(price) || 0;
  
  // Get commission based on user role
  const getCommissionInfo = () => {
    if (userRole === 'estate-firm') {
      return {
        title: '🏢 Estate Firm Listing',
        total: 0,
        breakdown: {
          rentEasy: 0,
          manager: 0,
          poster: 0
        },
        message: '0% RentEasy Commission - Subscription Model',
        color: 'var(--color-purple)'
      };
    }

    // Regular commission: 7.5% total
    const total = listingPrice * 0.075;
    return {
      title: userRole === 'tenant' ? '👤 Tenant Commission' : '🏠 Landlord Commission',
      total: total,
      breakdown: {
        rentEasy: listingPrice * 0.035, // 3.5%
        manager: listingPrice * 0.025,   // 2.5%
        poster: listingPrice * 0.015     // 1.5% - YOU GET THIS!
      },
      message: `Total Commission: 7.5% (You earn 1.5% as poster)`,
      color: userRole === 'tenant' ? 'var(--color-blue)' : 'var(--color-green)'
    };
  };

  const commissionInfo = getCommissionInfo();
  const totalPayable = listingPrice;

  return (
    <div className="commission-notice" style={{ borderColor: commissionInfo.color }}>
      <div className="commission-header">
        <Shield size={20} />
        <h3>{commissionInfo.title}</h3>
      </div>
      
      <div className="commission-details">
        <p className="commission-description">
          {userRole === 'estate-firm' ? (
            '✅ Estate firms pay subscription, NO commission on rentals'
          ) : (
            'A <strong>7.5% commission</strong> is deducted from the rent when the property is rented.'
          )}
        </p>
        
        <div className="commission-breakdown">
          <div className="breakdown-item">
            <div className="breakdown-label">
              <Building size={16} />
              <span>Monthly Rent</span>
            </div>
            <strong className="price">₦{listingPrice.toLocaleString()}</strong>
          </div>
          
          {userRole !== 'estate-firm' && (
            <>
              <div className="breakdown-separator">-</div>
              
              {/* RentEasy Commission */}
              <div className="breakdown-item commission-item">
                <div className="breakdown-label">
                  <TrendingUp size={16} />
                  <span>RentEasy (3.5%)</span>
                </div>
                <strong className="commission-renteasy">₦{commissionInfo.breakdown.rentEasy.toLocaleString()}</strong>
              </div>
              
              {/* Manager Commission */}
              <div className="breakdown-item commission-item">
                <div className="breakdown-label">
                  <Users size={16} />
                  <span>Manager (2.5%)</span>
                </div>
                <strong className="commission-manager">₦{commissionInfo.breakdown.manager.toLocaleString()}</strong>
              </div>
              
              {/* Poster Commission - YOU GET THIS! */}
              <div className="breakdown-item commission-item highlight">
                <div className="breakdown-label">
                  <DollarSign size={16} />
                  <span>You Earn (1.5%)</span>
                </div>
                <strong className="commission-poster">₦{commissionInfo.breakdown.poster.toLocaleString()}</strong>
              </div>
              
              <div className="breakdown-separator">=</div>
            </>
          )}
          
          {/* Total Amount */}
          <div className="breakdown-item total-item">
            <div className="breakdown-label">
              <span>{userRole === 'estate-firm' ? 'Total Rent' : 'Net Amount You Receive'}</span>
            </div>
            <strong className="total-amount">
              ₦{userRole === 'estate-firm' 
                ? listingPrice.toLocaleString()
                : (listingPrice - commissionInfo.breakdown.rentEasy - commissionInfo.breakdown.manager).toLocaleString()
              }
            </strong>
          </div>
        </div>
        
        {/* Business Rule Explanation */}
        <div className="commission-note">
          {userRole === 'estate-firm' ? (
            <p>
              <strong>Estate Firm Rules:</strong> Monthly subscription required. 
              No commission on rentals. Direct contact with tenants.
            </p>
          ) : userRole === 'tenant' ? (
            <p>
              <strong>Outgoing Tenant Bonus:</strong> You earn <strong>1.5% commission</strong> 
              (₦{commissionInfo.breakdown.poster.toLocaleString()}) when someone rents your vacating property.
              Manager handles verification and tenant contact.
            </p>
          ) : (
            <p>
              <strong>Landlord Earnings:</strong> You earn <strong>1.5% commission</strong> 
              (₦{commissionInfo.breakdown.poster.toLocaleString()}) for posting your property.
              Total commission 7.5% (You: 1.5%, Manager: 2.5%, RentEasy: 3.5%).
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommissionNotice;