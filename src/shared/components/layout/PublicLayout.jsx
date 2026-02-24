// src/shared/components/layout/PublicLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
// Corrected import paths (example):
import Header from '../../components/Header'; // If Header.jsx is in the parent 'components' folder
import BottomNav from './BottomNav'; // Apply the same logic to Footer

const PublicLayout = () => {
  return (
    <div className="public-layout">
      <Header />
      <main className="public-main">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
};

export default PublicLayout;