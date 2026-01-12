import React from 'react';
import { Outlet } from 'react-router-dom';
import ProviderSidebar from './ProviderSidebar';
import '../../../styles/providers/provider-general.css';


const ProviderLayout = () => {
  return (
    <div className="provider-layout">
      <ProviderSidebar />
      <main className="provider-main">
        <div className="provider-container">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default ProviderLayout;