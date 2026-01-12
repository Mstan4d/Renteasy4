import React from 'react'
import { BrowserRouter as Router } from 'react-router-dom' // MAKE SURE IT'S BrowserRouter
import { AuthProvider } from './shared/context/AuthContext'
import { AdminProvider } from './modules/admin/context/AdminContext'
import AppRoutes from './routes/AppRoutes'
import BottomNav from './shared/components/layout/BottomNav'
import { WebSocketProvider } from './shared/context/WebSocketContext'
import { ManagerProvider } from './shared/context/ManagerContext'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

function App() {
  return (
    <AuthProvider>
      <AdminProvider>
        <WebSocketProvider>
         <ManagerProvider>
          <Router> {/* THIS MUST BE BrowserRouter */}
            <AppRoutes />
            <BottomNav />
          </Router>
         </ManagerProvider>
        </WebSocketProvider>
      </AdminProvider>
    </AuthProvider>
  )
}

export default App