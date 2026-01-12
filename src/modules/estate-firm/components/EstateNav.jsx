import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, Building, Briefcase, DollarSign, 
  MessageSquare, Settings, Users, BarChart,
  FileText, Shield, Upload, LogOut,
  Menu, X, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useAuth } from '../../../shared/context/AuthContext';
import './EstateNav.css';

const EstateNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false); // For desktop collapse
  
  const navItems = [
    { path: '/dashboard/estate-firm', icon: Home, label: 'Overview' },
    { path: '/dashboard/estate-firm/properties', icon: Building, label: 'Portfolio' },
    { path: '/dashboard/estate-firm/services', icon: Briefcase, label: 'Services' },
    { path: '/dashboard/estate-firm/clients', icon: Users, label: 'Clients' },
    { path: '/dashboard/estate-firm/analytics', icon: BarChart, label: 'Analytics' },
    { path: '/dashboard/estate-firm/documents', icon: FileText, label: 'Documents' },
    { path: '/dashboard/estate-firm/verification', icon: Shield, label: 'Verification' },
    { path: '/dashboard/messages', icon: MessageSquare, label: 'Messages' },
    { path: '/dashboard/estate-firm/settings', icon: Settings, label: 'Settings' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handlePostProperty = () => {
    navigate('/dashboard/post-property');
  };

  const handlePostService = () => {
    navigate('/dashboard/estate-firm/post-service');
  };

  const handleBulkUpload = () => {
    navigate('/dashboard/estate-firm/bulk-upload');
  };

  // Handle body scroll when menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.classList.add('nav-open');
    } else {
      document.body.classList.remove('nav-open');
    }
    
    return () => {
      document.body.classList.remove('nav-open');
    };
  }, [mobileMenuOpen]);
  
  // Auto-close menu on route change (for mobile)
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);
  
  // Close menu when clicking escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [mobileMenuOpen]);

  return (
    <>
      {/* Mobile Menu Button - Only show on mobile */}
      <button 
        className="mobile-menu-btn d-lg-none"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Desktop Collapse Button */}
      <button 
        className="desktop-collapse-btn d-none d-lg-block"
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
      </button>

      <div className={`estate-nav ${mobileMenuOpen ? 'mobile-open' : ''} ${collapsed ? 'collapsed' : ''}`}>
        <div className="nav-header">
          <h3 className={collapsed ? 'text-center' : ''}>Estate Firm</h3>
          {!collapsed && <p className="nav-subtitle">Management Dashboard</p>}
        </div>
        
        <nav className="nav-menu">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${isActive ? 'active' : ''} ${collapsed ? 'collapsed' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
                title={collapsed ? item.label : ''}
              >
                <Icon size={20} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
        
        <div className={`nav-footer ${collapsed ? 'collapsed' : ''}`}>
          {!collapsed && (
            <>
              <button className="btn btn-primary" onClick={handlePostProperty}>
                <Building size={18} />
                Post Property
              </button>
              <button className="btn btn-outline" onClick={handlePostService}>
                <Briefcase size={18} />
                Post Service
              </button>
              <button className="btn btn-outline" onClick={handleBulkUpload}>
                <Upload size={18} />
                Bulk Upload
              </button>
            </>
          )}
          <button 
            className={`btn btn-text logout-btn ${collapsed ? 'collapsed' : ''}`}
            onClick={handleLogout}
            title={collapsed ? "Logout" : ""}
          >
            <LogOut size={18} />
            {!collapsed && "Logout"}
          </button>
        </div>
      </div>
      
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="mobile-nav-overlay d-lg-none"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  );
};

export default EstateNav;