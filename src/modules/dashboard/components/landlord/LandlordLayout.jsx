import React, { useState } from 'react';
import { Outlet, useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../../../../shared/context/AuthContext';
import {
  Home, Building, DollarSign, MessageSquare, 
  User, Settings, Bell, Wallet, Share2, 
  BarChart3, LogOut, PlusCircle, Menu, X
} from 'lucide-react';
import './LandlordLayout.css';

const LandlordLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Remove ALL other navigation imports
  const navItems = [
    { id: 'overview', path: '/dashboard/landlord', label: 'Overview', icon: <Home size={20} /> },
    { id: 'properties', path: '/dashboard/landlord/properties', label: 'Properties', icon: <Building size={20} /> },
    { id: 'earnings', path: '/dashboard/landlord/earnings', label: 'Earnings', icon: <DollarSign size={20} /> },
    { id: 'wallet', path: '/dashboard/landlord/wallet', label: 'Wallet', icon: <Wallet size={20} /> },
    { id: 'referrals', path: '/dashboard/landlord/referrals', label: 'Referrals', icon: <Share2 size={20} /> },
    { id: 'messages', path: '/dashboard/messages', label: 'Messages', icon: <MessageSquare size={20} /> },
    { id: 'analytics', path: '/dashboard/landlord/analytics', label: 'Analytics', icon: <BarChart3 size={20} /> },
  ];

  return (
    <div className="landlord-app-wrapper">
      {/* ONLY ONE SIDEBAR */}
      <aside className={`landlord-sidebar ${sidebarOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-icon"><Building size={24} color="white" /></div>
          <span>RentEasy<span className="pro-tag">PRO</span></span>
        </div>

        {/* ONLY ONE NAVIGATION */}
        <div className="sidebar-nav-container">
          <div className="nav-group">
            <p className="nav-group-label">Main Menu</p>
            {navItems.map((item) => (
              <NavLink
                key={item.id}
                to={item.path}
                className={({ isActive }) => `nav-link-item ${isActive ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
                end={item.path === '/dashboard/landlord'}
              >
                <span className="link-icon">{item.icon}</span>
                <span className="link-label">{item.label}</span>
              </NavLink>
            ))}
          </div>

          <div className="nav-group secondary">
            <p className="nav-group-label">Account</p>
            <NavLink to="/dashboard/landlord/profile" className="nav-link-item">
              <User size={20} /> <span>Profile</span>
            </NavLink>
            <NavLink to="/dashboard/landlord/settings" className="nav-link-item">
              <Settings size={20} /> <span>Settings</span>
            </NavLink>
            <button onClick={logout} className="nav-link-item logout-btn-sidebar">
              <LogOut size={20} /> <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      <div className="landlord-content-stack">
        <header className="landlord-navbar">
          <div className="navbar-left">
            <button className="mobile-menu-trigger" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <h2 className="page-context-title">Landlord Portal</h2>
          </div>

          <div className="navbar-right">
           
            <button className="nav-icon-btn"><Bell size={20} /></button>
            <div className="nav-user-pill">
              <div className="user-avatar-sm">{user?.name?.charAt(0)}</div>
              <span className="user-name-sm">{user?.name?.split(' ')[0]}</span>
            </div>
          </div>
        </header>

        <main className="landlord-main-viewport">
          <Outlet />
        </main>
      </div>
      
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>}
    </div>
  );
};

export default LandlordLayout;