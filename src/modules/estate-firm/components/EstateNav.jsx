import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, Building, Briefcase, DollarSign, 
  MessageSquare, Settings, Users, BarChart,
  FileText, Shield, Upload, LogOut,
  Menu, X
} from 'lucide-react';
import { useAuth } from '../../../shared/context/AuthContext';
import './EstateNav.css';

const EstateNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  
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

  return (
    <>
      {/* Mobile Menu Button */}
      <button 
        className="mobile-menu-btn"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <div className={`estate-nav ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="nav-header">
          <h3>Estate Firm</h3>
          <p className="nav-subtitle">Management Dashboard</p>
        </div>
        
        <nav className="nav-menu">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        
        <div className="nav-footer">
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
          <button 
            className="btn btn-text logout-btn"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>
      
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="mobile-nav-overlay"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  );
};

export default EstateNav;