import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  FaTachometerAlt, FaUser, FaClipboardList, FaCalendarAlt, 
  FaMoneyBill, FaWallet, FaCog, FaBell, FaChartLine, FaBullhorn,
  FaImage, FaMapMarkerAlt, FaFileAlt, FaComments, FaHandshake,
  FaCheckCircle, FaTools, FaBars, FaTimes, FaEllipsisV,
  FaHome, FaDollarSign, FaCreditCard, FaHistory, FaChartBar,
  FaUserCheck, FaFolderOpen, FaTags, FaClock, FaPercentage,
  FaSignOutAlt
} from 'react-icons/fa';
import './ProviderSidebar.css'

const ProviderSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const sidebarRef = useRef();

  const navItems = [
    { path: '/dashboard/provider/dashboard', label: 'Dashboard', icon: <FaTachometerAlt /> },
    { path: '/dashboard/provider/profile', label: 'Profile', icon: <FaUser /> },
    { path: '/dashboard/provider/portfolio', label: 'Portfolio', icon: <FaImage /> },
    { path: '/dashboard/provider/leads', label: 'Leads', icon: <FaClipboardList /> },
    { path: '/dashboard/provider/bookings', label: 'Bookings', icon: <FaCalendarAlt /> },
    { path: '/dashboard/provider/calendar', label: 'Calendar', icon: <FaClock /> },
    { path: '/dashboard/provider/earnings', label: 'Earnings', icon: <FaMoneyBill /> },
    { path: '/dashboard/provider/payouts', label: 'Payouts', icon: <FaDollarSign /> },
    { path: '/dashboard/provider/wallet', label: 'Wallet', icon: <FaWallet /> },
    { path: '/dashboard/provider/transactions', label: 'Transactions', icon: <FaHistory /> },
    { path: '/dashboard/provider/payment-methods', label: 'Payment Methods', icon: <FaCreditCard /> },
    { path: '/dashboard/provider/services', label: 'Services', icon: <FaTools /> },
    { path: '/dashboard/provider/post-service', label: 'Post Service', icon: <FaFolderOpen /> },
    { path: '/dashboard/provider/service-categories', label: 'Categories', icon: <FaTags /> },
    { path: '/dashboard/provider/pricing', label: 'Pricing', icon: <FaPercentage /> },
    { path: '/dashboard/provider/analytics', label: 'Analytics', icon: <FaChartLine /> },
    { path: '/dashboard/provider/performance', label: 'Performance', icon: <FaChartBar /> },
    { path: '/dashboard/provider/verify', label: 'Get Verified', icon: <FaCheckCircle /> },
    { path: '/dashboard/provider/verification-status', label: 'Verification Status', icon: <FaUserCheck /> },
    { path: '/dashboard/provider/compliance', label: 'Compliance', icon: <FaCheckCircle /> },
    { path: '/dashboard/provider/boost', label: 'Boost Profile', icon: <FaBullhorn /> },
    { path: '/dashboard/provider/boost-history', label: 'Boost History', icon: <FaHistory /> },
    { path: '/dashboard/provider/referral', label: 'Referral Program', icon: <FaHandshake /> },
    { path: '/dashboard/provider/availability', label: 'Availability', icon: <FaCalendarAlt /> },
    { path: '/dashboard/provider/location-setup', label: 'Service Area', icon: <FaMapMarkerAlt /> },
    { path: '/dashboard/provider/documents', label: 'Documents', icon: <FaFileAlt /> },
    { path: '/dashboard/provider/messages', label: 'Messages', icon: <FaComments /> },
    { path: '/dashboard/provider/notifications', label: 'Notifications', icon: <FaBell /> },
    { path: '/dashboard/provider/support', label: 'Support', icon: <FaHandshake /> },
    { path: '/dashboard/provider/settings', label: 'Settings', icon: <FaCog /> },
    { path: '/dashboard/provider/subscription', label: 'Subscription', icon: <FaCreditCard /> },
    { path: '/dashboard/provider/billing', label: 'Billing', icon: <FaDollarSign /> },
  ];

  const handleLogout = () => {
    localStorage.removeItem('renteasy_user');
    localStorage.removeItem('renteasy_token');
    navigate('/login');
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenuOpen && sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setMobileMenuOpen(false);
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [mobileMenuOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  // Get user email
  const getUserEmail = () => {
    try {
      const user = JSON.parse(localStorage.getItem('renteasy_user') || '{}');
      return user?.email || 'provider@example.com';
    } catch (error) {
      return 'provider@example.com';
    }
  };

  return (
    <>
      {/* Mobile Toggle Button (Always visible on mobile) */}
      <button 
        className="mobile-toggle"
        onClick={toggleMobileMenu}
        aria-label="Toggle menu"
      >
        {mobileMenuOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* Sidebar */}
      <div 
        ref={sidebarRef}
        className={`provider-sidebar ${isCollapsed ? 'collapsed' : ''} ${mobileMenuOpen ? 'mobile-open' : ''}`}
      >
        {/* Sidebar Header */}
        <div className="sidebar-header">
          {!isCollapsed && <h3 className="provider-logo">RentEasy Provider</h3>}

          {/* Collapse button for desktop */}
          <button 
            className="sidebar-toggle"
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <FaBars /> : <FaTimes />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="nav-icon">{item.icon}</span>
              {!isCollapsed && <span className="nav-label">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="provider-info">
            <div className="provider-avatar">
              <span>P</span>
            </div>
            {!isCollapsed && (
              <div className="provider-details">
                <h4>Service Provider</h4>
                <p className="provider-email">{getUserEmail()}</p>
              </div>
            )}
          </div>
          <button 
            className="logout-btn"
            onClick={handleLogout}
            title={isCollapsed ? "Logout" : ""}
          >
            <FaSignOutAlt className="logout-icon" />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  );
};

export default ProviderSidebar;