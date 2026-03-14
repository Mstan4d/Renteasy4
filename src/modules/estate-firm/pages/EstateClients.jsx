// src/modules/estate-firm/pages/EstateClients.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../shared/context/AuthContext';
import { supabase } from '../../../shared/lib/supabaseClient';
import ClientManager from '../components/ClientManager';
import './EstateClients.css';

const EstateClients = () => {
  const { user } = useAuth();
  const [estateFirmData, setEstateFirmData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEstateFirm();
  }, []);

  const fetchEstateFirm = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('estate_firm_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();
      if (error) throw error;
      setEstateFirmData(data);
    } catch (error) {
      console.error('Error fetching estate firm:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="estate-clients"><div className="loading">Loading...</div></div>;

  return (
    <div className="estate-clients">
      <ClientManager estateFirmData={estateFirmData} />
    </div>
  );
};

export default EstateClients;