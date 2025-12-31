import React from 'react'
import { HashRouter as Router } from 'react-router-dom'
import { AuthProvider } from './shared/context/AuthContext'
import { AdminProvider } from './modules/admin/context/AdminContext'
import AppRoutes from './routes/AppRoutes'
import BottomNav from './shared/components/layout/BottomNav'
import { WebSocketProvider } from './shared/context/WebSocketContext'

function App() {
  return (
    <AuthProvider>
      <AdminProvider>
        <WebSocketProvider>
          <Router>
            <AppRoutes />
            <BottomNav />
          </Router>
        </WebSocketProvider>
      </AdminProvider>
    </AuthProvider>
  )
}

export default App