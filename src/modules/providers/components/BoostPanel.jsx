// src/modules/providers/components/BoostPanel.jsx
import React, { useState } from 'react';
import { Zap, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import './BoostPanel.css';

const BoostPanel = ({ isBoosted, boostExpiry, providerId }) => {
  const [showBoostOptions, setShowBoostOptions] = useState(false);
  
  const boostOptions = [
    { id: '7days', duration: '7 days', price: 2000, description: 'Quick visibility boost' },
    { id: '30days', duration: '30 days', price: 5000, description: 'Extended visibility' },
    { id: '90days', duration: '90 days', price: 12000, description: 'Long-term placement' }
  ];
  
  const handleBoostPurchase = (boostOption) => {
    // Simulate boost purchase
    const providers = JSON.parse(localStorage.getItem('serviceProviders') || '[]');
    const providerIndex = providers.findIndex(p => p.id === providerId);
    
    if (providerIndex !== -1) {
      const expiryDate = new Date();
      if (boostOption.id === '7days') expiryDate.setDate(expiryDate.getDate() + 7);
      if (boostOption.id === '30days') expiryDate.setDate(expiryDate.getDate() + 30);
      if (boostOption.id === '90days') expiryDate.setDate(expiryDate.getDate() + 90);
      
      providers[providerIndex] = {
        ...providers[providerIndex],
        isBoosted: true,
        boostExpiry: expiryDate.toISOString(),
        badges: {
          ...providers[providerIndex].badges,
          boosted: true
        }
      };
      
      localStorage.setItem('serviceProviders', JSON.stringify(providers));
      
      alert(`✅ Boost activated for ${boostOption.duration}! You'll appear higher in search results.`);
      setShowBoostOptions(false);
      window.location.reload();
    }
  };
  
  if (isBoosted) {
    return (
      <div className="boost-panel active">
        <div className="boost-content">
          <div className="boost-status">
            <Zap size={20} color="#f59e0b" />
            <div className="boost-text">
              <strong>Boosted Profile</strong>
              <span>
                Active until {new Date(boostExpiry).toLocaleDateString()}
              </span>
            </div>
          </div>
          <span className="boost-badge">
            <TrendingUp size={14} />
            BOOSTED
          </span>
        </div>
      </div>
    );
  }
  
  return (
    <div className="boost-panel">
      <div className="boost-content">
        <div className="boost-promo">
          <Zap size={20} color="#6b7280" />
          <div className="boost-text">
            <strong>Boost Your Visibility</strong>
            <span>Get more clients with paid boost</span>
          </div>
        </div>
        
        <button 
          className="btn btn-small btn-outline"
          onClick={() => setShowBoostOptions(!showBoostOptions)}
        >
          <TrendingUp size={14} />
          {showBoostOptions ? 'Hide Options' : 'View Boost Options'}
        </button>
        
        {showBoostOptions && (
          <div className="boost-options">
            <div className="options-header">
              <h4>Boost Options</h4>
              <p>Appear above non-boosted providers</p>
            </div>
            <div className="options-grid">
              {boostOptions.map(option => (
                <div key={option.id} className="boost-option">
                  <h5>{option.duration}</h5>
                  <div className="option-price">₦{option.price}</div>
                  <p>{option.description}</p>
                  <button 
                    className="btn btn-small btn-primary"
                    onClick={() => handleBoostPurchase(option)}
                  >
                    Select
                  </button>
                </div>
              ))}
            </div>
            <div className="boost-note">
              <Clock size={14} />
              <p>Boost is separate from subscription and verification</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BoostPanel;