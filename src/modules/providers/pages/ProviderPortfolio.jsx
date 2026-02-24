import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../shared/context/AuthContext';
import { supabase } from '../../../shared/lib/supabaseClient';
import ProviderPageTemplate from '../templates/ProviderPageTemplate';
import { 
  FaPlus, FaEdit, FaTrash, FaStar, FaEye, FaDownload, 
  FaFilter, FaSearch, FaImage, FaVideo, FaFilePdf, FaShare
} from 'react-icons/fa';
import './ProviderPortfolio.css'; // external CSS

const ProviderPortfolio = () => {
  const { user } = useAuth();
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories] = useState(['All', 'Painting', 'Cleaning', 'Renovation', 'Plumbing', 'Electrical', 'Landscaping']);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newItem, setNewItem] = useState({
    title: '',
    description: '',
    category: '',
    type: 'image',
    file: null,
    tags: '',
    featured: false
  });

  useEffect(() => {
    if (user?.id) {
      fetchPortfolioItems();
    }
  }, [user]);

  const fetchPortfolioItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('provider_portfolio')
        .select('*')
        .eq('provider_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPortfolioItems(data || []);
    } catch (err) {
      console.error('Error fetching portfolio:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const uploadFile = async (file) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;
    const filePath = `portfolio/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('portfolio')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from('portfolio')
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  };

  const handleAddItem = async () => {
    if (!newItem.title || !newItem.category || !newItem.file) {
      alert('Please fill in required fields and select a file');
      return;
    }

    try {
      setUploading(true);
      const fileUrl = await uploadFile(newItem.file);

      const tagsArray = newItem.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag);

      const { data, error } = await supabase
        .from('provider_portfolio')
        .insert([{
          provider_id: user.id,
          title: newItem.title,
          description: newItem.description,
          category: newItem.category,
          type: newItem.type,
          url: fileUrl,
          thumbnail: newItem.type !== 'image' ? fileUrl : null,
          tags: tagsArray,
          featured: newItem.featured,
          views: 0,
          rating: 0
        }])
        .select();

      if (error) throw error;

      setPortfolioItems([data[0], ...portfolioItems]);
      setShowAddModal(false);
      setNewItem({
        title: '',
        description: '',
        category: '',
        type: 'image',
        file: null,
        tags: '',
        featured: false
      });
    } catch (err) {
      console.error('Error adding portfolio item:', err);
      alert('Failed to add item. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm('Are you sure you want to delete this portfolio item?')) return;

    try {
      const item = portfolioItems.find(i => i.id === id);
      if (!item) return;

      // Delete from storage
      if (item.url) {
        const urlParts = item.url.split('/portfolio/');
        if (urlParts.length > 1) {
          const filePath = urlParts[1];
          await supabase.storage.from('portfolio').remove([filePath]);
        }
      }

      const { error } = await supabase
        .from('provider_portfolio')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setPortfolioItems(portfolioItems.filter(item => item.id !== id));
    } catch (err) {
      console.error('Error deleting item:', err);
      alert('Failed to delete item. Please try again.');
    }
  };

  const handleToggleFeatured = async (id) => {
    const item = portfolioItems.find(i => i.id === id);
    if (!item) return;

    try {
      const newFeatured = !item.featured;
      const { error } = await supabase
        .from('provider_portfolio')
        .update({ featured: newFeatured })
        .eq('id', id);

      if (error) throw error;

      setPortfolioItems(portfolioItems.map(item =>
        item.id === id ? { ...item, featured: newFeatured } : item
      ));
    } catch (err) {
      console.error('Error toggling featured:', err);
      alert('Failed to update featured status.');
    }
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'image': return <FaImage />;
      case 'video': return <FaVideo />;
      case 'document': return <FaFilePdf />;
      default: return <FaImage />;
    }
  };

  // Calculate stats
  const stats = {
    totalItems: portfolioItems.length,
    featuredItems: portfolioItems.filter(item => item.featured).length,
    totalViews: portfolioItems.reduce((sum, item) => sum + (item.views || 0), 0),
    averageRating: portfolioItems.length > 0
      ? (portfolioItems.reduce((sum, item) => sum + (item.rating || 0), 0) / portfolioItems.length).toFixed(1)
      : '0.0'
  };

  // Filtering and sorting
  const filteredItems = portfolioItems.filter(item => {
    if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;
    if (showFeaturedOnly && !item.featured) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        item.title.toLowerCase().includes(term) ||
        item.description?.toLowerCase().includes(term) ||
        item.tags?.some(tag => tag.toLowerCase().includes(term))
      );
    }
    return true;
  }).sort((a, b) => {
    switch(sortBy) {
      case 'date': return new Date(b.created_at || b.date) - new Date(a.created_at || a.date);
      case 'rating': return (b.rating || 0) - (a.rating || 0);
      case 'views': return (b.views || 0) - (a.views || 0);
      case 'title': return (a.title || '').localeCompare(b.title || '');
      default: return 0;
    }
  });

  if (loading) return <div className="loading">Loading your portfolio...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <ProviderPageTemplate
      title="Portfolio"
      subtitle="Showcase your work to attract more clients"
      actions={
        <button 
          className="btn-primary"
          onClick={() => setShowAddModal(true)}
        >
          <FaPlus style={{ marginRight: '0.5rem' }} />
          Add Portfolio Item
        </button>
      }
    >
      {/* Stats Overview */}
      <div className="provider-grid" style={{ marginBottom: '2rem' }}>
        <div className="provider-card stats-card" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <div className="card-header">
            <h3 className="card-title" style={{ color: 'white' }}>Total Items</h3>
            <FaImage style={{ color: 'white', fontSize: '1.5rem' }} />
          </div>
          <div className="stats-number" style={{ color: 'white' }}>{stats.totalItems}</div>
          <div className="stats-label" style={{ color: 'rgba(255,255,255,0.9)' }}>
            Portfolio items
          </div>
        </div>

        <div className="provider-card stats-card" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
          <div className="card-header">
            <h3 className="card-title" style={{ color: 'white' }}>Featured</h3>
            <FaStar style={{ color: 'white', fontSize: '1.5rem' }} />
          </div>
          <div className="stats-number" style={{ color: 'white' }}>{stats.featuredItems}</div>
          <div className="stats-label" style={{ color: 'rgba(255,255,255,0.9)' }}>
            Featured items
          </div>
        </div>

        <div className="provider-card stats-card" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
          <div className="card-header">
            <h3 className="card-title" style={{ color: 'white' }}>Total Views</h3>
            <FaEye style={{ color: 'white', fontSize: '1.5rem' }} />
          </div>
          <div className="stats-number" style={{ color: 'white' }}>{stats.totalViews}</div>
          <div className="stats-label" style={{ color: 'rgba(255,255,255,0.9)' }}>
            Total portfolio views
          </div>
        </div>

        <div className="provider-card stats-card" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
          <div className="card-header">
            <h3 className="card-title" style={{ color: 'white' }}>Avg. Rating</h3>
            <FaStar style={{ color: 'white', fontSize: '1.5rem' }} />
          </div>
          <div className="stats-number" style={{ color: 'white' }}>{stats.averageRating}</div>
          <div className="stats-label" style={{ color: 'rgba(255,255,255,0.9)' }}>
            Average rating
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="provider-card" style={{ marginBottom: '2rem' }}>
        <div className="card-header">
          <h3 className="card-title">Filter Portfolio</h3>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search */}
          <div style={{ flex: 1, minWidth: '300px' }}>
            <div style={{ position: 'relative' }}>
              <FaSearch style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#666'
              }} />
              <input
                type="text"
                placeholder="Search portfolio items..."
                className="form-control"
                style={{ paddingLeft: '2.5rem' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="category-filter">
            <select
              className="form-control"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{ minWidth: '150px' }}
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="sort-filter">
            <select
              className="form-control"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ minWidth: '150px' }}
            >
              <option value="date">Newest First</option>
              <option value="rating">Highest Rated</option>
              <option value="views">Most Viewed</option>
              <option value="title">Title (A-Z)</option>
            </select>
          </div>

          {/* Featured Toggle */}
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={showFeaturedOnly}
              onChange={(e) => setShowFeaturedOnly(e.target.checked)}
              style={{ width: '18px', height: '18px' }}
            />
            <span>Show Featured Only</span>
          </label>
        </div>
      </div>

      {/* Portfolio Grid */}
      <div className="portfolio-grid">
        {filteredItems.length === 0 ? (
          <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
            <div className="empty-state-icon">🖼️</div>
            <h3>No portfolio items found</h3>
            <p>Try changing your filters or add new portfolio items</p>
            <button 
              className="btn-primary"
              onClick={() => setShowAddModal(true)}
            >
              Add Your First Item
            </button>
          </div>
        ) : (
          filteredItems.map(item => (
            <div key={item.id} className="portfolio-item">
              {/* Item Header */}
              <div className="item-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {getTypeIcon(item.type)}
                  <span className="item-type">{item.type?.toUpperCase()}</span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    className="item-action-btn"
                    onClick={() => handleToggleFeatured(item.id)}
                    title={item.featured ? 'Remove from featured' : 'Mark as featured'}
                  >
                    <FaStar style={{ color: item.featured ? '#ffd700' : '#ccc' }} />
                  </button>
                  <button
                    className="item-action-btn"
                    title="Edit"
                    onClick={() => alert(`Edit item ${item.id}`)}
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="item-action-btn"
                    onClick={() => handleDeleteItem(item.id)}
                    title="Delete"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>

              {/* Item Thumbnail */}
              <div className="item-thumbnail">
                <img 
                  src={item.thumbnail || item.url} 
                  alt={item.title}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400';
                  }}
                />
                {item.featured && (
                  <div className="featured-badge">
                    <FaStar /> Featured
                  </div>
                )}
              </div>

              {/* Item Info */}
              <div className="item-info">
                <h4 className="item-title">{item.title}</h4>
                <p className="item-description">{item.description}</p>
                
                <div className="item-meta">
                  <span className="item-category">{item.category}</span>
                  <span className="item-date">
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                </div>

                {/* Tags */}
                <div className="item-tags">
                  {item.tags?.map(tag => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>

                {/* Stats */}
                <div className="item-stats">
                  <div className="stat">
                    <FaStar />
                    <span>{item.rating || 0}</span>
                  </div>
                  <div className="stat">
                    <FaEye />
                    <span>{item.views || 0} views</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="item-actions">
                  <button 
                    className="btn-secondary"
                    onClick={() => alert(`View details of ${item.title}`)}
                  >
                    <FaEye style={{ marginRight: '0.3rem' }} />
                    View
                  </button>
                  <button 
                    className="btn-secondary"
                    onClick={() => alert(`Share ${item.title}`)}
                  >
                    <FaShare style={{ marginRight: '0.3rem' }} />
                    Share
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Add Portfolio Item</h3>
              <button 
                className="modal-close"
                onClick={() => setShowAddModal(false)}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="provider-grid">
                <div className="form-group">
                  <label className="form-label">Title *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newItem.title}
                    onChange={(e) => setNewItem({...newItem, title: e.target.value})}
                    placeholder="e.g., Modern Apartment Painting"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select
                    className="form-control"
                    value={newItem.category}
                    onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                  >
                    <option value="">Select Category</option>
                    {categories.filter(c => c !== 'All').map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={newItem.description}
                    onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                    placeholder="Describe your work..."
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Type</label>
                  <select
                    className="form-control"
                    value={newItem.type}
                    onChange={(e) => setNewItem({...newItem, type: e.target.value})}
                  >
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                    <option value="document">Document</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Tags</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newItem.tags}
                    onChange={(e) => setNewItem({...newItem, tags: e.target.value})}
                    placeholder="e.g., modern, apartment, painting"
                  />
                  <small className="form-text">Separate tags with commas</small>
                </div>

                <div className="form-group">
                  <label className="form-label">Upload File *</label>
                  <input
                    type="file"
                    className="form-control"
                    onChange={(e) => setNewItem({...newItem, file: e.target.files[0]})}
                    accept={newItem.type === 'image' ? 'image/*' : 
                            newItem.type === 'video' ? 'video/*' : '.pdf,.doc,.docx'}
                  />
                </div>

                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="checkbox"
                      checked={newItem.featured}
                      onChange={(e) => setNewItem({...newItem, featured: e.target.checked})}
                    />
                    <span>Mark as featured item</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="btn-secondary"
                onClick={() => setShowAddModal(false)}
                disabled={uploading}
              >
                Cancel
              </button>
              <button 
                className="btn-primary"
                onClick={handleAddItem}
                disabled={uploading}
              >
                {uploading ? 'Uploading...' : 'Add Item'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ProviderPageTemplate>
  );
};

export default ProviderPortfolio;