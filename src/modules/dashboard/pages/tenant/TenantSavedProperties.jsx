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
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) fetchSavedProperties();
  }, [user]);

  const fetchSavedProperties = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching saved properties for user:', user.id);
      
      // Fetch saved properties with a JOIN to listings
      const { data: savedData, error: savedError } = await supabase
        .from('saved_properties')
        .select(`
          id,
          created_at,
          listing_id,
          listings:listing_id (
            id,
            title,
            price,
            images,
            city,
            state,
            bedrooms,
            bathrooms,
            property_type,
            status,
            address
          )
        `)
        .eq('user_id', user.id);

      if (savedError) {
        console.error('Error fetching saved properties:', savedError);
        throw savedError;
      }

      console.log('Raw saved data:', savedData);

      if (!savedData || savedData.length === 0) {
        setSavedProperties([]);
        setLoading(false);
        return;
      }

      // Transform the data to a flat structure
      const transformedProperties = savedData.map(item => {
        const listing = item.listings;
        if (!listing) return null;
        
        return {
          ...listing,
          saved_id: item.id,
          saved_at: item.created_at
        };
      }).filter(Boolean);

      console.log('Transformed properties:', transformedProperties);
      setSavedProperties(transformedProperties);
      
    } catch (err) {
      console.error("Error loading saves:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const removeFromSaved = async (savedId, listingId) => {
    try {
      const { error } = await supabase
        .from('saved_properties')
        .delete()
        .eq('id', savedId);

      if (error) throw error;
      
      // Update local state
      setSavedProperties(prev => prev.filter(p => p.id !== listingId));
      
    } catch (err) {
      console.error("Failed to remove property:", err);
      alert("Failed to remove property");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const getFirstImage = (images) => {
    if (!images) return 'https://via.placeholder.com/300x200?text=No+Image';
    if (Array.isArray(images) && images.length > 0) return images[0];
    if (typeof images === 'string') {
      try {
        const parsed = JSON.parse(images);
        return parsed[0] || 'https://via.placeholder.com/300x200?text=No+Image';
      } catch {
        return images;
      }
    }
    return 'https://via.placeholder.com/300x200?text=No+Image';
  };

  if (loading) return <div className="loader">Loading your saved properties...</div>;
  
  if (error) return (
    <div className="error-state">
      <p>Error loading saved properties: {error}</p>
      <button onClick={fetchSavedProperties}>Retry</button>
    </div>
  );

  return (
    <div className="saved-container">
      <header className="saved-header-v2">
        <div>
          <h1>Saved Homes</h1>
          <p>{savedProperties.length} {savedProperties.length === 1 ? 'property' : 'properties'} saved</p>
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
                  <img 
                    src={getFirstImage(prop.images)} 
                    alt={prop.title || 'Property'} 
                  />
                  <button 
                    className="remove-pill" 
                    onClick={() => removeFromSaved(prop.saved_id, prop.id)}
                  >
                    Remove
                  </button>
                  {prop.saved_at && (
                    <div className="saved-date-badge">
                      Saved {formatDate(prop.saved_at)}
                    </div>
                  )}
                </div>
                
                <div className="card-info">
                  <div className="price-section">
                    <span className="save-price">₦{prop.price?.toLocaleString() || '0'}</span>
                    <span className="price-period">/year</span>
                  </div>
                  <h3>{prop.title || 'Untitled Property'}</h3>
                  <p className="location">{prop.city || prop.state || 'Location not specified'}</p>
                  
                  <div className="property-details-mini">
                    {prop.bedrooms && <span>🛏️ {prop.bedrooms} bed</span>}
                    {prop.bathrooms && <span>🚿 {prop.bathrooms} bath</span>}
                    {prop.property_type && <span>🏠 {prop.property_type}</span>}
                  </div>
                  
                  <div className="card-actions-v2">
                    <button className="view-btn" onClick={() => navigate(`/listings/${prop.id}`)}>
                      View Details
                    </button>
                    <button className="contact-btn primary" onClick={() => navigate(`/dashboard/messages?listingId=${prop.id}`)}>
                      Contact Owner
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Comparison Section */}
          {savedProperties.length >= 2 && (
            <div className="comparison-card">
              <h3>Quick Compare</h3>
              <div className="table-responsive">
                <table className="comparison-table">
                  <thead>
                    <tr>
                      <th>Feature</th>
                      {savedProperties.slice(0, 4).map(p => (
                        <th key={p.id}>{p.title?.substring(0, 20) || 'Property'}...</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>Price</strong></td>
                      {savedProperties.slice(0, 4).map(p => (
                        <td key={p.id}>₦{p.price?.toLocaleString() || '0'}</td>
                      ))}
                    </tr>
                    <tr>
                      <td><strong>Bedrooms</strong></td>
                      {savedProperties.slice(0, 4).map(p => (
                        <td key={p.id}>{p.bedrooms || 'N/A'}</td>
                      ))}
                    </tr>
                    <tr>
                      <td><strong>Bathrooms</strong></td>
                      {savedProperties.slice(0, 4).map(p => (
                        <td key={p.id}>{p.bathrooms || 'N/A'}</td>
                      ))}
                    </tr>
                    <tr>
                      <td><strong>Property Type</strong></td>
                      {savedProperties.slice(0, 4).map(p => (
                        <td key={p.id}>{p.property_type || 'N/A'}</td>
                      ))}
                    </tr>
                    <tr>
                      <td><strong>Location</strong></td>
                      {savedProperties.slice(0, 4).map(p => (
                        <td key={p.id}>{p.city || p.state || 'N/A'}</td>
                      ))}
                    </tr>
                    <tr>
                      <td><strong>Status</strong></td>
                      {savedProperties.slice(0, 4).map(p => (
                        <td key={p.id}>
                          <span className={`status-badge ${p.status}`}>
                            {p.status === 'approved' ? 'Available' : p.status || 'Unknown'}
                          </span>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="empty-saves-v2">
          <div className="icon">⭐</div>
          <h2>Your shortlist is empty</h2>
          <p>Heart properties while browsing to save them here for easy comparison.</p>
          <button className="btn-primary-cta" onClick={() => navigate('/listings')}>
            Start Browsing
          </button>
        </div>
      )}
    </div>
  );
};

export default TenantSavedProperties;