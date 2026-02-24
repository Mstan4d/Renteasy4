import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProviderPageTemplate from '../templates/ProviderPageTemplate';
import { 
  FaArrowLeft, FaPhone, FaEnvelope, FaMapMarkerAlt, 
  FaCalendar, FaClock, FaMoneyBill, FaFileContract,
  FaSpinner 
} from 'react-icons/fa';
import { useAuth } from '../../../shared/context/AuthContext';
import { supabase } from '../../../shared/lib/supabaseClient';

const ProviderBookingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!user || !id) return;
    fetchBooking();
  }, [user, id]);

  const fetchBooking = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch booking from service_requests, join with client profile
      const { data, error } = await supabase
        .from('service_requests')
        .select(`
          *,
          client:client_id (
            id,
            full_name,
            email,
            phone
          )
        `)
        .eq('id', id)
        .eq('provider_id', user.id)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Booking not found');

      // Transform to match component's expected format
      const formattedBooking = {
        id: data.id,
        client: data.client?.full_name || 'Unknown',
        clientPhone: data.client?.phone || 'N/A',
        clientEmail: data.client?.email || 'N/A',
        service: data.service_type || 'Service',
        date: data.scheduled_date ? new Date(data.scheduled_date).toLocaleDateString('en-US') : 'TBD',
        time: data.time || 'TBD',
        duration: data.duration || 'N/A',
        address: data.address || 'Address not provided',
        amount: data.amount ? `₦${data.amount.toLocaleString()}` : 'N/A',
        status: data.status || 'pending',
        payment: data.payment_status || 'pending',
        specialRequests: data.special_requests || 'None',
        notes: data.notes || '',
        teamAssigned: data.team_members || [], // assume array of names or IDs
        documents: data.documents || [] // array of file names/urls
      };

      setBooking(formattedBooking);
    } catch (err) {
      console.error('Error fetching booking:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (newStatus) => {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('service_requests')
        .update({ status: newStatus })
        .eq('id', id)
        .eq('provider_id', user.id);

      if (error) throw error;
      // Refresh data
      await fetchBooking();
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update status: ' + err.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <ProviderPageTemplate
        title="Loading Booking..."
        subtitle="Please wait while we fetch booking details"
      >
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <FaSpinner className="spinner" style={{ fontSize: '2rem', animation: 'spin 1s linear infinite' }} />
        </div>
      </ProviderPageTemplate>
    );
  }

  if (error || !booking) {
    return (
      <ProviderPageTemplate
        title="Booking Not Found"
        subtitle="The requested booking could not be found"
        actions={
          <button 
            className="btn-secondary"
            onClick={() => navigate('/dashboard/provider/bookings')}
          >
            <FaArrowLeft style={{ marginRight: '0.5rem' }} />
            Back to Bookings
          </button>
        }
      >
        <div className="empty-state">
          <div className="empty-state-icon">❌</div>
          <h3>Booking #{id} not found</h3>
          <p>{error || 'This booking may have been cancelled or does not exist.'}</p>
          <button 
            className="btn-primary"
            onClick={() => navigate('/dashboard/provider/bookings')}
          >
            View All Bookings
          </button>
        </div>
      </ProviderPageTemplate>
    );
  }

  return (
    <ProviderPageTemplate
      title={`Booking #${booking.id}`}
      subtitle={booking.service}
      actions={
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            className="btn-secondary"
            onClick={() => navigate('/dashboard/provider/bookings')}
          >
            <FaArrowLeft style={{ marginRight: '0.5rem' }} />
            Back to Bookings
          </button>
          <button className="btn-primary" disabled={updating}>
            {updating ? 'Updating...' : 'Update Status'}
          </button>
        </div>
      }
    >
      <div className="provider-grid" style={{ marginBottom: '2rem' }}>
        {/* Client Card */}
        <div className="provider-card">
          <div className="card-header">
            <h3 className="card-title">Client Information</h3>
          </div>
          <div style={{ padding: '1rem' }}>
            <h4 style={{ margin: '0 0 1rem 0' }}>{booking.client}</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FaPhone style={{ color: '#666' }} />
                <span>{booking.clientPhone}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FaEnvelope style={{ color: '#666' }} />
                <span>{booking.clientEmail}</span>
              </div>
              <button className="btn-secondary" style={{ marginTop: '1rem' }}>
                Message Client
              </button>
            </div>
          </div>
        </div>

        {/* Service Details Card */}
        <div className="provider-card">
          <div className="card-header">
            <h3 className="card-title">Service Details</h3>
          </div>
          <div style={{ padding: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FaCalendar style={{ color: '#666' }} />
                <span><strong>Date:</strong> {booking.date}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FaClock style={{ color: '#666' }} />
                <span><strong>Time:</strong> {booking.time}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FaClock style={{ color: '#666' }} />
                <span><strong>Duration:</strong> {booking.duration}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FaMoneyBill style={{ color: '#666' }} />
                <span><strong>Amount:</strong> {booking.amount}</span>
              </div>
              <div style={{ 
                padding: '0.5rem', 
                background: '#e8f5e9', 
                borderRadius: '4px',
                borderLeft: '4px solid #4caf50'
              }}>
                <strong>Status:</strong> {booking.status}
              </div>
            </div>
          </div>
        </div>

        {/* Location Card */}
        <div className="provider-card">
          <div className="card-header">
            <h3 className="card-title">Location</h3>
          </div>
          <div style={{ padding: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '1rem' }}>
              <FaMapMarkerAlt style={{ color: '#666', marginTop: '0.25rem' }} />
              <span>{booking.address}</span>
            </div>
            <button className="btn-secondary">
              Get Directions
            </button>
          </div>
        </div>
      </div>

      {/* Special Requests & Notes */}
      <div className="provider-card" style={{ marginBottom: '2rem' }}>
        <div className="card-header">
          <h3 className="card-title">Special Requests & Notes</h3>
        </div>
        <div style={{ padding: '1rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <h4 style={{ margin: '0 0 0.5rem 0' }}>Client Requests:</h4>
            <p style={{ 
              padding: '1rem', 
              background: '#f5f5f5', 
              borderRadius: '4px',
              margin: 0
            }}>
              {booking.specialRequests}
            </p>
          </div>
          {booking.notes && (
            <div>
              <h4 style={{ margin: '0 0 0.5rem 0' }}>Additional Notes:</h4>
              <p style={{ 
                padding: '1rem', 
                background: '#fff3e0', 
                borderRadius: '4px',
                margin: 0
              }}>
                {booking.notes}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Team & Documents */}
      <div className="provider-grid">
        {/* Team Assigned */}
        <div className="provider-card">
          <div className="card-header">
            <h3 className="card-title">Team Assigned</h3>
          </div>
          <div style={{ padding: '1rem' }}>
            {booking.teamAssigned && booking.teamAssigned.length > 0 ? (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {booking.teamAssigned.map((member, index) => (
                  <li key={index} style={{ 
                    padding: '0.5rem', 
                    borderBottom: '1px solid #eee',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span>{member}</span>
                    <button className="btn-secondary" style={{ padding: '0.25rem 0.5rem' }}>
                      Message
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No team assigned yet.</p>
            )}
            <button className="btn-secondary" style={{ marginTop: '1rem' }}>
              Assign Team Members
            </button>
          </div>
        </div>

        {/* Documents */}
        <div className="provider-card">
          <div className="card-header">
            <h3 className="card-title">Documents</h3>
          </div>
          <div style={{ padding: '1rem' }}>
            {booking.documents && booking.documents.length > 0 ? (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {booking.documents.map((doc, index) => (
                  <li key={index} style={{ 
                    padding: '0.5rem', 
                    borderBottom: '1px solid #eee',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <FaFileContract style={{ color: '#666' }} />
                      <span>{doc}</span>
                    </div>
                    <button className="btn-secondary" style={{ padding: '0.25rem 0.5rem' }}>
                      Download
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No documents uploaded.</p>
            )}
            <button className="btn-secondary" style={{ marginTop: '1rem' }}>
              Upload Document
            </button>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        padding: '1.5rem',
        borderTop: '1px solid #eee',
        marginTop: '2rem'
      }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn-secondary" onClick={() => window.print()}>
            Print Details
          </button>
          <button className="btn-secondary">
            Download Invoice
          </button>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {booking.status === 'pending' && (
            <>
              <button 
                className="btn-success" 
                onClick={() => updateBookingStatus('confirmed')}
                disabled={updating}
              >
                Accept Booking
              </button>
              <button 
                className="btn-danger"
                onClick={() => updateBookingStatus('cancelled')}
                disabled={updating}
              >
                Decline Booking
              </button>
            </>
          )}
          {booking.status === 'upcoming' && (
            <button 
              className="btn-primary"
              onClick={() => updateBookingStatus('in-progress')}
              disabled={updating}
            >
              Start Service
            </button>
          )}
          {booking.status === 'in-progress' && (
            <button 
              className="btn-success"
              onClick={() => updateBookingStatus('completed')}
              disabled={updating}
            >
              Mark as Complete
            </button>
          )}
          <button className="btn-secondary" disabled={updating}>
            Edit Booking
          </button>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </ProviderPageTemplate>
  );
};

export default ProviderBookingDetails;