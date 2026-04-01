// src/modules/admin/pages/PaymentVerification.jsx
import React, { useState, useEffect } from 'react';
import { Table, Button, Badge, Modal, Form, Alert, Card, Row, Col } from 'react-bootstrap';
import { 
  CheckCircle, XCircle, Eye, Clock, Download, 
  CreditCard, Building, User, Calendar, 
  Users, Banknote, FileText, Shield, TrendingUp
} from 'lucide-react';
import { supabase } from '../../../shared/lib/supabaseClient';
import { paymentService } from '../../../shared/lib/paymentService';
import './PaymentVerification.css';

const PaymentVerification = () => {
  const [payments, setPayments] = useState([]);
  const [commissions, setCommissions] = useState([]);
  const [activeTab, setActiveTab] = useState('payments'); // payments, commissions
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [stats, setStats] = useState({
    totalPayments: 0,
    pendingPayments: 0,
    pendingCommissions: 0,
    totalCommissionAmount: 0
  });

  useEffect(() => {
    loadData();
    // Subscribe to real-time updates
    const subscription = supabase
      .channel('admin-payments')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'payments' }, 
        () => loadData()
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'commissions' },
        () => loadData()
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load payments (subscriptions, boosts, etc)
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .select(`
          *,
          user:user_id(id, email, full_name, name, role, bank_name, account_number, account_name),
          service_provider:service_providers!service_providers_user_id_fkey(
            business_name,
            service_type
          )
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (!paymentsError) {
        setPayments(paymentsData || []);
      }

      // Load commissions (manager payments) with full details
      const { data: commissionsData, error: commissionsError } = await supabase
        .from('commissions')
        .select(`
          *,
          listing:listings(id, title, address, city, state, price, poster_role, user_id),
          manager:manager_id(id, full_name, name, email, phone, bank_name, account_number, account_name),
          referrer:referrer_id(id, full_name, name, email, phone, bank_name, account_number, account_name),
          listing_poster:listings!inner(user_id(id, full_name, name, email, bank_name, account_number, account_name))
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (!commissionsError) {
        setCommissions(commissionsData || []);
      }

      // Calculate stats
      const pendingPayments = paymentsData?.filter(p => p.status === 'pending').length || 0;
      const pendingCommissions = commissionsData?.filter(c => c.status === 'proof_submitted').length || 0;
      const totalCommissionAmount = commissionsData
        ?.filter(c => c.status === 'proof_submitted')
        .reduce((sum, c) => sum + (c.manager_share || 0), 0) || 0;

      setStats({
        totalPayments: paymentsData?.length || 0,
        pendingPayments,
        pendingCommissions,
        totalCommissionAmount
      });
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPayment = async (paymentId, status) => {
    setVerifying(true);
    try {
      const { data: { user: adminUser } } = await supabase.auth.getUser();
      const payment = payments.find(p => p.id === paymentId);
      
      // Update payment status
      const { error: updateError } = await supabase
        .from('payments')
        .update({
          status: status === 'completed' ? 'verified' : 'failed',
          verified_by: adminUser?.id,
          verified_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', paymentId);

      if (updateError) throw updateError;

      // Activate subscription or boost based on payment type
      if (status === 'completed') {
        if (payment.payment_type === 'subscription') {
          await paymentService.createSubscription({
            userId: payment.user_id,
            plan: payment.metadata?.plan,
            paymentId: payment.id
          });
        } else if (payment.payment_type === 'boost') {
          await paymentService.createBoost({
            userId: payment.user_id,
            package: payment.metadata?.package,
            paymentId: payment.id
          });
        }
      }

      // Create notification for user
      await supabase.from('notifications').insert({
        user_id: payment.user_id,
        title: status === 'completed' ? '✅ Payment Verified' : '❌ Payment Rejected',
        message: status === 'completed' 
          ? `Your payment of ₦${payment.amount?.toLocaleString()} has been verified and activated.`
          : `Your payment of ₦${payment.amount?.toLocaleString()} was rejected. Please contact support.`,
        type: 'payment_verification',
        data: { payment_id: paymentId, status },
        created_at: new Date().toISOString()
      });

      await loadData();
      setShowModal(false);
      alert(`Payment ${status === 'completed' ? 'verified and activated' : 'rejected'} successfully!`);
    } catch (err) {
      console.error('Error verifying payment:', err);
      alert('Failed to verify payment. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  const handleApproveCommission = async (commission) => {
    setVerifying(true);
    try {
      const { data: { user: adminUser } } = await supabase.auth.getUser();

      // Update commission status
      const { error: updateError } = await supabase
        .from('commissions')
        .update({
          status: 'verified',
          approved_by: adminUser?.id,
          approved_at: new Date().toISOString(),
          admin_notes: 'Payment proof verified and approved',
          updated_at: new Date().toISOString()
        })
        .eq('id', commission.id);

      if (updateError) throw updateError;

      // Update payment record if exists
      if (commission.payment_id) {
        await supabase
          .from('payments')
          .update({
            status: 'verified',
            verified_by: adminUser?.id,
            verified_at: new Date().toISOString()
          })
          .eq('id', commission.payment_id);
      }

      // Notify manager
      await supabase.from('notifications').insert({
        user_id: commission.manager_id,
        title: '✅ Commission Approved!',
        message: `Your commission payment of ₦${commission.manager_share?.toLocaleString()} for "${commission.listing?.title}" has been approved. The amount will be paid to your bank account within 24-48 hours.`,
        type: 'commission_approved',
        data: { commission_id: commission.id },
        created_at: new Date().toISOString()
      });

      await loadData();
      setShowModal(false);
      alert('Commission approved successfully!');
    } catch (err) {
      console.error('Error approving commission:', err);
      alert('Failed to approve commission. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  const handleRejectCommission = async () => {
    if (!rejectReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    setVerifying(true);
    try {
      const { error: updateError } = await supabase
        .from('commissions')
        .update({
          status: 'rejected',
          rejected_reason: rejectReason,
          admin_notes: rejectReason,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedItem.id);

      if (updateError) throw updateError;

      // Update payment record if exists
      if (selectedItem.payment_id) {
        await supabase
          .from('payments')
          .update({
            status: 'rejected',
            metadata: {
              ...selectedItem.metadata,
              rejected_reason: rejectReason,
              rejected_at: new Date().toISOString()
            }
          })
          .eq('id', selectedItem.payment_id);
      }

      // Notify manager
      await supabase.from('notifications').insert({
        user_id: selectedItem.manager_id,
        title: '❌ Commission Proof Rejected',
        message: `Your commission payment proof for "${selectedItem.listing?.title}" was rejected. Reason: ${rejectReason}. Please upload a valid proof.`,
        type: 'commission_rejected',
        data: { commission_id: selectedItem.id },
        created_at: new Date().toISOString()
      });

      await loadData();
      setShowRejectModal(false);
      setRejectReason('');
      setSelectedItem(null);
      alert('Commission rejected. Manager will be notified.');
    } catch (err) {
      console.error('Error rejecting commission:', err);
      alert('Failed to reject commission. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'verified':
      case 'completed':
        return <Badge bg="success"><CheckCircle size={12} /> Verified</Badge>;
      case 'pending':
        return <Badge bg="warning"><Clock size={12} /> Pending</Badge>;
      case 'proof_submitted':
        return <Badge bg="info"><FileText size={12} /> Proof Submitted</Badge>;
      case 'failed':
      case 'rejected':
        return <Badge bg="danger"><XCircle size={12} /> Rejected</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-verification p-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Payment Verification Dashboard</h2>
          <p className="text-muted">Verify payments, approve commissions, and manage transactions</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid mb-4">
        <Card className="stat-card">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="text-muted mb-1">Total Payments</h6>
                <h3 className="mb-0">{stats.totalPayments}</h3>
              </div>
              <CreditCard size={32} className="text-primary opacity-50" />
            </div>
          </Card.Body>
        </Card>
        <Card className="stat-card">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="text-muted mb-1">Pending Payments</h6>
                <h3 className="mb-0 text-warning">{stats.pendingPayments}</h3>
              </div>
              <Clock size={32} className="text-warning opacity-50" />
            </div>
          </Card.Body>
        </Card>
        <Card className="stat-card">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="text-muted mb-1">Pending Commissions</h6>
                <h3 className="mb-0 text-info">{stats.pendingCommissions}</h3>
              </div>
              <TrendingUp size={32} className="text-info opacity-50" />
            </div>
          </Card.Body>
        </Card>
        <Card className="stat-card">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="text-muted mb-1">Commission Amount</h6>
                <h3 className="mb-0 text-success">{formatCurrency(stats.totalCommissionAmount)}</h3>
              </div>
              <Banknote size={32} className="text-success opacity-50" />
            </div>
          </Card.Body>
        </Card>
      </div>

      {/* Tabs */}
      <div className="tabs-container mb-4">
        <button
          className={`tab-btn ${activeTab === 'payments' ? 'active' : ''}`}
          onClick={() => setActiveTab('payments')}
        >
          <CreditCard size={16} className="me-2" />
          Subscription & Boost Payments
        </button>
        <button
          className={`tab-btn ${activeTab === 'commissions' ? 'active' : ''}`}
          onClick={() => setActiveTab('commissions')}
        >
          <TrendingUp size={16} className="me-2" />
          Manager Commission Approvals
        </button>
      </div>

      {/* Payments Tab */}
      {activeTab === 'payments' && (
        <Card>
          <Card.Body>
            <Table responsive striped hover>
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>User</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id}>
                    <td><code>{payment.reference}</code></td>
                    <td>
                      <div className="d-flex align-items-center">
                        <User size={14} className="me-2 text-muted" />
                        {payment.user?.full_name || payment.user?.name || payment.user?.email}
                      </div>
                      {payment.user?.role && (
                        <small className="text-muted d-block">{payment.user.role}</small>
                      )}
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <CreditCard size={14} className="me-1" />
                        {payment.payment_type}
                      </div>
                    </td>
                    <td><strong>{formatCurrency(payment.amount)}</strong></td>
                    <td>{getStatusBadge(payment.status)}</td>
                    <td>
                      <Calendar size={14} className="me-1 text-muted" />
                      {new Date(payment.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => {
                          setSelectedItem(payment);
                          setShowModal(true);
                        }}
                      >
                        <Eye size={14} className="me-1" />
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
                {payments.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center py-4 text-muted">
                      No payments found
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      {/* Commissions Tab */}
      {activeTab === 'commissions' && (
        <Card>
          <Card.Body>
            <Table responsive striped hover>
              <thead>
                <tr>
                  <th>Property</th>
                  <th>Manager</th>
                  <th>Referrer/Poster</th>
                  <th>Rental Amount</th>
                  <th>Commission (2.5%)</th>
                  <th>Proof</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {commissions.map((commission) => (
                  <tr key={commission.id}>
                    <td>
                      <div>
                        <strong>{commission.listing?.title}</strong>
                        <small className="d-block text-muted">
                          {commission.listing?.address || `${commission.listing?.city || ''} ${commission.listing?.state || ''}`}
                        </small>
                        <Badge bg="secondary" className="mt-1">
                          {commission.listing?.poster_role === 'tenant' ? '👤 Outgoing Tenant' : 
                           commission.listing?.poster_role === 'landlord' ? '🏠 Landlord' : '🏢 Estate Firm'}
                        </Badge>
                      </div>
                    </td>
                    <td>
                      <div>
                        <strong>{commission.manager?.full_name || commission.manager?.name}</strong>
                        <small className="d-block text-muted">{commission.manager?.email}</small>
                        {commission.manager?.bank_name && (
                          <small className="d-block text-success">
                            🏦 {commission.manager.bank_name} - {commission.manager.account_number}
                          </small>
                        )}
                      </div>
                    </td>
                    <td>
                      <div>
                        <strong>{commission.referrer?.full_name || commission.referrer?.name || commission.listing_poster?.full_name}</strong>
                        <small className="d-block text-muted">{commission.referrer?.email || commission.listing_poster?.email}</small>
                        {commission.referrer?.bank_name && (
                          <small className="d-block text-info">
                            🏦 {commission.referrer.bank_name} - {commission.referrer.account_number}
                          </small>
                        )}
                      </div>
                    </td>
                    <td><strong>{formatCurrency(commission.rental_amount)}</strong></td>
                    <td>
                      <strong className="text-success">{formatCurrency(commission.manager_share)}</strong>
                      <small className="d-block text-muted">2.5% of rental</small>
                    </td>
                    <td>
                      {commission.proof_url ? (
                        <a href={commission.proof_url} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-primary">
                          <Eye size={12} /> View
                        </a>
                      ) : (
                        <span className="text-muted">No proof</span>
                      )}
                    </td>
                    <td>{getStatusBadge(commission.status)}</td>
                    <td>
                      {commission.status === 'proof_submitted' && (
                        <div className="d-flex gap-2">
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => handleApproveCommission(commission)}
                            disabled={verifying}
                          >
                            <CheckCircle size={14} />
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => {
                              setSelectedItem(commission);
                              setShowRejectModal(true);
                            }}
                            disabled={verifying}
                          >
                            <XCircle size={14} />
                          </Button>
                          <Button
                            variant="outline-info"
                            size="sm"
                            onClick={() => {
                              setSelectedItem(commission);
                              setShowModal(true);
                            }}
                          >
                            <Eye size={14} />
                          </Button>
                        </div>
                      )}
                      {(commission.status === 'verified' || commission.status === 'rejected') && (
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={() => {
                            setSelectedItem(commission);
                            setShowModal(true);
                          }}
                        >
                          <Eye size={14} /> View
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
                {commissions.length === 0 && (
                  <tr>
                    <td colSpan="8" className="text-center py-4 text-muted">
                      No commission records found
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      {/* Payment Detail Modal */}
      {selectedItem && showModal && (
        <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>
              {activeTab === 'payments' ? 'Payment Details' : 'Commission Details'}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {activeTab === 'payments' ? (
              // Payment Details
              <div>
                <Row>
                  <Col md={6}>
                    <h6>Payment Information</h6>
                    <dl className="row">
                      <dt className="col-sm-4">Reference:</dt>
                      <dd className="col-sm-8"><code>{selectedItem.reference}</code></dd>

                      <dt className="col-sm-4">Amount:</dt>
                      <dd className="col-sm-8">{formatCurrency(selectedItem.amount)}</dd>

                      <dt className="col-sm-4">Type:</dt>
                      <dd className="col-sm-8">{selectedItem.payment_type}</dd>

                      <dt className="col-sm-4">Status:</dt>
                      <dd className="col-sm-8">{getStatusBadge(selectedItem.status)}</dd>

                      <dt className="col-sm-4">Date:</dt>
                      <dd className="col-sm-8">
                        {new Date(selectedItem.created_at).toLocaleString()}
                      </dd>
                    </dl>
                  </Col>
                  
                  <Col md={6}>
                    <h6>User Information</h6>
                    <dl className="row">
                      <dt className="col-sm-4">Name:</dt>
                      <dd className="col-sm-8">{selectedItem.user?.full_name || selectedItem.user?.name || 'N/A'}</dd>

                      <dt className="col-sm-4">Email:</dt>
                      <dd className="col-sm-8">{selectedItem.user?.email}</dd>

                      <dt className="col-sm-4">Role:</dt>
                      <dd className="col-sm-8">{selectedItem.user?.role}</dd>

                      {selectedItem.user?.bank_name && (
                        <>
                          <dt className="col-sm-4">Bank:</dt>
                          <dd className="col-sm-8">{selectedItem.user.bank_name}</dd>

                          <dt className="col-sm-4">Account No:</dt>
                          <dd className="col-sm-8">{selectedItem.user.account_number}</dd>

                          <dt className="col-sm-4">Account Name:</dt>
                          <dd className="col-sm-8">{selectedItem.user.account_name}</dd>
                        </>
                      )}
                    </dl>
                  </Col>
                </Row>

                {selectedItem.metadata?.proof_url && (
                  <div className="mt-3">
                    <h6>Proof of Payment</h6>
                    <div className="text-center">
                      <img
                        src={selectedItem.metadata.proof_url}
                        alt="Payment proof"
                        className="img-fluid rounded border"
                        style={{ maxHeight: '300px' }}
                      />
                      <div className="mt-2">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          as="a"
                          href={selectedItem.metadata.proof_url}
                          target="_blank"
                          download
                        >
                          <Download size={14} className="me-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // Commission Details
              <div>
                <h6>Property Information</h6>
                <dl className="row">
                  <dt className="col-sm-3">Title:</dt>
                  <dd className="col-sm-9">{selectedItem.listing?.title}</dd>

                  <dt className="col-sm-3">Address:</dt>
                  <dd className="col-sm-9">{selectedItem.listing?.address}, {selectedItem.listing?.city}, {selectedItem.listing?.state}</dd>

                  <dt className="col-sm-3">Rental Amount:</dt>
                  <dd className="col-sm-9">{formatCurrency(selectedItem.rental_amount)}</dd>
                </dl>

                <hr />

                <h6>Manager Information</h6>
                <dl className="row">
                  <dt className="col-sm-3">Name:</dt>
                  <dd className="col-sm-9">{selectedItem.manager?.full_name || selectedItem.manager?.name}</dd>

                  <dt className="col-sm-3">Email:</dt>
                  <dd className="col-sm-9">{selectedItem.manager?.email}</dd>

                  <dt className="col-sm-3">Phone:</dt>
                  <dd className="col-sm-9">{selectedItem.manager?.phone}</dd>

                  <dt className="col-sm-3">Bank Details:</dt>
                  <dd className="col-sm-9">
                    {selectedItem.manager?.bank_name ? (
                      <>
                        <strong>Bank:</strong> {selectedItem.manager.bank_name}<br />
                        <strong>Account No:</strong> {selectedItem.manager.account_number}<br />
                        <strong>Account Name:</strong> {selectedItem.manager.account_name}
                      </>
                    ) : (
                      <span className="text-warning">⚠️ No bank details provided</span>
                    )}
                  </dd>
                </dl>

                <hr />

                <h6>Referrer/Poster Information</h6>
                <dl className="row">
                  <dt className="col-sm-3">Name:</dt>
                  <dd className="col-sm-9">{selectedItem.referrer?.full_name || selectedItem.referrer?.name || selectedItem.listing_poster?.full_name}</dd>

                  <dt className="col-sm-3">Email:</dt>
                  <dd className="col-sm-9">{selectedItem.referrer?.email || selectedItem.listing_poster?.email}</dd>

                  <dt className="col-sm-3">Role:</dt>
                  <dd className="col-sm-9">{selectedItem.listing?.poster_role}</dd>

                  <dt className="col-sm-3">Bank Details:</dt>
                  <dd className="col-sm-9">
                    {selectedItem.referrer?.bank_name ? (
                      <>
                        <strong>Bank:</strong> {selectedItem.referrer.bank_name}<br />
                        <strong>Account No:</strong> {selectedItem.referrer.account_number}<br />
                        <strong>Account Name:</strong> {selectedItem.referrer.account_name}
                      </>
                    ) : (
                      <span className="text-warning">⚠️ No bank details provided</span>
                    )}
                  </dd>
                </dl>

                <hr />

                <h6>Commission Breakdown</h6>
                <dl className="row">
                  <dt className="col-sm-3">Total Commission (7.5%):</dt>
                  <dd className="col-sm-9">{formatCurrency(selectedItem.rental_amount * 0.075)}</dd>

                  <dt className="col-sm-3">Manager Share (2.5%):</dt>
                  <dd className="col-sm-9 text-success">{formatCurrency(selectedItem.manager_share)}</dd>

                  <dt className="col-sm-3">Referrer Share (1.5%):</dt>
                  <dd className="col-sm-9 text-info">{formatCurrency(selectedItem.referrer_share)}</dd>

                  <dt className="col-sm-3">RentEasy Share (3.5%):</dt>
                  <dd className="col-sm-9 text-primary">{formatCurrency(selectedItem.platform_share)}</dd>
                </dl>

                {selectedItem.proof_url && (
                  <div className="mt-3">
                    <h6>Payment Proof</h6>
                    <div className="text-center">
                      <img
                        src={selectedItem.proof_url}
                        alt="Commission proof"
                        className="img-fluid rounded border"
                        style={{ maxHeight: '300px' }}
                      />
                      <div className="mt-2">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          as="a"
                          href={selectedItem.proof_url}
                          target="_blank"
                          download
                        >
                          <Download size={14} className="me-1" />
                          Download Proof
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {selectedItem.admin_notes && (
                  <div className="mt-3 alert alert-info">
                    <strong>Admin Notes:</strong> {selectedItem.admin_notes}
                  </div>
                )}
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            {activeTab === 'payments' && selectedItem.status === 'pending' && (
              <>
                <Button
                  variant="danger"
                  onClick={() => handleVerifyPayment(selectedItem.id, 'failed')}
                  disabled={verifying}
                >
                  <XCircle size={16} className="me-1" />
                  Reject
                </Button>
                <Button
                  variant="success"
                  onClick={() => handleVerifyPayment(selectedItem.id, 'completed')}
                  disabled={verifying}
                >
                  <CheckCircle size={16} className="me-1" />
                  Verify & Activate
                </Button>
              </>
            )}
            {activeTab === 'commissions' && selectedItem.status === 'proof_submitted' && (
              <>
                <Button
                  variant="danger"
                  onClick={() => {
                    setShowModal(false);
                    setShowRejectModal(true);
                  }}
                  disabled={verifying}
                >
                  <XCircle size={16} className="me-1" />
                  Reject
                </Button>
                <Button
                  variant="success"
                  onClick={() => handleApproveCommission(selectedItem)}
                  disabled={verifying}
                >
                  <CheckCircle size={16} className="me-1" />
                  Approve & Release
                </Button>
              </>
            )}
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedItem && (
        <Modal show={showRejectModal} onHide={() => setShowRejectModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Reject Commission Payment</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>Property: <strong>{selectedItem.listing?.title}</strong></p>
            <p>Manager: <strong>{selectedItem.manager?.full_name || selectedItem.manager?.name}</strong></p>
            <p>Amount: <strong>{formatCurrency(selectedItem.manager_share)}</strong></p>
            <Form.Group className="mt-3">
              <Form.Label>Reason for rejection:</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Please specify why this proof was rejected..."
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowRejectModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleRejectCommission} disabled={verifying}>
              Confirm Reject
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
};

export default PaymentVerification;