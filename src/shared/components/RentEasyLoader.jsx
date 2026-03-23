import React from 'react';
import './RentEasyLoader.css';

const RentEasyLoader = ({ message = 'Loading your dashboard...', fullScreen = false }) => {
  return (
    <div className={`renteasy-loader ${fullScreen ? 'fullscreen' : 'inline'}`}>
      <div className="loader-container">
        <div className="rotating-logo">
          <div className="logo-ring">
            <div className="logo-inner">
              <span className="letter-r">R</span>
            </div>
          </div>
        </div>
        <div className="loader-text">
          <p className="loading-message">{message}</p>
          <div className="loading-dots">
            <p className="tagline">Your trusted rental partner</p>
            <span>.</span><span>.</span><span>.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RentEasyLoader;