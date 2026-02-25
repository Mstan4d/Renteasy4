// src/modules/admin/pages/AdminServiceCategories.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../shared/context/AuthContext';
import { supabase } from '../../../shared/lib/supabaseClient';
import {
  Plus, Edit2, Trash2, Search,
  Package, CheckCircle, Users, DollarSign,
  TrendingUp, X
} from 'lucide-react';
import './AdminServiceCategories.css';

const AdminServiceCategories = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    icon: '',
    description: '',
    status: 'active',
    commission_rate: '7.5%',
    popularity: 0
  });

  // Stats summary
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

      // 2. Compute additional stats for each category and overall
      let totalServicesCount = 0;
      const enhancedCats = await Promise.all(
        cats.map(async (cat) => {
          // Count services in this category
          const { count: servicesCount } = await supabase
            .from('services')
            .select('*', { count: 'exact', head: true })
            .eq('service_category', cat.name)
            .eq('status', 'active');

          // Count active providers (distinct provider_id)
          const { data: providers } = await supabase
            .from('services')
            .select('provider_id')
            .eq('service_category', cat.name)
            .eq('status', 'active');
          const uniqueProviders = new Set(providers?.map(p => p.provider_id) || []);
          const activeProviders = uniqueProviders.size;

          // Average price (simplified: use base_price from fixed, hourly_rate, etc.)
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

          totalServicesCount += servicesCount || 0;

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
        totalServices: totalServicesCount,
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

  const handleOpenModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        icon: category.icon || '',
        description: category.description || '',
        status: category.status,
        commission_rate: category.commission_rate || '7.5%',
        popularity: category.popularity || 0
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        icon: '',
        description: '',
        status: 'active',
        commission_rate: '7.5%',
        popularity: 0
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCategory(null);
  };

  const handleSave = async () => {
    try {
      if (editingCategory) {
        // Update
        const { error } = await supabase
          .from('service_categories')
          .update({
            name: formData.name,
            icon: formData.icon,
            description: formData.description,
            status: formData.status,
            commission_rate: formData.commission_rate,
            popularity: parseInt(formData.popularity) || 0
          })
          .eq('id', editingCategory.id);
        if (error) throw error;
      } else {
        // Insert
        const { error } = await supabase
          .from('service_categories')
          .insert([{
            name: formData.name,
            icon: formData.icon,
            description: formData.description,
            status: formData.status,
            commission_rate: formData.commission_rate,
            popularity: parseInt(formData.popularity) || 0
          }]);
        if (error) throw error;
      }
      await fetchCategories();
      handleCloseModal();
    } catch (err) {
      console.error('Error saving category:', err);
      alert('Failed to save category.');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete category "${name}"?`)) return;
    try {
      const { error } = await supabase
        .from('service_categories')
        .delete()
        .eq('id', id);
      if (error) throw error;
      await fetchCategories();
    } catch (err) {
      console.error('Error deleting category:', err);
      alert('Failed to delete category.');
    }
  };

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (cat.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="loading">Loading categories...</div>;
  }

  return (
    <div className="admin-categories-container">
      {/* Header */}
      <div className="page-header">
        <h1>Service Categories</h1>
        <p>Manage service categories and view associated stats</p>
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
        <button className="btn-primary" onClick={() => handleOpenModal()}>
          <Plus size={18} /> Add Category
        </button>
      </div>

      {/* Categories Table */}
      {filteredCategories.length === 0 ? (
        <div className="empty-state">
          <Package size={48} />
          <h3>No categories found</h3>
          <p>Try adjusting your search or add a new category.</p>
        </div>
      ) : (
        <table className="categories-table">
          <thead>
            <tr>
              <th>Icon</th>
              <th>Name</th>
              <th>Description</th>
              <th>Services</th>
              <th>Providers</th>
              <th>Avg. Price</th>
              <th>Status</th>
              <th>Commission</th>
              <th>Popularity</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCategories.map(cat => (
              <tr key={cat.id}>
                <td style={{ fontSize: '2rem' }}>{cat.icon || '📦'}</td>
                <td><strong>{cat.name}</strong></td>
                <td>{cat.description || '—'}</td>
                <td>{cat.servicesCount}</td>
                <td>{cat.activeProviders}</td>
                <td>{cat.avgPrice}</td>
                <td>
                  <span className={`status-badge ${cat.status}`}>
                    {cat.status}
                  </span>
                </td>
                <td>{cat.commission_rate}</td>
                <td>{cat.popularity}%</td>
                <td>
                  <button className="action-btn" onClick={() => handleOpenModal(cat)} title="Edit">
                    <Edit2 size={16} />
                  </button>
                  <button className="action-btn delete" onClick={() => handleDelete(cat.id, cat.name)} title="Delete">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingCategory ? 'Edit Category' : 'Add New Category'}</h2>
              <button className="close-btn" onClick={handleCloseModal}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g., Cleaning Services"
                />
              </div>
              <div className="form-group">
                <label>Icon</label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={e => setFormData({...formData, icon: e.target.value})}
                  placeholder="Emoji or icon code (e.g., 🧹)"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  rows="2"
                  placeholder="Short description"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Commission Rate</label>
                  <input
                    type="text"
                    value={formData.commission_rate}
                    onChange={e => setFormData({...formData, commission_rate: e.target.value})}
                    placeholder="e.g., 7.5%"
                  />
                </div>
                <div className="form-group">
                  <label>Popularity (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.popularity}
                    onChange={e => setFormData({...formData, popularity: e.target.value})}
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={handleCloseModal}>Cancel</button>
              <button className="btn-primary" onClick={handleSave}>
                {editingCategory ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminServiceCategories;