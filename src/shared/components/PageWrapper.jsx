// src/shared/components/PageWrapper.jsx
import React, { useEffect } from 'react';
import './PageWrapper.css';

const PageWrapper = ({ children, className = '' }) => {
  // Reset scroll position on mount
  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Cleanup function
    return () => {
      // Any cleanup if needed
    };
  }, []);

  return (
    <div className={`page-wrapper ${className}`}>
      {children}
    </div>
  );
};

export default PageWrapper;