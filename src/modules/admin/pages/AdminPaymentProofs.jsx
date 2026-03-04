// src/modules/admin/pages/AdminPaymentProofs.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import { supabase } from '../../../shared/lib/supabaseClient';
import './AdminPaymentProofs.css';

const AdminPaymentProofs = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [proofs, setProofs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== 'admin' && user?.role !== 'super-admin') {
      navigate('/login');
      return;
    }
    fetchProofs();
  }, [user]);

  const fetchProofs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('payment_proofs')
      .select(`
        *,
        listings!payment_proofs_listing_id_fkey (title, address),
        profiles!payment_proofs_tenant_id_fkey (full_name, email)
      `)
      .eq('verified', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching payment proofs:', error);
    } else {
      setProofs(data || []);
    }
    setLoading(false);
  };

  const verifyProof = async (proofId) => {
    try {
      const { error } = await supabase
        .from('payment_proofs')
        .update({
          verified: true,
          verified_by: user.id,
          verified_at: new Date().toISOString(),
        })
        .eq('id', proofId);

      if (error) throw error;

      // Add system message in chat
      const proof = proofs.find(p => p.id === proofId);
      if (proof?.chat_id) {
        await supabase.from('messages').insert([{
          chat_id: proof.chat_id,
          sender_id: '00000000-0000-0000-0000-000000000000',
          sender_role: 'system',
          content: `✅ Admin verified payment proof.`,
          is_system: true,
        }]);
      }

      alert('Payment proof verified');
      fetchProofs();
    } catch (error) {
      console.error('Error verifying proof:', error);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="admin-payment-proofs">
      <h1>Pending Payment Proofs</h1>

      {proofs.length === 0 ? (
        <div className="empty-state">No pending payment proofs.</div>
      ) : (
        <div className="proofs-grid">
          {proofs.map(proof => (
            <div key={proof.id} className="proof-card">
              <div className="proof-header">
                <span className="proof-type">{proof.proof_type}</span>
                <span className="proof-date">{new Date(proof.created_at).toLocaleDateString()}</span>
              </div>
              <div className="proof-body">
                <p><strong>Property:</strong> {proof.listings?.title}</p>
                <p><strong>Tenant:</strong> {proof.profiles?.full_name || proof.tenant_id}</p>
                <p><strong>Description:</strong> {proof.description || 'No description'}</p>
                <div className="proof-file">
                  <a href={proof.file_url} target="_blank" rel="noopener noreferrer">
                    View {proof.proof_type}
                  </a>
                </div>
              </div>
              <div className="proof-actions">
                <button className="btn-verify" onClick={() => verifyProof(proof.id)}>
                  Verify
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPaymentProofs;