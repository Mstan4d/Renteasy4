import React from 'react';

const ProviderPageTemplate = ({ 
  title, 
  subtitle, 
  children, 
  actions 
}) => {
  return (
    <div className="provider-page">
      <div className="provider-page-header">
        <div>
          <h1 className="page-title">{title}</h1>
          {subtitle && <p className="page-subtitle">{subtitle}</p>}
        </div>
        {actions && <div className="page-actions">{actions}</div>}
      </div>
      
      <div className="provider-content">
        {children}
      </div>
    </div>
  );
};

export default ProviderPageTemplate;