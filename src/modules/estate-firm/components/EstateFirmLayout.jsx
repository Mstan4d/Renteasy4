import React from 'react';
import { Outlet } from 'react-router-dom';
import EstateHeader from './EstateHeader';
import './EstateFirmLayout.css'; // optional

const EstateFirmLayout = () => {
  return (
    <div className="estate-firm-layout">
      <EstateHeader />
      <main className="estate-firm-content">
        <Outlet />
      </main>
    </div>
  );
};

export default EstateFirmLayout;