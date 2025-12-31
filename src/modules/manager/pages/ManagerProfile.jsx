// src/modules/manager/pages/ManagerProfile.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import './ManagerDashboard.css';

const ManagerProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [assignedAreas, setAssignedAreas] = useState([]);

  useEffect(() => {
    if (user?.role !== 'manager') {
      navigate('/dashboard/manager');
      return;
    }

    // Load assigned areas
    const allManagers = JSON.parse(localStorage.getItem('managers') || '[]');
    const currentManager = allManagers.find(m => m.email === user?.email);
    if (currentManager) {
      setAssignedAreas(currentManager.assignedAreas || []);
    }
  }, [user, navigate]);

  return (
    <div className="manager-profile" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div className="profile-header">
        <h1>Manager Profile</h1>
        <button onClick={() => navigate('/dashboard/manager')} style={{ padding: '8px 16px', background: '#4a6fa5', color: 'white', border: 'none', borderRadius: '4px' }}>
          Back to Dashboard
        </button>
      </div>

      <div className="profile-sections">
        <div className="profile-card">
          <h3>Personal Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <label>Name</label>
              <p>{user?.name || 'N/A'}</p>
            </div>
            <div className="info-item">
              <label>Email</label>
              <p>{user?.email || 'N/A'}</p>
            </div>
            <div className="info-item">
              <label>Phone</label>
              <p>{user?.phone || 'N/A'}</p>
            </div>
            <div className="info-item">
              <label>Role</label>
              <p style={{ background: '#e3f2fd', color: '#1976d2', padding: '4px 8px', borderRadius: '4px', display: 'inline-block' }}>
                {user?.role || 'N/A'}
              </p>
            </div>
          </div>
        </div>

        <div className="profile-card">
          <h3>Assigned Areas</h3>
          {assignedAreas.length === 0 ? (
            <p style={{ color: '#666' }}>No areas assigned yet. Contact admin.</p>
          ) : (
            <div className="areas-grid">
              {assignedAreas.map((area, index) => (
                <div key={index} className="area-card">
                  <h4>{area.state}</h4>
                  <p>{area.lga === 'all' ? 'All LGAs' : area.lga}</p>
                  <span className="area-status">Active</span>
                </div>
              ))}
            </div>
          )}
          <button style={{ marginTop: '20px', padding: '10px 20px', background: 'transparent', border: '2px solid #4a6fa5', color: '#4a6fa5', borderRadius: '4px' }}>
            Request Area Changes
          </button>
        </div>

        <div className="profile-card">
          <h3>Account Settings</h3>
          <div className="settings-list">
            <div className="setting-item">
              <span>Notifications</span>
              <input type="checkbox" defaultChecked />
            </div>
            <div className="setting-item">
              <span>Email Alerts</span>
              <input type="checkbox" defaultChecked />
            </div>
            <div className="setting-item">
              <span>SMS Alerts</span>
              <input type="checkbox" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerProfile;