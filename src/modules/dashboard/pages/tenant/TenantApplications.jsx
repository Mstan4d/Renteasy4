import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../../shared/lib/supabaseClient';
import { useAuth } from '../../../../shared/context/AuthContext';
import './TenantApplications.css';

const TenantApplications = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active'); 

  useEffect(() => {
    if (user) fetchApplications();
  }, [user, activeTab]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      // Fetching chats where the tenant is participant1
      // and joining listing details
      const { data: chats, error } = await supabase
        .from('chats')
        .select(`
          id,
          last_message,
          last_message_at,
          listing_id,
          listings (
            title,
            price,
            images,
            status,
            city,
            state,
            poster_name,
            is_managed
          )
        `)
        .eq('participant1_id', user.id);

      if (error) throw error;
      setData(chats || []);
    } catch (err) {
      console.error("Fetch error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tenant-container">
      <header className="mobile-header">
        <h1>My Applications</h1>
        <button className="fab-add" onClick={() => navigate('/listings')}>+</button>
      </header>

      <div className="tab-pill-container">
        {['active', 'rented', 'history'].map((tab) => (
          <button 
            key={tab} 
            className={`tab-pill ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="apps-feed">
        {loading ? (
          <div className="loader-container"><div className="spinner"></div></div>
        ) : data.length > 0 ? (
          data.map((item) => (
            <div key={item.id} className="app-card-modern">
              <div className="card-main" onClick={() => navigate(`/listings/${item.listing_id}`)}>
                <img 
                  src={item.listings?.images?.[0] || 'https://via.placeholder.com/100'} 
                  alt="Property" 
                />
                <div className="card-details">
                  <span className="price-tag">₦{item.listings?.price?.toLocaleString()}</span>
                  <h3>{item.listings?.title}</h3>
                  <p className="loc-text">{item.listings?.city}, {item.listings?.state}</p>
                </div>
              </div>

              <div className="card-footer-modern">
                <div className="msg-preview">
                  <span className="dot"></span>
                  <p>{item.last_message || "No messages yet"}</p>
                </div>
                <div className="action-row">
                  <button className="btn-msg" onClick={() => navigate(`/dashboard/messages`)}>
                    Chat {item.listings?.is_managed ? 'Manager' : 'Owner'}
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state-v2">
  <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏠</div>
  <h3>Your journey starts here</h3>
  <p>You haven't messaged any landlords or managers yet.</p>
  <button onClick={() => navigate('/listings')}>
    Browse Available Houses
  </button>
</div>
        )}
      </div>
    </div>
  );
};

export default TenantApplications;