// src/modules/admin/pages/PaymentVerification.jsx
import React, { useState, useEffect } from 'react';
import { Table, Button, Badge, Modal, Form, Alert, Card } from 'react-bootstrap';
import { 
  CheckCircle, XCircle, Eye, Clock, Download, 
  CreditCard, Building, User, Calendar
} from 'lucide-react';
import { supabase } from '../../../shared/lib/supabaseClient';
import { paymentSystem } from '../../../shared/lib/paymentSystem';

const PaymentVerification = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    loadPayments();
    // Subscribe to real-time updates
    const subscription = supabase
      .channel('payments')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'payments' }, 
        () => loadPayments()
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadPayments = async () => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          user:user_id(email, name),
          service_provider:service_providers!service_providers_user_id_fkey(
            business_name,
            service_type
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (!error) {
        setPayments(data || []);
      }
    } catch (err) {
      console.error('Error loading payments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPayment = async (paymentId, status) => {
    setVerifying(true);
    try {
      const user = (await supabase.auth.getUser()).data.user;
      
      // Update payment status
      await paymentSystem.verifyPayment(
        payments.find(p => p.id === paymentId)?.reference,
        user.id
      );

      // Activate subscription or boost based on payment type
      const payment = payments.find(p => p.id === paymentId);
      
      if (status === 'completed') {
        if (payment.payment_type === 'subscription') {
          await paymentSystem.activateSubscription(paymentId);
        } else if (payment.payment_type === 'boost') {
          await paymentSystem.activateBoost(paymentId);
        }
      }

      // Reload payments
      await loadPayments();
      setShowModal(false);
    } catch (err) {
      console.error('Error verifying payment:', err);
    } finally {
      setVerifying(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <Badge bg="success"><CheckCircle size={12} /> Completed</Badge>;
      case 'pending':
        return <Badge bg="warning"><Clock size={12} /> Pending</Badge>;
      case 'failed':
        return <Badge bg="danger"><XCircle size={12} /> Failed</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  const getPaymentTypeIcon = (type) => {
    switch (type) {
      case 'subscription':
        return <Crown size={16} className="me-1" />;
      case 'boost':
        return <Zap size={16} className="me-1" />;
      default:
        return <CreditCard size={16} className="me-1" />;
    }
  };

  return (
    <div className="p-4">
      <h2 className="mb-4">Payment Verification</h2>
      
      <Card className="mb-4">
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
                  <td>
                    <code>{payment.reference}</code>
                  </td>
                  <td>
                    <div className="d-flex align-items-center">
                      <User size={14} className="me-2 text-muted" />
                      {payment.user?.name || payment.user?.email}
                    </div>
                    {payment.service_provider && (
                      <small className="text-muted d-block">
                        {payment.service_provider.business_name}
                      </small>
                    )}
                  </td>
                  <td>
                    <div className="d-flex align-items-center">
                      {getPaymentTypeIcon(payment.payment_type)}
                      {payment.payment_type}
                    </div>
                  </td>
                  <td>
                    <strong>₦{payment.amount?.toLocaleString()}</strong>
                  </td>
                  <td>{getStatusBadge(payment.status)}</td>
                  <td>
                    <div className="d-flex align-items-center">
                      <Calendar size={14} className="me-2 text-muted" />
                      {new Date(payment.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => {
                        setSelectedPayment(payment);
                        setShowModal(true);
                      }}
                    >
                      <Eye size={14} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Payment Detail Modal */}
      {selectedPayment && (
        <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Payment Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="row">
              <div className="col-md-6">
                <h6>Payment Information</h6>
                <dl className="row">
                  <dt className="col-sm-4">Reference:</dt>
                  <dd className="col-sm-8"><code>{selectedPayment.reference}</code></dd>

                  <dt className="col-sm-4">Amount:</dt>
                  <dd className="col-sm-8">₦{selectedPayment.amount?.toLocaleString()}</dd>

                  <dt className="col-sm-4">Type:</dt>
                  <dd className="col-sm-8">{selectedPayment.payment_type}</dd>

                  <dt className="col-sm-4">Status:</dt>
                  <dd className="col-sm-8">{getStatusBadge(selectedPayment.status)}</dd>

                  <dt className="col-sm-4">Date:</dt>
                  <dd className="col-sm-8">
                    {new Date(selectedPayment.created_at).toLocaleString()}
                  </dd>
                </dl>
              </div>
              
              <div className="col-md-6">
                <h6>User Information</h6>
                <dl className="row">
                  <dt className="col-sm-4">Name:</dt>
                  <dd className="col-sm-8">{selectedPayment.user?.name || 'N/A'}</dd>

                  <dt className="col-sm-4">Email:</dt>
                  <dd className="col-sm-8">{selectedPayment.user?.email}</dd>

                  {selectedPayment.service_provider && (
                    <>
                      <dt className="col-sm-4">Business:</dt>
                      <dd className="col-sm-8">{selectedPayment.service_provider.business_name}</dd>

                      <dt className="col-sm-4">Service Type:</dt>
                      <dd className="col-sm-8">{selectedPayment.service_provider.service_type}</dd>
                    </>
                  )}
                </dl>
              </div>
            </div>

            {selectedPayment.metadata?.bank_details && (
              <Card className="mt-3">
                <Card.Body>
                  <h6>Bank Transfer Details</h6>
                  <dl className="row mb-0">
                    <dt className="col-sm-3">Bank:</dt>
                    <dd className="col-sm-9">{selectedPayment.metadata.bank_details.bankName}</dd>

                    <dt className="col-sm-3">Account No:</dt>
                    <dd className="col-sm-9">{selectedPayment.metadata.bank_details.accountNumber}</dd>

                    <dt className="col-sm-3">Account Name:</dt>
                    <dd className="col-sm-9">{selectedPayment.metadata.bank_details.accountName}</dd>
                  </dl>
                </Card.Body>
              </Card>
            )}

            {selectedPayment.metadata?.proof_url && (
              <div className="mt-3">
                <h6>Proof of Payment</h6>
                <div className="text-center">
                  <img
                    src={selectedPayment.metadata.proof_url}
                    alt="Payment proof"
                    className="img-fluid rounded border"
                    style={{ maxHeight: '300px' }}
                  />
                  <div className="mt-2">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      as="a"
                      href={selectedPayment.metadata.proof_url}
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
          </Modal.Body>
          <Modal.Footer>
            {selectedPayment.status === 'pending' && (
              <>
                <Button
                  variant="danger"
                  onClick={() => handleVerifyPayment(selectedPayment.id, 'failed')}
                  disabled={verifying}
                >
                  <XCircle size={16} className="me-1" />
                  Reject
                </Button>
                <Button
                  variant="success"
                  onClick={() => handleVerifyPayment(selectedPayment.id, 'completed')}
                  disabled={verifying}
                >
                  <CheckCircle size={16} className="me-1" />
                  Verify & Activate
                </Button>
              </>
            )}
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
};

export default PaymentVerification;