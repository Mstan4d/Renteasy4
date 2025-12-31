import React from 'react';
import ClientManager from '../components/ClientManager';

const EstateClients = () => {
  // This will get actual properties from context/API in real app
  const properties = []; // Placeholder
  
  return (
    <div className="estate-clients">
      <ClientManager properties={properties} />
    </div>
  );
};

export default EstateClients;