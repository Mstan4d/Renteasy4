import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Home, PlusCircle, Upload, Filter, Download, 
  Edit, Trash2, Eye, DollarSign, MapPin,
  CheckCircle, XCircle, MoreVertical, Search,
  Users, TrendingUp, ArrowUpRight, Building
} from 'lucide-react';
import { supabase } from '../../../shared/lib/supabaseClient';
import { useAuth } from '../../../shared/context/AuthContext';
import './EstateProperties.css';

const EstateProperties = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [externalProperties, setExternalProperties] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [selectedProperties, setSelectedProperties] = useState([]);
  const [sortBy, setSortBy] = useState('recent');
  const [searchQuery, setSearchQuery] = useState('');
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

  const allProperties = [...properties, ...externalProperties];

  const handleDeleteProperty = async (propertyId, isExternal = false) => {
    if (!window.confirm('Are you sure you want to delete this property?')) return;

    try {
      if (isExternal) {
        // Delete external property
        const { error } = await supabase
          .from('external_properties')
          .update({ status: 'terminated' })
          .eq('id', propertyId);

        if (error) throw error;
      } else {
        // Delete RentEasy property
        const { error } = await supabase
          .from('listings')
          .delete()
          .eq('id', propertyId)
          .eq('estate_firm_id', user.id);

        if (error) throw error;
      }

      // Update estate firm stats
      await supabase.rpc('update_estate_firm_stats', { user_id: user.id });

      // Log activity
      await supabase.from('activities').insert({
        user_id: user.id,
        type: 'property',
        action: 'delete',
        description: `Deleted property from portfolio`,
        created_at: new Date().toISOString()
      });

      alert('Property deleted successfully!');
      loadProperties();

    } catch (error) {
      console.error('Error deleting property:', error);
      alert('Failed to delete property. Please try again.');
    }
  };

  const filteredProperties = allProperties.filter(property => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      property.title.toLowerCase().includes(query) ||
      property.address.toLowerCase().includes(query) ||
      (property.client?.name || '').toLowerCase().includes(query)
    );
  }).sort((a, b) => {
    if (sortBy === 'recent') return new Date(b.created_at) - new Date(a.created_at);
    if (sortBy === 'rent-high') return (b.price || 0) - (a.price || 0);
    if (sortBy === 'rent-low') return (a.price || 0) - (b.price || 0);
    if (sortBy === 'name') return a.title.localeCompare(b.title);
    return 0;
  });

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
      <PortfolioManager 
        properties={properties}
        onAddProperty={handleAddProperty}
        onBulkUpload={handleBulkUpload}
        onEditProperty={handleEditProperty}
      />
    </div>
  );
};

export default EstateProperties;