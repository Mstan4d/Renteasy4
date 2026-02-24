// src/modules/admin/pages/AdminServices.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../shared/context/AuthContext';

// Import your Supabase client
import { supabase } from '../../../shared/lib/supabaseClient';

const AdminServices = () => {
  const { profile } = useAuth();
  const [serviceProviders, setServiceProviders] = useState([]);
  const [estateFirms, setEstateFirms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('providers');

  // Fetch data from Supabase
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch service providers from Supabase
      const { data: providers, error: providersError } = await supabase
        .from('service_providers')
        .select('*')
        .order('created_at', { ascending: false });

      if (providersError) {
        console.error('Error fetching providers:', providersError);
      } else {
        setServiceProviders(providers || []);
      }

      // Fetch estate firms from Supabase
      const { data: firms, error: firmsError } = await supabase
        .from('estate_firms')
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
      const table = type === 'provider' ? 'service_providers' : 'estate_firms';
      
      const { error } = await supabase
        .from(table)
        .update({ 
          verification_status: 'verified',
          verified_by: profile?.id,
          verified_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      
      // Refresh data
      await fetchData();
    } catch (error) {
      console.error('Verification error:', error);
      alert(`Error verifying: ${error.message}`);
    }
  };

  const handleBoost = async (id, type, days = 7) => {
    try {
      const table = type === 'provider' ? 'service_providers' : 'estate_firms';
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + days);

      const { error } = await supabase
        .from(table)
        .update({ 
          boost_status: 'boosted',
          boost_expiry: expiry.toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      
      await fetchData();
    } catch (error) {
      console.error('Boost error:', error);
      alert(`Error boosting: ${error.message}`);
    }
  };

  // Helper to safely render coordinates
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
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div className="loading-spinner"></div>
        <p>Loading service data from Supabase...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ 
        marginBottom: '30px',
        borderBottom: '1px solid #e1e1e1',
        paddingBottom: '15px'
      }}>
        <h1 style={{ margin: '0 0 10px 0' }}>Service Management</h1>
        <p style={{ color: '#666', margin: 0 }}>
          Manage service providers and estate firms in the marketplace
        </p>
      </div>

      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        marginBottom: '20px',
        borderBottom: '2px solid #f0f0f0'
      }}>
        <button
          onClick={() => setActiveTab('providers')}
          style={{
            padding: '10px 20px',
            background: activeTab === 'providers' ? '#007bff' : 'transparent',
            color: activeTab === 'providers' ? 'white' : '#333',
            border: 'none',
            borderBottom: activeTab === 'providers' ? '2px solid #007bff' : 'none',
            cursor: 'pointer',
            fontWeight: activeTab === 'providers' ? '600' : '400'
          }}
        >
          Service Providers ({serviceProviders.length})
        </button>
        <button
          onClick={() => setActiveTab('firms')}
          style={{
            padding: '10px 20px',
            background: activeTab === 'firms' ? '#007bff' : 'transparent',
            color: activeTab === 'firms' ? 'white' : '#333',
            border: 'none',
            borderBottom: activeTab === 'firms' ? '2px solid #007bff' : 'none',
            cursor: 'pointer',
            fontWeight: activeTab === 'firms' ? '600' : '400'
          }}
        >
          Estate Firms ({estateFirms.length})
        </button>
      </div>

      {activeTab === 'providers' && (
        <div style={{ 
          background: 'white', 
          borderRadius: '8px', 
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse',
            minWidth: '600px'
          }}>
            <thead>
              <tr style={{ background: '#f8f9fa' }}>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e1e1e1' }}>Business Name</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e1e1e1' }}>Service Type</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e1e1e1' }}>Contact</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e1e1e1' }}>Location</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e1e1e1' }}>Verification</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e1e1e1' }}>Boost Status</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e1e1e1' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {serviceProviders.map(provider => (
                <tr key={provider.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '12px' }}>
                    <strong>{provider.business_name}</strong>
                    <br />
                    <small style={{ color: '#666' }}>{provider.address}</small>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      background: '#e3f2fd',
                      color: '#1976d2',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      {provider.service_type}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>{provider.contact_phone}</td>
                  <td style={{ padding: '12px' }}>
                    {provider.address && (
                      <>
                        {provider.address}
                        <br />
                        <small>{renderCoordinates(provider.coordinates)}</small>
                      </>
                    )}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '500',
                      background: provider.verification_status === 'verified' ? '#d4edda' : '#f8d7da',
                      color: provider.verification_status === 'verified' ? '#155724' : '#721c24'
                    }}>
                      {provider.verification_status}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <div>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '500',
                        background: provider.boost_status === 'boosted' ? '#fff3cd' : '#e2e3e5',
                        color: provider.boost_status === 'boosted' ? '#856404' : '#383d41'
                      }}>
                        {provider.boost_status}
                      </span>
                      {provider.boost_expiry && (
                        <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
                          Expires: {new Date(provider.boost_expiry).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      {provider.verification_status === 'unverified' && (
                        <button 
                          onClick={() => handleVerify(provider.id, 'provider')}
                          style={{
                            padding: '6px 12px',
                            background: '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          Verify
                        </button>
                      )}
                      {provider.boost_status === 'not_boosted' && (
                        <button 
                          onClick={() => handleBoost(provider.id, 'provider')}
                          style={{
                            padding: '6px 12px',
                            background: '#ffc107',
                            color: '#212529',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          Boost
                        </button>
                      )}
                      <button style={{
                        padding: '6px 12px',
                        background: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}>
                        View
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'firms' && (
        <div style={{ 
          background: 'white', 
          borderRadius: '8px', 
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse',
            minWidth: '600px'
          }}>
            <thead>
              <tr style={{ background: '#f8f9fa' }}>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e1e1e1' }}>Firm Name</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e1e1e1' }}>Contact</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e1e1e1' }}>Location</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e1e1e1' }}>Verification</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e1e1e1' }}>Subscription</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e1e1e1' }}>Boost Status</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e1e1e1' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {estateFirms.map(firm => (
                <tr key={firm.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '12px' }}>
                    <strong>{firm.firm_name}</strong>
                    <br />
                    <small style={{ color: '#666' }}>{firm.address}</small>
                  </td>
                  <td style={{ padding: '12px' }}>{firm.contact_phone}</td>
                  <td style={{ padding: '12px' }}>
                    {firm.address && (
                      <>
                        {firm.address}
                        <br />
                        <small>{renderCoordinates(firm.coordinates)}</small>
                      </>
                    )}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '500',
                      background: firm.verification_status === 'verified' ? '#d4edda' : '#f8d7da',
                      color: firm.verification_status === 'verified' ? '#155724' : '#721c24'
                    }}>
                      {firm.verification_status}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <div>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '500',
                        background: firm.subscription_status === 'active' ? '#d4edda' : 
                                   firm.subscription_status === 'expired' ? '#f8d7da' : '#e2e3e5',
                        color: firm.subscription_status === 'active' ? '#155724' : 
                               firm.subscription_status === 'expired' ? '#721c24' : '#383d41'
                      }}>
                        {firm.subscription_status}
                      </span>
                      {firm.subscription_expiry && (
                        <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
                          Expires: {new Date(firm.subscription_expiry).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <div>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '500',
                        background: firm.boost_status === 'boosted' ? '#fff3cd' : '#e2e3e5',
                        color: firm.boost_status === 'boosted' ? '#856404' : '#383d41'
                      }}>
                        {firm.boost_status}
                      </span>
                      {firm.boost_expiry && (
                        <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
                          Expires: {new Date(firm.boost_expiry).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      {firm.verification_status === 'unverified' && (
                        <button 
                          onClick={() => handleVerify(firm.id, 'firm')}
                          style={{
                            padding: '6px 12px',
                            background: '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          Verify
                        </button>
                      )}
                      {firm.boost_status === 'not_boosted' && (
                        <button 
                          onClick={() => handleBoost(firm.id, 'firm')}
                          style={{
                            padding: '6px 12px',
                            background: '#ffc107',
                            color: '#212529',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          Boost
                        </button>
                      )}
                      <button style={{
                        padding: '6px 12px',
                        background: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}>
                        View
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminServices;