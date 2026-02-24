// src/modules/estate-firm/components/FinancialOverview.jsx
import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Button, ProgressBar, Row, Col, Alert, Modal, Form } from 'react-bootstrap';
import { 
  DollarSign, TrendingUp, TrendingDown, Download, Calendar, 
  CreditCard, Receipt, PieChart, BarChart3, Filter, 
  RefreshCw, Eye, FileText, Wallet, Percent, Clock,
  CheckCircle, XCircle, AlertCircle, Banknote, Coins,
  ArrowUpRight, ArrowDownRight, Target, TrendingUp as TrendingUpIcon
} from 'lucide-react';
import { supabase } from '../../../shared/lib/supabaseClient';

const FinancialOverview = ({ estateFirmData, dashboardStats }) => {
  const [transactions, setTransactions] = useState([]);
  const [earnings, setEarnings] = useState([]);
  const [timeRange, setTimeRange] = useState('month');
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [showTransactionDetails, setShowTransactionDetails] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [paymentStats, setPaymentStats] = useState({
    totalCompleted: 0,
    totalPending: 0,
    totalFailed: 0,
    monthlyGrowth: 0,
    averageTransaction: 0,
    forecastedEarnings: 0
  });

  useEffect(() => {
    loadFinancialData();
  }, [timeRange, filter]);

  const loadFinancialData = async () => {
    setLoading(true);
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return;

      // Load all transactions
      let query = supabase
        .from('payments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Apply time filter
      const now = new Date();
      let startDate = new Date();
      
      switch(timeRange) {
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          startDate.setMonth(now.getMonth() - 3);
          break;
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
        default:
          startDate = null;
      }

      if (startDate) {
        query = query.gte('created_at', startDate.toISOString());
      }

      // Apply type filter
      if (filter !== 'all') {
        query = query.eq('payment_type', filter);
      }

      const { data: payments, error } = await query;

      if (!error && payments) {
        setTransactions(payments);

        // Calculate payment statistics
        const completed = payments.filter(p => p.status === 'completed');
        const pending = payments.filter(p => p.status === 'pending');
        const failed = payments.filter(p => p.status === 'failed');
        
        const totalCompleted = completed.reduce((sum, p) => sum + (p.amount || 0), 0);
        const totalPending = pending.reduce((sum, p) => sum + (p.amount || 0), 0);
        const totalFailed = failed.reduce((sum, p) => sum + (p.amount || 0), 0);
        
        const averageTransaction = completed.length > 0 
          ? totalCompleted / completed.length 
          : 0;

        // Calculate monthly growth (mock calculation for now)
        const monthlyGrowth = 15.5; // This would come from comparing with previous period

        // Load subscription earnings
        const { data: subscriptionData } = await supabase
          .from('subscriptions')
          .select('*, plan:subscription_plans(*)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        // Load boost earnings
        const { data: boostData } = await supabase
          .from('active_boosts')
          .select('*, boost_package:boost_packages(*)')
          .eq('service_provider_id', estateFirmData.id)
          .order('created_at', { ascending: false });

        setEarnings([
          ...(subscriptionData || []).map(sub => ({
            id: sub.id,
            type: 'subscription_revenue',
            description: `Subscription: ${sub.plan?.name || 'Monthly'}`,
            amount: sub.amount_paid || sub.plan?.price || 0,
            date: sub.starts_at,
            status: sub.status,
            reference: sub.payment_reference
          })),
          ...(boostData || []).map(boost => ({
            id: boost.id,
            type: 'boost_revenue',
            description: `Boost: ${boost.boost_package?.name || 'Profile Boost'}`,
            amount: boost.boost_package?.price || 0,
            date: boost.starts_at,
            status: boost.status,
            reference: boost.payment_reference
          }))
        ]);

        setPaymentStats({
          totalCompleted,
          totalPending,
          totalFailed,
          monthlyGrowth,
          averageTransaction,
          forecastedEarnings: totalCompleted * 1.15 // 15% growth forecast
        });
      }
    } catch (err) {
      console.error('Error loading financial data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <Badge bg="success" className="d-inline-flex align-items-center"><CheckCircle size={12} className="me-1" /> Completed</Badge>;
      case 'pending':
        return <Badge bg="warning" className="d-inline-flex align-items-center"><Clock size={12} className="me-1" /> Pending</Badge>;
      case 'failed':
        return <Badge bg="danger" className="d-inline-flex align-items-center"><XCircle size={12} className="me-1" /> Failed</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case 'subscription':
        return <Badge bg="primary" className="d-inline-flex align-items-center"><CreditCard size={12} className="me-1" /> Subscription</Badge>;
      case 'boost':
        return <Badge bg="warning" className="d-inline-flex align-items-center"><TrendingUpIcon size={12} className="me-1" /> Boost</Badge>;
      case 'commission':
        return <Badge bg="success" className="d-inline-flex align-items-center"><Percent size={12} className="me-1" /> Commission</Badge>;
      case 'earnings':
        return <Badge bg="info" className="d-inline-flex align-items-center"><DollarSign size={12} className="me-1" /> Earnings</Badge>;
      default:
        return <Badge bg="secondary">{type}</Badge>;
    }
  };

  const formatCurrency = (amount) => {
    return `₦${amount?.toLocaleString() || '0'}`;
  };

  const handleViewTransaction = (transaction) => {
    setSelectedTransaction(transaction);
    setShowTransactionDetails(true);
  };

  const handleExportData = () => {
    // In a real app, this would generate a CSV or PDF
    alert('Export functionality would generate a financial report');
  };

  const handleRefresh = () => {
    loadFinancialData();
  };

  const getFilteredTotal = () => {
    if (filter === 'all') return paymentStats.totalCompleted;
    if (filter === 'completed') return paymentStats.totalCompleted;
    if (filter === 'pending') return paymentStats.totalPending;
    if (filter === 'failed') return paymentStats.totalFailed;
    return 0;
  };

  return (
    <div>
      {/* Header with Actions */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h5 className="mb-1">Financial Overview</h5>
          <p className="text-muted mb-0">Track your earnings, payments, and commissions</p>
        </div>
        <div className="d-flex gap-2">
          <Button 
            variant="outline-secondary" 
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw size={14} className={`me-1 ${loading ? 'spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline-primary" size="sm" onClick={handleExportData}>
            <Download size={14} className="me-1" />
            Export
          </Button>
          <select 
            className="form-select form-select-sm" 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            style={{ width: 'auto' }}
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <Row className="g-3 mb-4">
        <Col xs={6} md={3}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h6 className="text-muted mb-1">Total Revenue</h6>
                  <h3 className="mb-0">{formatCurrency(paymentStats.totalCompleted)}</h3>
                </div>
                <Badge bg="success" className="rounded-circle p-2">
                  <DollarSign size={16} />
                </Badge>
              </div>
              <div className="d-flex align-items-center mt-2">
                {paymentStats.monthlyGrowth >= 0 ? (
                  <>
                    <ArrowUpRight size={16} className="text-success me-1" />
                    <small className="text-success">+{paymentStats.monthlyGrowth}% from last month</small>
                  </>
                ) : (
                  <>
                    <ArrowDownRight size={16} className="text-danger me-1" />
                    <small className="text-danger">{paymentStats.monthlyGrowth}% from last month</small>
                  </>
                )}
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
                  <h3 className="mb-0">{formatCurrency(dashboardStats.commissionSaved)}</h3>
                </div>
                <Badge bg="warning" className="rounded-circle p-2">
                  <Percent size={16} />
                </Badge>
              </div>
              <div className="mt-2">
                <ProgressBar 
                  now={Math.min((dashboardStats.commissionSaved / 1000000) * 100, 100)} 
                  variant="warning"
                  style={{ height: '6px' }}
                />
                <small className="text-muted">
                  {estateFirmData.hasActiveSubscription ? '0% commission on all listings' : '7.5% commission without subscription'}
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
                <Badge bg="info" className="rounded-circle p-2">
                  <Clock size={16} />
                </Badge>
              </div>
              <div className="d-flex align-items-center mt-2">
                <small className="text-muted">
                  {transactions.filter(t => t.status === 'pending').length} transaction(s) pending
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
                  <h6 className="text-muted mb-1">Forecasted Earnings</h6>
                  <h3 className="mb-0">{formatCurrency(paymentStats.forecastedEarnings)}</h3>
                </div>
                <Badge bg="primary" className="rounded-circle p-2">
                  <Target size={16} />
                </Badge>
              </div>
              <div className="mt-2">
                <small className="text-muted">Next 30 days forecast</small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Transaction Filters */}
      <Card className="mb-4 border-0 shadow-sm">
        <Card.Body className="py-2">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <h6 className="mb-0 me-3">Transactions</h6>
              <div className="d-flex flex-wrap gap-2">
                <Badge 
                  bg={filter === 'all' ? 'primary' : 'light'} 
                  className="cursor-pointer"
                  onClick={() => setFilter('all')}
                >
                  All
                </Badge>
                <Badge 
                  bg={filter === 'subscription' ? 'primary' : 'light'} 
                  className="cursor-pointer"
                  onClick={() => setFilter('subscription')}
                >
                  Subscriptions
                </Badge>
                <Badge 
                  bg={filter === 'boost' ? 'primary' : 'light'} 
                  className="cursor-pointer"
                  onClick={() => setFilter('boost')}
                >
                  Boosts
                </Badge>
                <Badge 
                  bg={filter === 'earnings' ? 'primary' : 'light'} 
                  className="cursor-pointer"
                  onClick={() => setFilter('earnings')}
                >
                  Earnings
                </Badge>
                <Badge 
                  bg={filter === 'commission' ? 'primary' : 'light'} 
                  className="cursor-pointer"
                  onClick={() => setFilter('commission')}
                >
                  Commissions
                </Badge>
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
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3 text-muted">Loading transactions...</p>
            </div>
          ) : transactions.length === 0 ? (
            <Alert variant="info" className="text-center py-4">
              <CreditCard size={48} className="text-muted mb-3 opacity-50" />
              <h5>No Transactions Found</h5>
              <p className="text-muted">You don't have any transactions in the selected period</p>
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
                  {transactions.map(transaction => (
                    <tr key={transaction.id}>
                      <td>
                        <div className="small">
                          {new Date(transaction.created_at).toLocaleDateString()}
                        </div>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                          {new Date(transaction.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td>
                        <div className="fw-medium">{transaction.payment_type?.replace('_', ' ')}</div>
                        {transaction.metadata?.description && (
                          <div className="text-muted small">{transaction.metadata.description}</div>
                        )}
                      </td>
                      <td>{getTypeBadge(transaction.payment_type)}</td>
                      <td>
                        <div className={`fw-medium ${transaction.amount > 0 ? 'text-success' : 'text-danger'}`}>
                          {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                        </div>
                        {transaction.metadata?.original_amount && (
                          <div className="text-muted small">
                            Original: {formatCurrency(transaction.metadata.original_amount)}
                          </div>
                        )}
                      </td>
                      <td>{getStatusBadge(transaction.status)}</td>
                      <td>
                        <code className="small">{transaction.reference}</code>
                      </td>
                      <td>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => handleViewTransaction(transaction)}
                        >
                          <Eye size={14} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}

          {/* Transaction Summary Footer */}
          {transactions.length > 0 && (
            <div className="mt-4 pt-3 border-top">
              <Row>
                <Col md={4}>
                  <div className="d-flex align-items-center">
                    <div className="me-3">
                      <div className="bg-success bg-opacity-10 rounded-circle p-2">
                        <CheckCircle size={20} className="text-success" />
                      </div>
                    </div>
                    <div>
                      <div className="text-muted small">Completed</div>
                      <div className="fw-medium">{formatCurrency(paymentStats.totalCompleted)}</div>
                    </div>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="d-flex align-items-center">
                    <div className="me-3">
                      <div className="bg-warning bg-opacity-10 rounded-circle p-2">
                        <Clock size={20} className="text-warning" />
                      </div>
                    </div>
                    <div>
                      <div className="text-muted small">Pending</div>
                      <div className="fw-medium">{formatCurrency(paymentStats.totalPending)}</div>
                    </div>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="d-flex align-items-center">
                    <div className="me-3">
                      <div className="bg-danger bg-opacity-10 rounded-circle p-2">
                        <AlertCircle size={20} className="text-danger" />
                      </div>
                    </div>
                    <div>
                      <div className="text-muted small">Failed</div>
                      <div className="fw-medium">{formatCurrency(paymentStats.totalFailed)}</div>
                    </div>
                  </div>
                </Col>
              </Row>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Additional Financial Insights */}
      <Row className="g-3 mt-4">
        <Col md={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="mb-0">Earnings Breakdown</h6>
                <PieChart size={18} className="text-muted" />
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Subscriptions</span>
                <span className="fw-medium">{formatCurrency(
                  earnings.filter(e => e.type === 'subscription_revenue' && e.status === 'active')
                    .reduce((sum, e) => sum + e.amount, 0)
                )}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Boosts</span>
                <span className="fw-medium">{formatCurrency(
                  earnings.filter(e => e.type === 'boost_revenue' && e.status === 'active')
                    .reduce((sum, e) => sum + e.amount, 0)
                )}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Commissions</span>
                <span className="fw-medium">{formatCurrency(dashboardStats.commissionSaved)}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted">Other Earnings</span>
                <span className="fw-medium">{formatCurrency(
                  transactions
                    .filter(t => t.payment_type === 'earnings' && t.status === 'completed')
                    .reduce((sum, t) => sum + t.amount, 0)
                )}</span>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="mb-0">Payment Methods</h6>
                <CreditCard size={18} className="text-muted" />
              </div>
              <div className="d-flex align-items-center mb-3">
                <div className="me-3">
                  <div className="bg-primary bg-opacity-10 rounded-circle p-2">
                    <Banknote size={20} className="text-primary" />
                  </div>
                </div>
                <div className="flex-grow-1">
                  <div className="d-flex justify-content-between">
                    <span>Bank Transfer</span>
                    <span className="fw-medium">75%</span>
                  </div>
                  <ProgressBar now={75} variant="primary" style={{ height: '6px' }} />
                </div>
              </div>
              <div className="d-flex align-items-center mb-3">
                <div className="me-3">
                  <div className="bg-success bg-opacity-10 rounded-circle p-2">
                    <Coins size={20} className="text-success" />
                  </div>
                </div>
                <div className="flex-grow-1">
                  <div className="d-flex justify-content-between">
                    <span>Online Payment</span>
                    <span className="fw-medium">20%</span>
                  </div>
                  <ProgressBar now={20} variant="success" style={{ height: '6px' }} />
                </div>
              </div>
              <div className="d-flex align-items-center">
                <div className="me-3">
                  <div className="bg-info bg-opacity-10 rounded-circle p-2">
                    <Wallet size={20} className="text-info" />
                  </div>
                </div>
                <div className="flex-grow-1">
                  <div className="d-flex justify-content-between">
                    <span>Other Methods</span>
                    <span className="fw-medium">5%</span>
                  </div>
                  <ProgressBar now={5} variant="info" style={{ height: '6px' }} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Transaction Details Modal */}
      {selectedTransaction && (
        <Modal show={showTransactionDetails} onHide={() => setShowTransactionDetails(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Transaction Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row className="mb-4">
              <Col md={6}>
                <div className="mb-3">
                  <h6 className="text-muted mb-1">Transaction ID</h6>
                  <code>{selectedTransaction.id}</code>
                </div>
                <div className="mb-3">
                  <h6 className="text-muted mb-1">Reference</h6>
                  <code>{selectedTransaction.reference}</code>
                </div>
                <div className="mb-3">
                  <h6 className="text-muted mb-1">Payment Type</h6>
                  <div>{getTypeBadge(selectedTransaction.payment_type)}</div>
                </div>
              </Col>
              <Col md={6}>
                <div className="mb-3">
                  <h6 className="text-muted mb-1">Amount</h6>
                  <h3 className={`mb-0 ${selectedTransaction.amount > 0 ? 'text-success' : 'text-danger'}`}>
                    {formatCurrency(selectedTransaction.amount)}
                  </h3>
                </div>
                <div className="mb-3">
                  <h6 className="text-muted mb-1">Status</h6>
                  <div>{getStatusBadge(selectedTransaction.status)}</div>
                </div>
                <div className="mb-3">
                  <h6 className="text-muted mb-1">Date</h6>
                  <div>{new Date(selectedTransaction.created_at).toLocaleString()}</div>
                </div>
              </Col>
            </Row>

            {selectedTransaction.metadata && (
              <>
                <h6 className="mb-3">Additional Information</h6>
                <Card className="bg-light">
                  <Card.Body>
                    <pre className="mb-0" style={{ fontSize: '0.875rem' }}>
                      {JSON.stringify(selectedTransaction.metadata, null, 2)}
                    </pre>
                  </Card.Body>
                </Card>
              </>
            )}

            {selectedTransaction.status === 'pending' && (
              <Alert variant="warning" className="mt-3">
                <div className="d-flex align-items-center">
                  <Clock size={20} className="me-2" />
                  <div>
                    <strong>Payment Pending Verification</strong>
                    <p className="mb-0 mt-1">
                      This payment is awaiting verification by the admin team.
                      Please ensure you have uploaded proof of payment.
                    </p>
                  </div>
                </div>
              </Alert>
            )}

            {selectedTransaction.status === 'failed' && (
              <Alert variant="danger" className="mt-3">
                <div className="d-flex align-items-center">
                  <XCircle size={20} className="me-2" />
                  <div>
                    <strong>Payment Failed</strong>
                    <p className="mb-0 mt-1">
                      This payment failed. Please contact support if you believe this is an error.
                    </p>
                  </div>
                </div>
              </Alert>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowTransactionDetails(false)}>
              Close
            </Button>
            {selectedTransaction.metadata?.proof_url && (
              <Button 
                variant="outline-primary"
                as="a"
                href={selectedTransaction.metadata.proof_url}
                target="_blank"
                download
              >
                <Download size={16} className="me-1" />
                Download Proof
              </Button>
            )}
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
};

export default FinancialOverview;