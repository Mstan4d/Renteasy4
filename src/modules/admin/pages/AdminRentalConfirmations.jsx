// src/modules/admin/pages/AdminRentalConfirmations.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import { supabase } from '../../../shared/lib/supabaseClient';
import './AdminRentalConfirmations.css';

const AdminRentalConfirmations = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [confirmations, setConfirmations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== 'admin' && user?.role !== 'super-admin') {
      navigate('/login');
      return;
    }
    fetchConfirmations();
  }, [user]);

  const fetchConfirmations = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('rental_confirmations')
      .select(`
        *,
        listings!rental_confirmations_listing_id_fkey (title, address, price),
        profiles!rental_confirmations_tenant_id_fkey (full_name, email, phone)
      `)
      .or('landlord_confirmed.eq.false,tenant_confirmed.eq.false')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching rental confirmations:', error);
    } else {
      setConfirmations(data || []);
    }
    setLoading(false);
  };

  const markLandlordConfirmed = async (confirmationId) => {
    try {
      const { error } = await supabase
        .from('rental_confirmations')
        .update({
          landlord_confirmed: true,
          landlord_confirmed_at: new Date().toISOString(),
        })
        .eq('id', confirmationId);

      if (error) throw error;

      // Add system message in chat
      const confirmation = confirmations.find(c => c.id === confirmationId);
      if (confirmation?.chat_id) {
        await supabase.from('messages').insert([{
          chat_id: confirmation.chat_id,
          sender_id: '00000000-0000-0000-0000-000000000000',
          sender_role: 'system',
          content: `✅ Admin confirmed landlord. Awaiting tenant confirmation.`,
          is_system: true,
        }]);
      }

      alert('Landlord confirmed');
      fetchConfirmations();
    } catch (error) {
      console.error('Error marking landlord confirmed:', error);
    }
  };

  const markTenantConfirmed = async (confirmationId) => {
    // Admin can also force tenant confirmation (if needed)
    try {
      const { error } = await supabase
        .from('rental_confirmations')
        .update({
          tenant_confirmed: true,
          tenant_confirmed_at: new Date().toISOString(),
        })
        .eq('id', confirmationId);

      if (error) throw error;
      alert('Tenant confirmed (admin override)');
      fetchConfirmations();
    } catch (error) {
      console.error('Error marking tenant confirmed:', error);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="admin-rental-confirmations">
      <h1>Rental Confirmations</h1>
      <p>Rentals pending landlord or tenant confirmation.</p>

      {confirmations.length === 0 ? (
        <div className="empty-state">No pending rental confirmations.</div>
      ) : (
        <table className="confirmations-table">
          <thead>
            <tr>
              <th>Property</th>
              <th>Tenant</th>
              <th>Landlord Confirmed</th>
              <th>Tenant Confirmed</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {confirmations.map(conf => (
              <tr key={conf.id}>
                <td>
                  <strong>{conf.listings?.title}</strong><br />
                  <small>{conf.listings?.address}</small>
                </td>
                <td>{conf.profiles?.full_name || conf.tenant_id?.slice(0,8)}</td>
                <td>
                  {conf.landlord_confirmed ? '✅' : '❌'}
                  {conf.landlord_confirmed_at && <br/><small>{new Date(conf.landlord_confirmed_at).toLocaleDateString()}</small>}
                </td>
                <td>
                  {conf.tenant_confirmed ? '✅' : '❌'}
                  {conf.tenant_confirmed_at && <br/><small>{new Date(conf.tenant_confirmed_at).toLocaleDateString()}</small>}
                </td>
                <td>
                  {!conf.landlord_confirmed && (
                    <button className="btn-confirm" onClick={() => markLandlordConfirmed(conf.id)}>
                      Landlord Confirmed
                    </button>
                  )}
                  {!conf.tenant_confirmed && (
                    <button className="btn-confirm" onClick={() => markTenantConfirmed(conf.id)}>
                      Force Tenant Confirm
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminRentalConfirmations;