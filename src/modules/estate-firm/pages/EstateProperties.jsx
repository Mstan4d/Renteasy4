import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../shared/lib/supabaseClient';
import { useAuth } from '../../../shared/context/AuthContext';
import PortfolioManager from '../components/PortfolioManager'; // ✅ import the component
import './EstateProperties.css';

const EstateProperties = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [externalProperties, setExternalProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadProperties();
    }
  }, [user]);

  const loadProperties = async () => {
    try {
      setLoading(true);

      // Load RentEasy properties
      const { data: rentEasyData, error: rentEasyError } = await supabase
        .from('listings')
        .select('*, landlord:profiles!landlord_id(name, email), tenant:profiles!tenant_id(name, email)')
        .eq('estate_firm_id', user.id)
        .order('created_at', { ascending: false });

      if (rentEasyError) throw rentEasyError;

      // Load external properties
      const { data: externalData, error: externalError } = await supabase
        .from('external_properties')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (externalError) throw externalError;

      // Transform external properties to match RentEasy properties format
      const transformedExternal = (externalData || []).map(prop => ({
        id: prop.id,
        title: prop.property_name,
        address: prop.address,
        property_type: prop.property_type,
        price: prop.rent_amount,
        rent_frequency: prop.rent_frequency,
        status: 'occupied', // Assume external properties are occupied
        source: 'external',
        client: {
          name: prop.client_name,
          email: prop.client_email,
          phone: prop.client_phone
        },
        commission_rate: prop.commission_rate,
        management_level: prop.management_level,
        rent_due_date: prop.next_rent_due,
        created_at: prop.created_at
      }));

      setProperties(rentEasyData || []);
      setExternalProperties(transformedExternal);

    } catch (error) {
      console.error('Error loading properties:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handlers for PortfolioManager props
  const handleAddProperty = (type) => {
    if (type === 'rent-easy') {
      navigate('/post-property?type=estate-firm');
    } else {
      // For external properties, open a modal or navigate to external property form
      alert('Add external property – feature coming soon');
    }
  };

  const handleBulkUpload = () => {
    navigate('/dashboard/estate-firm/bulk-upload');
  };

  const handleEditProperty = (property) => {
    // For now, just navigate to the listing detail page (if it's a RentEasy property)
    if (property.source === 'external') {
      alert('Edit external property – feature coming soon');
    } else {
      navigate(`/listings/${property.id}`);
    }
  };

  // Calculate stats (optional, for page header)
  const allProperties = [...properties, ...externalProperties];
  const portfolioStats = {
    totalProperties: allProperties.length,
    rentEasyListings: properties.length,
    externalProperties: externalProperties.length,
    occupiedProperties: allProperties.filter(p => p.status === 'occupied').length,
    totalValue: allProperties.reduce((sum, p) => sum + ((p.price || 0) * 5), 0),
    monthlyRevenue: allProperties.reduce((sum, p) => {
      if (p.status !== 'occupied') return sum;
      let multiplier = 1;
      if (p.rent_frequency === 'yearly') multiplier = 1/12;
      if (p.rent_frequency === 'quarterly') multiplier = 1/3;
      if (p.rent_frequency === 'weekly') multiplier = 52/12;
      return sum + ((p.price || 0) * multiplier);
    }, 0)
  };

  if (loading) {
    return (
      <div className="estate-properties">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading portfolio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="estate-properties">
      {/* Optional: display stats header */}
      <div className="portfolio-header">
        <h2>Property Portfolio</h2>
        <div className="stats">
          <span>Total: {portfolioStats.totalProperties}</span>
          <span>RentEasy: {portfolioStats.rentEasyListings}</span>
          <span>External: {portfolioStats.externalProperties}</span>
        </div>
      </div>

      <PortfolioManager 
        onAddProperty={handleAddProperty}
        onBulkUpload={handleBulkUpload}
        onEditProperty={handleEditProperty}
        // You could also pass the pre‑loaded properties if you want to avoid duplicate fetching,
        // but PortfolioManager currently fetches its own data. If you prefer to pass them,
        // you'd need to modify PortfolioManager to accept a `properties` prop.
      />
    </div>
  );
};

export default EstateProperties;