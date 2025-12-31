import React from 'react';
import FinancialOverview from '../components/FinancialOverview';

const EstateAnalytics = () => {
  // This will get actual data from context/API in real app
  const properties = []; // Placeholder
  const dashboardStats = {}; // Placeholder
  
  return (
    <div className="estate-analytics">
      <FinancialOverview 
        properties={properties}
        dashboardStats={dashboardStats}
      />
    </div>
  );
};

export default EstateAnalytics;