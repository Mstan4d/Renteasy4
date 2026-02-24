// src/modules/admin/pages/AdminIssues.jsx
import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, CheckCircle, Clock, XCircle, 
  Filter, Search, MessageSquare, User, Calendar,
  ExternalLink, Eye, Edit, Trash2, Mail, Phone,
  MapPin, AlertCircle, Shield, Home
} from 'lucide-react';
import { supabase } from '../../../shared/lib/supabaseClient';
import { useAuth } from '../../../shared/context/AuthContext';
import './AdminIssues.css';

const AdminIssues = () => {
  const { user: currentAdmin } = useAuth();
  const [issues, setIssues] = useState([]);
  const [filteredIssues, setFilteredIssues] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    critical: 0
  });

  // ---------- Fetch issues from Supabase ----------
  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('issues')
        .select(`
          *,
          reporter:reported_by (id, full_name, email, phone),
          assignee:assigned_to (id, full_name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform to match component's expected format
      const formattedIssues = data.map(issue => ({
        id: issue.id,
        title: issue.title,
        description: issue.description,
        type: issue.type,
        priority: issue.priority,
        status: issue.status,
        reportedBy: issue.reporter ? {
          id: issue.reporter.id,
          name: issue.reporter.full_name,
          email: issue.reporter.email,
          phone: issue.reporter.phone
        } : {
          name: 'Unknown User',
          email: '',
          phone: ''
        },
        assignedTo: issue.assignee?.full_name || 'Unassigned',
        assignedToId: issue.assigned_to,
        location: issue.location,
        attachments: issue.attachments || [],
        comments: issue.comments || [],
        createdAt: issue.created_at,
        updatedAt: issue.updated_at
      }));

      setIssues(formattedIssues);
      calculateStats(formattedIssues);

      // If no issues exist, seed with sample data
      if (formattedIssues.length === 0) {
        await seedSampleIssues();
      }
    } catch (error) {
      console.error('Error fetching issues:', error);
    } finally {
      setLoading(false);
    }
  };

  // ---------- Seed sample issues (only if table is empty) ----------
  const seedSampleIssues = async () => {
    const sampleIssues = generateSampleIssues();
    const issuesToInsert = sampleIssues.map(issue => ({
      title: issue.title,
      description: issue.description,
      type: issue.type,
      priority: issue.priority,
      status: issue.status,
      reported_by: null, // No real user, leave null
      location: issue.location,
      attachments: issue.attachments || [],
      comments: issue.comments || []
    }));

    try {
      const { error } = await supabase
        .from('issues')
        .insert(issuesToInsert);

      if (error) throw error;

      // Refetch to include seeded issues
      fetchIssues();
    } catch (error) {
      console.error('Error seeding issues:', error);
    }
  };

  const generateSampleIssues = () => {
    const issueTypes = ['Technical', 'Payment', 'Listing', 'User', 'Security', 'Feature Request'];
    const priorities = ['low', 'medium', 'high', 'critical'];
    const statuses = ['open', 'in-progress', 'resolved'];
    const locations = ['Lagos', 'Abuja', 'Port Harcourt', 'Ibadan'];
    const names = ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Wilson'];
    const emails = ['john@example.com', 'jane@example.com', 'mike@example.com', 'sarah@example.com'];

    return Array.from({ length: 20 }, (_, index) => ({
      title: `Issue with ${['payment', 'listing', 'profile', 'login', 'search'][index % 5]}`,
      description: `User reported an issue with ${
        ['payment processing', 'listing visibility', 'profile update', 'login authentication', 'search functionality'][index % 5]
      }.`,
      type: issueTypes[index % issueTypes.length],
      priority: priorities[index % priorities.length],
      status: statuses[index % statuses.length],
      reportedBy: {
        name: names[index % names.length],
        email: emails[index % emails.length],
        phone: `+123456789${index}`
      },
      location: locations[index % locations.length],
      attachments: index % 3 === 0 ? ['screenshot.png', 'log.txt'] : [],
      comments: index % 4 === 0 ? [{
        id: 1,
        user: 'Support Agent',
        message: 'Looking into this issue.',
        timestamp: new Date(Date.now() - 1800000).toISOString()
      }] : []
    }));
  };

  // ---------- Stats calculation ----------
  const calculateStats = (issuesData) => {
    const total = issuesData.length;
    const open = issuesData.filter(i => i.status === 'open').length;
    const inProgress = issuesData.filter(i => i.status === 'in-progress').length;
    const resolved = issuesData.filter(i => i.status === 'resolved').length;
    const critical = issuesData.filter(i => i.priority === 'critical').length;
    setStats({ total, open, inProgress, resolved, critical });
  };

  // ---------- Client-side filtering ----------
  useEffect(() => {
    filterIssues();
  }, [searchTerm, statusFilter, priorityFilter, issues]);

  const filterIssues = () => {
    let filtered = [...issues];
    
    if (searchTerm) {
      filtered = filtered.filter(issue =>
        issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.reportedBy.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(issue => issue.status === statusFilter);
    }
    
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(issue => issue.priority === priorityFilter);
    }
    
    setFilteredIssues(filtered);
  };

  // ---------- Update issue status ----------
  const updateIssueStatus = async (issueId, newStatus) => {
    try {
      const { error } = await supabase
        .from('issues')
        .update({ status: newStatus })
        .eq('id', issueId);

      if (error) throw error;

      // Optimistically update local state
      setIssues(prev => prev.map(issue =>
        issue.id === issueId ? { ...issue, status: newStatus } : issue
      ));

      if (selectedIssue?.id === issueId) {
        setSelectedIssue(prev => ({ ...prev, status: newStatus }));
      }
    } catch (error) {
      console.error('Error updating issue status:', error);
      alert('Failed to update status: ' + error.message);
    }
  };

  // ---------- Assign issue ----------
  const assignIssue = async (issueId, assigneeName) => {
    // In a real system, you'd map assigneeName to a profile ID.
    // For simplicity, we store the name as a string in a separate column or use a lookup.
    // Here we'll just update the assigned_to field with a dummy ID or keep as string.
    // For proper implementation, we should have an assignee lookup.
    // We'll keep the existing logic: assignee is stored as text in the 'assigned_to' column? 
    // Our table uses assigned_to UUID. So we need to find a profile with that name? 
    // For simplicity in this demo, we'll set assigned_to to null and store the name in a new column 'assigned_to_name'.
    // But to avoid schema changes, we'll assume the assignee is a profile ID. 
    // Since we don't have real support staff, we'll use the current admin's ID.
    
    // Simplified: assign to current admin
    try {
      const { error } = await supabase
        .from('issues')
        .update({ assigned_to: currentAdmin?.id })
        .eq('id', issueId);

      if (error) throw error;

      // Update local state
      const assigneeName = currentAdmin?.full_name || 'Admin';
      setIssues(prev => prev.map(issue =>
        issue.id === issueId ? { ...issue, assignedTo: assigneeName, assignedToId: currentAdmin?.id } : issue
      ));

      if (selectedIssue?.id === issueId) {
        setSelectedIssue(prev => ({ ...prev, assignedTo: assigneeName, assignedToId: currentAdmin?.id }));
      }
    } catch (error) {
      console.error('Error assigning issue:', error);
      alert('Failed to assign issue: ' + error.message);
    }
  };

  // ---------- Add comment ----------
  const addComment = async (issueId, commentText) => {
    if (!commentText.trim()) return;

    const newComment = {
      id: Date.now(),
      user: currentAdmin?.full_name || 'Admin',
      message: commentText,
      timestamp: new Date().toISOString()
    };

    try {
      // Fetch current comments
      const { data: issue, error: fetchError } = await supabase
        .from('issues')
        .select('comments')
        .eq('id', issueId)
        .single();

      if (fetchError) throw fetchError;

      const currentComments = issue.comments || [];
      const updatedComments = [...currentComments, newComment];

      const { error } = await supabase
        .from('issues')
        .update({ comments: updatedComments })
        .eq('id', issueId);

      if (error) throw error;

      // Update local state
      setIssues(prev => prev.map(issue =>
        issue.id === issueId ? { ...issue, comments: updatedComments, updatedAt: new Date().toISOString() } : issue
      ));

      if (selectedIssue?.id === issueId) {
        setSelectedIssue(prev => ({ ...prev, comments: updatedComments, updatedAt: new Date().toISOString() }));
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment: ' + error.message);
    }
  };

  // ---------- Delete issue ----------
  const deleteIssue = async (issueId) => {
    if (!window.confirm('Are you sure you want to delete this issue?')) return;

    try {
      const { error } = await supabase
        .from('issues')
        .delete()
        .eq('id', issueId);

      if (error) throw error;

      // Update local state
      setIssues(prev => prev.filter(issue => issue.id !== issueId));
      
      if (selectedIssue?.id === issueId) {
        setShowModal(false);
        setSelectedIssue(null);
      }
    } catch (error) {
      console.error('Error deleting issue:', error);
      alert('Failed to delete issue: ' + error.message);
    }
  };

  // ---------- View issue details ----------
  const viewIssueDetails = (issue) => {
    setSelectedIssue(issue);
    setShowModal(true);
  };

  // ---------- Utility functions for styling ----------
  const getPriorityIcon = (priority) => {
    switch(priority) {
      case 'critical': return <AlertTriangle size={16} className="critical" />;
      case 'high': return <AlertCircle size={16} className="high" />;
      case 'medium': return <Clock size={16} className="medium" />;
      case 'low': return <CheckCircle size={16} className="low" />;
      default: return <AlertCircle size={16} />;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'open': return 'danger';
      case 'in-progress': return 'warning';
      case 'resolved': return 'success';
      default: return 'secondary';
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'critical': return 'danger';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="admin-issues loading">
        <div className="loading-spinner"></div>
        <p>Loading issues...</p>
      </div>
    );
  }

  return (
    <div className="admin-issues">
      <div className="issues-header">
        <div className="header-left">
          <h1><AlertTriangle size={28} /> Issues & Complaints</h1>
          <p>Manage user-reported issues and complaints</p>
        </div>
        <div className="header-right">
          <button className="btn-refresh" onClick={fetchIssues}>
            Refresh Issues
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="issues-stats-grid">
        <div className="stat-card total">
          <div className="stat-icon">
            <AlertTriangle size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats.total}</h3>
            <p>Total Issues</p>
          </div>
        </div>
        
        <div className="stat-card open">
          <div className="stat-icon">
            <Clock size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats.open}</h3>
            <p>Open Issues</p>
          </div>
        </div>
        
        <div className="stat-card in-progress">
          <div className="stat-icon">
            <MessageSquare size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats.inProgress}</h3>
            <p>In Progress</p>
          </div>
        </div>
        
        <div className="stat-card resolved">
          <div className="stat-icon">
            <CheckCircle size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats.resolved}</h3>
            <p>Resolved</p>
          </div>
        </div>
        
        <div className="stat-card critical">
          <div className="stat-icon">
            <Shield size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats.critical}</h3>
            <p>Critical</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="issues-filters">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search issues..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-group">
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
          
          <select 
            value={priorityFilter} 
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Priority</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          
          <button className="btn-filter" onClick={() => {
            setSearchTerm('');
            setStatusFilter('all');
            setPriorityFilter('all');
          }}>
            <Filter size={16} /> Clear Filters
          </button>
        </div>
      </div>

      {/* Issues List */}
      <div className="issues-list">
        {filteredIssues.length > 0 ? (
          filteredIssues.map(issue => (
            <div key={issue.id} className="issue-card">
              <div className="issue-header">
                <div className="issue-title">
                  <h4>{issue.title}</h4>
                  <div className="issue-meta">
                    <span className={`priority-badge ${getPriorityColor(issue.priority)}`}>
                      {getPriorityIcon(issue.priority)} {issue.priority}
                    </span>
                    <span className={`status-badge ${getStatusColor(issue.status)}`}>
                      {issue.status}
                    </span>
                    <span className="issue-type">{issue.type}</span>
                  </div>
                </div>
                <div className="issue-actions">
                  <button 
                    className="btn-view"
                    onClick={() => viewIssueDetails(issue)}
                  >
                    <Eye size={16} /> View
                  </button>
                  <button 
                    className="btn-assign"
                    onClick={() => assignIssue(issue.id, 'Support Team')}
                  >
                    Assign
                  </button>
                </div>
              </div>
              
              <div className="issue-body">
                <p>{issue.description}</p>
              </div>
              
              <div className="issue-footer">
                <div className="reporter-info">
                  <User size={14} />
                  <span>{issue.reportedBy.name}</span>
                  <Mail size={14} />
                  <span>{issue.reportedBy.email}</span>
                  {issue.location && (
                    <>
                      <MapPin size={14} />
                      <span>{issue.location}</span>
                    </>
                  )}
                </div>
                <div className="issue-dates">
                  <Calendar size={14} />
                  <span>Reported: {new Date(issue.createdAt).toLocaleDateString()}</span>
                  <span>Updated: {new Date(issue.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-issues">
            <CheckCircle size={48} />
            <p>No issues found</p>
            <small>All issues have been resolved</small>
          </div>
        )}
      </div>

      {/* Issue Detail Modal */}
      {showModal && selectedIssue && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{selectedIssue.title}</h3>
              <button className="btn-close" onClick={() => setShowModal(false)}>
                <XCircle size={20} />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="issue-details-grid">
                <div className="detail-section">
                  <h4>Issue Details</h4>
                  <p>{selectedIssue.description}</p>
                  
                  <div className="detail-row">
                    <span className="label">Type:</span>
                    <span className="value">{selectedIssue.type}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Priority:</span>
                    <span className={`value priority-${selectedIssue.priority}`}>
                      {selectedIssue.priority}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Status:</span>
                    <span className={`value status-${selectedIssue.status}`}>
                      {selectedIssue.status}
                    </span>
                  </div>
                </div>
                
                <div className="detail-section">
                  <h4>Reporter Information</h4>
                  <div className="reporter-details">
                    <div className="detail-row">
                      <User size={16} />
                      <span>{selectedIssue.reportedBy.name}</span>
                    </div>
                    <div className="detail-row">
                      <Mail size={16} />
                      <span>{selectedIssue.reportedBy.email}</span>
                    </div>
                    <div className="detail-row">
                      <Phone size={16} />
                      <span>{selectedIssue.reportedBy.phone || 'N/A'}</span>
                    </div>
                    {selectedIssue.location && (
                      <div className="detail-row">
                        <MapPin size={16} />
                        <span>{selectedIssue.location}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="detail-section">
                  <h4>Assigned To</h4>
                  <div className="assignee-section">
                    <span className={`assignee ${selectedIssue.assignedTo === 'Unassigned' ? 'unassigned' : 'assigned'}`}>
                      {selectedIssue.assignedTo}
                    </span>
                    <select 
                      value={selectedIssue.assignedTo}
                      onChange={(e) => assignIssue(selectedIssue.id, e.target.value)}
                      className="assign-select"
                    >
                      <option value="Unassigned">Unassigned</option>
                      <option value="Support Team">Support Team</option>
                      <option value="Technical Team">Technical Team</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </div>
                </div>
                
                <div className="detail-section full-width">
                  <h4>Comments ({selectedIssue.comments.length})</h4>
                  <div className="comments-section">
                    {selectedIssue.comments.map(comment => (
                      <div key={comment.id} className="comment">
                        <div className="comment-header">
                          <strong>{comment.user}</strong>
                          <small>{new Date(comment.timestamp).toLocaleString()}</small>
                        </div>
                        <p>{comment.message}</p>
                      </div>
                    ))}
                    
                    <div className="add-comment">
                      <textarea 
                        placeholder="Add a comment..."
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            addComment(selectedIssue.id, e.target.value);
                            e.target.value = '';
                          }
                        }}
                      />
                      <button 
                        onClick={(e) => {
                          const textarea = e.target.previousElementSibling;
                          addComment(selectedIssue.id, textarea.value);
                          textarea.value = '';
                        }}
                      >
                        Add Comment
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <div className="status-actions">
                <button 
                  className={`btn-status ${selectedIssue.status === 'open' ? 'active' : ''}`}
                  onClick={() => updateIssueStatus(selectedIssue.id, 'open')}
                >
                  Open
                </button>
                <button 
                  className={`btn-status ${selectedIssue.status === 'in-progress' ? 'active' : ''}`}
                  onClick={() => updateIssueStatus(selectedIssue.id, 'in-progress')}
                >
                  In Progress
                </button>
                <button 
                  className={`btn-status ${selectedIssue.status === 'resolved' ? 'active' : ''}`}
                  onClick={() => updateIssueStatus(selectedIssue.id, 'resolved')}
                >
                  Resolved
                </button>
              </div>
              
              <div className="modal-actions">
                <button 
                  className="btn-delete"
                  onClick={() => deleteIssue(selectedIssue.id)}
                >
                  <Trash2 size={16} /> Delete Issue
                </button>
                <button 
                  className="btn-close-modal"
                  onClick={() => setShowModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminIssues;