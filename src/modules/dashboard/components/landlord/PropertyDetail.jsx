import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../../shared/context/AuthContext';
import { supabase } from '../../../../shared/lib/supabaseClient';
import { 
  ArrowLeft, Edit3, CheckCircle, Home, Users, 
  DollarSign, FileText, Activity, MapPin, Calendar,
  ShieldCheck, AlertCircle, Share2, Info
} from 'lucide-react';
import './PropertyDetail.css';

const PropertyDetail = () => {
  const { user } = useAuth();
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [property, setProperty] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (user && propertyId) fetchPropertyDetails();
  }, [user, propertyId]);

  const fetchPropertyDetails = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('id', propertyId)
        .single();

      if (error) throw error;
      setProperty(data);
    } catch (error) {
      console.error('Error fetching property:', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRented = async () => {
    const confirmRent = window.confirm(
      "Confirming this property as RENTED will notify the admin to verify the transaction for your 1.5% commission. Proceed?"
    );

    if (!confirmRent) return;

    try {
      // 1. Update Property Status
      const { error: updateError } = await supabase
        .from('listings')
        .update({ status: 'rented', updated_at: new Date() })
        .eq('id', propertyId);

      if (updateError) throw updateError;

      // 2. Insert into Commissions Table for Admin Review
      // Calculation: Price * 0.015 (1.5%)
      const commissionAmount = property.price * 0.015;
      
      const { error: commissionError } = await supabase
        .from('tenant_commissions')
        .insert([{
          property_id: propertyId,
          tenant_id: user.id, // Landlord as the poster
          commission_amount: commissionAmount,
          status: 'calculated', // Matches your manual payout logic
          property_title: property.title
        }]);

      if (commissionError) throw commissionError;

      alert('✅ Property marked as rented! Commission is now pending admin payout.');
      fetchPropertyDetails(); // Refresh view
    } catch (error) {
      alert('Error updating status: ' + error.message);
    }
  };

  if (isLoading) return <div className="loading-screen">Verifying Property Records...</div>;
  if (!property) return <div className="error-screen">Property Not Found.</div>;

  return (
    <div className="property-detail-container">
      {/* Header Section */}
      <header className="detail-header">
        <div className="header-top">
          <button className="back-btn-circle" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
          </button>
          <div className="header-labels">
            <span className={`badge-status ${property.status}`}>{property.status}</span>
            {property.verified && <span className="badge-verified"><ShieldCheck size={14}/> Verified</span>}
          </div>
        </div>
        
        <div className="header-main">
          <div className="title-group">
            <h1>{property.title}</h1>
            <p><MapPin size={16} /> {property.address}</p>
          </div>
          <div className="price-tag">
            <span>Monthly Rent</span>
            <h2>₦{Number(property.price).toLocaleString()}</h2>
          </div>
        </div>

        <div className="header-actions-row">
          <button className="action-btn secondary" onClick={() => navigate('edit')}>
            <Edit3 size={18} /> Edit Listing
          </button>
          {property.status === 'vacant' && (
            <button className="action-btn primary" onClick={handleMarkAsRented}>
              <CheckCircle size={18} /> Mark as Rented
            </button>
          )}
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="detail-tabs">
        <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>Overview</button>
        <button className={activeTab === 'financial' ? 'active' : ''} onClick={() => setActiveTab('financial')}>Earnings</button>
        <button className={activeTab === 'documents' ? 'active' : ''} onClick={() => setActiveTab('documents')}>Documents</button>
      </nav>

      {/* Tab Panels */}
      <div className="tab-panel">
        {activeTab === 'overview' && (
          <div className="overview-grid">
            <div className="info-card">
              <h3><Info size={18}/> Description</h3>
              <p>{property.description}</p>
            </div>
            <div className="specs-grid">
              <div className="spec-item"><span>Bedrooms</span><strong>{property.bedrooms}</strong></div>
              <div className="spec-item"><span>Bathrooms</span><strong>{property.bathrooms}</strong></div>
              <div className="spec-item"><span>Type</span><strong>{property.property_type}</strong></div>
            </div>
          </div>
        )}

        {activeTab === 'financial' && (
          <div className="financial-card">
            <h3>Commission Breakdown (1.5%)</h3>
            <div className="breakdown-row">
              <span>Potential Earning</span>
              <strong className="text-green">₦{(property.price * 0.015).toLocaleString()}</strong>
            </div>
            <p className="note">This amount is moved to your 'Pending Payout' once the property is marked as rented.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyDetail;