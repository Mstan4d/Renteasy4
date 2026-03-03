// src/modules/manager/pages/ManagerSetup.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import { supabase } from '../../../shared/lib/supabaseClient';
import './ManagerSetup.css';

const ManagerSetup = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [state, setState] = useState('');
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch states from Supabase
  useEffect(() => {
    const fetchStates = async () => {
      const { data, error } = await supabase
        .from('states')
        .select('name')
        .eq('active', true)
        .order('name');
      if (!error && data) {
        setStates(data.map(s => s.name));
      }
    };
    fetchStates();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!state) {
      alert('Please select your state');
      return;
    }

    setLoading(true);
    try {
      // Update profile with selected state
      const { error } = await supabase
        .from('profiles')
        .update({ state: state })
        .eq('id', user.id);

      if (error) throw error;

      // Update local user object if needed
      if (updateUser) {
        updateUser({ ...user, state });
      }

      // Redirect to manager dashboard
      navigate('/dashboard/manager');
    } catch (error) {
      console.error('Error saving state:', error);
      alert('Failed to save state. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="manager-setup">
      <div className="setup-card">
        <h2>Welcome to RentEasy Manager Dashboard</h2>
        <p>Please set your base state to get started</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Select Your State</label>
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              required
              disabled={loading}
            >
              <option value="">Select State</option>
              {states.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <small>This will be used as your default area until admin assigns specific LGAs</small>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save and Continue to Dashboard'}
            </button>
            <button
              type="button"
              className="btn-outline"
              onClick={() => navigate('/dashboard')}
            >
              Skip for Now
            </button>
          </div>
        </form>

        <div className="setup-info">
          <h4>Note:</h4>
          <ul>
            <li>You'll receive notifications for properties in your state</li>
            <li>Admin can later assign you to specific LGAs</li>
            <li>You can update your state anytime in profile settings</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ManagerSetup;