// src/modules/auth/pages/AcceptInvite.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../../shared/lib/supabaseClient';
import { useAuth } from '../../../shared/context/AuthContext';

const AcceptInvite = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [invite, setInvite] = useState(null);
  const [error, setError] = useState(null);
  const [showSignup, setShowSignup] = useState(false);
  const [signupData, setSignupData] = useState({
    email: '',
    password: '',
    full_name: ''
  });

  useEffect(() => {
    verifyInvite();
  }, [token]);

  const verifyInvite = async () => {
    try {
      const { data, error } = await supabase
        .from('staff_invites')
        .select('*')
        .eq('id', token)
        .eq('status', 'pending')
        .single();

      if (error || !data) {
        setError('Invalid or expired invitation');
        setLoading(false);
        return;
      }

      if (new Date(data.expires_at) < new Date()) {
        setError('This invitation has expired');
        setLoading(false);
        return;
      }

      setInvite(data);
      setSignupData(prev => ({ ...prev, email: data.email }));

      if (user) {
        await linkStaffAccount(data);
      } else {
        setLoading(false);
      }

    } catch (err) {
      setError('Invalid invitation link');
      setLoading(false);
    }
  };

  const linkStaffAccount = async (inviteData) => {
    setLoading(true);
    try {
      const { data: existingProfile } = await supabase
        .from('estate_firm_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (existingProfile) {
        await supabase
          .from('estate_firm_profiles')
          .update({
            parent_estate_firm_id: inviteData.estate_firm_id,
            staff_role: inviteData.role,
            is_staff_account: true
          })
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('estate_firm_profiles')
          .insert({
            user_id: user.id,
            parent_estate_firm_id: inviteData.estate_firm_id,
            staff_role: inviteData.role,
            is_staff_account: true,
            firm_name: 'Team Member',
            is_active: true
          });
      }

      await supabase
        .from('staff_invites')
        .update({ status: 'accepted' })
        .eq('id', inviteData.id);

      alert('Success! You have been added to the team.');
      navigate('/dashboard/estate-firm');

    } catch (err) {
      console.error('Error:', err);
      setError('Failed to link your account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
          data: {
            full_name: signupData.full_name,
            role: 'estate-firm'
          }
        }
      });
      
      if (error) throw error;
      
      setTimeout(async () => {
        await linkStaffAccount(invite);
      }, 2000);
      
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Loading...</div>;
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <h2>Invalid Invitation</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/')}>Go Home</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '500px', margin: '50px auto', padding: '30px', textAlign: 'center', border: '1px solid #ddd', borderRadius: '10px' }}>
      <h2>You've been invited!</h2>
      <p>Join as a <strong>{invite?.role}</strong></p>
      
      {!user ? (
        <div>
          {!showSignup ? (
            <div>
              <p>Already have an account?</p>
              <button onClick={() => navigate(`/login?redirect=/accept-invite/${token}`)} style={{ margin: '10px', padding: '10px 20px', cursor: 'pointer' }}>
                Log In
              </button>
              <button onClick={() => setShowSignup(true)} style={{ margin: '10px', padding: '10px 20px', cursor: 'pointer' }}>
                Create New Account
              </button>
            </div>
          ) : (
            <form onSubmit={handleSignup}>
              <input
                type="text"
                placeholder="Full Name"
                value={signupData.full_name}
                onChange={(e) => setSignupData({...signupData, full_name: e.target.value})}
                required
                style={{ width: '100%', padding: '10px', margin: '10px 0' }}
              />
              <input
                type="email"
                placeholder="Email"
                value={signupData.email}
                disabled
                style={{ width: '100%', padding: '10px', margin: '10px 0' }}
              />
              <input
                type="password"
                placeholder="Password"
                value={signupData.password}
                onChange={(e) => setSignupData({...signupData, password: e.target.value})}
                required
                style={{ width: '100%', padding: '10px', margin: '10px 0' }}
              />
              <button type="submit" disabled={loading} style={{ padding: '10px 20px', cursor: 'pointer' }}>
                {loading ? 'Creating Account...' : 'Create Account & Accept Invite'}
              </button>
            </form>
          )}
        </div>
      ) : (
        <div>
          <p>Accept invitation as {user.email}?</p>
          <button onClick={() => linkStaffAccount(invite)} style={{ padding: '10px 20px', cursor: 'pointer' }}>Accept Invitation</button>
        </div>
      )}
    </div>
  );
};

export default AcceptInvite;