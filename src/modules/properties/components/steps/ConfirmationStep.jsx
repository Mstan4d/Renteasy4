// src/modules/properties/components/steps/ConfirmationStep.jsx
import React from 'react';
import { 
  CheckCircle, 
  MapPin, 
  Home, 
  Phone, 
  Mail, 
  Image as ImageIcon,
  User,
  Calendar,
  Shield,
  AlertCircle
} from 'lucide-react';
import './ConfirmationStep.css';

const ConfirmationStep = ({ 
  formData, 
  commission, 
  userRole, 
  onSubmit, 
  onRequestVerification, 
  isSubmitting 
}) => {
  const totalImages = Object.values(formData.images).reduce((sum, arr) => sum + arr.length, 0);
  
  // Format price with commas
  const formatPrice = (price) => {
    const num = parseFloat(price) || 0;
    return `₦${num.toLocaleString()}`;
  };

  // Format commission breakdown
  const renderCommissionBreakdown = () => {
    const { listingPrice, totalPrice, breakdown } = commission;
    
    return (
      <div className="commission-breakdown-section">
        <h4>
          <Shield size={18} />
          Commission Breakdown (7.5%)
        </h4>
        
        <div className="commission-grid">
          <div className="commission-item">
            <span className="commission-label">Listing Price:</span>
            <span className="commission-value">{formatPrice(listingPrice)}</span>
          </div>
          
          <div className="commission-item breakdown">
            <span className="commission-label">RentEasy (4%):</span>
            <span className="commission-value renteasy">+ {formatPrice(breakdown.rentEasy)}</span>
          </div>
          
          <div className="commission-item breakdown">
            <span className="commission-label">Manager (2.5%):</span>
            <span className="commission-value manager">+ {formatPrice(breakdown.manager)}</span>
          </div>
          
          {breakdown.referral > 0 && (
            <div className="commission-item breakdown">
              <span className="commission-label">Referral (1%):</span>
              <span className="commission-value referral">+ {formatPrice(breakdown.referral)}</span>
            </div>
          )}
          
          <div className="commission-item total">
            <span className="commission-label">Total Payable:</span>
            <span className="commission-value total-price">{formatPrice(totalPrice)}</span>
          </div>
        </div>
      </div>
    );
  };

  // Render image summary
  const renderImageSummary = () => {
    const groups = [
      { key: 'kitchen', label: 'Kitchen' },
      { key: 'dining', label: 'Living/Dining' },
      { key: 'outside', label: 'Exterior' },
      { key: 'inside', label: 'Interior' },
      { key: 'other', label: 'Other' }
    ];

    return (
      <div className="images-summary-section">
        <h4>
          <ImageIcon size={18} />
          Images ({totalImages})
        </h4>
        
        <div className="image-groups-summary">
          {groups.map(group => (
            <div key={group.key} className="image-group-summary">
              <span className="group-label">{group.label}:</span>
              <span className={`group-count ${formData.images[group.key].length > 0 ? 'has-images' : 'no-images'}`}>
                {formData.images[group.key].length} image{formData.images[group.key].length !== 1 ? 's' : ''}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render user role info
  const renderUserRoleInfo = () => {
    const roleDisplay = {
      'tenant': 'Outgoing Tenant',
      'landlord': 'Landlord',
      'manager': 'Property Manager',
      'admin': 'Administrator'
    };

    return (
      <div className="user-info-section">
        <h4>
          <User size={18} />
          Posting Information
        </h4>
        <div className="user-details">
          <div className="detail-item">
            <span className="detail-label">Posted as:</span>
            <span className="detail-value role">{roleDisplay[userRole]}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Name:</span>
            <span className="detail-value">{formData.userName || 'Not specified'}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Email:</span>
            <span className="detail-value">{formData.userEmail}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Phone:</span>
            <span className="detail-value">{formData.contactPhone}</span>
          </div>
        </div>
        
        {/* Landlord consent for tenants */}
        {userRole === 'tenant' && (
          <div className={`consent-status ${formData.hasLandlordConsent ? 'consented' : 'not-consented'}`}>
            <CheckCircle size={16} />
            <span>
              {formData.hasLandlordConsent 
                ? 'Landlord has been informed (admin will verify)'
                : 'Landlord has NOT been informed - listing may be rejected'}
            </span>
          </div>
        )}
      </div>
    );
  };

  // Render property details
  const renderPropertyDetails = () => {
    return (
      <div className="property-details-section">
        <h4>
          <Home size={18} />
          Property Details
        </h4>
        
        <div className="property-details-grid">
          <div className="detail-card">
            <h5>Basic Information</h5>
            <div className="detail-item">
              <span className="detail-label">Title:</span>
              <span className="detail-value">{formData.title}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Type:</span>
              <span className="detail-value">{formData.propertyType}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Price:</span>
              <span className="detail-value price">{formatPrice(formData.price)}/month</span>
            </div>
          </div>
          
          <div className="detail-card">
            <h5>Location</h5>
            <div className="detail-item">
              <span className="detail-label">Address:</span>
              <span className="detail-value">{formData.address}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">State:</span>
              <span className="detail-value">{formData.state}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">LGA:</span>
              <span className="detail-value">{formData.lga}</span>
            </div>
            {formData.coordinates?.lat && (
              <div className="detail-item">
                <span className="detail-label">Coordinates:</span>
                <span className="detail-value">
                  {formData.coordinates.lat.toFixed(6)}, {formData.coordinates.lng.toFixed(6)}
                </span>
              </div>
            )}
          </div>
          
          <div className="detail-card description-card">
            <h5>Description</h5>
            <div className="description-content">
              {formData.description || 'No description provided'}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render referral info
  const renderReferralInfo = () => {
    if (!formData.referralCode) return null;
    
    return (
      <div className="referral-info-section">
        <h4>
          <CheckCircle size={18} />
          Referral Information
        </h4>
        <div className="referral-details">
          <div className="detail-item">
            <span className="detail-label">Referral Code:</span>
            <span className="detail-value code">{formData.referralCode}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Referral Bonus:</span>
            <span className="detail-value bonus">
              {formatPrice(commission.listingPrice * 0.01)} (1%)
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="confirmation-step">
      <div className="step-header success-header">
        <CheckCircle size={24} className="success-icon" />
        <div>
          <h2>Ready to Submit!</h2>
          <p className="step-description">
            Review all details below. Once submitted, your listing will go through the verification process.
          </p>
        </div>
      </div>

      {/* Status Notice */}
      <div className="status-notice">
        <AlertCircle size={20} />
        <div>
          <h4>Submission Status</h4>
          <p>
            Your listing will be marked as <strong>Unverified</strong> and sent to the admin queue.
            {userRole === 'tenant' && ' Admin will contact your landlord for verification.'}
            {userRole === 'landlord' && ' Admin will review and verify your property.'}
            {userRole === 'manager' && ' Admin will verify and assign a manager if needed.'}
          </p>
        </div>
      </div>

      {/* Property Details */}
      {renderPropertyDetails()}

      {/* Commission Breakdown */}
      {renderCommissionBreakdown()}

      {/* Images Summary */}
      {renderImageSummary()}

      {/* User Info */}
      {renderUserRoleInfo()}

      {/* Referral Info */}
      {renderReferralInfo()}

      {/* Terms and Conditions */}
      <div className="terms-section">
        <h4>Terms & Conditions</h4>
        <div className="terms-content">
          <div className="term-item">
            <CheckCircle size={16} />
            <span>I confirm that all information provided is accurate</span>
          </div>
          <div className="term-item">
            <CheckCircle size={16} />
            <span>I understand the 7.5% commission structure</span>
          </div>
          <div className="term-item">
            <CheckCircle size={16} />
            <span>I agree to RentEasy's terms of service</span>
          </div>
          {userRole === 'tenant' && (
            <div className="term-item">
              <CheckCircle size={16} />
              <span>I confirm I have landlord consent for tenant takeover</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="confirmation-actions">
        {userRole !== 'tenant' && (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onRequestVerification}
            disabled={isSubmitting}
          >
            Request Verification
          </button>
        )}
        
        <button
          type="button"
          className="btn btn-success submit-btn"
          onClick={onSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="spinner"></span>
              Submitting...
            </>
          ) : (
            <>
              <CheckCircle size={18} />
              Submit Listing
            </>
          )}
        </button>
      </div>

      {/* Important Notes */}
      <div className="important-notes">
        <h5>
          <AlertCircle size={16} />
          Important Notes
        </h5>
        <ul>
          <li>Listing will be visible only after admin verification</li>
          <li>Commission is only charged upon successful tenant placement</li>
          <li>You will be notified via email about listing status updates</li>
          <li>You can edit the listing before it's verified</li>
          <li>Chat system will be activated once listing is live</li>
        </ul>
      </div>
    </div>
  );
};

export default ConfirmationStep;