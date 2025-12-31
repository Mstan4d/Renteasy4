// src/modules/admin/pages/AdminIssues.jsx
import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, CheckCircle, Clock, XCircle, 
  Filter, Search, MessageSquare, User, Calendar,
  ExternalLink, Eye, Edit, Trash2, Mail, Phone,
  MapPin, AlertCircle, Shield, Home
} from 'lucide-react';
import './AdminIssues.css';

const AdminIssues = () => {
  const [issues, setIssues] = useState([]);
  const [filteredIssues, setFilteredIssues] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    critical: 0
  });

  useEffect(() => {
    loadIssues();
  }, []);

  useEffect(() => {
    filterIssues();
  }, [searchTerm, statusFilter, priorityFilter, issues]);

  const loadIssues = () => {
    try {
      const issuesData = JSON.parse(localStorage.getItem('reportedIssues') || '[]');
      
      if (issuesData.length === 0) {
        const sampleIssues = generateSampleIssues();
        localStorage.setItem('reportedIssues', JSON.stringify(sampleIssues));
        setIssues(sampleIssues);
      } else {
        setIssues(issuesData);
      }
      
      calculateStats(issuesData.length > 0 ? issuesData : generateSampleIssues());
    } catch (error) {
      console.error('Error loading issues:', error);
    }
  };

  const generateSampleIssues = () => {
    const issueTypes = ['Technical', 'Payment', 'Listing', 'User', 'Security', 'Feature Request'];
    const priorities = ['low', 'medium', 'high', 'critical'];
    
    return Array.from({ length: 20 }, (_, index) => ({
      id: `issue-${Date.now()}-${index}`,
      title: `Issue with ${['payment', 'listing', 'profile', 'login', 'search'][index % 5]}`,
      description: `User reported an issue with ${['payment processing', 'listing visibility', 'profile update', 'login authentication', 'search functionality'][index % 5]}.`,
      type: issueTypes[index % issueTypes.length],
      priority: priorities[index % priorities.length],
      status: index % 4 === 0 ? 'open' : index % 4 === 1 ? 'in-progress' : 'resolved',
      reportedBy: {
        id: `user-${index}`,
        name: ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Wilson'][index % 4],
        email: `user${index}@example.com`,
        phone: `+123456789${index}`
      },
      assignedTo: index > 10 ? 'Support Team' : 'Unassigned',
      createdAt: new Date(Date.now() - index * 3600000).toISOString(),
      updatedAt: new Date(Date.now() - index * 1800000).toISOString(),
      location: ['Lagos', 'Abuja', 'Port Harcourt', 'Ibadan'][index % 4],
      attachments: index % 3 === 0 ? ['screenshot.png', 'log.txt'] : [],
      comments: [
        {
          id: 1,
          user: 'Support Agent',
          message: 'Looking into this issue.',
          timestamp: new Date(Date.now() - 1800000).toISOString()
        }
      ]
    }));
  };

  const calculateStats = (issuesData) => {
    const total = issuesData.length;
    const open = issuesData.filter(i => i.status === 'open').length;
    const inProgress = issuesData.filter(i => i.status === 'in-progress').length;
    const resolved = issuesData.filter(i => i.status === 'resolved').length;
    const critical = issuesData.filter(i => i.priority === 'critical').length;
    
    setStats({ total, open, inProgress, resolved, critical });
  };

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

  const viewIssueDetails = (issue) => {
    setSelectedIssue(issue);
    setShowModal(true);
  };

  const updateIssueStatus = (issueId, newStatus) => {
    const updatedIssues = issues.map(issue =>
      issue.id === issueId ? { ...issue, status: newStatus } : issue
    );
    setIssues(updatedIssues);
    localStorage.setItem('reportedIssues', JSON.stringify(updatedIssues));
    calculateStats(updatedIssues);
    
    if (selectedIssue?.id === issueId) {
      setSelectedIssue({ ...selectedIssue, status: newStatus });
    }
  };

  const assignIssue = (issueId, assignee) => {
    const updatedIssues = issues.map(issue =>
      issue.id === issueId ? { ...issue, assignedTo: assignee } : issue
    );
    setIssues(updatedIssues);
    localStorage.setItem('reportedIssues', JSON.stringify(updatedIssues));
  };

  const addComment = (issueId, comment) => {
    if (!comment.trim()) return;
    
    const newComment = {
      id: Date.now(),
      user: 'Admin',
      message: comment,
      timestamp: new Date().toISOString()
    };
    
    const updatedIssues = issues.map(issue =>
      issue.id === issueId 
        ? { 
            ...issue, 
            comments: [...issue.comments, newComment],
            updatedAt: new Date().toISOString()
          } 
        : issue
    );
    
    setIssues(updatedIssues);
    localStorage.setItem('reportedIssues', JSON.stringify(updatedIssues));
    
    if (selectedIssue?.id === issueId) {
      setSelectedIssue(updatedIssues.find(i => i.id === issueId));
    }
  };

  const deleteIssue = (issueId) => {
    if (!window.confirm('Are you sure you want to delete this issue?')) return;
    
    const updatedIssues = issues.filter(issue => issue.id !== issueId);
    setIssues(updatedIssues);
    localStorage.setItem('reportedIssues', JSON.stringify(updatedIssues));
    calculateStats(updatedIssues);
    
    if (selectedIssue?.id === issueId) {
      setShowModal(false);
      setSelectedIssue(null);
    }
  };

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

  return (
    <div className="admin-issues">
      <div className="issues-header">
        <div className="header-left">
          <h1><AlertTriangle size={28} /> Issues & Complaints</h1>
          <p>Manage user-reported issues and complaints</p>
        </div>
        <div className="header-right">
          <button className="btn-refresh" onClick={loadIssues}>
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