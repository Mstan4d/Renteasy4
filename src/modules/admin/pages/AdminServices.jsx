// src/modules/admin/pages/AdminServices.jsx (final working version)
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../shared/context/AuthContext';
import { supabase } from '../../../shared/lib/supabaseClient';
import './AdminServices.css';

const AdminServices = () => {
  const { user } = useAuth();
  const [serviceProviders, setServiceProviders] = useState([]);
  const [estateFirms, setEstateFirms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('providers');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch service providers
      const { data: providers, error: providersError } = await supabase
        .from('service_providers')
        .select('*')
        .order('created_at', { ascending: false });

      if (providersError) {
        console.error('Error fetching providers:', providersError);
      } else {
        setServiceProviders(providers || []);
      }

      // Fetch estate firms from estate_firm_profiles
      const { data: firms, error: firmsError } = await supabase
        .from('estate_firm_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (firmsError) {
        console.error('Error fetching firms:', firmsError);
      } else {
        setEstateFirms(firms || []);
      }
    } catch (error) {
      console.error('Error in fetchData:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id, type) => {
    try {
      let table, updateData;

      if (type === 'provider') {
        table = 'service_providers';
        updateData = { 
          verification_status: 'verified',
          verified: true,
          verified_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      } else {
        table = 'estate_firm_profiles';
        updateData = { 
          verification_status: 'verified',
          verified_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      }

      const { error } = await supabase
        .from(table)
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      // Log admin activity
      await supabase.from('admin_activities').insert({
        admin_id: user?.id,
        action: `Verified ${type}: ${id}`,
        type: type,
        entity_id: id,
        created_at: new Date().toISOString()
      });

      await fetchData();
      alert(`${type === 'provider' ? 'Service provider' : 'Estate firm'} verified successfully!`);
    } catch (error) {
      console.error('Verification error:', error);
      alert(`Error verifying: ${error.message}`);
    }
  };

  const handleBoost = async (id, type, days = 7) => {
    try {
      const table = type === 'provider' ? 'service_providers' : 'estate_firm_profiles';
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + days);

      const { error } = await supabase
        .from(table)
        .update({ 
          boost_status: 'boosted',
          boost_expiry: expiry.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      await supabase.from('admin_activities').insert({
        admin_id: user?.id,
        action: `Boosted ${type}: ${id}`,
        type: type,
        entity_id: id,
        created_at: new Date().toISOString()
      });

      await fetchData();
    } catch (error) {
      console.error('Boost error:', error);
      alert(`Error boosting: ${error.message}`);
    }
  };

  const renderCoordinates = (coords) => {
    if (!coords) return 'N/A';
    try {
      const parsed = typeof coords === 'string' ? JSON.parse(coords) : coords;
      return `Lat: ${parsed.lat || parsed.x || 'N/A'}, Lng: ${parsed.lng || parsed.y || 'N/A'}`;
    } catch {
      return 'Invalid coordinates';
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading service data from Supabase...</p>
      </div>
    );
  }

  return (
    <div className="admin-services">
      <div className="page-header">
        <h1>Service Management</h1>
        <p>Manage service providers and estate firms in the marketplace</p>
      </div>

      <div className="tab-nav">
        <button
          className={`tab-btn ${activeTab === 'providers' ? 'active' : ''}`}
          onClick={() => setActiveTab('providers')}
        >
          Service Providers ({serviceProviders.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'firms' ? 'active' : ''}`}
          onClick={() => setActiveTab('firms')}
        >
          Estate Firms ({estateFirms.length})
        </button>
      </div>

      {activeTab === 'providers' && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Business Name</th>
                <th>Service Type</th>
                <th>Contact</th>
                <th>Location</th>
                <th>Verification</th>
                <th>Boost Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {serviceProviders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="empty-message">No service providers found.</td>
                </tr>
              ) : (
                serviceProviders.map(provider => (
                  <tr key={provider.id}>
                    <td>
                      <strong>{provider.business_name || 'Unnamed'}</strong>
                      <br />
                      <small>{provider.address || 'No address'}</small>
                    </td>
                    <td>
                      <span className="badge service-type">{provider.service_type || 'N/A'}</span>
                    </td>
                    <td>{provider.contact_phone || 'N/A'}</td>
                    <td>
                      {provider.address && (
                        <>
                          {provider.address}
                          {provider.coordinates && (
                            <>
                              <br />
                              <small>{renderCoordinates(provider.coordinates)}</small>
                            </>
                          )}
                        </>
                      )}
                      {!provider.address && 'No location'}
                    </td>
                    <td>
                      <span className={`status-badge ${provider.verification_status || 'unverified'}`}>
                        {provider.verification_status || 'unverified'}
                      </span>
                    </td>
                    <td>
                      <div>
                        <span className={`status-badge ${provider.boost_status || 'not_boosted'}`}>
                          {provider.boost_status || 'not_boosted'}
                        </span>
                        {provider.boost_expiry && (
                          <small>Expires: {new Date(provider.boost_expiry).toLocaleDateString()}</small>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="action-buttons">
                        {provider.verification_status !== 'verified' && (
                          <button className="btn-verify" onClick={() => handleVerify(provider.id, 'provider')}>
                            Verify
                          </button>
                        )}
                        {provider.boost_status !== 'boosted' && (
                          <button className="btn-boost" onClick={() => handleBoost(provider.id, 'provider')}>
                            Boost
                          </button>
                        )}
                        <button className="btn-view">View</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'firms' && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Firm Name</th>
                <th>Contact</th>
                <th>Location</th>
                <th>Verification</th>
                <th>Subscription</th>
                <th>Boost Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {estateFirms.length === 0 ? (
                <tr>
                  <td colSpan="7" className="empty-message">No estate firms found.</td>
                </tr>
              ) : (
                estateFirms.map(firm => (
                  <tr key={firm.id}>
                    <td>
                      <strong>{firm.firm_name || 'Unnamed Firm'}</strong>
                      <br />
                      <small>{firm.address || 'No address'}</small>
                    </td>
                    <td>{firm.business_phone || firm.contact_phone || 'N/A'}</td>
                    <td>
                      {firm.address ? (
                        <>
                          {firm.address}
                          {firm.coordinates && (
                            <>
                              <br />
                              <small>{renderCoordinates(firm.coordinates)}</small>
                            </>
                          )}
                        </>
                      ) : (
                        'No location'
                      )}
                    </td>
                    <td>
                      <span className={`status-badge ${firm.verification_status || 'unverified'}`}>
                        {firm.verification_status || 'unverified'}
                      </span>
                    </td>
                    <td>
                      <div>
                        <span className={`status-badge ${firm.subscription_status || 'inactive'}`}>
                          {firm.subscription_status || 'inactive'}
                        </span>
                        {firm.subscription_expiry && (
                          <small>Expires: {new Date(firm.subscription_expiry).toLocaleDateString()}</small>
                        )}
                      </div>
                    </td>
                    <td>
                      <div>
                        <span className={`status-badge ${firm.boost_status || 'not_boosted'}`}>
                          {firm.boost_status || 'not_boosted'}
                        </span>
                        {firm.boost_expiry && (
                          <small>Expires: {new Date(firm.boost_expiry).toLocaleDateString()}</small>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="action-buttons">
                        {(!firm.verification_status || firm.verification_status !== 'verified') && (
                          <button className="btn-verify" onClick={() => handleVerify(firm.id, 'firm')}>
                            Verify
                          </button>
                        )}
                        {(!firm.boost_status || firm.boost_status !== 'boosted') && (
                          <button className="btn-boost" onClick={() => handleBoost(firm.id, 'firm')}>
                            Boost
                          </button>
                        )}
                        <button className="btn-view">View</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminServices;