// src/modules/providers/pages/ProviderLeads.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import { supabase } from '../../../shared/lib/supabaseClient';
import {
  Bell, MessageSquare, Clock, CheckCircle,
  XCircle, Filter, Search, MapPin, DollarSign,
  Calendar, User, Phone, Mail, Eye,
  ChevronRight, Star, AlertCircle, TrendingUp,
  Users, Target, Zap, RefreshCw
} from 'lucide-react';
import './ProviderLeads.css';

const ProviderLeads = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [provider, setProvider] = useState(null);
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState(null);
  const [showLeadDetails, setShowLeadDetails] = useState(false);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  
  // Lead stats
  const [leadStats, setLeadStats] = useState({
    total: 0,
    new: 0,
    contacted: 0,
    quoted: 0,
    booked: 0,
    lost: 0,
    conversionRate: 0,
    avgResponseTime: '2h'
  });
  
  // Available services for filter (will be populated from leads)
  const [availableServices, setAvailableServices] = useState([]);

  useEffect(() => {
    if (user?.id) {
      loadLeadsData();
    }
  }, [user]);

  useEffect(() => {
    filterLeads();
    calculateLeadStats();
  }, [leads, searchTerm, statusFilter, serviceFilter, urgencyFilter, dateFilter]);

  const loadLeadsData = async () => {
    try {
      setLoading(true);
      
      // Fetch leads for this provider from Supabase
      const { data: leadsData, error } = await supabase
        .from('provider_leads')
        .select('*')
        .eq('provider_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform to match component's expected fields (if needed)
      const formattedLeads = leadsData.map(lead => ({
        ...lead,
        // Ensure date field exists (created_at)
        date: lead.created_at,
        // Map any field name differences (e.g., service -> service)
      }));

      setLeads(formattedLeads || []);

      // Extract unique services for filter
      const services = [...new Set(formattedLeads.map(l => l.service))];
      setAvailableServices(services);
      
    } catch (error) {
      console.error('Error loading leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterLeads = () => {
    let filtered = leads.filter(lead => {
      // Filter by status
      if (statusFilter !== 'all' && lead.status !== statusFilter) return false;
      
      // Filter by service
      if (serviceFilter !== 'all' && lead.service !== serviceFilter) return false;
      
      // Filter by urgency
      if (urgencyFilter !== 'all' && lead.urgency !== urgencyFilter) return false;
      
      // Filter by date
      if (dateFilter !== 'all') {
        const leadDate = new Date(lead.created_at);
        const now = new Date();
        const diffTime = Math.abs(now - leadDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        switch (dateFilter) {
          case 'today': return diffDays === 0;
          case 'week': return diffDays <= 7;
          case 'month': return diffDays <= 30;
          default: return true;
        }
      }
      
      // Filter by search term
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        return (
          lead.client_name?.toLowerCase().includes(term) ||
          lead.service?.toLowerCase().includes(term) ||
          lead.location?.toLowerCase().includes(term) ||
          lead.description?.toLowerCase().includes(term)
        );
      }
      
      return true;
    });
    
    // Sort by urgency and date
    filtered.sort((a, b) => {
      const urgencyOrder = { high: 3, medium: 2, low: 1 };
      if (urgencyOrder[b.urgency] !== urgencyOrder[a.urgency]) {
        return urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
      }
      return new Date(b.created_at) - new Date(a.created_at);
    });
    
    setFilteredLeads(filtered);
  };

  const calculateLeadStats = (leadsList = filteredLeads) => {
    const stats = {
      total: leadsList.length,
      new: leadsList.filter(lead => lead.status === 'new').length,
      contacted: leadsList.filter(lead => lead.status === 'contacted').length,
      quoted: leadsList.filter(lead => lead.status === 'quoted').length,
      booked: leadsList.filter(lead => lead.status === 'booked').length,
      lost: leadsList.filter(lead => lead.status === 'lost').length,
      conversionRate: 0,
      avgResponseTime: '2h' // You can calculate this from data if available
    };
    
    const convertedLeads = stats.booked;
    const totalContacted = stats.contacted + stats.quoted + stats.booked + stats.lost;
    stats.conversionRate = totalContacted > 0 
      ? Math.round((convertedLeads / totalContacted) * 100)
      : 0;
    
    setLeadStats(stats);
  };

  const updateLeadStatus = async (leadId, newStatus) => {
    try {
      const { error } = await supabase
        .from('provider_leads')
        .update({ 
          status: newStatus,
          last_contact: newStatus !== 'new' ? new Date().toISOString() : null
        })
        .eq('id', leadId);

      if (error) throw error;

      // Update local state
      const updatedLeads = leads.map(lead => {
        if (lead.id === leadId) {
          const updated = {
            ...lead,
            status: newStatus,
            last_contact: newStatus !== 'new' ? new Date().toISOString() : lead.last_contact
          };
          if (selectedLead && selectedLead.id === leadId) setSelectedLead(updated);
          return updated;
        }
        return lead;
      });
      
      setLeads(updatedLeads);

      const statusMessages = {
        contacted: 'Lead marked as contacted',
        quoted: 'Quote sent to client',
        booked: '🎉 Congratulations! Lead converted to booking!',
        lost: 'Lead marked as lost'
      };
      
      if (statusMessages[newStatus]) {
        alert(statusMessages[newStatus]);
      }
    } catch (error) {
      console.error('Error updating lead status:', error);
      alert('Failed to update status. Please try again.');
    }
  };

  const openLeadDetails = (lead) => {
    setSelectedLead(lead);
    setShowLeadDetails(true);
  };

  const closeLeadDetails = () => {
    setShowLeadDetails(false);
    setSelectedLead(null);
  };

  const startChat = (lead) => {
    // Navigate to chat with this lead
    navigate(`/messages/chat/new`, { 
      state: { 
        recipientId: `client_${lead.id}`, // Or use a real user ID if available
        recipientName: lead.client_name,
        leadId: lead.id,
        service: lead.service
      }
    });
  };

  const sendQuote = (lead) => {
    const quoteAmount = prompt(`Enter quote amount for ${lead.service}:`, lead.budget?.split(' - ')[0] || '');
    if (quoteAmount) {
      updateLeadStatus(lead.id, 'quoted');
      alert(`Quote of ₦${quoteAmount} sent to ${lead.client_name}`);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return '#3b82f6';
      case 'contacted': return '#f59e0b';
      case 'quoted': return '#8b5cf6';
      case 'booked': return '#10b981';
      case 'lost': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'new': return <Bell size={14} />;
      case 'contacted': return <MessageSquare size={14} />;
      case 'quoted': return <DollarSign size={14} />;
      case 'booked': return <CheckCircle size={14} />;
      case 'lost': return <XCircle size={14} />;
      default: return <Bell size={14} />;
    }
  };

  const getUrgencyBadge = (urgency) => {
    const config = {
      high: { color: '#ef4444', label: 'High', icon: '🚨' },
      medium: { color: '#f59e0b', label: 'Medium', icon: '⚠️' },
      low: { color: '#10b981', label: 'Low', icon: '📅' }
    };
    
    const { color, label, icon } = config[urgency] || config.low;
    
    return (
      <span className="urgency-badge" style={{ backgroundColor: `${color}20`, color }}>
        {icon} {label}
      </span>
    );
  };

  const getTimeSince = (dateString) => {
    if (!dateString) return 'Just now';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      return `${diffDays}d ago`;
    }
  };

  const refreshLeads = async () => {
    setLoading(true);
    await loadLeadsData();
    alert('Leads refreshed!');
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setServiceFilter('all');
    setUrgencyFilter('all');
    setDateFilter('all');
  };

  if (loading) {
    return (
      <div className="leads-loading">
        <div className="loading-spinner"></div>
        <p>Loading leads...</p>
      </div>
    );
  }

  return (
    <div className="provider-leads">
      <div className="leads-container">
        {/* Header */}
        <div className="leads-header">
          <div className="header-content">
            <h1>
              <Bell size={24} />
              Service Leads
            </h1>
            <p className="subtitle">
              Manage incoming service requests and convert them to bookings
            </p>
          </div>
          
          <div className="header-actions">
            <button 
              className="btn btn-secondary"
              onClick={refreshLeads}
            >
              <RefreshCw size={18} />
              Refresh
            </button>
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/providers/analytics')}
            >
              <TrendingUp size={18} />
              View Analytics
            </button>
          </div>
        </div>
        
        {/* Stats Overview */}
        <div className="leads-stats">
          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#3b82f620' }}>
              <Bell size={24} color="#3b82f6" />
            </div>
            <div className="stat-content">
              <h3>{leadStats.total}</h3>
              <p>Total Leads</p>
            </div>
            <div className="stat-trend">
              <TrendingUp size={16} color="#059669" />
              <span className="positive">+12%</span>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#f59e0b20' }}>
              <MessageSquare size={24} color="#f59e0b" />
            </div>
            <div className="stat-content">
              <h3>{leadStats.new}</h3>
              <p>New Leads</p>
              <small>Require action</small>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#10b98120' }}>
              <CheckCircle size={24} color="#10b981" />
            </div>
            <div className="stat-content">
              <h3>{leadStats.booked}</h3>
              <p>Converted</p>
              <small>Successful bookings</small>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#8b5cf620' }}>
              <Target size={24} color="#8b5cf6" />
            </div>
            <div className="stat-content">
              <h3>{leadStats.conversionRate}%</h3>
              <p>Conversion Rate</p>
              <small>Lead to booking</small>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#ec489920' }}>
              <Clock size={24} color="#ec4899" />
            </div>
            <div className="stat-content">
              <h3>{leadStats.avgResponseTime}</h3>
              <p>Avg. Response</p>
              <small>Response time</small>
            </div>
          </div>
        </div>
        
        {/* Quick Tips Banner */}
        <div className="tips-banner">
          <div className="banner-content">
            <AlertCircle size={20} color="#f59e0b" />
            <div className="banner-text">
              <strong>Quick Response = Higher Conversion!</strong>
              <span>Leads contacted within 1 hour are 5x more likely to convert to bookings.</span>
            </div>
            <button 
              className="btn btn-small btn-primary"
              onClick={() => {
                setStatusFilter('new');
                setUrgencyFilter('high');
              }}
            >
              <Zap size={16} />
              Show High Priority
            </button>
          </div>
        </div>
        
        {/* Filters Section */}
        <div className="leads-filters">
          <div className="filters-header">
            <h3>
              <Filter size={20} />
              Filter Leads
            </h3>
            <button 
              className="btn btn-small btn-outline"
              onClick={clearFilters}
            >
              Clear Filters
            </button>
          </div>
          
          <div className="filters-grid">
            {/* Search */}
            <div className="filter-group">
              <div className="search-bar">
                <Search size={18} color="#9ca3af" />
                <input
                  type="text"
                  placeholder="Search leads by client, service, location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            {/* Status Filter */}
            <div className="filter-group">
              <label>Status</label>
              <div className="filter-buttons">
                <button
                  className={`filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setStatusFilter('all')}
                >
                  All ({leadStats.total})
                </button>
                <button
                  className={`filter-btn ${statusFilter === 'new' ? 'active' : ''}`}
                  onClick={() => setStatusFilter('new')}
                >
                  <Bell size={14} />
                  New ({leadStats.new})
                </button>
                <button
                  className={`filter-btn ${statusFilter === 'contacted' ? 'active' : ''}`}
                  onClick={() => setStatusFilter('contacted')}
                >
                  <MessageSquare size={14} />
                  Contacted ({leadStats.contacted})
                </button>
                <button
                  className={`filter-btn ${statusFilter === 'quoted' ? 'active' : ''}`}
                  onClick={() => setStatusFilter('quoted')}
                >
                  <DollarSign size={14} />
                  Quoted ({leadStats.quoted})
                </button>
                <button
                  className={`filter-btn ${statusFilter === 'booked' ? 'active' : ''}`}
                  onClick={() => setStatusFilter('booked')}
                >
                  <CheckCircle size={14} />
                  Booked ({leadStats.booked})
                </button>
              </div>
            </div>
            
            {/* Other Filters */}
            <div className="filter-row">
              <div className="filter-field">
                <label>Service Type</label>
                <select
                  value={serviceFilter}
                  onChange={(e) => setServiceFilter(e.target.value)}
                >
                  <option value="all">All Services</option>
                  {availableServices.map(service => (
                    <option key={service} value={service}>
                      {service}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="filter-field">
                <label>Urgency</label>
                <select
                  value={urgencyFilter}
                  onChange={(e) => setUrgencyFilter(e.target.value)}
                >
                  <option value="all">All Urgency</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              
              <div className="filter-field">
                <label>Date Range</label>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Results Info */}
          <div className="results-info">
            <span>
              Showing {filteredLeads.length} of {leads.length} leads
              {searchTerm && ` matching "${searchTerm}"`}
            </span>
            <span className="conversion-rate">
              Current conversion rate: <strong>{leadStats.conversionRate}%</strong>
            </span>
          </div>
        </div>
        
        {/* Leads List */}
        {filteredLeads.length === 0 ? (
          <div className="no-leads">
            <div className="empty-icon">📭</div>
            <h3>No leads found</h3>
            <p>
              {leads.length === 0 
                ? "You haven't received any leads yet. Complete your profile to appear in more searches!"
                : "No leads match your current filters. Try adjusting your search criteria."}
            </p>
            {leads.length === 0 && (
              <button 
                className="btn btn-primary"
                onClick={() => navigate('/providers/profile/edit')}
              >
                <Star size={18} />
                Optimize Profile
              </button>
            )}
          </div>
        ) : (
          <div className="leads-list">
            {filteredLeads.map(lead => (
              <div key={lead.id} className="lead-card">
                <div className="lead-header">
                  <div className="lead-info">
                    <h3>{lead.service}</h3>
                    <div className="lead-meta">
                      <span className="client-info">
                        <User size={14} />
                        {lead.client_name}
                      </span>
                      <span className="location-info">
                        <MapPin size={14} />
                        {lead.location}
                      </span>
                      <span className="date-info">
                        <Calendar size={14} />
                        {getTimeSince(lead.created_at)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="lead-status">
                    <span 
                      className="status-badge"
                      style={{ 
                        backgroundColor: `${getStatusColor(lead.status)}20`,
                        color: getStatusColor(lead.status)
                      }}
                    >
                      {getStatusIcon(lead.status)}
                      {lead.status.toUpperCase()}
                    </span>
                    {getUrgencyBadge(lead.urgency)}
                  </div>
                </div>
                
                <div className="lead-body">
                  <p className="lead-description">{lead.description}</p>
                  
                  <div className="lead-details">
                    <div className="detail-item">
                      <DollarSign size={14} />
                      <span>{lead.budget}</span>
                    </div>
                    <div className="detail-item">
                      <Clock size={14} />
                      <span>Preferred: {lead.preferred_date}</span>
                    </div>
                    <div className="detail-item">
                      <span className="source-badge">{lead.source}</span>
                    </div>
                  </div>
                </div>
                
                <div className="lead-footer">
                  <div className="footer-left">
                    {lead.last_contact && (
                      <span className="last-contact">
                        Last contact: {getTimeSince(lead.last_contact)}
                      </span>
                    )}
                    {lead.messages > 0 && (
                      <span className="message-count">
                        <MessageSquare size={12} />
                        {lead.messages} messages
                      </span>
                    )}
                  </div>
                  
                  <div className="footer-actions">
                    <button 
                      className="btn btn-small btn-outline"
                      onClick={() => openLeadDetails(lead)}
                    >
                      <Eye size={14} />
                      View Details
                    </button>
                    
                    {lead.status === 'new' && (
                      <>
                        <button 
                          className="btn btn-small btn-primary"
                          onClick={() => startChat(lead)}
                        >
                          <MessageSquare size={14} />
                          Contact Now
                        </button>
                        <button 
                          className="btn btn-small btn-secondary"
                          onClick={() => sendQuote(lead)}
                        >
                          <DollarSign size={14} />
                          Send Quote
                        </button>
                      </>
                    )}
                    
                    {lead.status === 'contacted' && (
                      <button 
                        className="btn btn-small btn-primary"
                        onClick={() => sendQuote(lead)}
                      >
                        <DollarSign size={14} />
                        Send Quote
                      </button>
                    )}
                    
                    {lead.status === 'quoted' && (
                      <button 
                        className="btn btn-small btn-success"
                        onClick={() => updateLeadStatus(lead.id, 'booked')}
                      >
                        <CheckCircle size={14} />
                        Mark as Booked
                      </button>
                    )}
                    
                    <div className="status-dropdown">
                      <select
                        value={lead.status}
                        onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                        className="status-select"
                      >
                        <option value="new">Mark as New</option>
                        <option value="contacted">Mark as Contacted</option>
                        <option value="quoted">Mark as Quoted</option>
                        <option value="booked">Mark as Booked</option>
                        <option value="lost">Mark as Lost</option>
                      </select>
                      <ChevronRight size={14} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Lead Conversion Tips */}
        <div className="conversion-tips">
          <h3>
            <Target size={20} />
            Lead Conversion Tips
          </h3>
          
          <div className="tips-grid">
            <div className="tip-card">
              <div className="tip-icon" style={{ backgroundColor: '#3b82f620' }}>
                <Clock size={20} color="#3b82f6" />
              </div>
              <div className="tip-content">
                <h4>Respond Quickly</h4>
                <p>Contact new leads within 1 hour for 5x higher conversion rate.</p>
              </div>
            </div>
            
            <div className="tip-card">
              <div className="tip-icon" style={{ backgroundColor: '#10b98120' }}>
                <MessageSquare size={20} color="#10b981" />
              </div>
              <div className="tip-content">
                <h4>Personalize Messages</h4>
                <p>Use client's name and reference specific needs from their request.</p>
              </div>
            </div>
            
            <div className="tip-card">
              <div className="tip-icon" style={{ backgroundColor: '#f59e0b20' }}>
                <DollarSign size={20} color="#f59e0b" />
              </div>
              <div className="tip-content">
                <h4>Clear Quotes</h4>
                <p>Break down costs and include timelines to build trust.</p>
              </div>
            </div>
            
            <div className="tip-card">
              <div className="tip-icon" style={{ backgroundColor: '#8b5cf620' }}>
                <Users size={20} color="#8b5cf6" />
              </div>
              <div className="tip-content">
                <h4>Follow Up</h4>
                <p>Check in after 24 hours if you haven't heard back.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Lead Details Modal */}
      {showLeadDetails && selectedLead && (
        <div className="lead-details-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Lead Details</h3>
              <button 
                className="modal-close"
                onClick={closeLeadDetails}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="lead-header-details">
                <div className="lead-title">
                  <h2>{selectedLead.service}</h2>
                  <div className="lead-tags">
                    <span 
                      className="status-badge"
                      style={{ 
                        backgroundColor: `${getStatusColor(selectedLead.status)}20`,
                        color: getStatusColor(selectedLead.status)
                      }}
                    >
                      {getStatusIcon(selectedLead.status)}
                      {selectedLead.status.toUpperCase()}
                    </span>
                    {getUrgencyBadge(selectedLead.urgency)}
                  </div>
                </div>
                
                <div className="lead-meta-details">
                  <div className="meta-item">
                    <strong>Received:</strong>
                    <span>{new Date(selectedLead.created_at).toLocaleString()}</span>
                  </div>
                  <div className="meta-item">
                    <strong>Source:</strong>
                    <span>{selectedLead.source}</span>
                  </div>
                  <div className="meta-item">
                    <strong>Duration:</strong>
                    <span>{selectedLead.duration}</span>
                  </div>
                </div>
              </div>
              
              <div className="client-info-section">
                <h4>
                  <User size={18} />
                  Client Information
                </h4>
                <div className="client-details">
                  <div className="detail-row">
                    <div className="detail-column">
                      <strong>Name:</strong>
                      <span>{selectedLead.client_name}</span>
                    </div>
                    <div className="detail-column">
                      <strong>Phone:</strong>
                      <span>{selectedLead.client_phone}</span>
                    </div>
                  </div>
                  <div className="detail-row">
                    <div className="detail-column">
                      <strong>Email:</strong>
                      <span>{selectedLead.client_email}</span>
                    </div>
                    <div className="detail-column">
                      <strong>Location:</strong>
                      <span>{selectedLead.location}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="service-details-section">
                <h4>
                  <DollarSign size={18} />
                  Service Details
                </h4>
                <div className="service-details">
                  <div className="detail-item-full">
                    <strong>Budget Range:</strong>
                    <span className="budget-amount">{selectedLead.budget}</span>
                  </div>
                  <div className="detail-item-full">
                    <strong>Preferred Date:</strong>
                    <span>{selectedLead.preferred_date}</span>
                  </div>
                  <div className="detail-item-full">
                    <strong>Project Description:</strong>
                    <p className="description-text">{selectedLead.description}</p>
                  </div>
                </div>
              </div>
              
              <div className="communication-history">
                <h4>
                  <MessageSquare size={18} />
                  Communication History
                </h4>
                {selectedLead.last_contact ? (
                  <div className="history-item">
                    <div className="history-content">
                      <strong>Last Contact:</strong>
                      <span>{new Date(selectedLead.last_contact).toLocaleString()}</span>
                    </div>
                    <div className="history-content">
                      <strong>Total Messages:</strong>
                      <span>{selectedLead.messages}</span>
                    </div>
                  </div>
                ) : (
                  <div className="no-history">
                    <MessageSquare size={24} color="#9ca3af" />
                    <p>No communication history yet</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="modal-footer">
              <div className="footer-actions">
                <button 
                  className="btn btn-secondary"
                  onClick={closeLeadDetails}
                >
                  Close
                </button>
                
                <div className="action-buttons">
                  <button 
                    className="btn btn-outline"
                    onClick={() => {
                      navigator.clipboard.writeText(selectedLead.client_phone);
                      alert('Phone number copied to clipboard!');
                    }}
                  >
                    <Phone size={16} />
                    Copy Phone
                  </button>
                  
                  <button 
                    className="btn btn-outline"
                    onClick={() => {
                      navigator.clipboard.writeText(selectedLead.client_email);
                      alert('Email copied to clipboard!');
                    }}
                  >
                    <Mail size={16} />
                    Copy Email
                  </button>
                  
                  <button 
                    className="btn btn-primary"
                    onClick={() => {
                      startChat(selectedLead);
                      closeLeadDetails();
                    }}
                  >
                    <MessageSquare size={16} />
                    Start Chat
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderLeads;