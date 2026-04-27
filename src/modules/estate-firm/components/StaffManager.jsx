// src/modules/estate-firm/components/StaffManager.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../shared/context/AuthContext';
import { supabase } from '../../../shared/lib/supabaseClient';
import { Crown, Star, Handshake, UserPlus, Mail, Trash2, X, Users, Loader } from 'lucide-react';
import RentEasyLoader from '../../../shared/components/RentEasyLoader';
import './StaffManager.css';

const StaffManager = () => {
  const { user } = useAuth();
  const [staff, setStaff] = useState([]);
  const [pendingInvites, setPendingInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('associate');
  const [sending, setSending] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [estateFirmId, setEstateFirmId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Loading user data...', user.id);
      
      // Get current user's estate firm profile
      const { data: profile, error: profileError } = await supabase
        .from('estate_firm_profiles')
        .select('id, staff_role, parent_estate_firm_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Profile error:', profileError);
        setError('Could not load your profile');
        setLoading(false);
        return;
      }

      if (!profile) {
        setError('No estate firm profile found');
        setLoading(false);
        return;
      }

      // Determine the main firm ID
      const mainFirmId = profile.parent_estate_firm_id || profile.id;
      setEstateFirmId(mainFirmId);
      setUserRole(profile.staff_role || 'principal');

      // Load staff data
      await loadStaffData(mainFirmId);
      await loadPendingInvites(mainFirmId);

    } catch (err) {
      console.error('Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadStaffData = async (firmId) => {
    try {
      console.log('Loading staff for firm:', firmId);
      
      // Get all staff members (those with parent_estate_firm_id set to this firm)
      const { data: staffProfiles, error: staffError } = await supabase
        .from('estate_firm_profiles')
        .select(`
          id,
          user_id,
          staff_role,
          parent_estate_firm_id,
          profiles!inner (
            id,
            email,
            full_name
          )
        `)
        .eq('parent_estate_firm_id', firmId);

      if (staffError) {
        console.error('Staff error:', staffError);
        return;
      }

      const formattedStaff = (staffProfiles || []).map(profile => ({
        id: profile.user_id,
        email: profile.profiles?.email,
        full_name: profile.profiles?.full_name,
        staff_role: profile.staff_role
      }));

      setStaff(formattedStaff);
      console.log('Staff loaded:', formattedStaff.length);

    } catch (err) {
      console.error('Error loading staff:', err);
    }
  };

  const loadPendingInvites = async (firmId) => {
    try {
      const { data: invites, error: invitesError } = await supabase
        .from('staff_invites')
        .select('*')
        .eq('estate_firm_id', firmId)
        .eq('status', 'pending');

      if (invitesError) {
        console.error('Invites error:', invitesError);
        return;
      }

      setPendingInvites(invites || []);
      console.log('Invites loaded:', invites?.length);

    } catch (err) {
      console.error('Error loading invites:', err);
    }
  };

 // In StaffManager.jsx – replace the sendInvite function with this:

const sendInvite = async () => {
  if (!inviteEmail) {
    alert('Please enter an email address');
    return;
  }

  setSending(true);
  try {
    // Insert into staff_invites table
    const { data: invite, error } = await supabase
      .from('staff_invites')
      .insert({
        estate_firm_id: estateFirmId,
        email: inviteEmail,
        role: inviteRole,
        invited_by: user.id,
        status: 'pending',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    // Production link – replace with your actual domain
    const inviteLink = `${window.location.origin}/accept-invite/${invite.id}`;
    
    // Copy to clipboard
    await navigator.clipboard.writeText(inviteLink);
    
    alert(`✅ Invitation created for ${inviteEmail}!\n\nLink copied to clipboard.\n\nShare this link with them:\n${inviteLink}`);
    
    // Reset form and refresh pending invites
    setInviteEmail('');
    setShowInviteModal(false);
    await loadPendingInvites(estateFirmId);

  } catch (err) {
    console.error('Error creating invitation:', err);
    alert('Failed to create invitation. Please try again.');
  } finally {
    setSending(false);
  }
};
{/*
    !!!use this send innite before deployment
const sendInvite = async () => {
  if (!inviteEmail) {
    alert('Please enter an email address');
    return;
  }

  setSending(true);
  try {
    const { data: invite, error } = await supabase
      .from('staff_invites')
      .insert({
        estate_firm_id: estateFirmId,
        email: inviteEmail,
        role: inviteRole,
        invited_by: user.id,
        status: 'pending',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    // USE YOUR VERCELL URL HERE
    const inviteLink = `https://renteasy-frontend-xi.vercel.app/accept-invite/${invite.id}`;
    
    await navigator.clipboard.writeText(inviteLink);
    
    alert(`✅ Invitation created for ${inviteEmail}!\n\nLink copied to clipboard.\n\nShare this link with them:\n${inviteLink}`);
    
    setInviteEmail('');
    setShowInviteModal(false);
    await loadPendingInvites(estateFirmId);

  } catch (err) {
    console.error('Error:', err);
    alert('Failed to create invitation');
  } finally {
    setSending(false);
  }
};

*/}
  const cancelInvite = async (inviteId) => {
    if (!window.confirm('Cancel this invitation?')) return;
    
    try {
      const { error } = await supabase
        .from('staff_invites')
        .update({ status: 'cancelled' })
        .eq('id', inviteId);
      
      if (error) throw error;
      
      await loadPendingInvites(estateFirmId);
      alert('Invitation cancelled');
      
    } catch (err) {
      console.error('Error cancelling invite:', err);
      alert('Failed to cancel invitation');
    }
  };

  const removeStaff = async (staffId, staffName) => {
    if (!window.confirm(`Remove ${staffName} from your team?`)) return;
    
    try {
      const { error } = await supabase
        .from('estate_firm_profiles')
        .update({ parent_estate_firm_id: null, staff_role: null })
        .eq('user_id', staffId);
      
      if (error) throw error;
      
      await loadStaffData(estateFirmId);
      alert(`${staffName} has been removed`);
      
    } catch (err) {
      console.error('Error removing staff:', err);
      alert('Failed to remove staff');
    }
  };

  const getRoleIcon = (role) => {
    switch(role) {
      case 'principal': return <Crown size={16} />;
      case 'executive': return <Star size={16} />;
      default: return <Handshake size={16} />;
    }
  };

  const getRoleColor = (role) => {
    switch(role) {
      case 'principal': return '#8b5cf6';
      case 'executive': return '#3b82f6';
      default: return '#10b981';
    }
  };

  
   if (loading) {
  return <RentEasyLoader message="Loading Team Management..." fullScreen />;
}

  if (error) {
    return (
      <div className="staff-manager-error">
        <h3>Error</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  // Only Principal can manage staff
  if (userRole !== 'principal') {
    return (
      <div className="staff-manager-restricted">
        <Crown size={48} />
        <h3>Restricted Access</h3>
        <p>Only the Firm Principal can manage team members.</p>
        <button onClick={() => window.history.back()}>Go Back</button>
      </div>
    );
  }

  return (
    <div className="staff-manager">
      {/* Header */}
      <div className="staff-header">
        <div>
          <h2><Users size={24} /> Team Management</h2>
          <p>Manage your firm's team members and their roles</p>
        </div>
        <button className="btn-primary" onClick={() => setShowInviteModal(true)}>
          <UserPlus size={18} /> Invite Team Member
        </button>
      </div>

      {/* Role Legend */}
      <div className="role-legend">
        <div className="legend-item">
          <Crown size={16} style={{ color: '#8b5cf6' }} />
          <span><strong>Principal</strong> - Full control (Owner/MD)</span>
        </div>
        <div className="legend-item">
          <Star size={16} style={{ color: '#3b82f6' }} />
          <span><strong>Executive</strong> - Full operational control</span>
        </div>
        <div className="legend-item">
          <Handshake size={16} style={{ color: '#10b981' }} />
          <span><strong>Associate</strong> - Manage only their own work</span>
        </div>
      </div>

      {/* Team Members */}
      <div className="staff-section">
        <h3>Team Members ({staff.length})</h3>
        {staff.length === 0 ? (
          <div className="empty-state">
            <Handshake size={48} />
            <p>No team members yet. Invite your first team member to get started.</p>
          </div>
        ) : (
          <div className="staff-cards">
            {staff.map(member => (
              <div key={member.id} className="staff-card">
                <div className="staff-avatar">
                  {member.full_name?.charAt(0) || member.email?.charAt(0) || 'S'}
                </div>
                <div className="staff-info">
                  <div className="staff-name">{member.full_name || 'No name set'}</div>
                  <div className="staff-email">{member.email}</div>
                  <div className="staff-role" style={{ color: getRoleColor(member.staff_role) }}>
                    {getRoleIcon(member.staff_role)} {member.staff_role?.charAt(0).toUpperCase() + member.staff_role?.slice(1)}
                  </div>
                </div>
                <button 
                  className="btn-icon danger"
                  onClick={() => removeStaff(member.id, member.full_name || member.email)}
                  title="Remove"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pending Invites */}
      {pendingInvites.length > 0 && (
        <div className="pending-section">
          <h3>Pending Invitations ({pendingInvites.length})</h3>
          <div className="invites-list">
            {pendingInvites.map(invite => (
              <div key={invite.id} className="invite-card">
                <Mail size={18} />
                <div className="invite-info">
                  <span className="invite-email">{invite.email}</span>
                  <span className="invite-role" style={{ color: getRoleColor(invite.role) }}>
                    {getRoleIcon(invite.role)} {invite.role}
                  </span>
                  <span className="invite-expiry">
                    Expires: {new Date(invite.expires_at).toLocaleDateString()}
                  </span>
                </div>
                <button onClick={() => cancelInvite(invite.id)} className="btn-icon" title="Cancel Invitation">
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="modal-overlay" onClick={() => setShowInviteModal(false)}>
          <div className="invite-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Invite Team Member</h3>
              <button className="close-btn" onClick={() => setShowInviteModal(false)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  placeholder="staff@company.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Select Role</label>
                <div className="role-options">
                  <label className={`role-option ${inviteRole === 'executive' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      value="executive"
                      checked={inviteRole === 'executive'}
                      onChange={(e) => setInviteRole(e.target.value)}
                    />
                    <div className="role-content">
                      <Star size={24} style={{ color: '#3b82f6' }} />
                      <strong>Executive</strong>
                      <small>Full operational control - can manage all properties and listings</small>
                    </div>
                  </label>

                  <label className={`role-option ${inviteRole === 'associate' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      value="associate"
                      checked={inviteRole === 'associate'}
                      onChange={(e) => setInviteRole(e.target.value)}
                    />
                    <div className="role-content">
                      <Handshake size={24} style={{ color: '#10b981' }} />
                      <strong>Associate</strong>
                      <small>Manage only their own properties and listings</small>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowInviteModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={sendInvite} disabled={sending}>
                {sending ? 'Sending...' : 'Send Invitation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManager;