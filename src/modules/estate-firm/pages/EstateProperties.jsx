import React from 'react';
import PortfolioManager from '../components/PortfolioManager';

const EstateProperties = () => {
  // This will get actual properties from context/API in real app
  const properties = []; // Placeholder
  
  const handleAddProperty = (type) => {
    console.log(`Add ${type} property`);
  };

  const handleBulkUpload = () => {
    console.log('Bulk upload');
  };

  const handleEditProperty = (property) => {
    console.log('Edit property:', property);
  };

  return (
    <div className="estate-properties">
      <PortfolioManager 
        properties={properties}
        onAddProperty={handleAddProperty}
        onBulkUpload={handleBulkUpload}
        onEditProperty={handleEditProperty}
      />
    </div>
  );
};

export default EstateProperties;