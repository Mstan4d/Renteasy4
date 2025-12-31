// src/shared/components/layout/DashboardLayout.jsx - UPDATED
import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, NavLink, useLocation } from 'react-router-dom'; // Added useLocation
import { useAuth } from '../../context/AuthContext';
import Header from '../Header';
import BottomNav from './BottomNav';
import './DashboardLayout.css';

// Import Lucide icons
import {
  Building, Briefcase, Users, DollarSign,
  BarChart, FileText, Home, MessageSquare,
  User, Settings, Shield, Bell,
  TrendingUp, PieChart, ClipboardCheck,
  Globe, Wallet, CreditCard, Receipt,
  Star, FileCheck, Wrench, Folder,
  History, ClipboardList, Heart
} from 'lucide-react';

const DashboardLayout = () => {
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userStats, setUserStats] = useState({
    referralEarnings: 0,
    activeListings: 0,
    totalListings: 0,
    unreadMessages: 0,
    portfolioValue: 0,
    activeClients: 0,
    monthlyRevenue: 0
  });
  
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); // Get current location
  
  // Check if user is estate firm AND on estate firm routes
  const isEstateFirmUser = user?.role === 'estate-firm';
  const isEstateFirmRoute = location.pathname.startsWith('/dashboard/estate-firm');
  
  // Don't show main sidebar for estate firm users on their routes
  // They have their own sidebar (EstateNav)
  const showMainSidebar = !(isEstateFirmUser && isEstateFirmRoute);

  // ================= ENHANCED NAVIGATION CONFIGURATION =================
  
  // Define icon mapping for consistent icon usage
  const ICON_MAP = {
    overview: <BarChart size={20} />,
    properties: <Building size={20} />,
    portfolio: <TrendingUp size={20} />,
    services: <Briefcase size={20} />,
    clients: <Users size={20} />,
    financial: <DollarSign size={20} />,
    analytics: <PieChart size={20} />,
    messages: <MessageSquare size={20} />,
    profile: <User size={20} />,
    settings: <Settings size={20} />,
    admin: <Shield size={20} />,
    verification: <ClipboardCheck size={20} />,
    earnings: <Wallet size={20} />,
    payments: <CreditCard size={20} />,
    rentals: <Home size={20} />,
    saved: <Star size={20} />,
    documents: <Folder size={20} />,
    maintenance: <Wrench size={20} />,
    applications: <ClipboardList size={20} />,
    history: <History size={20} />,
    referrals: <Users size={20} />
  };

  // ========== TENANT SPECIFIC NAVIGATION ITEMS ==========
  const TENANT_NAV_ITEMS = [
    {
      id: 'overview',
      path: '/dashboard/tenant',
      label: 'Overview',
      icon: ICON_MAP.overview,
      description: 'Dashboard overview'
    },
    {
      id: 'applications',
      path: '/dashboard/tenant/applications',
      label: 'Applications',
      icon: ICON_MAP.applications,
      description: 'View and manage your applications'
    },
    {
      id: 'saved',
      path: '/dashboard/tenant/saved',
      label: 'Saved Properties',
      icon: ICON_MAP.saved,
      description: 'View saved properties'
    },
    {
      id: 'rental-history',
      path: '/dashboard/tenant/rental-history',
      label: 'Rental History',
      icon: ICON_MAP.history,
      description: 'View your rental history'
    },
    {
      id: 'payments',
      path: '/dashboard/tenant/payments',
      label: 'Payments',
      icon: ICON_MAP.payments,
      description: 'Manage rent payments'
    },
    {
      id: 'maintenance',
      path: '/dashboard/tenant/maintenance',
      label: 'Maintenance',
      icon: ICON_MAP.maintenance,
      description: 'Submit and track maintenance requests'
    },
    {
      id: 'documents',
      path: '/dashboard/tenant/documents',
      label: 'Documents',
      icon: ICON_MAP.documents,
      description: 'Manage your important documents'
    },
    {
      id: 'referrals',
      path: '/dashboard/tenant/referrals',
      label: 'Referrals',
      icon: ICON_MAP.referrals,
      description: 'Refer friends and earn rewards'
    },
    {
      id: 'messages',
      path: '/dashboard/messages',
      label: 'Messages',
      icon: ICON_MAP.messages,
      badge: 'unreadMessages',
      description: 'View and send messages'
    },
    {
      id: 'profile',
      path: '/dashboard/tenant/profile',
      label: 'Profile',
      icon: ICON_MAP.profile,
      description: 'Manage your profile'
    },
    {
      id: 'settings',
      path: '/dashboard/tenant/settings',
      label: 'Settings',
      icon: ICON_MAP.settings,
      description: 'Account settings'
    },
    {
      id: 'verify',
      path: '/verify',
      label: 'Get Verified',
      icon: ICON_MAP.verification,
      description: 'Complete account verification'
    }
  ];

  const NAV_ITEMS_BY_ROLE = {
    // Common items for all authenticated users
    common: [
      {
        path: '/dashboard',
        label: 'Overview',
        icon: ICON_MAP.overview,
        roles: ['tenant', 'landlord', 'manager', 'provider', 'estate-firm', 'admin'],
        description: 'Dashboard overview'
      },
      {
        path: '/dashboard/messages',
        label: 'Messages',
        icon: ICON_MAP.messages,
        roles: ['tenant', 'landlord', 'manager', 'provider', 'estate-firm', 'admin'],
        badge: 'unreadMessages',
        description: 'View and send messages'
      }
    ],
    
    // Tenant-specific items (will use the full TENANT_NAV_ITEMS array)
    tenant: TENANT_NAV_ITEMS,
    
    // Landlord-specific items
    landlord: [
      {
        path: '/dashboard/landlord',
        label: 'Landlord Dashboard',
        icon: ICON_MAP.properties,
        roles: ['landlord'],
        description: 'Landlord management dashboard'
      },
      {
        path: '/dashboard/landlord/profile',
        label: 'Profile',
        icon: ICON_MAP.profile,
        roles: ['landlord'],
        description: 'Manage your landlord profile'
      },
      {
        path: '/dashboard/post-property',
        label: 'Post Property',
        icon: <FileText size={20} />,
        roles: ['landlord', 'manager', 'estate-firm'],
        description: 'Create new property listing'
      }
    ],
    
    // Estate Firm specific items - Only show these when NOT on estate firm routes
    'estate-firm': [
      {
        path: '/dashboard',
        label: 'Back to Dashboard',
        icon: ICON_MAP.overview,
        roles: ['estate-firm'],
        description: 'Return to main dashboard'
      },
      {
        path: '/dashboard/post-property',
        label: 'Post Property',
        icon: <FileText size={20} />,
        roles: ['estate-firm'],
        description: 'Create new property listing'
      },
      {
        path: '/dashboard/messages',
        label: 'Messages',
        icon: ICON_MAP.messages,
        roles: ['estate-firm'],
        description: 'View and send messages'
      },
      {
        path: '/dashboard/estate-firm/profile',
        label: 'Profile',
        icon: ICON_MAP.profile,
        roles: ['estate-firm'],
        description: 'Manage your estate firm profile'
      }
    ],
    
    // Manager-specific items
    manager: [
      {
        path: '/dashboard/managed-properties',
        label: 'Managed Properties',
        icon: <Users size={20} />,
        roles: ['manager'],
        description: 'Properties you manage'
      }
    ],
    
    // Admin-specific items
    admin: [
      {
        path: '/admin',
        label: 'Admin Dashboard',
        icon: ICON_MAP.admin,
        roles: ['admin'],
        description: 'Platform administration'
      }
    ]
  };
  
  // ================= USER STATS FETCHING =================
  
  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const mockStats = {
          referralEarnings: user?.role === 'landlord' ? 125000 : 
                          user?.role === 'estate-firm' ? 450000 : 0,
          activeListings: user?.role === 'landlord' ? 3 : 
                         user?.role === 'estate-firm' ? 12 : 0,
          totalListings: user?.role === 'landlord' ? 5 : 
                        user?.role === 'estate-firm' ? 23 : 0,
          unreadMessages: 3,
          portfolioValue: user?.role === 'estate-firm' ? 125000000 : 0,
          activeClients: user?.role === 'estate-firm' ? 8 : 0,
          monthlyRevenue: user?.role === 'estate-firm' ? 2500000 : 0
        };
        
        setUserStats(mockStats);
        setUnreadCount(mockStats.unreadMessages);
      } catch (error) {
        console.error('Error fetching user stats:', error);
      }
    };
    
    if (user) {
      fetchUserStats();
    }
  }, [user]);
  
  const getNavigationItems = () => {
    if (!user) return [];
    
    // For tenants, return all tenant navigation items
    if (user.role === 'tenant') {
      return TENANT_NAV_ITEMS;
    }
    
    // For estate firm users on estate firm routes, show limited navigation
    if (user.role === 'estate-firm' && isEstateFirmRoute) {
      // On estate firm routes, they use their own sidebar (EstateNav)
      // So we don't show the main sidebar navigation
      return [];
    }
    
    // For other roles, combine common and role-specific items
    const commonItems = NAV_ITEMS_BY_ROLE.common.filter(item =>
      item.roles.includes(user.role)
    );
    
    const roleSpecificItems = NAV_ITEMS_BY_ROLE[user.role] || [];
    
    return [...commonItems, ...roleSpecificItems];
  };
  
  const getBadgeCount = (badgeKey) => {
    return userStats[badgeKey] || 0;
  };
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  const closeSidebarOnMobile = () => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };
  
  // Get user display name based on role
  const getUserDisplayName = () => {
    if (user?.role === 'estate-firm') {
      return user.firmName || user.name || 'Estate Firm';
    }
    return user?.name || user?.email?.split('@')[0] || 'User';
  };
  
  // Get user display role with proper labels
  const getUserDisplayRole = () => {
    const roleMap = {
      'tenant': 'Tenant',
      'landlord': 'Landlord',
      'estate-firm': 'Estate Firm',
      'manager': 'Property Manager',
      'admin': 'Administrator',
      'provider': 'Service Provider'
    };
    return roleMap[user?.role] || user?.role || 'User';
  };
  
  // Get user avatar based on role
  const getUserAvatar = () => {
    if (user?.avatar) return user.avatar;
    
    // Role-based default avatars
    const roleAvatars = {
      'estate-firm': '🏢',
      'landlord': '🏠',
      'tenant': '👤',
      'manager': '💼',
      'admin': '👑'
    };
    
    return roleAvatars[user?.role] || '👤';
  };
  
  // Don't render if no user (should be caught by ProtectedRoute)
  if (!user) {
    return null;
  }
  
  const navigationItems = getNavigationItems();
  
  // Check if user is tenant for special styling
  const isTenant = user?.role === 'tenant';
  
  return (
    <div className="dashboard-layout">
      {/* App Header */}
      <Header />
      
      <div className="dashboard-container">
        {/* Sidebar Navigation - Conditionally render based on user role and route */}
        {showMainSidebar && (
          <aside className={`sidebar ${sidebarOpen ? 'open' : ''} ${isTenant ? 'tenant-sidebar' : ''}`}>
            {/* Enhanced User Profile Section */}
            <div className="sidebar-profile">
              <div className="profile-avatar">
                <div className="avatar-placeholder">
                  {getUserAvatar()}
                </div>
              </div>
              <div className="profile-info">
                <h3 className="profile-name">{getUserDisplayName()}</h3>
                <p className="profile-role">
                  <span className={`role-badge ${user?.role}`}>
                    {getUserDisplayRole()}
                    {user?.isVerified && <span className="verified-dot" title="Verified"></span>}
                  </span>
                </p>
                <p className="profile-email">{user?.email}</p>
                
                {/* Trust Score for tenants */}
                {isTenant && (
                  <div className="tenant-quick-stats">
                    <div className="quick-stat">
                      <span className="stat-label">Trust Score</span>
                      <span className="stat-value score-high">
                        {user?.isVerified ? '85' : '65'}/100
                      </span>
                    </div>
                    {!user?.isVerified && (
                      <button 
                        className="verify-prompt-btn"
                        onClick={() => navigate('/verify')}
                      >
                        Get Verified
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {/* Navigation Items */}
            <nav className="sidebar-nav" onClick={closeSidebarOnMobile}>
              <ul className="nav-menu">
                {navigationItems.map((item) => {
                  const badgeCount = item.badge ? getBadgeCount(item.badge) : 0;
                  
                  return (
                    <li key={item.id || item.path} className="nav-item">
                      <NavLink
                        to={item.path}
                        className={({ isActive }) => 
                          `nav-link ${isActive ? 'active' : ''}`
                        }
                        title={item.description}
                        end={item.path === '/dashboard' || item.path === '/dashboard/tenant'}
                      >
                        <span className="nav-icon" aria-hidden="true">
                          {item.icon}
                        </span>
                        <span className="nav-label">{item.label}</span>
                        {badgeCount > 0 && (
                          <span className="nav-badge">{badgeCount}</span>
                        )}
                      </NavLink>
                    </li>
                  );
                })}
                
                {/* Logout Button */}
                <li className="nav-item logout-item">
                  <button
                    onClick={handleLogout}
                    className="nav-link logout-link"
                    title="Logout from your account"
                  >
                    <span className="nav-icon" aria-hidden="true">🚪</span>
                    <span className="nav-label">Logout</span>
                  </button>
                </li>
              </ul>
            </nav>
            
            {/* Referral Section for tenants */}
            {isTenant && (
              <div className="sidebar-referral">
                <h4>Refer & Earn</h4>
                <p>Invite friends and earn ₦5,000 for each successful referral</p>
                <button 
                  className="referral-btn"
                  onClick={() => navigate('/dashboard/tenant/referrals')}
                >
                  Invite Friends
                </button>
              </div>
            )}
            
            {/* Quick Actions for all users */}
            <div className="quick-actions">
              <h4>Quick Actions</h4>
              <div className="action-buttons">
                {user?.role === 'tenant' && (
                  <>
                    <button 
                      className="action-btn"
                      onClick={() => navigate('/dashboard/post-property')}
                    >
                      <span className="action-icon">➕</span>
                      <span>List Property</span>
                    </button>
                    <button 
                      className="action-btn"
                      onClick={() => navigate('/listings')}
                    >
                      <span className="action-icon">🔍</span>
                      <span>Browse Properties</span>
                    </button>
                  </>
                )}
                {user?.role === 'landlord' && (
                  <button 
                    className="action-btn"
                    onClick={() => navigate('/dashboard/post-property')}
                  >
                    <span className="action-icon">➕</span>
                    <span>Post Property</span>
                  </button>
                )}
                {user?.role === 'estate-firm' && !isEstateFirmRoute && (
                  <button 
                    className="action-btn"
                    onClick={() => navigate('/dashboard/estate-firm')}
                  >
                    <span className="action-icon">🏢</span>
                    <span>Estate Dashboard</span>
                  </button>
                )}
                <button 
                  className="action-btn"
                  onClick={() => navigate('/dashboard/messages')}
                >
                  <span className="action-icon">💬</span>
                  <span>Messages</span>
                </button>
              </div>
            </div>
          </aside>
        )}
        
        {/* Main Content Area */}
        <main className={`dashboard-main ${!showMainSidebar ? 'full-width' : ''}`}>
          {/* Mobile Sidebar Toggle Button - Only show when sidebar should be visible */}
          {showMainSidebar && (
            <button 
              className="sidebar-toggle"
              onClick={toggleSidebar}
              aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
              aria-expanded={sidebarOpen}
            >
              {sidebarOpen ? '✕' : '☰'}
            </button>
          )}
          
          {/* Page Content */}
          <div className="dashboard-content">
            <Outlet /> {/* Renders child dashboard pages */}
          </div>
        </main>
      </div>
      
      {/* Bottom Navigation (Mobile only) - Only show when sidebar should be visible */}
      {showMainSidebar && <BottomNav />}
    </div>
  );
};

export default DashboardLayout;