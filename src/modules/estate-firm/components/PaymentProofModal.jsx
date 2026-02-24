// src/modules/estate-firm/components/PaymentProofModal.jsx
import React, { useState } from 'react';
import { Modal, Button, Form, Alert, Card } from 'react-bootstrap';
import { Upload, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '../../../shared/lib/supabaseClient';

const PaymentProofModal = ({ show, onHide, estateFirmData }) => {
  const [file, setFile] = useState(null);
  const [paymentType, setPaymentType] = useState('subscription');
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleFileUpload = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      if (!selectedFile.type.startsWith('image/')) {
        setError('Only image files are allowed');
        return;
      }
      setFile(selectedFile);
      setError('');
    }
  };

  const handleSubmit = async () => {
    if (!file || !amount || !reference) {
      setError('Please fill all fields and upload proof');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `payment_proofs/${Date.now()}_${reference}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('renteasy-payments')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('renteasy-payments')
        .getPublicUrl(fileName);

      // Create payment record
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          user_id: (await supabase.auth.getUser()).data.user.id,
          amount: parseFloat(amount),
          payment_type: paymentType,
          reference: reference,
          status: 'pending',
          metadata: {
            proof_url: publicUrl,
            submitted_at: new Date().toISOString(),
            file_name: file.name
          }
        });

      if (paymentError) throw paymentError;

      setSuccess('Payment proof submitted successfully! Admin will verify your payment.');
      setTimeout(() => {
        onHide();
        setFile(null);
        setAmount('');
        setReference('');
        setSuccess('');
      }, 2000);

    } catch (err) {
      setError(err.message || 'Failed to submit payment proof');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Submit Payment Proof</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {success && (
          <Alert variant="success" className="d-flex align-items-center">
            <CheckCircle size={20} className="me-2" />
            {success}
          </Alert>
        )}
        
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Payment Type</Form.Label>
            <Form.Select 
              value={paymentType} 
              onChange={(e) => setPaymentType(e.target.value)}
            >
              <option value="subscription">Subscription Payment</option>
              <option value="boost">Boost Payment</option>
              <option value="commission">Commission Payment</option>
              <option value="other">Other Payment</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Amount (₦)</Form.Label>
            <Form.Control
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount paid"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Payment Reference/Transaction ID</Form.Label>
            <Form.Control
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Enter payment reference"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Upload Proof of Payment</Form.Label>
            <div className="border rounded p-3 text-center">
              {file ? (
                <div className="d-flex align-items-center justify-content-between">
                  <span>{file.name}</span>
                  <Button 
                    variant="link" 
                    size="sm"
                    onClick={() => setFile(null)}
                  >
                    <XCircle size={16} />
                  </Button>
                </div>
              ) : (
                <>
                  <Upload size={32} className="text-muted mb-2" />
                  <p className="text-muted mb-2">Click to upload or drag and drop</p>
                  <small className="text-muted d-block">PNG, JPG, PDF up to 5MB</small>
                  <Form.Control
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileUpload}
                    className="mt-2"
                  />
                </>
              )}
            </div>
          </Form.Group>
        </Form>

        {error && (
          <Alert variant="danger" className="d-flex align-items-center">
            <XCircle size={20} className="me-2" />
            {error}
          </Alert>
        )}

        <Card className="mt-3">
          <Card.Body className="p-3">
            <h6 className="mb-2">Bank Details for Transfer:</h6>
            <div className="small">
              <div><strong>Bank:</strong> Wema Bank</div>
              <div><strong>Account Name:</strong> RentEasy</div>
              <div><strong>Account Number:</strong> 1234567890</div>
            </div>
          </Card.Body>
        </Card>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button 
          variant="primary" 
          onClick={handleSubmit}
          disabled={loading || !file || !amount || !reference}
        >
          {loading ? 'Submitting...' : 'Submit Proof'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PaymentProofModal;