import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../../shared/lib/supabaseClient';
import RentEasyLoader from '../../../shared/components/RentEasyLoader';
import { ArrowLeft, Mail, Phone, Building, Home, Banknote, Edit, Trash2 } from 'lucide-react';
import './EstateLandlordDetail.css';

const EstateLandlordDetail = () => {
  const { landlordId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [landlord, setLandlord] = useState(null);
  const [properties, setProperties] = useState([]);
  const [units, setUnits] = useState([]);

  useEffect(() => {
    if (landlordId) loadLandlordData();
  }, [landlordId]);

  const loadLandlordData = async () => {
    setLoading(true);
    try {
      // Fetch landlord
      const { data: landlordData, error: lErr } = await supabase
        .from('estate_landlords')
        .select('*')
        .eq('id', landlordId)
        .single();
      if (lErr) throw lErr;
      setLandlord(landlordData);

      // Fetch properties owned by this landlord
      const { data: props, error: pErr } = await supabase
        .from('properties')
        .select('*')
        .eq('landlord_id', landlordId);
      if (pErr) throw pErr;
      setProperties(props || []);

      // Fetch units for those properties
      if (props?.length) {
        const propertyIds = props.map(p => p.id);
        const { data: unitsData, error: uErr } = await supabase
          .from('units')
          .select('*')
          .in('property_id', propertyIds);
        if (uErr) throw uErr;
        setUnits(unitsData || []);
      } else {
        setUnits([]);
      }
    } catch (err) {
      console.error('Error loading landlord details:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <RentEasyLoader message="Loading landlord details..." fullScreen />;
  if (!landlord) return <div className="error-state">Landlord not found</div>;

  return (
    <div className="estate-landlord-detail">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} /> Back to Landlords
        </button>
        <h1>{landlord.name}</h1>
      </div>

      <div className="landlord-info-section">
        <div className="info-card">
          <h3>Contact Details</h3>
          <div className="info-row"><Mail size={16} /> <span>{landlord.email || 'Not provided'}</span></div>
          <div className="info-row"><Phone size={16} /> <span>{landlord.phone || 'Not provided'}</span></div>
        </div>

        <div className="info-card">
          <h3>Bank Details</h3>
          <div className="info-row"><Banknote size={16} /> Bank: {landlord.bank_details?.bank_name || 'Not provided'}</div>
          <div className="info-row"><Banknote size={16} /> Account: {landlord.bank_details?.account_number || 'Not provided'}</div>
          <div className="info-row"><Banknote size={16} /> Name: {landlord.bank_details?.account_name || 'Not provided'}</div>
        </div>

        <div className="info-card">
          <h3>Notes</h3>
          <p>{landlord.notes || 'No notes'}</p>
        </div>
      </div>

      <div className="properties-section">
        <h2>Properties ({properties.length})</h2>
        <div className="properties-grid">
          {properties.map(property => (
            <div key={property.id} className="property-card">
              <h3>{property.name}</h3>
              <div className="property-stats">
                <span>Units: {units.filter(u => u.property_id === property.id).length}</span>
                <button onClick={() => navigate(`/dashboard/estate-firm/properties/${property.id}`)}>
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EstateLandlordDetail;