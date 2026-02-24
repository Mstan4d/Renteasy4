// src/shared/hooks/useListings.js
import { useState, useEffect, useCallback } from 'react';
import { listingsService } from '../services/listingsService';

export const useListings = (filters = {}) => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({});

  const loadListings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await listingsService.getAll(filters);
      setListings(data);
      
      // Calculate stats
      const stats = {
        total: data.length,
        verified: data.filter(l => l.verified && l.status === 'approved').length,
        pending: data.filter(l => l.status === 'pending').length,
        tenants: data.filter(l => l.posterRole === 'tenant').length,
        landlords: data.filter(l => l.posterRole === 'landlord').length,
        estates: data.filter(l => l.posterRole === 'estate-firm').length,
      };
      setStats(stats);
    } catch (err) {
      setError(err.message);
      setListings([]);
      setStats({});
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadListings();
  }, [loadListings]);

  return { listings, loading, error, stats, refetch: loadListings };
};

// Usage in components:
const { listings, loading, error, stats } = useListings(filters);