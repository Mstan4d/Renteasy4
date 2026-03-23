// src/modules/estate-firm/components/ClientManager.jsx
import React, { useState, useEffect } from 'react';
import { 
  Card, Button, Table, Badge, Modal, Form, Alert, 
  InputGroup, Dropdown, Row, Col, ProgressBar 
} from 'react-bootstrap';
import { 
  Users, Phone, Mail, MapPin, Plus, Edit, Trash2, Eye, 
  Search, Filter, UserCheck, UserX, MessageSquare, Calendar,
  TrendingUp, Home, DollarSign, Shield, Star, MoreVertical,
  Download, Upload, UserPlus, CheckCircle, XCircle, Clock,
  ArrowUpRight, ArrowDownRight, BarChart3
} from 'lucide-react';
import { supabase } from '../../../shared/lib/supabaseClient';
import RentEasyLoader from '../../../shared/components/RentEasyLoader';
import './ClientManager.css';

const ClientManager = ({ estateFirmData }) => {
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showClientDetails, setShowClientDetails] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [clientType, setClientType] = useState('all');
  const [clientStatus, setClientStatus] = useState('all');
  
  const [newClient, setNewClient] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    type: 'landlord',
    status: 'active',
    notes: '',
    property_ids: []
  });

  const [stats, setStats] = useState({
    totalClients: 0,
    activeClients: 0,
    landlords: 0,
    tenants: 0,
    avgPropertiesPerClient: 0,
    clientRetentionRate: 85
  });

  useEffect(() => {
    if (estateFirmData?.id) {
      loadClients();
    }
  }, [estateFirmData]);

  useEffect(() => {
    filterClients();
  }, [clients, searchTerm, clientType, clientStatus]);

const loadClients = async () => {
  if (!estateFirmData?.id) return;
  setLoading(true);
  try {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return;

    // 1. Fetch landlords from listings (those who have posted properties)
    const { data: listingsData } = await supabase
      .from('listings')
      .select('landlord_id, landlord:profiles!landlord_id(*)')
      .eq('estate_firm_id', estateFirmData.id)
      .not('landlord_id', 'is', null);

    // 2. Fetch contacts from messages (people the estate firm has chatted with)
    const { data: messagesData } = await supabase
      .from('messages')
      .select('sender_id, receiver_id, profiles!sender_id(*), profiles!receiver_id(*)')
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);

    // 3. Fetch manually added contacts from `contacts` table (legacy)
    const { data: manualContacts } = await supabase
      .from('contacts')
      .select('*')
      .eq('estate_firm_id', estateFirmData.id);

    // 4. **NEW: Fetch landlords from `estate_landlords` (the estate firm's own landlord contacts)**
    const { data: estateLandlords } = await supabase
      .from('estate_landlords')
      .select('*')
      .eq('estate_firm_id', estateFirmData.id);

    const allClients = new Map();

    // Add landlords from listings
    listingsData?.forEach(prop => {
      if (prop.landlord_id && prop.landlord) {
        allClients.set(prop.landlord_id, {
          id: prop.landlord_id,
          name: prop.landlord.name || 'Unknown',
          email: prop.landlord.email,
          phone: prop.landlord.phone,
          type: 'landlord',
          status: 'active',
          source: 'properties',
          propertyCount: 1,
          lastContact: prop.created_at,
          totalValue: prop.price || 0
        });
      }
    });

    // Add contacts from messages
    messagesData?.forEach(msg => {
      const contactId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
      const contact = msg.sender_id === user.id ? msg.profiles_receiver_id : msg.profiles_sender_id;
      if (contactId && contact && contact.id !== user.id) {
        if (allClients.has(contactId)) {
          const existing = allClients.get(contactId);
          existing.messageCount = (existing.messageCount || 0) + 1;
        } else {
          allClients.set(contactId, {
            id: contactId,
            name: contact.name || 'Unknown',
            email: contact.email,
            phone: contact.phone,
            type: 'contact',
            status: 'active',
            source: 'messages',
            messageCount: 1,
            lastContact: msg.created_at
          });
        }
      }
    });

    // Add manual contacts (legacy)
    manualContacts?.forEach(contact => {
      const key = `contact_${contact.id}`;
      allClients.set(key, {
        id: key,
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
        address: contact.address,
        type: contact.type || 'contact',
        status: contact.status || 'active',
        source: 'manual',
        notes: contact.notes,
        createdAt: contact.created_at
      });
    });

    // **NEW: Add estate landlords (the estate firm's own landlord contacts)**
    estateLandlords?.forEach(landlord => {
      const key = `estate_landlord_${landlord.id}`;
      allClients.set(key, {
        id: key,
        name: landlord.name,
        email: landlord.email,
        phone: landlord.phone,
        type: 'landlord',           // they are landlords
        status: 'active',
        source: 'estate_landlords', // so we know where they came from
        notes: landlord.notes,
        bank_details: landlord.bank_details,
        createdAt: landlord.created_at
      });
    });

    const clientsArray = Array.from(allClients.values());
    setClients(clientsArray);

    // ... rest of stats calculation (unchanged)
    const landlords = clientsArray.filter(c => c.type === 'landlord').length;
    const tenants = clientsArray.filter(c => c.type === 'tenant').length;
    const activeClients = clientsArray.filter(c => c.status === 'active').length;
    const totalPropertyValue = clientsArray
      .filter(c => c.type === 'landlord')
      .reduce((sum, c) => sum + (c.totalValue || 0), 0);

    setStats({
      totalClients: clientsArray.length,
      activeClients,
      landlords,
      tenants,
      avgPropertiesPerClient: landlords > 0 ? (clientsArray.filter(c => c.propertyCount).reduce((sum, c) => sum + (c.propertyCount || 0), 0) / landlords).toFixed(1) : 0,
      clientRetentionRate: 85,
      totalPropertyValue
    });

  } catch (err) {
    console.error('Error loading clients:', err);
  } finally {
    setLoading(false);
  }
};

  const filterClients = () => {
    let filtered = [...clients];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(client =>
        client.name?.toLowerCase().includes(term) ||
        client.email?.toLowerCase().includes(term) ||
        client.phone?.toLowerCase().includes(term)
      );
    }

    // Apply type filter
    if (clientType !== 'all') {
      filtered = filtered.filter(client => client.type === clientType);
    }

    // Apply status filter
    if (clientStatus !== 'all') {
      filtered = filtered.filter(client => client.status === clientStatus);
    }

    setFilteredClients(filtered);
  };

  const handleAddClient = async () => {
    if (!newClient.name || !newClient.email) {
      alert('Please fill in required fields');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('contacts')
        .insert({
          estate_firm_id: estateFirmData.id,
          name: newClient.name,
          email: newClient.email,
          phone: newClient.phone,
          address: newClient.address,
          type: newClient.type,
          status: newClient.status,
          notes: newClient.notes,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (!error) {
        // Refresh clients
        await loadClients();
        setShowAddModal(false);
        setNewClient({
          name: '',
          email: '',
          phone: '',
          address: '',
          type: 'landlord',
          status: 'active',
          notes: '',
          property_ids: []
        });
        alert('Client added successfully!');
      }
    } catch (err) {
      console.error('Error adding client:', err);
      alert('Failed to add client');
    } finally {
      setLoading(false);
    }
  };

  const handleImportClients = async (file) => {
    // CSV import logic would go here
    alert('CSV import functionality would be implemented here');
  };

  const handleExportClients = () => {
    // Export logic would go here
    alert('Export functionality would generate a client list CSV');
  };

  const handleViewClient = (client) => {
    setSelectedClient(client);
    setShowClientDetails(true);
  };

  const handleEditClient = (client) => {
    setSelectedClient(client);
    // In a real app, you would open an edit modal
    alert(`Edit client: ${client.name}`);
  };

  const handleDeleteClient = async (clientId) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      try {
        await supabase
          .from('contacts')
          .delete()
          .eq('id', clientId.replace('contact_', ''));

        await loadClients();
        const { data: contactsData, error: contactsError } = await supabase
  .from('contacts')
  .select('*')
  .eq('estate_firm_id', estateFirmData.id);
        alert('Client deleted successfully');
      } catch (err) {
        console.error('Error deleting client:', err);
        alert('Failed to delete client');
      }
    }
  };

  const getClientTypeBadge = (type) => {
    switch (type) {
      case 'landlord':
        return <Badge bg="primary" className="d-inline-flex align-items-center"><Home size={12} className="me-1" /> Landlord</Badge>;
      case 'tenant':
        return <Badge bg="success" className="d-inline-flex align-items-center"><Users size={12} className="me-1" /> Tenant</Badge>;
      case 'buyer':
        return <Badge bg="info" className="d-inline-flex align-items-center"><DollarSign size={12} className="me-1" /> Buyer</Badge>;
      case 'seller':
        return <Badge bg="warning" className="d-inline-flex align-items-center"><TrendingUp size={12} className="me-1" /> Seller</Badge>;
      default:
        return <Badge bg="secondary">{type}</Badge>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <Badge bg="success" className="d-inline-flex align-items-center"><CheckCircle size={12} className="me-1" /> Active</Badge>;
      case 'inactive':
        return <Badge bg="secondary" className="d-inline-flex align-items-center"><UserX size={12} className="me-1" /> Inactive</Badge>;
      case 'pending':
        return <Badge bg="warning" className="d-inline-flex align-items-center"><Clock size={12} className="me-1" /> Pending</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  const getSourceBadge = (source) => {
    switch (source) {
      case 'properties':
        return <Badge bg="primary" className="bg-opacity-10 text-primary">From Properties</Badge>;
      case 'messages':
        return <Badge bg="info" className="bg-opacity-10 text-info">From Messages</Badge>;
      case 'manual':
        return <Badge bg="success" className="bg-opacity-10 text-success">Manual Entry</Badge>;
      default:
        return null;
    }
  };

 
 if (loading) {
  return <RentEasyLoader message="Loading your clients..." fullScreen />;
}


  return (
    <div>
      {/* Header with Stats */}
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h5 className="mb-1">Client Management</h5>
            <p className="text-muted mb-0">Manage your landlords, tenants, and contacts</p>
          </div>
          <div className="d-flex gap-2">
            <Button variant="outline-primary" size="sm" onClick={handleExportClients}>
              <Download size={14} className="me-1" />
              Export
            </Button>
            <Button variant="outline-secondary" size="sm" onClick={() => setShowImportModal(true)}>
              <Upload size={14} className="me-1" />
              Import
            </Button>
            <Button variant="primary" size="sm" onClick={() => setShowAddModal(true)}>
              <UserPlus size={14} className="me-1" />
              Add Client
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <Row className="g-3 mb-4">
          <Col xs={6} md={3}>
            <Card className="border-0 shadow-sm h-100 stat-card">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h6 className="text-muted mb-1">Total Clients</h6>
                    <h3 className="mb-0">{stats.totalClients}</h3>
                  </div>
                  <Badge bg="primary" className="rounded-circle p-2">
                    <Users size={16} />
                  </Badge>
                </div>
                <div className="d-flex align-items-center mt-2">
                  <ArrowUpRight size={14} className="text-success me-1" />
                  <small className="text-success">+5 this month</small>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col xs={6} md={3}>
            <Card className="border-0 shadow-sm h-100 stat-card">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h6 className="text-muted mb-1">Active Clients</h6>
                    <h3 className="mb-0">{stats.activeClients}</h3>
                  </div>
                  <Badge bg="success" className="rounded-circle p-2">
                    <UserCheck size={16} />
                  </Badge>
                </div>
                <div className="mt-2">
                  <ProgressBar 
                    now={(stats.activeClients / stats.totalClients) * 100 || 0} 
                    variant="success"
                    style={{ height: '6px' }}
                  />
                  <small className="text-muted">{((stats.activeClients / stats.totalClients) * 100 || 0).toFixed(1)}% active</small>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col xs={6} md={3}>
            <Card className="border-0 shadow-sm h-100 stat-card">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h6 className="text-muted mb-1">Landlords</h6>
                    <h3 className="mb-0">{stats.landlords}</h3>
                  </div>
                  <Badge bg="info" className="rounded-circle p-2">
                    <Home size={16} />
                  </Badge>
                </div>
                <div className="mt-2">
                  <small className="text-muted">
                    Avg: {stats.avgPropertiesPerClient} properties each
                  </small>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col xs={6} md={3}>
            <Card className="border-0 shadow-sm h-100 stat-card">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h6 className="text-muted mb-1">Retention Rate</h6>
                    <h3 className="mb-0">{stats.clientRetentionRate}%</h3>
                  </div>
                  <Badge bg="warning" className="rounded-circle p-2">
                    <TrendingUp size={16} />
                  </Badge>
                </div>
                <div className="d-flex align-items-center mt-2">
                  <small className="text-muted">Industry avg: 75%</small>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Filters and Search */}
      <Card className="mb-4 border-0 shadow-sm">
        <Card.Body className="py-2">
          <Row className="align-items-center">
            <Col md={6}>
              <InputGroup>
                <InputGroup.Text>
                  <Search size={16} />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Search clients by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={3}>
              <Form.Select 
                value={clientType}
                onChange={(e) => setClientType(e.target.value)}
                size="sm"
              >
                <option value="all">All Types</option>
                <option value="landlord">Landlords</option>
                <option value="tenant">Tenants</option>
                <option value="buyer">Buyers</option>
                <option value="seller">Sellers</option>
                <option value="contact">Contacts</option>
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Select 
                value={clientStatus}
                onChange={(e) => setClientStatus(e.target.value)}
                size="sm"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
              </Form.Select>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Clients Table */}
      <Card className="border-0 shadow-sm">
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3 text-muted">Loading clients...</p>
            </div>
          ) : filteredClients.length === 0 ? (
            <Alert variant="info" className="text-center py-4">
              <Users size={48} className="text-muted mb-3 opacity-50" />
              <h5>No Clients Found</h5>
              <p className="text-muted">
                {searchTerm || clientType !== 'all' || clientStatus !== 'all' 
                  ? 'No clients match your filters'
                  : 'Start by adding your first client'}
              </p>
              <Button 
                variant="primary" 
                onClick={() => setShowAddModal(true)}
                className="mt-2"
              >
                <UserPlus size={16} className="me-2" />
                Add First Client
              </Button>
            </Alert>
          ) : (
            <div className="table-responsive">
              <Table hover className="mb-0">
                <thead>
                  <tr>
                    <th>Client</th>
                    <th>Contact</th>
                    <th>Type</th>
                    <th>Properties</th>
                    <th>Status</th>
                    <th>Source</th>
                    <th>Last Contact</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClients.map(client => (
                    <tr key={client.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="me-3">
                            <div className="client-avatar">
                              <Users size={16} />
                            </div>
                          </div>
                          <div>
                            <div className="fw-medium">{client.name}</div>
                            <div className="text-muted small">{client.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="small">
                          {client.phone && (
                            <div className="d-flex align-items-center">
                              <Phone size={12} className="me-1 text-muted" />
                              {client.phone}
                            </div>
                          )}
                          {client.address && (
                            <div className="d-flex align-items-center">
                              <MapPin size={12} className="me-1 text-muted" />
                              <span className="text-truncate" style={{ maxWidth: '150px' }}>
                                {client.address}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <Badge 
                          bg={client.type === 'landlord' ? 'primary' : 
                              client.type === 'tenant' ? 'success' : 
                              client.type === 'buyer' ? 'info' : 
                              client.type === 'seller' ? 'warning' : 'secondary'}
                          className="badge-client"
                        >
                          {client.type}
                        </Badge>
                      </td>
                      <td>
                        <div className="text-center">
                          <div className="fw-medium">{client.propertyCount || 0}</div>
                          {client.totalValue && client.totalValue > 0 && (
                            <small className="text-muted">
                              ₦{(client.totalValue || 0).toLocaleString()}
                            </small>
                          )}
                        </div>
                      </td>
                      <td>
                        <Badge 
                          bg={client.status === 'active' ? 'success' : 
                              client.status === 'inactive' ? 'secondary' : 'warning'}
                          className="status-badge"
                        >
                          {client.status}
                        </Badge>
                      </td>
                      <td>
                        <Badge 
                          bg={client.source === 'properties' ? 'info' : 
                              client.source === 'messages' ? 'success' : 'light'}
                          text={client.source === 'manual' ? 'dark' : 'white'}
                          className="source-badge"
                        >
                          {client.source}
                        </Badge>
                      </td>
                      <td>
                        <div className="small">
                          {client.lastContact 
                            ? new Date(client.lastContact).toLocaleDateString()
                            : 'Never'}
                        </div>
                      </td>
                      <td>
                        <Dropdown>
                          <Dropdown.Toggle variant="outline-secondary" size="sm" id="dropdown-basic">
                            <MoreVertical size={14} />
                          </Dropdown.Toggle>
                          <Dropdown.Menu>
                            <Dropdown.Item onClick={() => setSelectedClient(client) || setShowClientDetails(true)}>
                              <Eye size={14} className="me-2" />
                              View Details
                            </Dropdown.Item>
                            <Dropdown.Item>
                              <MessageSquare size={14} className="me-2" />
                              Message
                            </Dropdown.Item>
                            <Dropdown.Divider />
                            <Dropdown.Item 
                              className="text-danger"
                              onClick={() => client.source === 'manual' && handleDeleteClient(client.id)}
                              disabled={client.source !== 'manual'}
                            >
                              <Trash2 size={14} className="me-2" />
                              Delete
                            </Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}

          {/* Results Summary */}
          {filteredClients.length > 0 && (
            <div className="mt-3 pt-3 border-top">
              <div className="d-flex justify-content-between align-items-center">
                <div className="text-muted">
                  Showing {filteredClients.length} of {clients.length} clients
                </div>
                <div className="d-flex gap-3">
                  <div className="text-center">
                    <div className="fw-medium">{stats.landlords}</div>
                    <small className="text-muted">Landlords</small>
                  </div>
                  <div className="text-center">
                    <div className="fw-medium">{stats.tenants}</div>
                    <small className="text-muted">Tenants</small>
                  </div>
                  <div className="text-center">
                    <div className="fw-medium">{stats.activeClients}</div>
                    <small className="text-muted">Active</small>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Add Client Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <UserPlus size={20} className="me-2" />
            Add New Client
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Full Name *</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter client name"
                    value={newClient.name}
                    onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email Address *</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter email address"
                    value={newClient.email}
                    onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Phone Number</Form.Label>
                  <Form.Control
                    type="tel"
                    placeholder="Enter phone number"
                    value={newClient.phone}
                    onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Client Type</Form.Label>
                  <Form.Select
                    value={newClient.type}
                    onChange={(e) => setNewClient({...newClient, type: e.target.value})}
                  >
                    <option value="landlord">Landlord</option>
                    <option value="tenant">Tenant</option>
                    <option value="buyer">Buyer</option>
                    <option value="seller">Seller</option>
                    <option value="contact">General Contact</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Address</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter full address"
                value={newClient.address}
                onChange={(e) => setNewClient({...newClient, address: e.target.value})}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Add any notes about this client..."
                value={newClient.notes}
                onChange={(e) => setNewClient({...newClient, notes: e.target.value})}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <div className="d-flex gap-3">
                <Form.Check
                  type="radio"
                  label="Active"
                  name="status"
                  checked={newClient.status === 'active'}
                  onChange={() => setNewClient({...newClient, status: 'active'})}
                />
                <Form.Check
                  type="radio"
                  label="Inactive"
                  name="status"
                  checked={newClient.status === 'inactive'}
                  onChange={() => setNewClient({...newClient, status: 'inactive'})}
                />
                <Form.Check
                  type="radio"
                  label="Pending"
                  name="status"
                  checked={newClient.status === 'pending'}
                  onChange={() => setNewClient({...newClient, status: 'pending'})}
                />
              </div>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleAddClient}
            disabled={loading || !newClient.name || !newClient.email}
          >
            {loading ? 'Adding...' : 'Add Client'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Client Details Modal */}
      {selectedClient && (
        <Modal show={showClientDetails} onHide={() => setShowClientDetails(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>
              <div className="d-flex align-items-center">
                <div className="client-avatar me-3">
                  <Users size={24} />
                </div>
                <div>
                  <div>{selectedClient.name}</div>
                  <small className="text-muted">{selectedClient.email}</small>
                </div>
              </div>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <div className="mb-4">
                  <h6 className="text-muted mb-3">Contact Information</h6>
                  <div className="mb-2">
                    <strong>Phone:</strong> {selectedClient.phone || 'Not provided'}
                  </div>
                  <div className="mb-2">
                    <strong>Address:</strong> {selectedClient.address || 'Not provided'}
                  </div>
                  <div className="mb-2">
                    <strong>Type:</strong> <Badge bg={selectedClient.type === 'landlord' ? 'primary' : 'secondary'}>{selectedClient.type}</Badge>
                  </div>
                  <div className="mb-2">
                    <strong>Status:</strong> <Badge bg={selectedClient.status === 'active' ? 'success' : 'secondary'}>{selectedClient.status}</Badge>
                  </div>
                  <div>
                    <strong>Source:</strong> <Badge bg="light" text="dark">{selectedClient.source}</Badge>
                  </div>
                </div>

                {selectedClient.notes && (
                  <div className="mb-4">
                    <h6 className="text-muted mb-2">Notes</h6>
                    <Card className="bg-light">
                      <Card.Body>
                        <p className="mb-0">{selectedClient.notes}</p>
                      </Card.Body>
                    </Card>
                  </div>
                )}
              </Col>

              <Col md={6}>
                <div className="mb-4">
                  <h6 className="text-muted mb-3">Statistics</h6>
                  <Row>
                    <Col xs={6} className="mb-3">
                      <div className="text-center p-3 border rounded">
                        <div className="fw-medium">{selectedClient.propertyCount || 0}</div>
                        <small className="text-muted">Properties</small>
                      </div>
                    </Col>
                    <Col xs={6} className="mb-3">
                      <div className="text-center p-3 border rounded">
                        <div className="fw-medium">{selectedClient.messageCount || 0}</div>
                        <small className="text-muted">Messages</small>
                      </div>
                    </Col>
                    <Col xs={6}>
                      <div className="text-center p-3 border rounded">
                        <div className="fw-medium">
                          ₦{(selectedClient.totalValue || 0).toLocaleString()}
                        </div>
                        <small className="text-muted">Total Value</small>
                      </div>
                    </Col>
                    <Col xs={6}>
                      <div className="text-center p-3 border rounded">
                        <div className="fw-medium">
                          {selectedClient.lastContact 
                            ? new Date(selectedClient.lastContact).toLocaleDateString()
                            : 'Never'}
                        </div>
                        <small className="text-muted">Last Contact</small>
                      </div>
                    </Col>
                  </Row>
                </div>

                <div>
                  <h6 className="text-muted mb-3">Quick Actions</h6>
                  <div className="d-grid gap-2">
                    <Button variant="outline-primary" className="quick-action-btn">
                      <MessageSquare size={16} />
                      Send Message
                    </Button>
                    <Button variant="outline-secondary" className="quick-action-btn">
                      <Edit size={16} />
                      Edit Client
                    </Button>
                    <Button variant="outline-info" className="quick-action-btn">
                      <Home size={16} />
                      View Properties
                    </Button>
                  </div>
                </div>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowClientDetails(false)}>
              Close
            </Button>
            <Button variant="primary">
              <MessageSquare size={16} className="me-2" />
              Contact Client
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
};

export default ClientManager;