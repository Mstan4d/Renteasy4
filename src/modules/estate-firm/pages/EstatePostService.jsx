import React from 'react';
import ServicePostForm from '../components/ServicePostForm';

const EstatePostService = () => {
  // Mock firm details - in real app, get from auth context
  const firmDetails = {
    id: 'firm_001',
    name: 'Your Estate Firm',
    contact: {
      email: 'contact@firm.com',
      phone: '+2348012345678',
      website: 'https://firm.com'
    },
    verified: true,
    rating: 4.8
  };

  const handleSuccess = (serviceData) => {
    console.log('Service posted successfully:', serviceData);
  };

  return (
    
    <div className="estate-post-service">
      <EstateNav />
      <ServicePostForm 
        firmDetails={firmDetails}
        onSuccess={handleSuccess}
      />
    </div>
  );
};

export default EstatePostService;