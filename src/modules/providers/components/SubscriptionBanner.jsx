// src/modules/providers/components/SubscriptionBanner.jsx
import React from 'react';
import { AlertCircle, CreditCard, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import './SubscriptionBanner.css';

const SubscriptionBanner = ({ 
  bookingCount, 
  isSubscribed, 
  requiresSubscription,
  subscriptionExpiry 
}) => {
  // Calculate remaining free bookings
  const remainingFreeBookings = Math.max(0, 10 - bookingCount);
  
  if (isSubscribed) {
    return (
      <div className="subscription-banner subscribed">
        <div className="banner-content">
          <CheckCircle size={20} />
          <div className="banner-text">
            <strong>Subscribed ✓</strong>
            <span>
              Active until {subscriptionExpiry ? new Date(subscriptionExpiry).toLocaleDateString() : 'N/A'}
            </span>
          </div>
          <Link to="/providers/subscription" className="btn btn-small btn-outline">
            Manage Subscription
          </Link>
        </div>
      </div>
    );
  }
  
  if (requiresSubscription) {
    return (
      <div className="subscription-banner required">
        <div className="banner-content">
          <AlertCircle size={20} />
          <div className="banner-text">
            <strong>Subscription Required</strong>
            <span>
              You've used all {bookingCount} free bookings. Please subscribe to continue.
            </span>
          </div>
          <Link to="/providers/subscribe" className="btn btn-small btn-primary">
            <CreditCard size={16} />
            Subscribe Now (₦3,000/month)
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="subscription-banner free">
      <div className="banner-content">
        <div className="banner-text">
          <strong>Free Period Active</strong>
          <span>
            {remainingFreeBookings} free booking{remainingFreeBookings !== 1 ? 's' : ''} remaining
            ({bookingCount}/10 used)
          </span>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${(bookingCount / 10) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionBanner;