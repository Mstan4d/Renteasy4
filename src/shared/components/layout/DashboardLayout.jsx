// src/shared/components/layout/DashboardLayout.jsx - SIMPLIFIED VERSION
import React from 'react';
import { Outlet } from 'react-router-dom';
import './DashboardLayout.css';

const DashboardLayout = () => {
  // This is just a minimal wrapper for any generic dashboard content
  return (
    <div className="dashboard-layout">
      <Outlet />
    </div>
  );
};

export default DashboardLayout;