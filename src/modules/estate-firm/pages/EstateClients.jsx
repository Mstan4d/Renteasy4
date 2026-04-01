// src/modules/estate-firm/pages/EstateClients.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../shared/context/AuthContext';
import { supabase } from '../../../shared/lib/supabaseClient';
import ClientManager from '../components/ClientManager';
import RentEasyLoader from '../../../shared/components/RentEasyLoader';
import { Shield } from 'lucide-react';
import './EstateClients.css';

const EstateClients = () => {
  const { user } = useAuth();
  const [estateFirmData, setEstateFirmData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('principal');
  const [canEdit, setCanEdit] = useState(true);

  useEffect(() => {
    fetchUserRole();
    fetchEstateFirm();
  }, [user]);

  const fetchUserRole = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('estate_firm_profiles')
        .select('staff_role')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (!error && data) {
        const role = data.staff_role || 'principal';
        setUserRole(role);
        // Only Principal can edit clients
        setCanEdit(role === 'principal');
      }
    } catch (err) {
      console.warn('Could not fetch user role:', err);
      setCanEdit(true);
    }
  };

  const fetchEstateFirm = async () => {
    if (!user) return;
    try {
      // Get effective firm ID (parent for staff)
      let effectiveFirmId = null;
      
      const { data: roleData } = await supabase
        .from('estate_firm_profiles')
        .select('id, parent_estate_firm_id, staff_role')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (roleData) {
        // If staff, use parent firm ID
        if (roleData.staff_role === 'associate' || roleData.staff_role === 'executive') {
          effectiveFirmId = roleData.parent_estate_firm_id || roleData.id;
        } else {
          effectiveFirmId = roleData.id;
        }
      }
      
      const { data, error } = await supabase
        .from('estate_firm_profiles')
        .select('id, firm_name')
        .eq('id', effectiveFirmId)
        .single();
        
      if (error) throw error;
      setEstateFirmData({ ...data, userRole, canEdit });
    } catch (error) {
      console.error('Error fetching estate firm:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <RentEasyLoader message="Loading your clients..." fullScreen />;
  }

  return (
    <div className="estate-clients">
      {/* Role Banner */}
      {userRole === 'associate' && (
        <div className="role-banner">
          <Shield size={16} />
          <span>Associate View - You can only see clients (tenants) from properties you manage</span>
        </div>
      )}
      
      {userRole === 'executive' && (
        <div className="role-banner executive">
          <Shield size={16} />
          <span>Executive View - You can view all clients but cannot edit</span>
        </div>
      )}
      
      <ClientManager estateFirmData={estateFirmData} userRole={userRole} canEdit={canEdit} />
    </div>
  );
};

export default EstateClients;