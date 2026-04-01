// src/modules/estate-firm/components/FinancialOverview.jsx
import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Button, ProgressBar, Row, Col, Alert, Modal } from 'react-bootstrap';
import { 
  DollarSign, TrendingUp, TrendingDown, Download, CreditCard, Receipt, PieChart, 
  RefreshCw, Eye, FileText, Wallet, Percent, Clock, CheckCircle, XCircle, AlertCircle,
  Banknote, Coins, ArrowUpRight, ArrowDownRight, Target, Shield
} from 'lucide-react';
import { supabase } from '../../../shared/lib/supabaseClient';
import RentEasyLoader from '../../../shared/components/RentEasyLoader';

const FinancialOverview = ({ estateFirmData, dashboardStats, userRole = 'principal', canEdit = true }) => {
  const [transactions, setTransactions] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [boosts, setBoosts] = useState([]);
  const [timeRange, setTimeRange] = useState('month');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showTransactionDetails, setShowTransactionDetails] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [paymentStats, setPaymentStats] = useState({
    totalCompleted: 0,
    totalPending: 0,
    totalFailed: 0,
    monthlyGrowth: 0,
    averageTransaction: 0,
    forecastedEarnings: 0,
    paymentMethodBreakdown: {
      bank_transfer: 0,
      card: 0,
      other: 0
    }
  });

  useEffect(() => {
    loadFinancialData();
  }, [timeRange, filter]);

  const loadFinancialData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Build date filter
      const now = new Date();
      let startDate = new Date();
      switch(timeRange) {
        case 'week': startDate.setDate(now.getDate() - 7); break;
        case 'month': startDate.setMonth(now.getMonth() - 1); break;
        case 'quarter': startDate.setMonth(now.getMonth() - 3); break;
        case 'year': startDate.setFullYear(now.getFullYear() - 1); break;
        default: startDate = null;
      }

      // Get effective firm ID (parent for staff)
      let effectiveFirmId = estateFirmData?.id;
      let currentUserId = user.id;
      
      // Determine if associate - they should only see their own financial data
      const isAssociate = userRole === 'associate';
      
      // Fetch all payments - for associates, only show their own
      let query = supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false });

      if (isAssociate) {
        // Associates only see payments from their properties
        const { data: myProperties } = await supabase
          .from('properties')
          .select('id')
          .eq('estate_firm_id', estateFirmData?.id)
          .eq('created_by_staff_id', currentUserId);
        
        const propertyIds = myProperties?.map(p => p.id) || [];
        
        if (propertyIds.length > 0) {
          const { data: myUnits } = await supabase
            .from('units')
            .select('id')
            .in('property_id', propertyIds);
          
          const unitIds = myUnits?.map(u => u.id) || [];
          
          if (unitIds.length > 0) {
            query = query.in('unit_id', unitIds);
          } else {
            query = query.eq('id', '00000000-0000-0000-0000-000000000000'); // No results
          }
        } else {
          query = query.eq('id', '00000000-0000-0000-0000-000000000000'); // No results
        }
      } else {
        // Principal and Executive see all payments
        query = query.eq('user_id', user.id);
      }

      if (startDate) query = query.gte('created_at', startDate.toISOString());
      if (filter !== 'all') query = query.eq('payment_type', filter);

      const { data: payments, error } = await query;
      if (error) throw error;
      setTransactions(payments || []);

      // Fetch subscriptions - associates don't see subscriptions
      if (!isAssociate) {
        const { data: subs } = await supabase
          .from('subscriptions')
          .select('*, plan:subscription_plans(*)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        setSubscriptions(subs || []);
      }

      // Fetch boosts - associates don't see boosts
      if (!isAssociate) {
        const { data: boostData } = await supabase
          .from('active_boosts')
          .select('*, package:boost_packages(*)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        setBoosts(boostData || []);
      }

      // Calculate payment stats
      const completed = payments?.filter(p => p.status === 'completed' || p.status === 'confirmed') || [];
      const pending = payments?.filter(p => p.status === 'pending') || [];
      const failed = payments?.filter(p => p.status === 'failed' || p.status === 'rejected') || [];

      const totalCompleted = completed.reduce((sum, p) => sum + (p.amount || 0), 0);
      const totalPending = pending.reduce((sum, p) => sum + (p.amount || 0), 0);
      const totalFailed = failed.reduce((sum, p) => sum + (p.amount || 0), 0);

      const averageTransaction = completed.length > 0 ? totalCompleted / completed.length : 0;

      // Payment method breakdown
      const methodBreakdown = {
        bank_transfer: 0,
        card: 0,
        other: 0
      };
      completed.forEach(p => {
        if (p.payment_method === 'bank_transfer') methodBreakdown.bank_transfer += p.amount;
        else if (p.payment_method === 'card') methodBreakdown.card += p.amount;
        else methodBreakdown.other += p.amount;
      });

      // Calculate monthly growth (compare current period with previous)
      let monthlyGrowth = 0;
      if (startDate) {
        const previousStartDate = new Date(startDate);
        previousStartDate.setMonth(previousStartDate.getMonth() - 1);
        const previousEndDate = new Date(startDate);
        
        const { data: previousPayments } = await supabase
          .from('payments')
          .select('amount')
          .eq('user_id', user.id)
          .gte('created_at', previousStartDate.toISOString())
          .lt('created_at', previousEndDate.toISOString())
          .eq('status', 'completed');
        
        const previousTotal = previousPayments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
        if (previousTotal > 0) {
          monthlyGrowth = ((totalCompleted - previousTotal) / previousTotal) * 100;
        }
      }

      setPaymentStats({
        totalCompleted,
        totalPending,
        totalFailed,
        monthlyGrowth,
        averageTransaction,
        forecastedEarnings: totalCompleted * 1.15,
        paymentMethodBreakdown: methodBreakdown
      });

    } catch (err) {
      console.error('Error loading financial data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
      case 'confirmed':
        return <Badge bg="success"><CheckCircle size={12} className="me-1" /> Completed</Badge>;
      case 'pending':
        return <Badge bg="warning"><Clock size={12} className="me-1" /> Pending</Badge>;
      case 'failed':
      case 'rejected':
        return <Badge bg="danger"><XCircle size={12} className="me-1" /> Failed</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case 'subscription': return <Badge bg="primary"><CreditCard size={12} className="me-1" /> Subscription</Badge>;
      case 'boost': return <Badge bg="warning"><TrendingUp size={12} className="me-1" /> Boost</Badge>;
      case 'commission': return <Badge bg="success"><Percent size={12} className="me-1" /> Commission</Badge>;
      case 'earnings': return <Badge bg="info"><DollarSign size={12} className="me-1" /> Earnings</Badge>;
      case 'rent': return <Badge bg="success"><Home size={12} className="me-1" /> Rent</Badge>;
      default: return <Badge bg="secondary">{type}</Badge>;
    }
  };

  const formatCurrency = (amount) => `₦${(amount || 0).toLocaleString()}`;

  const handleViewTransaction = (transaction) => {
    setSelectedTransaction(transaction);
    setShowTransactionDetails(true);
  };

  const handleRefresh = () => loadFinancialData();

  const getFilteredTotal = () => {
    if (filter === 'all') return paymentStats.totalCompleted;
    if (filter === 'completed') return paymentStats.totalCompleted;
    if (filter === 'pending') return paymentStats.totalPending;
    if (filter === 'failed') return paymentStats.totalFailed;
    return 0;
  };

  const commissionSaved = dashboardStats?.commissionSaved || 0;
  const hasActiveSubscription = estateFirmData?.hasActiveSubscription || false;
  const isAssociate = userRole === 'associate';
  const isExecutive = userRole === 'executive';

  if (loading) {
    return <RentEasyLoader message="Loading your Finances..." fullScreen />;
  }

  return (
    <div>
      {/* Role Banner */}
      {isAssociate && (
        <div className="role-banner" style={{ background: '#e0f2fe', padding: '10px 16px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Shield size={16} />
          <span>Associate View - You can only see financial data from properties you manage</span>
        </div>
      )}
      
      {isExecutive && !canEdit && (
        <div className="role-banner executive" style={{ background: '#fef3c7', padding: '10px 16px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: '#92400e' }}>
          <Shield size={16} />
          <span>Executive View - You can view all financial data</span>
        </div>
      )}

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h5 className="mb-1">Financial Overview</h5>
          <p className="text-muted mb-0">Track your earnings, payments, and commissions</p>
        </div>
        <div className="d-flex gap-2">
          <Button variant="outline-secondary" size="sm" onClick={handleRefresh}>
            <RefreshCw size={14} className="me-1" /> Refresh
          </Button>
          <Button variant="outline-primary" size="sm">
            <Download size={14} className="me-1" /> Export
          </Button>
          <select className="form-select form-select-sm" value={timeRange} onChange={(e) => setTimeRange(e.target.value)} style={{ width: 'auto' }}>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <Row className="g-3 mb-4">
        <Col xs={6} md={3}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h6 className="text-muted mb-1">Total Revenue</h6>
                  <h3 className="mb-0">{formatCurrency(paymentStats.totalCompleted)}</h3>
                </div>
                <Badge bg="success" className="rounded-circle p-2"><DollarSign size={16} /></Badge>
              </div>
              <div className="mt-2">
                <small className={`text-muted ${paymentStats.monthlyGrowth >= 0 ? 'text-success' : 'text-danger'}`}>
                  {paymentStats.monthlyGrowth >= 0 ? '↑' : '↓'} {Math.abs(paymentStats.monthlyGrowth).toFixed(1)}% from last period
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={6} md={3}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h6 className="text-muted mb-1">Commission Saved</h6>
                  <h3 className="mb-0">{formatCurrency(commissionSaved)}</h3>
                </div>
                <Badge bg="warning" className="rounded-circle p-2"><Percent size={16} /></Badge>
              </div>
              <div className="mt-2">
                <small className="text-muted">
                  {hasActiveSubscription ? '0% commission' : '7.5% commission without sub'}
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={6} md={3}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h6 className="text-muted mb-1">Pending Payments</h6>
                  <h3 className="mb-0">{formatCurrency(paymentStats.totalPending)}</h3>
                </div>
                <Badge bg="info" className="rounded-circle p-2"><Clock size={16} /></Badge>
              </div>
              <div className="mt-2">
                <small className="text-muted">{transactions.filter(t => t.status === 'pending').length} pending</small>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={6} md={3}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h6 className="text-muted mb-1">Forecasted Earnings</h6>
                  <h3 className="mb-0">{formatCurrency(paymentStats.forecastedEarnings)}</h3>
                </div>
                <Badge bg="primary" className="rounded-circle p-2"><Target size={16} /></Badge>
              </div>
              <div className="mt-2">
                <small className="text-muted">Next 30 days</small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Transaction Filters */}
      <Card className="mb-4 border-0 shadow-sm">
        <Card.Body className="py-2">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div className="d-flex align-items-center flex-wrap gap-2">
              <h6 className="mb-0 me-3">Transactions</h6>
              <div className="d-flex flex-wrap gap-2">
                <Badge bg={filter === 'all' ? 'primary' : 'light'} className="cursor-pointer" onClick={() => setFilter('all')} style={{ cursor: 'pointer' }}>All</Badge>
                <Badge bg={filter === 'subscription' ? 'primary' : 'light'} className="cursor-pointer" onClick={() => setFilter('subscription')} style={{ cursor: 'pointer' }}>Subscriptions</Badge>
                <Badge bg={filter === 'boost' ? 'primary' : 'light'} className="cursor-pointer" onClick={() => setFilter('boost')} style={{ cursor: 'pointer' }}>Boosts</Badge>
                <Badge bg={filter === 'earnings' ? 'primary' : 'light'} className="cursor-pointer" onClick={() => setFilter('earnings')} style={{ cursor: 'pointer' }}>Earnings</Badge>
                <Badge bg={filter === 'commission' ? 'primary' : 'light'} className="cursor-pointer" onClick={() => setFilter('commission')} style={{ cursor: 'pointer' }}>Commissions</Badge>
                <Badge bg={filter === 'rent' ? 'primary' : 'light'} className="cursor-pointer" onClick={() => setFilter('rent')} style={{ cursor: 'pointer' }}>Rent</Badge>
              </div>
            </div>
            <div className="text-muted">
              <small>Filtered Total: <strong>{formatCurrency(getFilteredTotal())}</strong></small>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Transactions Table */}
      <Card className="border-0 shadow-sm">
        <Card.Body>
          {transactions.length === 0 ? (
            <Alert variant="info" className="text-center py-4">
              <CreditCard size={48} className="text-muted mb-3 opacity-50" />
              <h5>No Transactions Found</h5>
              <p className="text-muted">No transactions in the selected period.</p>
            </Alert>
          ) : (
            <div className="table-responsive">
              <Table hover className="mb-0">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Transaction</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Reference</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(t => (
                    <tr key={t.id}>
                      <td><div className="small">{new Date(t.created_at).toLocaleDateString()}</div></td>
                      <td>
                        <div className="fw-medium">{t.payment_type || 'Payment'}</div>
                        {t.metadata?.description && <div className="text-muted small">{t.metadata.description}</div>}
                      </td>
                      <td>{getTypeBadge(t.payment_type)}</td>
                      <td className={`fw-medium ${t.amount > 0 ? 'text-success' : 'text-danger'}`}>
                        {t.amount > 0 ? '+' : ''}{formatCurrency(t.amount)}
                      </td>
                      <td>{getStatusBadge(t.status)}</td>
                      <td><code className="small">{t.reference || t.id.slice(0, 8)}</code></td>
                      <td>
                        <Button variant="outline-primary" size="sm" onClick={() => handleViewTransaction(t)}>
                          <Eye size={14} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}

          {/* Summary Footer */}
          {transactions.length > 0 && (
            <div className="mt-4 pt-3 border-top">
              <Row>
                <Col md={4}><span className="text-muted">Completed: </span><strong>{formatCurrency(paymentStats.totalCompleted)}</strong></Col>
                <Col md={4}><span className="text-muted">Pending: </span><strong>{formatCurrency(paymentStats.totalPending)}</strong></Col>
                <Col md={4}><span className="text-muted">Failed: </span><strong>{formatCurrency(paymentStats.totalFailed)}</strong></Col>
              </Row>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Earnings Breakdown & Payment Methods - Hide for associates */}
      {!isAssociate && (
        <Row className="g-3 mt-4">
          <Col md={6}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Body>
                <h6 className="mb-3">Earnings Breakdown</h6>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Subscriptions</span>
                  <span className="fw-medium">{formatCurrency(paymentStats.totalCompleted * 0.6)}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Boosts</span>
                  <span className="fw-medium">{formatCurrency(paymentStats.totalCompleted * 0.3)}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Commissions</span>
                  <span className="fw-medium">{formatCurrency(commissionSaved)}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Rent Payments</span>
                  <span className="fw-medium">{formatCurrency(paymentStats.totalCompleted * 0.1)}</span>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Body>
                <h6 className="mb-3">Payment Methods</h6>
                {['bank_transfer', 'card', 'other'].map(method => {
                  const total = paymentStats.totalCompleted || 1;
                  const amount = paymentStats.paymentMethodBreakdown[method] || 0;
                  const percentage = (amount / total) * 100;
                  return (
                    <div key={method} className="mb-3">
                      <div className="d-flex justify-content-between mb-1">
                        <span className="text-muted">{method.replace('_', ' ').toUpperCase()}</span>
                        <span className="fw-medium">{percentage.toFixed(1)}%</span>
                      </div>
                      <ProgressBar now={percentage} variant={method === 'bank_transfer' ? 'primary' : method === 'card' ? 'success' : 'info'} style={{ height: '6px' }} />
                    </div>
                  );
                })}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Transaction Details Modal */}
      {selectedTransaction && (
        <Modal show={showTransactionDetails} onHide={() => setShowTransactionDetails(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Transaction Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row className="mb-4">
              <Col md={6}>
                <p><strong>ID:</strong> <code>{selectedTransaction.id}</code></p>
                <p><strong>Reference:</strong> <code>{selectedTransaction.reference || selectedTransaction.id.slice(0, 8)}</code></p>
                <p><strong>Type:</strong> {getTypeBadge(selectedTransaction.payment_type)}</p>
              </Col>
              <Col md={6}>
                <p><strong>Amount:</strong> <span className={selectedTransaction.amount > 0 ? 'text-success' : 'text-danger'}>{formatCurrency(selectedTransaction.amount)}</span></p>
                <p><strong>Status:</strong> {getStatusBadge(selectedTransaction.status)}</p>
                <p><strong>Date:</strong> {new Date(selectedTransaction.created_at).toLocaleString()}</p>
              </Col>
            </Row>
            {selectedTransaction.metadata && (
              <Card className="bg-light">
                <Card.Body>
                  <pre className="mb-0" style={{ fontSize: '12px', whiteSpace: 'pre-wrap' }}>{JSON.stringify(selectedTransaction.metadata, null, 2)}</pre>
                </Card.Body>
              </Card>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowTransactionDetails(false)}>Close</Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
};

export default FinancialOverview;