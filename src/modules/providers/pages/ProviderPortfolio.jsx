import React, { useState } from 'react';
import ProviderPageTemplate from '../templates/ProviderPageTemplate';
import { 
  FaPlus, FaEdit, FaTrash, FaStar, FaEye, FaDownload, 
  FaFilter, FaSearch, FaImage, FaVideo, FaFilePdf, FaShare
} from 'react-icons/fa';

const ProviderPortfolio = () => {
  const [portfolioItems, setPortfolioItems] = useState([
    {
      id: 1,
      title: 'Modern Apartment Painting',
      description: 'Complete interior painting for 3-bedroom apartment in Lekki',
      category: 'Painting',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
      date: '2024-01-10',
      rating: 4.8,
      views: 245,
      tags: ['interior', 'modern', 'apartment'],
      featured: true
    },
    {
      id: 2,
      title: 'Office Deep Cleaning',
      description: 'Commercial cleaning for 10-story office building',
      category: 'Cleaning',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w-400',
      date: '2024-01-05',
      rating: 4.9,
      views: 189,
      tags: ['commercial', 'office', 'deep-clean'],
      featured: true
    },
    {
      id: 3,
      title: 'Kitchen Renovation',
      description: 'Complete kitchen remodeling with modern fixtures',
      category: 'Renovation',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=400',
      date: '2023-12-20',
      rating: 4.7,
      views: 312,
      tags: ['kitchen', 'renovation', 'modern'],
      featured: false
    },
    {
      id: 4,
      title: 'Garden Landscape Design',
      description: 'Landscaping and garden setup for residential property',
      category: 'Landscaping',
      type: 'video',
      url: 'https://example.com/video1.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=400',
      date: '2023-12-15',
      rating: 4.6,
      views: 156,
      tags: ['garden', 'landscaping', 'outdoor'],
      featured: false
    },
    {
      id: 5,
      title: 'Plumbing System Upgrade',
      description: 'Complete plumbing system replacement',
      category: 'Plumbing',
      type: 'document',
      url: 'https://example.com/report1.pdf',
      thumbnail: 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=400',
      date: '2023-12-10',
      rating: 4.5,
      views: 98,
      tags: ['plumbing', 'system', 'upgrade'],
      featured: false
    },
    {
      id: 6,
      title: 'Electrical Wiring Project',
      description: 'New electrical wiring for residential building',
      category: 'Electrical',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400',
      date: '2023-11-28',
      rating: 4.8,
      views: 201,
      tags: ['electrical', 'wiring', 'safety'],
      featured: true
    }
  ]);

  const [categories] = useState(['All', 'Painting', 'Cleaning', 'Renovation', 'Plumbing', 'Electrical', 'Landscaping']);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);

  const [newItem, setNewItem] = useState({
    title: '',
    description: '',
    category: '',
    type: 'image',
    file: null,
    tags: '',
    featured: false
  });

  const [showAddModal, setShowAddModal] = useState(false);

  const filteredItems = portfolioItems.filter(item => {
    if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;
    if (showFeaturedOnly && !item.featured) return false;
    if (searchTerm) {
      return (
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    return true;
  }).sort((a, b) => {
    switch(sortBy) {
      case 'date': return new Date(b.date) - new Date(a.date);
      case 'rating': return b.rating - a.rating;
      case 'views': return b.views - a.views;
      case 'title': return a.title.localeCompare(b.title);
      default: return 0;
    }
  });

  const handleAddItem = () => {
    if (!newItem.title || !newItem.category) {
      alert('Please fill in required fields');
      return;
    }

    const newPortfolioItem = {
      id: portfolioItems.length + 1,
      title: newItem.title,
      description: newItem.description,
      category: newItem.category,
      type: newItem.type,
      url: newItem.type === 'image' ? 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400' :
           newItem.type === 'video' ? 'https://example.com/video.mp4' : 'https://example.com/document.pdf',
      thumbnail: newItem.type === 'video' ? 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400' :
                newItem.type === 'document' ? 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400' : null,
      date: new Date().toISOString().split('T')[0],
      rating: 0,
      views: 0,
      tags: newItem.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      featured: newItem.featured
    };

    setPortfolioItems([newPortfolioItem, ...portfolioItems]);
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
  };

  const handleDeleteItem = (id) => {
    if (window.confirm('Are you sure you want to delete this portfolio item?')) {
      setPortfolioItems(portfolioItems.filter(item => item.id !== id));
    }
  };

  const handleToggleFeatured = (id) => {
    setPortfolioItems(portfolioItems.map(item => 
      item.id === id ? { ...item, featured: !item.featured } : item
    ));
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'image': return <FaImage />;
      case 'video': return <FaVideo />;
      case 'document': return <FaFilePdf />;
      default: return <FaImage />;
    }
  };

  const stats = {
    totalItems: portfolioItems.length,
    featuredItems: portfolioItems.filter(item => item.featured).length,
    totalViews: portfolioItems.reduce((sum, item) => sum + item.views, 0),
    averageRating: (portfolioItems.reduce((sum, item) => sum + item.rating, 0) / portfolioItems.length).toFixed(1)
  };

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
                  <span className="item-type">{item.type.toUpperCase()}</span>
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
                  <span className="item-date">{item.date}</span>
                </div>

                {/* Tags */}
                <div className="item-tags">
                  {item.tags.map(tag => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>

                {/* Stats */}
                <div className="item-stats">
                  <div className="stat">
                    <FaStar />
                    <span>{item.rating}</span>
                  </div>
                  <div className="stat">
                    <FaEye />
                    <span>{item.views} views</span>
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
                  <label className="form-label">Upload File</label>
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
              >
                Cancel
              </button>
              <button 
                className="btn-primary"
                onClick={handleAddItem}
              >
                Add Item
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .portfolio-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
        }
        
        .portfolio-item {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          border: 1px solid #e0e0e0;
        }
        
        .portfolio-item:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
          border-color: #1a237e;
        }
        
        .item-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.5rem;
          background: #f8f9fa;
          border-bottom: 1px solid #e0e0e0;
        }
        
        .item-type {
          font-size: 0.8rem;
          font-weight: 600;
          color: #666;
          text-transform: uppercase;
        }
        
        .item-action-btn {
          width: 30px;
          height: 30px;
          border-radius: 6px;
          border: 1px solid #ddd;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .item-action-btn:hover {
          background: #f8f9fa;
          border-color: #1a237e;
          color: #1a237e;
        }
        
        .item-thumbnail {
          position: relative;
          height: 200px;
          overflow: hidden;
        }
        
        .item-thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }
        
        .portfolio-item:hover .item-thumbnail img {
          transform: scale(1.05);
        }
        
        .featured-badge {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: linear-gradient(135deg, #ffd700 0%, #ff9800 100%);
          color: white;
          padding: 0.3rem 0.8rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.3rem;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .item-info {
          padding: 1.5rem;
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        
        .item-title {
          margin: 0 0 0.5rem 0;
          font-size: 1.2rem;
          font-weight: 600;
          color: #1a237e;
        }
        
        .item-description {
          margin: 0 0 1rem 0;
          color: #666;
          font-size: 0.9rem;
          line-height: 1.5;
          flex: 1;
        }
        
        .item-meta {
          display: flex;
          justify-content: space-between;
          margin-bottom: 1rem;
          padding: 0.5rem 0;
          border-top: 1px solid #e0e0e0;
          border-bottom: 1px solid #e0e0e0;
        }
        
        .item-category {
          background: #e8f0fe;
          color: #1a237e;
          padding: 0.3rem 0.8rem;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 600;
        }
        
        .item-date {
          color: #666;
          font-size: 0.8rem;
        }
        
        .item-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }
        
        .tag {
          background: #f0f0f0;
          color: #666;
          padding: 0.2rem 0.6rem;
          border-radius: 12px;
          font-size: 0.8rem;
        }
        
        .item-stats {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
        }
        
        .stat {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          color: #666;
          font-size: 0.9rem;
        }
        
        .item-actions {
          display: flex;
          gap: 0.5rem;
          margin-top: auto;
        }
        
        .item-actions button {
          flex: 1;
          padding: 0.5rem;
          font-size: 0.9rem;
        }
        
        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }
        
        .modal-content {
          background: white;
          border-radius: 12px;
          width: 100%;
          max-width: 800px;
          max-height: 90vh;
          overflow-y: auto;
        }
        
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid #e0e0e0;
        }
        
        .modal-header h3 {
          margin: 0;
        }
        
        .modal-close {
          background: none;
          border: none;
          font-size: 2rem;
          cursor: pointer;
          color: #666;
          line-height: 1;
        }
        
        .modal-body {
          padding: 1.5rem;
        }
        
        .modal-footer {
          padding: 1.5rem;
          border-top: 1px solid #e0e0e0;
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
        }
        
        .form-text {
          display: block;
          margin-top: 0.3rem;
          color: #666;
          font-size: 0.8rem;
        }
        
        @media (max-width: 768px) {
          .portfolio-grid {
            grid-template-columns: 1fr;
          }
          
          .item-actions {
            flex-direction: column;
          }
          
          .modal-content {
            margin: 1rem;
          }
        }
      `}</style>
    </ProviderPageTemplate>
  );
};

export default ProviderPortfolio;