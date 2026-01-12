// src/modules/providers/pages/ProviderServiceCategories.jsx
import React, { useState } from 'react';
import { 
  Search, Filter, Plus, Edit2, 
  Trash2, CheckCircle, AlertCircle,
  Star, Users, DollarSign, Package,
  TrendingUp, Clock, Shield, Zap
} from 'lucide-react';

const ProviderServiceCategories = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [editingCategory, setEditingCategory] = useState(null);

  const serviceCategories = [
    {
      id: 1,
      name: 'Cleaning Services',
      icon: '🧹',
      description: 'Residential and commercial cleaning',
      servicesCount: 15,
      activeProviders: 124,
      avgPrice: '₦15,000 - ₦50,000',
      popularity: 95,
      status: 'active',
      commission: '7.5%'
    },
    {
      id: 2,
      name: 'Painting Services',
      icon: '🎨',
      description: 'Interior and exterior painting',
      servicesCount: 8,
      activeProviders: 67,
      avgPrice: '₦25,000 - ₦150,000',
      popularity: 88,
      status: 'active',
      commission: '7.5%'
    },
    {
      id: 3,
      name: 'Plumbing Services',
      icon: '🔧',
      description: 'Pipe repair and installation',
      servicesCount: 12,
      activeProviders: 89,
      avgPrice: '₦5,000 - ₦80,000',
      popularity: 92,
      status: 'active',
      commission: '7.5%'
    },
    {
      id: 4,
      name: 'Electrical Services',
      icon: '⚡',
      description: 'Wiring and electrical repairs',
      servicesCount: 10,
      activeProviders: 75,
      avgPrice: '₦8,000 - ₦100,000',
      popularity: 85,
      status: 'inactive',
      commission: '7.5%'
    },
    {
      id: 5,
      name: 'Security Installation',
      icon: '🔒',
      description: 'CCTV and alarm systems',
      servicesCount: 6,
      activeProviders: 42,
      avgPrice: '₦30,000 - ₦200,000',
      popularity: 78,
      status: 'active',
      commission: '7.5%'
    },
    {
      id: 6,
      name: 'Moving Services',
      icon: '🚚',
      description: 'Home and office relocation',
      servicesCount: 9,
      activeProviders: 56,
      avgPrice: '₦20,000 - ₦300,000',
      popularity: 82,
      status: 'active',
      commission: '7.5%'
    }
  ];

  const styles = {
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '1rem',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    },
    header: {
      marginBottom: '2rem'
    },
    title: {
      fontSize: '1.875rem',
      fontWeight: '700',
      color: '#1f2937',
      marginBottom: '0.5rem'
    },
    subtitle: {
      color: '#6b7280',
      fontSize: '1rem'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1rem',
      marginBottom: '2rem'
    },
    statCard: {
      background: 'white',
      borderRadius: '0.75rem',
      padding: '1.5rem',
      border: '1px solid #e5e7eb',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem'
    },
    statIcon: {
      width: '3rem',
      height: '3rem',
      borderRadius: '0.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#eff6ff'
    },
    statContent: {
      flex: 1
    },
    statTitle: {
      fontSize: '0.875rem',
      color: '#6b7280',
      marginBottom: '0.25rem'
    },
    statValue: {
      fontSize: '1.5rem',
      fontWeight: '700',
      color: '#1f2937'
    },
    controls: {
      display: 'flex',
      gap: '1rem',
      marginBottom: '2rem',
      flexWrap: 'wrap'
    },
    searchBox: {
      flex: 1,
      minWidth: '300px',
      position: 'relative'
    },
    searchInput: {
      width: '100%',
      padding: '0.75rem 1rem 0.75rem 3rem',
      border: '2px solid #e5e7eb',
      borderRadius: '0.75rem',
      fontSize: '1rem',
      color: '#1f2937',
      transition: 'border-color 0.2s'
    },
    searchIcon: {
      position: 'absolute',
      left: '1rem',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#9ca3af'
    },
    filterButtons: {
      display: 'flex',
      gap: '0.5rem',
      flexWrap: 'wrap'
    },
    filterButton: {
      padding: '0.75rem 1.5rem',
      border: '1px solid #e5e7eb',
      background: 'white',
      borderRadius: '0.5rem',
      color: '#6b7280',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s'
    },
    activeFilter: {
      background: '#2563eb',
      borderColor: '#2563eb',
      color: 'white'
    },
    addButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.75rem 1.5rem',
      background: '#10b981',
      color: 'white',
      border: 'none',
      borderRadius: '0.5rem',
      fontWeight: '600',
      cursor: 'pointer'
    },
    categoriesGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: '1.5rem'
    },
    categoryCard: {
      background: 'white',
      borderRadius: '1rem',
      border: '1px solid #e5e7eb',
      padding: '1.5rem',
      transition: 'all 0.3s ease'
    },
    categoryHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '1rem'
    },
    categoryIcon: {
      fontSize: '2rem'
    },
    categoryStatus: {
      padding: '0.25rem 0.75rem',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      fontWeight: '600'
    },
    statusActive: {
      background: '#d1fae5',
      color: '#065f46'
    },
    statusInactive: {
      background: '#fee2e2',
      color: '#991b1b'
    },
    categoryName: {
      fontSize: '1.25rem',
      fontWeight: '600',
      color: '#1f2937',
      marginBottom: '0.5rem'
    },
    categoryDescription: {
      color: '#6b7280',
      fontSize: '0.875rem',
      marginBottom: '1.5rem',
      lineHeight: '1.5'
    },
    categoryStats: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '1rem',
      marginBottom: '1.5rem'
    },
    statItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    statIconSmall: {
      color: '#9ca3af'
    },
    statLabel: {
      fontSize: '0.75rem',
      color: '#6b7280',
      marginBottom: '0.125rem'
    },
    statValueSmall: {
      fontSize: '0.875rem',
      fontWeight: '600',
      color: '#1f2937'
    },
    popularityBar: {
      height: '6px',
      background: '#e5e7eb',
      borderRadius: '3px',
      overflow: 'hidden',
      marginBottom: '0.5rem'
    },
    popularityFill: {
      height: '100%',
      background: 'linear-gradient(90deg, #10b981, #3b82f6)',
      borderRadius: '3px'
    },
    categoryFooter: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: '1rem',
      borderTop: '1px solid #e5e7eb'
    },
    commissionBadge: {
      padding: '0.25rem 0.75rem',
      background: '#f3e8ff',
      color: '#7c3aed',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      fontWeight: '600'
    },
    actionButtons: {
      display: 'flex',
      gap: '0.5rem'
    },
    actionButton: {
      padding: '0.5rem',
      border: '1px solid #e5e7eb',
      background: 'white',
      borderRadius: '0.5rem',
      color: '#6b7280',
      cursor: 'pointer',
      transition: 'all 0.2s'
    },
    editForm: {
      background: 'white',
      borderRadius: '1rem',
      border: '1px solid #e5e7eb',
      padding: '2rem',
      marginTop: '2rem'
    },
    formTitle: {
      fontSize: '1.5rem',
      fontWeight: '600',
      color: '#1f2937',
      marginBottom: '1.5rem'
    },
    formGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '1.5rem',
      marginBottom: '1.5rem'
    },
    formGroup: {
      marginBottom: '1rem'
    },
    formLabel: {
      display: 'block',
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#374151',
      marginBottom: '0.5rem'
    },
    formInput: {
      width: '100%',
      padding: '0.75rem 1rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.5rem',
      fontSize: '0.875rem',
      color: '#374151'
    },
    formTextarea: {
      width: '100%',
      padding: '0.75rem 1rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.5rem',
      fontSize: '0.875rem',
      color: '#374151',
      minHeight: '100px',
      resize: 'vertical'
    },
    formSelect: {
      width: '100%',
      padding: '0.75rem 1rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.5rem',
      fontSize: '0.875rem',
      color: '#374151',
      background: 'white'
    },
    formActions: {
      display: 'flex',
      gap: '1rem',
      justifyContent: 'flex-end',
      marginTop: '2rem'
    },
    cancelButton: {
      padding: '0.75rem 1.5rem',
      border: '1px solid #d1d5db',
      background: 'white',
      borderRadius: '0.5rem',
      color: '#374151',
      fontWeight: '500',
      cursor: 'pointer'
    },
    saveButton: {
      padding: '0.75rem 1.5rem',
      background: '#2563eb',
      color: 'white',
      border: 'none',
      borderRadius: '0.5rem',
      fontWeight: '600',
      cursor: 'pointer'
    },
    emptyState: {
      textAlign: 'center',
      padding: '3rem 1rem',
      gridColumn: '1 / -1'
    },
    emptyIcon: {
      width: '4rem',
      height: '4rem',
      background: '#f3f4f6',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 1rem'
    },
    emptyTitle: {
      fontSize: '1.25rem',
      fontWeight: '600',
      color: '#1f2937',
      marginBottom: '0.5rem'
    },
    emptyText: {
      color: '#6b7280'
    }
  };

  const filteredCategories = serviceCategories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         category.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = activeFilter === 'all' || category.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    totalCategories: serviceCategories.length,
    activeCategories: serviceCategories.filter(c => c.status === 'active').length,
    totalServices: serviceCategories.reduce((sum, cat) => sum + cat.servicesCount, 0),
    avgPopularity: Math.round(serviceCategories.reduce((sum, cat) => sum + cat.popularity, 0) / serviceCategories.length)
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Service Categories</h1>
        <p style={styles.subtitle}>Manage and organize your service offerings</p>
      </div>

      {/* Stats */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>
            <Package size={24} color="#2563eb" />
          </div>
          <div style={styles.statContent}>
            <div style={styles.statTitle}>Total Categories</div>
            <div style={styles.statValue}>{stats.totalCategories}</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>
            <CheckCircle size={24} color="#10b981" />
          </div>
          <div style={styles.statContent}>
            <div style={styles.statTitle}>Active Categories</div>
            <div style={styles.statValue}>{stats.activeCategories}</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>
            <Users size={24} color="#8b5cf6" />
          </div>
          <div style={styles.statContent}>
            <div style={styles.statTitle}>Total Services</div>
            <div style={styles.statValue}>{stats.totalServices}</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>
            <TrendingUp size={24} color="#f59e0b" />
          </div>
          <div style={styles.statContent}>
            <div style={styles.statTitle}>Avg. Popularity</div>
            <div style={styles.statValue}>{stats.avgPopularity}%</div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div style={styles.controls}>
        <div style={styles.searchBox}>
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
          <Search style={styles.searchIcon} size={20} />
        </div>
        
        <div style={styles.filterButtons}>
          {['all', 'active', 'inactive'].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              style={{
                ...styles.filterButton,
                ...(activeFilter === filter ? styles.activeFilter : {})
              }}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>
        
        <button style={styles.addButton}>
          <Plus size={20} />
          Add Category
        </button>
      </div>

      {/* Categories Grid */}
      {filteredCategories.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>
            <Package size={32} color="#9ca3af" />
          </div>
          <h3 style={styles.emptyTitle}>No categories found</h3>
          <p style={styles.emptyText}>Try adjusting your search or filters</p>
        </div>
      ) : (
        <div style={styles.categoriesGrid}>
          {filteredCategories.map((category) => (
            <div key={category.id} style={styles.categoryCard}>
              <div style={styles.categoryHeader}>
                <div style={styles.categoryIcon}>{category.icon}</div>
                <span style={{
                  ...styles.categoryStatus,
                  ...styles[`status${category.status.charAt(0).toUpperCase() + category.status.slice(1)}`]
                }}>
                  {category.status}
                </span>
              </div>
              
              <h3 style={styles.categoryName}>{category.name}</h3>
              <p style={styles.categoryDescription}>{category.description}</p>
              
              <div style={styles.categoryStats}>
                <div style={styles.statItem}>
                  <Package style={styles.statIconSmall} size={16} />
                  <div>
                    <div style={styles.statLabel}>Services</div>
                    <div style={styles.statValueSmall}>{category.servicesCount}</div>
                  </div>
                </div>
                <div style={styles.statItem}>
                  <Users style={styles.statIconSmall} size={16} />
                  <div>
                    <div style={styles.statLabel}>Providers</div>
                    <div style={styles.statValueSmall}>{category.activeProviders}</div>
                  </div>
                </div>
                <div style={styles.statItem}>
                  <DollarSign style={styles.statIconSmall} size={16} />
                  <div>
                    <div style={styles.statLabel}>Avg. Price</div>
                    <div style={styles.statValueSmall}>{category.avgPrice}</div>
                  </div>
                </div>
                <div style={styles.statItem}>
                  <TrendingUp style={styles.statIconSmall} size={16} />
                  <div>
                    <div style={styles.statLabel}>Popularity</div>
                    <div style={styles.statValueSmall}>{category.popularity}%</div>
                  </div>
                </div>
              </div>
              
              <div style={styles.popularityBar}>
                <div style={{...styles.popularityFill, width: `${category.popularity}%`}}></div>
              </div>
              
              <div style={styles.categoryFooter}>
                <span style={styles.commissionBadge}>
                  Commission: {category.commission}
                </span>
                <div style={styles.actionButtons}>
                  <button
                    onClick={() => setEditingCategory(category)}
                    style={styles.actionButton}
                    title="Edit"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Delete ${category.name}? This will remove all services in this category.`)) {
                        alert(`Category "${category.name}" deleted`);
                      }
                    }}
                    style={styles.actionButton}
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Form */}
      {editingCategory && (
        <div style={styles.editForm}>
          <h3 style={styles.formTitle}>Edit Category</h3>
          
          <div style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Category Name</label>
              <input
                type="text"
                defaultValue={editingCategory.name}
                style={styles.formInput}
              />
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Icon</label>
              <input
                type="text"
                defaultValue={editingCategory.icon}
                style={styles.formInput}
                placeholder="Emoji or icon code"
              />
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Status</label>
              <select defaultValue={editingCategory.status} style={styles.formSelect}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Commission Rate</label>
              <input
                type="text"
                defaultValue={editingCategory.commission}
                style={styles.formInput}
              />
            </div>
            
            <div style={{...styles.formGroup, gridColumn: '1 / -1'}}>
              <label style={styles.formLabel}>Description</label>
              <textarea
                defaultValue={editingCategory.description}
                style={styles.formTextarea}
              />
            </div>
          </div>
          
          <div style={styles.formActions}>
            <button
              onClick={() => setEditingCategory(null)}
              style={styles.cancelButton}
            >
              Cancel
            </button>
            <button
              onClick={() => {
                alert('Category updated successfully');
                setEditingCategory(null);
              }}
              style={styles.saveButton}
            >
              Save Changes
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderServiceCategories;