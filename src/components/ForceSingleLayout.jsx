// src/components/ForceSingleLayout.jsx
import React, { useEffect } from 'react';

const ForceSingleLayout = ({ children }) => {
  useEffect(() => {
    // Remove all sidebars except landlord-sidebar
    const allSidebars = document.querySelectorAll(`
      aside, 
      .sidebar, 
      [class*="sidebar"],
      nav[class*="sidebar"]
    `);
    
    allSidebars.forEach(sidebar => {
      if (!sidebar.classList.contains('landlord-sidebar')) {
        sidebar.remove(); // Completely remove from DOM
      }
    });
    
    // Also remove any DashboardLayout remnants
    const dashboardLayouts = document.querySelectorAll('.dashboard-layout, .dashboard-container');
    dashboardLayouts.forEach(el => {
      if (!el.closest('.landlord-app-wrapper')) {
        el.remove();
      }
    });
  }, []);

  return <>{children}</>;
};

export default ForceSingleLayout;