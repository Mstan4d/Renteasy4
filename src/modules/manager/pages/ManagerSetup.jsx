// src/modules/manager/pages/ManagerSetup.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
//import { toast } from 'react-hot-toast';

const ManagerSetup = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [state, setState] = useState(user?.state || '');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!state) {
      toast.error('Please select your state');
      return;
    }
    
    // Update user with state
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const updatedUsers = users.map(u => 
      u.email === user.email ? { ...u, state } : u
    );
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    
    // Update current user
    const currentUser = { ...user, state };
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    updateUser(currentUser);
    
    // Create or update manager record
    const managers = JSON.parse(localStorage.getItem('managers') || '[]');
    const existingManager = managers.find(m => m.email === user.email);
    
    if (existingManager) {
      existingManager.state = state;
      if (!existingManager.assignedAreas) {
        existingManager.assignedAreas = [{ state, lga: 'all' }];
      }
    } else {
      managers.push({
        id: user.id,
        name: user.name,
        email: user.email,
        state,
        assignedAreas: [{ state, lga: 'all' }],
        status: 'active',
        createdAt: new Date().toISOString()
      });
    }
    
    localStorage.setItem('managers', JSON.stringify(managers));
    
    toast.success(`State set to ${state}. You can now use the dashboard.`);
    navigate('/dashboard/manager');
  };
  
  const nigerianStates = [
    'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
    'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe',
    'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara',
    'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau',
    'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
  ];
  
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
            >
              <option value="">Select State</option>
              {nigerianStates.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
            <small>This will be used as your default area until admin assigns specific LGAs</small>
          </div>
          
          <div className="form-actions">
            <button type="submit" className="btn-primary">
              Save and Continue to Dashboard
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