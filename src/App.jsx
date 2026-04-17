import React, { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { CapacitorUpdater } from '@capgo/capacitor-updater';
import { AuthProvider } from './shared/context/AuthContext';
import { AdminProvider } from './modules/admin/context/AdminContext';
import AppRoutes from './routes/AppRoutes';
import BottomNav from './shared/components/layout/BottomNav';
import { WebSocketProvider } from './shared/context/WebSocketContext';
import { ManagerProvider } from './shared/context/ManagerContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

function App() {
  useEffect(() => {
    // Only run on native platforms (Android/iOS), not in a browser
    if (Capacitor.isNativePlatform()) {
      const checkForUpdates = async () => {
        try {
          const result = await CapacitorUpdater.notifyAppReady();
          // result is true if the current version is working correctly
          console.log('[Capgo] Update status:', result);
        } catch (error) {
          console.error('[Capgo] Error notifying app ready:', error);
        }
      };
      checkForUpdates();
    }
  }, []);

  return (
    <Router>
      <AuthProvider>
        <AdminProvider>
          <WebSocketProvider>
            <ManagerProvider>
              <AppRoutes />
              <BottomNav />
            </ManagerProvider>
          </WebSocketProvider>
        </AdminProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;