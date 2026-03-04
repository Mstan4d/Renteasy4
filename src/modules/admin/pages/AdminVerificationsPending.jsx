// src/modules/admin/pages/AdminVerificationsPending.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import { supabase } from '../../../shared/lib/supabaseClient';
import './AdminVerificationsPending.css';

const AdminVerificationsPending = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedListing, setSelectedListing] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    if (user?.role !== 'admin' && user?.role !== 'super-admin') {
      navigate('/login');
      return;
    }
    fetchPendingListings();
  }, [user]);

  const fetchPendingListings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('listings')
      .select(`
        *,
        assigned_manager:assigned_manager_id (full_name, email),
        profiles!listings_user_id_fkey (full_name, email, phone)
      `)
      .eq('verification_status', 'pending_admin')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching listings:', error);
    } else {
      setListings(data || []);
    }
    setLoading(false);
  };

  const handleConfirm = async () => {
    if (!selectedListing) return;

    try {
      const { error } = await supabase
        .from('listings')
        .update({
          verification_status: 'verified',
          verified: true,
          admin_confirmed_at: new Date().toISOString(),
          admin_confirmed_by: user.id,
          admin_notes: adminNotes,
        })
        .eq('id', selectedListing.id);

      if (error) throw error;

      // Add system message in chat
      const { data: chat } = await supabase
        .from('chats')
        .select('id')
        .eq('listing_id', selectedListing.id)
        .maybeSingle();

      if (chat) {
        await supabase.from('messages').insert([{
          chat_id: chat.id,
          sender_id: '00000000-0000-0000-0000-000000000000',
          sender_role: 'system',
          content: `✅ Admin confirmed landlord – property verified.`,
          is_system: true,
        }]);
      }

      alert('Listing verified successfully');
      setShowModal(false);
      setSelectedListing(null);
      setAdminNotes('');
      fetchPendingListings();
    } catch (error) {
      console.error('Error confirming verification:', error);
      alert('Failed to confirm');
    }
  };

  const handleReject = async () => {
    if (!selectedListing) return;

    const reason = window.prompt('Reason for rejection (optional)');
    try {
      const { error } = await supabase
        .from('listings')
        .update({
          verification_status: 'rejected',
          rejected: true,
          rejection_reason: reason || 'Admin rejected verification',
          admin_confirmed_at: new Date().toISOString(),
          admin_confirmed_by: user.id,
        })
        .eq('id', selectedListing.id);

      if (error) throw error;

      alert('Listing rejected');
      setShowModal(false);
      setSelectedListing(null);
      fetchPendingListings();
    } catch (error) {
      console.error('Error rejecting verification:', error);
    }
  };

  const openDetails = (listing) => {
    setSelectedListing(listing);
    setShowModal(true);
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="admin-verifications-pending">
      <h1>Pending Admin Verifications</h1>
      <p>Listings that have been verified by managers and need your landlord confirmation.</p>

      {listings.length === 0 ? (
        <div className="empty-state">No pending verifications.</div>
      ) : (
        <table className="listings-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Address</th>
              <th>Price</th>
              <th>Posted by</th>
              <th>Manager</th>
              <th>Landlord Phone</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {listings.map(listing => (
              <tr key={listing.id}>
                <td>{listing.title}</td>
                <td>{listing.address}</td>
                <td>₦{listing.price?.toLocaleString()}</td>
                <td>{listing.poster_role}</td>
                <td>{listing.assigned_manager?.full_name || 'Unknown'}</td>
                <td>{listing.landlord_phone || 'Not provided'}</td>
                <td>
                  <button className="btn-view" onClick={() => openDetails(listing)}>
                    Review
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showModal && selectedListing && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Verify Listing</h2>
            <div className="modal-body">
              <p><strong>Title:</strong> {selectedListing.title}</p>
              <p><strong>Address:</strong> {selectedListing.address}</p>
              <p><strong>Price:</strong> ₦{selectedListing.price?.toLocaleString()}</p>
              <p><strong>Landlord Phone:</strong> {selectedListing.landlord_phone || 'Not provided'}</p>
              <p><strong>Manager Notes:</strong> {selectedListing.verification_notes || 'None'}</p>
              {selectedListing.verification_images && selectedListing.verification_images.length > 0 && (
                <div>
                  <strong>Photos:</strong>
                  <div className="photo-grid">
                    {selectedListing.verification_images.map((url, i) => (
                      <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                        <img src={url} alt={`verification ${i+1}`} style={{ width: 100, height: 100, objectFit: 'cover' }} />
                      </a>
                    ))}
                  </div>
                </div>
              )}
              <div className="form-group">
                <label>Admin Notes (optional)</label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows="3"
                />
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn-confirm" onClick={handleConfirm}>Confirm Verified</button>
              <button className="btn-reject" onClick={handleReject}>Reject</button>
              <button className="btn-cancel" onClick={() => setShowModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVerificationsPending;