import React from 'react';
import { CheckCircle, Home, MapPin, DollarSign, Image as ImageIcon, User, Shield, Receipt } from 'lucide-react';
import './ConfirmationStep.css';

const ConfirmationStep = ({ formData, commission, userRole, onSubmit, isSubmitting, onBack }) => {
  const formatPrice = (price) => {
    const num = parseFloat(price) || 0;
    return `₦${num.toLocaleString()}`;
  };

  const renderCommissionBreakdown = () => {
    if (userRole === 'estate-firm') {
      return (
        <div className="commission-breakdown-section">
          <h4><Shield size={18} /> Estate Firm Listing</h4>
          <div className="estate-commission-info">
            <p>✅ 0% Commission (Subscription Model)</p>
          </div>
        </div>
      );
    }

    return (
      <div className="commission-breakdown-section">
        <h4><Shield size={18} /> Commission Breakdown (7.5% Total)</h4>
        <div className="commission-grid">
          <div className="commission-item">
            <span>Annual Rent:</span>
            <span>{formatPrice(commission.annualRent)}</span>
          </div>
          <div className="commission-item">
            <span>Total Commission (7.5%):</span>
            <span>+ {formatPrice(commission.totalCommission)}</span>
          </div>
          <div className="commission-item highlight">
            <span>Your Poster Commission (1.5%):</span>
            <span className="poster-earn">+ {formatPrice(commission.posterCommission)}</span>
          </div>
          <div className="commission-item">
            <span>Manager Commission (2.5%):</span>
            <span>+ {formatPrice(commission.managerCommission)}</span>
          </div>
          <div className="commission-item">
            <span>RentEasy Platform (3.5%):</span>
            <span>+ {formatPrice(commission.rentEasyCommission)}</span>
          </div>
        </div>
      </div>
    );
  };

  const renderExtraFees = () => {
    const extraFees = formData.extra_fees || [];
    if (extraFees.length === 0) return null;

    return (
      <div className="extra-fees-section">
        <h4><Receipt size={18} /> Additional Fees</h4>
        <div className="extra-fees-list">
          {extraFees.map((fee, index) => (
            <div key={index} className="fee-item">
              <span className="fee-name">{fee.name}</span>
              <span className="fee-amount">+ {formatPrice(fee.amount)}</span>
              {fee.description && <small className="fee-description">({fee.description})</small>}
            </div>
          ))}
          <div className="fee-total">
            <span>Total Additional Fees:</span>
            <span>{formatPrice(extraFees.reduce((sum, f) => sum + (f.amount || 0), 0))}</span>
          </div>
        </div>
      </div>
    );
  };

  const totalImages = formData.images?.length || 0;

  // Contact info with fallback for both naming conventions (camelCase or underscore)
  const contactPhone = formData.contact_phone || formData.contactPhone || 'Not provided';
  const contactEmail = formData.contact_email || formData.contactEmail || 'Not provided';

  return (
    <div className="confirmation-step">
      <div className="step-header">
        <CheckCircle size={24} color="#10b981" />
        <h2>Final Confirmation</h2>
      </div>

      <div className="confirmation-content">
        {/* Property Summary Card */}
        <div className="summary-card">
          <h4><Home size={18} /> Property Details</h4>
          <div className="detail-item"><strong>Title:</strong> {formData.title}</div>
          <div className="detail-item"><strong>Location:</strong> {formData.address}, {formData.lga}, {formData.state}</div>
          <div className="detail-item"><strong>Property Type:</strong> {formData.property_type}</div>
          <div className="detail-item"><strong>Annual Rent:</strong> {formatPrice(formData.rent_amount)}</div>
        </div>

        {renderExtraFees()}
        {renderCommissionBreakdown()}

        <div className="images-summary-section">
          <h4><ImageIcon size={18} /> Images ({totalImages})</h4>
          <p>{totalImages} image{totalImages !== 1 ? 's' : ''} uploaded</p>
        </div>

        <div className="user-info-section">
          <h4><User size={18} /> Contact Details</h4>
          <p><strong>Phone:</strong> {contactPhone}</p>
          <p><strong>Email:</strong> {contactEmail}</p>
        </div>

        {formData.landlord_phone && (
          <div className="landlord-info">
            <p><strong>Landlord Phone:</strong> {formData.landlord_phone}</p>
          </div>
        )}
      </div>

      <div className="confirmation-actions">
        <button className="btn-secondary" onClick={onBack} disabled={isSubmitting}>
          Back to Edit
        </button>
        
      </div>
    </div>
  );
};

export default ConfirmationStep;