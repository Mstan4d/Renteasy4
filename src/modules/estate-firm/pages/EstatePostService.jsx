import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import { supabase } from '../../../shared/lib/supabaseClient';
import ServicePostForm from '../components/ServicePostForm';


const EstatePostService = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [firmDetails, setFirmDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchFirmProfile();
  }, [user]);

  const fetchFirmProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('estate_firm_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      if (!data) {
        alert('Please complete your estate firm profile first.');
        navigate('/dashboard/estate-firm/settings');
        return;
      }

      setFirmDetails({
        id: data.id,
        name: data.firm_name || 'Estate Firm',
        contact: {
          email: data.contact_email || user.email,
          phone: data.contact_phone || '',
          website: data.website || ''
        },
        verified: data.verification_status === 'verified',
        rating: data.rating || 0,
        logo: data.logo_url || null
      });
    } catch (error) {
      console.error('Error fetching firm profile:', error);
      alert('Failed to load firm details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = (serviceData) => {
    navigate('/services'); // or to the service detail page
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!firmDetails) {
    return <div>Could not load firm details.</div>;
  }

  return (
    <div className="estate-post-service">
      <ServicePostForm
        firmDetails={firmDetails}
        onSuccess={handleSuccess}
      />
    </div>
  );
};

export default EstatePostService;