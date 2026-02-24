// shared/hooks/useMarketplace.js
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const useMarketplace = () => {
  const [serviceProviders, setServiceProviders] = useState([]);
  const [estateFirms, setEstateFirms] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMarketplaceData = async (filters = {}) => {
    try {
      setLoading(true);
      
      // Fetch service providers
      let query = supabase
        .from('service_providers')
        .select('*, profiles(full_name, avatar_url)')
        .eq('is_active', true);

      if (filters.serviceType) {
        query = query.eq('service_type', filters.serviceType);
      }

      if (filters.verifiedOnly) {
        query = query.eq('verification_status', 'verified');
      }

      const { data: providers, error: providersError } = await query;

      if (providersError) throw providersError;

      // Sort: boosted first, then by rating
      const sortedProviders = (providers || []).sort((a, b) => {
        if (a.boost_status === 'boosted' && b.boost_status !== 'boosted') return -1;
        if (a.boost_status !== 'boosted' && b.boost_status === 'boosted') return 1;
        return (b.rating || 0) - (a.rating || 0);
      });

      setServiceProviders(sortedProviders);

      // Fetch estate firms
      let firmQuery = supabase
        .from('estate_firms')
        .select('*, profiles(full_name, avatar_url)')
        .eq('is_active', true);

      if (filters.verifiedOnly) {
        firmQuery = firmQuery.eq('verification_status', 'verified');
      }

      const { data: firms, error: firmsError } = await firmQuery;

      if (firmsError) throw firmsError;

      const sortedFirms = (firms || []).sort((a, b) => {
        if (a.boost_status === 'boosted' && b.boost_status !== 'boosted') return -1;
        if (a.boost_status !== 'boosted' && b.boost_status === 'boosted') return 1;
        return (b.rating || 0) - (a.rating || 0);
      });

      setEstateFirms(sortedFirms);

      // Fetch marketplace services
      let serviceQuery = supabase
        .from('marketplace_services')
        .select('*, service_providers(*), estate_firms(*)')
        .eq('is_active', true);

      if (filters.category) {
        serviceQuery = serviceQuery.eq('category', filters.category);
      }

      const { data: marketplaceServices, error: servicesError } = await serviceQuery;

      if (servicesError) throw servicesError;

      setServices(marketplaceServices || []);

    } catch (err) {
      setError(err.message);
      console.error('Error fetching marketplace data:', err);
    } finally {
      setLoading(false);
    }
  };

  const verifyServiceProvider = async (providerId, adminId) => {
    try {
      const { error } = await supabase
        .from('service_providers')
        .update({ 
          verification_status: 'verified',
          verified_by: adminId,
          verified_at: new Date().toISOString()
        })
        .eq('id', providerId);

      if (error) throw error;
      
      // Refresh data
      fetchMarketplaceData();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const boostServiceProvider = async (providerId, days) => {
    try {
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + days);

      const { error } = await supabase
        .from('service_providers')
        .update({ 
          boost_status: 'boosted',
          boost_expiry: expiry.toISOString()
        })
        .eq('id', providerId);

      if (error) throw error;
      
      fetchMarketplaceData();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  useEffect(() => {
    fetchMarketplaceData();
  }, []);

  return {
    serviceProviders,
    estateFirms,
    services,
    loading,
    error,
    fetchMarketplaceData,
    verifyServiceProvider,
    boostServiceProvider,
    refetch: fetchMarketplaceData
  };
};