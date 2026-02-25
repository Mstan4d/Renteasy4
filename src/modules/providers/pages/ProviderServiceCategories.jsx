// src/modules/providers/pages/ProviderServiceCategories.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../shared/context/AuthContext';
import { supabase } from '../../../shared/lib/supabaseClient';
import {
  Search, Package, CheckCircle, Users, DollarSign, TrendingUp
} from 'lucide-react';
import './ProviderServiceCategories.css';

const ProviderServiceCategories = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'active', 'inactive'

  // Overall stats
  const [stats, setStats] = useState({
    totalCategories: 0,
    activeCategories: 0,
    totalServices: 0,
    avgPopularity: 0
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      // 1. Fetch all categories
      const { data: cats, error } = await supabase
        .from('service_categories')
        .select('*')
        .order('name');
      if (error) throw error;

      // 2. Compute stats per category and overall
      let totalServicesSum = 0;
      const enhancedCats = await Promise.all(
        cats.map(async (cat) => {
          // Services count in this category
          const { count: servicesCount } = await supabase
            .from('services')
            .select('*', { count: 'exact', head: true })
            .eq('service_category', cat.name)  // adjust column name if needed
            .eq('status', 'active');

          // Active providers (distinct provider_id)
          const { data: providers } = await supabase
            .from('services')
            .select('provider_id')
            .eq('service_category', cat.name)
            .eq('status', 'active');
          const uniqueProviders = new Set(providers?.map(p => p.provider_id) || []);
          const activeProviders = uniqueProviders.size;

          // Average price (simplified: use base_price for fixed, hourly_rate, price_per_unit)
          const { data: prices } = await supabase
            .from('services')
            .select('base_price, hourly_rate, price_per_unit')
            .eq('service_category', cat.name)
            .eq('status', 'active');
          let avgPrice = 'N/A';
          if (prices && prices.length > 0) {
            const sum = prices.reduce((acc, s) => {
              const val = s.base_price || s.hourly_rate || s.price_per_unit || 0;
              return acc + val;
            }, 0);
            const avg = sum / prices.length;
            avgPrice = `₦${Math.round(avg).toLocaleString()}`;
          }

          totalServicesSum += servicesCount || 0;

          return {
            ...cat,
            servicesCount: servicesCount || 0,
            activeProviders,
            avgPrice
          };
        })
      );

      setCategories(enhancedCats);

      // Overall stats
      setStats({
        totalCategories: cats.length,
        activeCategories: cats.filter(c => c.status === 'active').length,
        totalServices: totalServicesSum,
        avgPopularity: cats.length
          ? Math.round(cats.reduce((sum, c) => sum + (c.popularity || 0), 0) / cats.length)
          : 0
      });
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter categories
  const filteredCategories = categories.filter(cat => {
    const matchesSearch = cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (cat.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || cat.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return <div className="loading">Loading categories...</div>;
  }

  return (
    <div className="provider-categories-container">
      {/* Header */}
      <div className="page-header">
        <h1>Service Categories</h1>
        <p>Browse all service categories and their performance</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue"><Package size={24} /></div>
          <div>
            <div className="stat-label">Total Categories</div>
            <div className="stat-value">{stats.totalCategories}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><CheckCircle size={24} /></div>
          <div>
            <div className="stat-label">Active Categories</div>
            <div className="stat-value">{stats.activeCategories}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple"><Users size={24} /></div>
          <div>
            <div className="stat-label">Total Services</div>
            <div className="stat-value">{stats.totalServices}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange"><TrendingUp size={24} /></div>
          <div>
            <div className="stat-label">Avg. Popularity</div>
            <div className="stat-value">{stats.avgPopularity}%</div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="controls">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-buttons">
          {['all', 'active', 'inactive'].map((filter) => (
            <button
              key={filter}
              onClick={() => setFilterStatus(filter)}
              className={`filter-button ${filterStatus === filter ? 'active' : ''}`}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Categories Grid */}
      {filteredCategories.length === 0 ? (
        <div className="empty-state">
          <Package size={48} />
          <h3>No categories found</h3>
          <p>Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="categories-grid">
          {filteredCategories.map(cat => (
            <div key={cat.id} className="category-card">
              <div className="category-header">
                <div className="category-icon">{cat.icon || '📦'}</div>
                <span className={`status-badge ${cat.status}`}>{cat.status}</span>
              </div>
              <h3 className="category-name">{cat.name}</h3>
              <p className="category-description">{cat.description || ''}</p>

              <div className="category-stats">
                <div className="stat-item">
                  <Package size={16} />
                  <div>
                    <div className="stat-label-small">Services</div>
                    <div className="stat-value-small">{cat.servicesCount}</div>
                  </div>
                </div>
                <div className="stat-item">
                  <Users size={16} />
                  <div>
                    <div className="stat-label-small">Providers</div>
                    <div className="stat-value-small">{cat.activeProviders}</div>
                  </div>
                </div>
                <div className="stat-item">
                  <DollarSign size={16} />
                  <div>
                    <div className="stat-label-small">Avg. Price</div>
                    <div className="stat-value-small">{cat.avgPrice}</div>
                  </div>
                </div>
                <div className="stat-item">
                  <TrendingUp size={16} />
                  <div>
                    <div className="stat-label-small">Popularity</div>
                    <div className="stat-value-small">{cat.popularity || 0}%</div>
                  </div>
                </div>
              </div>

              <div className="popularity-bar">
                <div className="popularity-fill" style={{ width: `${cat.popularity || 0}%` }}></div>
              </div>

              <div className="category-footer">
                <span className="commission-badge">Commission: {cat.commission_rate || '7.5%'}</span>
                {/* No edit/delete buttons for providers */}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProviderServiceCategories;