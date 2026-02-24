import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../shared/context/AuthContext';
import { supabase } from '../../../../shared/lib/supabaseClient';
import { 
  PlusCircle, DollarSign, Building, Users, 
  TrendingUp, CheckCircle, Clock, AlertCircle,
  Copy, ExternalLink, Eye, Edit, Trash2,
  Filter, Search, Download, Upload
} from 'lucide-react';
import './LandlordDashboard.css';

const LandlordDashboard = () => {
  const [stats, setStats] = useState({
    totalEarnings: 0,
    commission: 0,
    listings: 0,
    referrals: 0
  });
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLandlordStats = async () => {
      if (!user) return;
      setLoading(true);

      try {
        // 1. Fetch count of properties
        const { count: propertyCount } = await supabase
          .from('listings')
          .select('*', { count: 'exact', head: true })
          .eq('owner_id', user.id);

        // 2. Fetch successful bookings
        const { data: bookings } = await supabase
          .from('bookings')
          .select('total_price')
          .eq('poster_id', user.id)
          .eq('status', 'completed');

        const totalRev = bookings?.reduce((acc, curr) => acc + curr.total_price, 0) || 0;
        
        // 3. Fetch properties
        const { data: propertiesData } = await supabase
          .from('listings')
          .select('*')
          .eq('owner_id', user.id)
          .limit(5);

        setStats({
          listings: propertyCount || 0,
          totalEarnings: totalRev,
          commission: totalRev * 0.015,
          referrals: 0
        });

        setProperties(propertiesData || []);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLandlordStats();
  }, [user]);

  const handlePostProperty = () => {
    const confirmed = window.confirm(
      '🏠 POST PROPERTY - COMMISSION STRUCTURE\n\n' +
      'TOTAL COMMISSION: 7.5%\n' +
      '• Manager: 2.5% (verifies & monitors)\n' +
      '• You (as Poster): 1.5% (you post = you earn!)\n' +
      '• RentEasy: 3.5% (platform fee)\n\n' +
      '💰 YOU EARN 1.5% when this property gets rented!\n\n' +
      'Do you understand and agree?'
    );
    
    if (confirmed) {
      navigate('/post-property');
    }
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '₦0';
    return `₦${parseFloat(amount).toLocaleString('en-NG')}`;
  };

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="landlord-dashboard-content">
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <h1>Welcome back, {user?.name || 'Landlord'}</h1>
        <p className="subtitle">Here's what's happening with your properties</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <DollarSign size={24} />
          </div>
          <div className="stat-info">
            <p className="stat-label">Net Balance</p>
            <p className="stat-value">{formatCurrency(stats.totalEarnings)}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon commission">
            <TrendingUp size={24} />
          </div>
          <div className="stat-info">
            <p className="stat-label">Your Commission (1.5%)</p>
            <p className="stat-value">{formatCurrency(stats.commission)}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Building size={24} />
          </div>
          <div className="stat-info">
            <p className="stat-label">Total Listings</p>
            <p className="stat-value">{stats.listings}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Users size={24} />
          </div>
          <div className="stat-info">
            <p className="stat-label">Referral Bonus</p>
            <p className="stat-value">{formatCurrency(stats.referrals)}</p>
          </div>
        </div>
      </div>

      {/* Action Banner */}
      <div className="action-banner">
        <div className="banner-content">
          <h3>Ready to list a new property?</h3>
          <p>Remember, you earn 1.5% commission as the poster!</p>
        </div>
        <button onClick={handlePostProperty} className="add-property-btn">
          <PlusCircle size={20} /> Post Listing
        </button>
      </div>

      {/* Recent Properties */}
      {properties.length > 0 && (
        <div className="recent-properties">
          <div className="section-header">
            <h2>Recent Properties</h2>
            <button 
              onClick={() => navigate('/dashboard/landlord/properties')}
              className="view-all-btn"
            >
              View All
            </button>
          </div>
          
          <div className="properties-grid">
            {properties.map((property) => (
              <div key={property.id} className="property-card">
                <div className="property-image">
                  <img 
                    src={property.images?.[0] || '/default-property.jpg'} 
                    alt={property.title} 
                  />
                </div>
                <div className="property-info">
                  <h4>{property.title}</h4>
                  <p className="property-address">{property.address}</p>
                  <div className="property-details">
                    <span className="price">{formatCurrency(property.price)}/month</span>
                    <span className={`status ${property.status}`}>
                      {property.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LandlordDashboard;