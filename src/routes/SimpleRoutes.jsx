import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import SuperAdminLayout from '../modules/super-admin/components/SuperAdminLayout';
import CommandCenterPage from '../modules/super-admin/pages/CommandCenterPage';
import AdminManagementPage from '../modules/super-admin/pages/AdminManagementPage';

const SimpleRoutes = () => {
  return (
    <Routes>
      {/* Super Admin Routes - SIMPLIFIED */}
      <Route path="/super-admin" element={<SuperAdminLayout />}>
        <Route index element={<CommandCenterPage />} />
        <Route path="command-center" element={<CommandCenterPage />} />
        <Route path="admin-management" element={<AdminManagementPage />} />
      </Route>
      
      {/* Redirect to super admin */}
      <Route path="/" element={<Navigate to="/super-admin" replace />} />
    </Routes>
  );
};

export default SimpleRoutes;