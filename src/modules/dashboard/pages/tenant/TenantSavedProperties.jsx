import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../../shared/lib/supabaseClient';
import { useAuth } from '../../../../shared/context/AuthContext';
import './TenantSavedProperties.css';

const TenantSavedProperties = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [savedProperties, setSavedProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchSavedProperties();
  }, [user]);

  const fetchSavedProperties = async () => {
    setLoading(true);
    try {
      // Fetch saved_properties AND the associated listing data in one go
      const { data, error } = await supabase
        .from('saved_properties')
        .select(`
          id,
          listing_id,
          listings (*)
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      // Flatten the data so 'listings' properties are easy to access
      setSavedProperties(data.map(item => item.listings) || []);
    } catch (err) {
      console.error("Error loading saves:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const removeFromSaved = async (listingId) => {
    try {
      const { error } = await supabase
        .from('saved_properties')
        .delete()
        .eq('user_id', user.id)
        .eq('listing_id', listingId);

      if (error) throw error;
      setSavedProperties(prev => prev.filter(p => p.id !== listingId));
    } catch (err) {
      alert("Failed to remove property");
    }
  };

  if (loading) return <div className="loader">Optimizing your shortlist...</div>;

  return (
    <div className="saved-container">
      <header className="saved-header-v2">
  <div>
    <h1>Saved Homes</h1>
    <p>{savedProperties.length} properties interested you</p>
  </div>
  <button className="btn-browse" onClick={() => navigate('/listings')}>
    Find More
  </button>
</header>

      {savedProperties.length > 0 ? (
        <div className="saved-content">
          <div className="saved-list-modern">
            {savedProperties.map(prop => (
              <div key={prop.id} className="modern-save-card">
                <div className="card-img-wrapper">
                  <img src={prop.images?.[0] || 'https://via.placeholder.com/300'} alt={prop.title} />
                  <button className="remove-pill" onClick={() => removeFromSaved(prop.id)}>
                    Remove
                  </button>
                </div>
                
                <div className="card-info">
                  <span className="save-price">₦{prop.price?.toLocaleString()}</span>
                  <h3>{prop.title}</h3>
                  <p>{prop.city}, {prop.state}</p>
                  
                  <div className="card-actions-v2">
                    <button onClick={() => navigate(`/listings/${prop.id}`)}>View</button>
                    <button className="primary" onClick={() => navigate(`/messages`)}>Message</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Comparison remains as requested, but sleek */}
          <div className="comparison-card">
            <h3>Quick Compare</h3>
            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>Feature</th>
                    {savedProperties.map(p => <th key={p.id}>{p.title.substring(0, 15)}...</th>)}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Price</td>
                    {savedProperties.map(p => <td key={p.id}>₦{p.price?.toLocaleString()}</td>)}
                  </tr>
                  <tr>
                    <td>Rooms</td>
                    {savedProperties.map(p => <td key={p.id}>{p.bedrooms} Bed / {p.bathrooms} Bath</td>) }
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="empty-saves-v2">
          <div className="icon">⭐</div>
          <h2>Shortlist is empty</h2>
          <p>Heart properties while browsing to compare them here.</p>
          <button className="btn-primary-cta" onClick={() => navigate('/listings')}>Start Browsing</button>
        </div>
      )}
    </div>
  );
};

export default TenantSavedProperties;