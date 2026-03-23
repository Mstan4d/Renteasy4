import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../shared/lib/supabaseClient';
import { useAuth } from '../../../shared/context/AuthContext';
import PortfolioManager from '../components/PortfolioManager';
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

      // 1. Get estate firm profile id
      const { data: profile } = await supabase
        .from('estate_firm_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) {
        console.warn('No estate firm profile found');
        setLoading(false);
        return;
      }

      // 2. Load RentEasy listings (without ambiguous joins)
      const { data: listings, error: listingsError } = await supabase
        .from('listings')
        .select('*')
        .eq('estate_firm_id', profile.id)
        .order('created_at', { ascending: false });

      if (listingsError) throw listingsError;

      // 3. Load landlord names separately (optional)
      const landlordIds = listings.map(l => l.landlord_id).filter(Boolean);
      let landlordMap = {};
      if (landlordIds.length > 0) {
        const { data: landlords } = await supabase
          .from('profiles')
          .select('id, name, email, phone')
          .in('id', landlordIds);
        landlordMap = Object.fromEntries(landlords?.map(l => [l.id, l]) || []);
      }

      // 4. Attach landlord info to listings
      const enhancedListings = listings.map(l => ({
        ...l,
        landlord: landlordMap[l.landlord_id] || null,
        source: 'rent-easy',
      }));

      // 5. Load external properties from `properties` table (not `external_properties`)
      const { data: props, error: propsError } = await supabase
        .from('properties')
        .select('*, landlord:landlord_id(*)')
        .eq('estate_firm_id', profile.id)
        .order('created_at', { ascending: false });

      if (propsError) throw propsError;

      // 6. Load units for these properties
      const propertyIds = props.map(p => p.id).filter(Boolean);
      let unitsByProperty = {};
      if (propertyIds.length > 0) {
        const { data: units } = await supabase
          .from('units')
          .select('*')
          .in('property_id', propertyIds);
        unitsByProperty = (units || []).reduce((acc, u) => {
          if (!acc[u.property_id]) acc[u.property_id] = [];
          acc[u.property_id].push(u);
          return acc;
        }, {});
      }

      // 7. Enhance external properties with units and stats
      const enhancedExternal = (props || []).map(p => ({
        ...p,
        source: 'external',
        units: unitsByProperty[p.id] || [],
        unitCount: (unitsByProperty[p.id] || []).length,
        occupiedCount: (unitsByProperty[p.id] || []).filter(u => u.status === 'occupied').length,
        vacantCount: (unitsByProperty[p.id] || []).filter(u => u.status === 'vacant').length,
      }));

      setProperties(enhancedListings);
      setExternalProperties(enhancedExternal);

    } catch (error) {
      console.error('Error loading properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProperty = (type) => {
    if (type === 'rent-easy') {
      navigate('/post-property?type=estate-firm');
    } else {
      navigate('/dashboard/estate-firm/add-external-property');
    }
  };

  const handleBulkUpload = () => {
    navigate('/dashboard/estate-firm/bulk-upload');
  };

  const handleEditProperty = (property) => {
    if (property.source === 'external') {
      navigate(`/dashboard/estate-firm/properties/${property.id}/edit`);
    } else {
      navigate(`/listings/${property.id}`);
    }
  };

  const allProperties = [...properties, ...externalProperties];
  const portfolioStats = {
    totalProperties: allProperties.length,
    rentEasyListings: properties.length,
    externalProperties: externalProperties.length,
    occupiedProperties: allProperties.reduce((sum, p) => sum + (p.occupiedCount || 0), 0),
    totalUnits: allProperties.reduce((sum, p) => sum + (p.unitCount || 1), 0),
    monthlyRevenue: allProperties.reduce((sum, p) => {
      if (p.source === 'external') {
        return sum + (p.monthlyRent || 0);
      } else {
        // For listings, compute monthly rent
        const price = parseFloat(p.price) || 0;
        const freq = p.rent_frequency || 'yearly';
        let monthly = 0;
        if (freq === 'yearly') monthly = price / 12;
        else if (freq === 'monthly') monthly = price;
        else if (freq === 'quarterly') monthly = price / 3;
        return sum + (p.status === 'rented' ? monthly : 0);
      }
    }, 0),
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
      <div className="portfolio-header">
        <h2>Property Portfolio</h2>
        <div className="stats">
          <span>Total: {portfolioStats.totalProperties}</span>
          <span>RentEasy: {portfolioStats.rentEasyListings}</span>
          <span>External: {portfolioStats.externalProperties}</span>
          <span>Units: {portfolioStats.totalUnits}</span>
        </div>
      </div>

      <PortfolioManager 
        onAddProperty={handleAddProperty}
        onBulkUpload={handleBulkUpload}
        onEditProperty={handleEditProperty}
      />
    </div>
  );
};

export default EstateProperties;