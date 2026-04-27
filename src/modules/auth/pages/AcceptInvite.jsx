// src/modules/auth/pages/AcceptInvite.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import { supabase } from '../../../shared/lib/supabaseClient';
import RentEasyLoader from '../../../shared/components/RentEasyLoader';
import './AcceptInvite.css';

const AcceptInvite = () => {
  const { inviteId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [status, setStatus] = useState('loading'); // loading, error, success
  const [message, setMessage] = useState('');
  const [inviteData, setInviteData] = useState(null);

  useEffect(() => {
    if (!inviteId) {
      setStatus('error');
      setMessage('Invalid invitation link.');
      return;
    }
    checkInvite();
  }, [inviteId]);

  const checkInvite = async () => {
    try {
      // Fetch the invitation
      const { data: invite, error } = await supabase
        .from('staff_invites')
        .select('*')
        .eq('id', inviteId)
        .single();

      if (error || !invite) {
        setStatus('error');
        setMessage('Invitation not found or has been removed.');
        return;
      }

      if (invite.status !== 'pending') {
        setStatus('error');
        setMessage(`This invitation has already been ${invite.status}.`);
        return;
      }

      if (new Date(invite.expires_at) < new Date()) {
        setStatus('error');
        setMessage('This invitation has expired. Please ask the firm to send a new one.');
        return;
      }

      setInviteData(invite);

      // If user is already logged in, accept immediately
      if (user) {
        await acceptInvite(invite);
      } else {
        setStatus('needs_login');
        setMessage('Please log in or sign up to accept this invitation.');
      }
    } catch (err) {
      console.error(err);
      setStatus('error');
      setMessage('An error occurred. Please try again.');
    }
  };

  const acceptInvite = async (invite) => {
    try {
      // Check if the user already has an estate_firm_profiles row
      const { data: existing, error: checkError } = await supabase
        .from('estate_firm_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existing) {
        // Update existing row: set parent and role
        const { error: updateError } = await supabase
          .from('estate_firm_profiles')
          .update({
            parent_estate_firm_id: invite.estate_firm_id,
            staff_role: invite.role,
            is_staff_account: true
          })
          .eq('user_id', user.id);
        if (updateError) throw updateError;
      } else {
        // Create new row
        const { error: insertError } = await supabase
          .from('estate_firm_profiles')
          .insert({
            user_id: user.id,
            parent_estate_firm_id: invite.estate_firm_id,
            staff_role: invite.role,
            is_staff_account: true,
            verification_status: 'pending'
          });
        if (insertError) throw insertError;
      }

      // Mark invitation as accepted
      const { error: inviteError } = await supabase
        .from('staff_invites')
        .update({ status: 'accepted', accepted_at: new Date().toISOString() })
        .eq('id', invite.id);
      if (inviteError) throw inviteError;

      setStatus('success');
      setMessage(`You have been added as ${invite.role} to the estate firm. Redirecting...`);
      setTimeout(() => {
        navigate('/dashboard/estate-firm');
      }, 3000);
    } catch (err) {
      console.error(err);
      setStatus('error');
      setMessage('Failed to accept invitation. Please try again.');
    }
  };

  const handleLoginRedirect = () => {
    // Store the invite ID in sessionStorage to use after login
    sessionStorage.setItem('pendingInviteId', inviteId);
    navigate('/login', { state: { from: `/accept-invite/${inviteId}` } });
  };

  // After login, the AuthCallback or login page should check for pendingInviteId
  // and redirect back to this page. Simpler: Just use the `from` state.

  if (status === 'loading') {
    return <RentEasyLoader message="Verifying invitation..." fullScreen />;
  }

  if (status === 'needs_login') {
    return (
      <div className="accept-invite-container">
        <div className="accept-invite-card">
          <h2>Join the team</h2>
          <p>{message}</p>
          <div className="button-group">
            <button className="btn-primary" onClick={handleLoginRedirect}>Log in / Sign up</button>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="accept-invite-container">
        <div className="accept-invite-card error">
          <h2>Invitation Error</h2>
          <p>{message}</p>
          <button className="btn-secondary" onClick={() => navigate('/')}>Go Home</button>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="accept-invite-container">
        <div className="accept-invite-card success">
          <h2>Invitation Accepted!</h2>
          <p>{message}</p>
        </div>
      </div>
    );
  }

  return null;
};

export default AcceptInvite;