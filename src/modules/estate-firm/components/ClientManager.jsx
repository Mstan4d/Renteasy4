import React, { useState } from 'react';
import { 
  Users, UserPlus, Phone, Mail, MapPin, 
  Building, DollarSign, Calendar, MessageSquare,
  Edit, Trash2, Eye, MoreVertical, Filter,
  Search, Download, Upload
} from 'lucide-react';
import './ClientManager.css'; // Add this line

const ClientManager = ({ properties }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClients, setSelectedClients] = useState([]);
  
  // Extract unique clients from properties
  const clients = Array.from(
    new Map(
      properties.map(p => [p.clientId, {
        id: p.clientId,
        name: p.clientName,
        properties: properties.filter(prop => prop.clientId === p.clientId),
        totalRent: properties
          .filter(prop => prop.clientId === p.clientId)
          .reduce((sum, prop) => sum + prop.rentAmount, 0),
        lastPayment: '2024-11-01', // Mock data
        contact: {
          phone: '+2348012345678',
          email: `${p.clientName.toLowerCase().replace(/\s+/g, '.')}@email.com`
        }
      }])
    ).values()
  );

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.contact.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalCommission = clients.reduce((sum, client) => {
    const clientProperties = properties.filter(p => p.clientId === client.id);
    const commission = clientProperties.reduce((commissionSum, prop) => {
      return commissionSum + (prop.rentAmount * (prop.commissionRate / 100));
    }, 0);
    return sum + commission;
  }, 0);

  const handleAddClient = () => {
    console.log('Open add client modal');
  };

  const handleExportClients = () => {
    console.log('Export clients data');
  };

  return (
    <div className="client-manager">
      {/* Header */}
      <div className="manager-header">
        <div>
          <h2>Client Management</h2>
          <p className="subtitle">
            Manage {clients.length} clients | Total Commission: 
            <strong> ₦{(totalCommission / 1000000).toFixed(1)}M/year</strong>
          </p>
        </div>
        
        <div className="header-actions">
          <button className="btn btn-primary" onClick={handleAddClient}>
            <UserPlus size={18} />
            Add Client
          </button>
          <button className="btn btn-outline" onClick={handleExportClients}>
            <Download size={18} />
            Export
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="client-stats">
        <div className="stat-card">
          <Users size={24} />
          <div className="stat-info">
            <span className="stat-label">Total Clients</span>
            <span className="stat-value">{clients.length}</span>
          </div>
        </div>
        
        <div className="stat-card">
          <Building size={24} />
          <div className="stat-info">
            <span className="stat-label">Properties Managed</span>
            <span className="stat-value">
              {clients.reduce((sum, client) => sum + client.properties.length, 0)}
            </span>
          </div>
        </div>
        
        <div className="stat-card">
          <DollarSign size={24} />
          <div className="stat-info">
            <span className="stat-label">Annual Commission</span>
            <span className="stat-value">₦{(totalCommission / 1000000).toFixed(1)}M</span>
          </div>
        </div>
        
        <div className="stat-card">
          <Calendar size={24} />
          <div className="stat-info">
            <span className="stat-label">Active Leases</span>
            <span className="stat-value">
              {properties.filter(p => p.status === 'occupied').length}
            </span>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="client-controls">
        <div className="search-bar">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search clients by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-options">
          <button className="btn btn-sm">
            <Filter size={16} />
            Filter
          </button>
          <select className="sort-select">
            <option>Sort by: Name A-Z</option>
            <option>Sort by: Properties</option>
            <option>Sort by: Rent Value</option>
          </select>
        </div>
      </div>

      {/* Clients Grid */}
      <div className="clients-grid">
        {filteredClients.map(client => {
          const clientProperties = properties.filter(p => p.clientId === client.id);
          const occupiedCount = clientProperties.filter(p => p.status === 'occupied').length;
          const vacantCount = clientProperties.length - occupiedCount;
          
          return (
            <div key={client.id} className="client-card">
              <div className="client-header">
                <div className="client-avatar">
                  {client.name.charAt(0)}
                </div>
                <div className="client-info">
                  <h4>{client.name}</h4>
                  <div className="client-contact">
                    <span>
                      <Phone size={12} />
                      {client.contact.phone}
                    </span>
                    <span>
                      <Mail size={12} />
                      {client.contact.email}
                    </span>
                  </div>
                </div>
                <button className="btn-icon">
                  <MoreVertical size={16} />
                </button>
              </div>

              <div className="client-properties">
                <div className="property-stats">
                  <div className="stat">
                    <Building size={14} />
                    <span>{clientProperties.length} Properties</span>
                  </div>
                  <div className="stat">
                    <DollarSign size={14} />
                    <span>₦{client.totalRent.toLocaleString()}/year</span>
                  </div>
                </div>
                
                <div className="property-status">
                  <div className="status-item">
                    <span className="status-dot occupied"></span>
                    <span>{occupiedCount} Occupied</span>
                  </div>
                  <div className="status-item">
                    <span className="status-dot vacant"></span>
                    <span>{vacantCount} Vacant</span>
                  </div>
                </div>
              </div>

              <div className="client-commission">
                <div className="commission-info">
                  <span className="label">Commission Rate</span>
                  <span className="value">
                    {Math.max(...clientProperties.map(p => p.commissionRate))}%
                  </span>
                </div>
                <div className="commission-annual">
                  <small>Annual: ₦{(client.totalRent * 0.1).toLocaleString()}</small>
                </div>
              </div>

              <div className="client-actions">
                <button className="btn btn-sm" title="View Properties">
                  <Eye size={14} />
                  Properties
                </button>
                <button className="btn btn-sm btn-outline" title="Message">
                  <MessageSquare size={14} />
                  Message
                </button>
                <button className="btn-icon" title="Edit">
                  <Edit size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredClients.length === 0 && (
        <div className="empty-state">
          <Users size={48} />
          <h3>No clients found</h3>
          <p>Add your first client to start managing their properties</p>
          <button className="btn btn-primary" onClick={handleAddClient}>
            <UserPlus size={18} />
            Add Client
          </button>
        </div>
      )}
    </div>
  );
};

export default ClientManager;