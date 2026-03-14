// src/modules/super-admin/pages/AdminStates.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../shared/context/AuthContext';
import { supabase } from '../../../shared/lib/supabaseClient';
import { Plus, Edit2, Trash2, Save, X, ChevronDown, ChevronRight, MapPin } from 'lucide-react';
import './AdminStates.css';

const AdminStates = () => {
  const { user } = useAuth();
  const [states, setStates] = useState([]);
  const [expandedState, setExpandedState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newState, setNewState] = useState('');
  const [newStateValue, setNewStateValue] = useState(''); // slug
  const [editingStateId, setEditingStateId] = useState(null);
  const [editStateName, setEditStateName] = useState('');
  const [editStateValue, setEditStateValue] = useState('');

  // LGA management
  const [lgas, setLgas] = useState({}); // key: stateId, value: array of LGAs
  const [newLga, setNewLga] = useState({}); // key: stateId, value: new LGA name
  const [editingLga, setEditingLga] = useState({ id: null, name: '', stateId: null });

  const isSuperAdmin = user?.role === 'super-admin';

  useEffect(() => {
    fetchStates();
  }, []);

  const fetchStates = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('states')
        .select('*')
        .order('name');
      if (error) throw error;
      setStates(data || []);
      
      // Fetch all LGAs
      const { data: lgasData, error: lgasError } = await supabase
        .from('lgas')
        .select('*');
      if (lgasError) throw lgasError;

      // Group by state_id
      const lgasMap = {};
      lgasData.forEach(lga => {
        if (!lgasMap[lga.state_id]) lgasMap[lga.state_id] = [];
        lgasMap[lga.state_id].push(lga);
      });
      setLgas(lgasMap);
    } catch (error) {
      console.error('Error fetching states:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLgasForState = async (stateId) => {
    const { data, error } = await supabase
      .from('lgas')
      .select('*')
      .eq('state_id', stateId)
      .order('name');
    if (!error) {
      setLgas(prev => ({ ...prev, [stateId]: data }));
    }
  };

  const toggleState = (stateId) => {
    if (expandedState === stateId) {
      setExpandedState(null);
    } else {
      setExpandedState(stateId);
      if (!lgas[stateId]) {
        fetchLgasForState(stateId);
      }
    }
  };

  // State CRUD (superadmin only)
  const handleAddState = async () => {
    if (!isSuperAdmin) return;
    if (!newState.trim() || !newStateValue.trim()) {
      alert('Please enter both name and value');
      return;
    }
    try {
      const { error } = await supabase
        .from('states')
        .insert([{ name: newState.trim(), value: newStateValue.trim().toLowerCase().replace(/\s+/g, '-'), active: true }]);
      if (error) throw error;
      setNewState('');
      setNewStateValue('');
      fetchStates();
    } catch (error) {
      alert('Error adding state: ' + error.message);
    }
  };

  const handleDeleteState = async (id) => {
    if (!isSuperAdmin) return;
    if (!window.confirm('Delete this state and all its LGAs? This cannot be undone.')) return;
    try {
      const { error } = await supabase
        .from('states')
        .delete()
        .eq('id', id);
      if (error) throw error;
      fetchStates();
    } catch (error) {
      alert('Error deleting state: ' + error.message);
    }
  };

  const startEditState = (state) => {
    setEditingStateId(state.id);
    setEditStateName(state.name);
    setEditStateValue(state.value);
  };

  const cancelEditState = () => {
    setEditingStateId(null);
    setEditStateName('');
    setEditStateValue('');
  };

  const saveEditState = async (id) => {
    if (!isSuperAdmin) return;
    if (!editStateName.trim() || !editStateValue.trim()) return;
    try {
      const { error } = await supabase
        .from('states')
        .update({ name: editStateName.trim(), value: editStateValue.trim().toLowerCase().replace(/\s+/g, '-') })
        .eq('id', id);
      if (error) throw error;
      setEditingStateId(null);
      fetchStates();
    } catch (error) {
      alert('Error updating state: ' + error.message);
    }
  };

  const toggleStateActive = async (id, currentActive) => {
    if (!isSuperAdmin) return;
    try {
      const { error } = await supabase
        .from('states')
        .update({ active: !currentActive })
        .eq('id', id);
      if (error) throw error;
      fetchStates();
    } catch (error) {
      alert('Error toggling state: ' + error.message);
    }
  };

  // LGA CRUD (superadmin only)
  const handleAddLga = async (stateId) => {
    if (!isSuperAdmin) return;
    const lgaName = newLga[stateId];
    if (!lgaName || !lgaName.trim()) return;
    try {
      const { error } = await supabase
        .from('lgas')
        .insert([{ state_id: stateId, name: lgaName.trim(), active: true }]);
      if (error) throw error;
      setNewLga(prev => ({ ...prev, [stateId]: '' }));
      fetchLgasForState(stateId);
    } catch (error) {
      alert('Error adding LGA: ' + error.message);
    }
  };

  const handleDeleteLga = async (lgaId, stateId) => {
    if (!isSuperAdmin) return;
    if (!window.confirm('Delete this LGA?')) return;
    try {
      const { error } = await supabase
        .from('lgas')
        .delete()
        .eq('id', lgaId);
      if (error) throw error;
      fetchLgasForState(stateId);
    } catch (error) {
      alert('Error deleting LGA: ' + error.message);
    }
  };

  const startEditLga = (lga) => {
    setEditingLga({ id: lga.id, name: lga.name, stateId: lga.state_id });
  };

  const cancelEditLga = () => {
    setEditingLga({ id: null, name: '', stateId: null });
  };

  const saveEditLga = async () => {
    if (!isSuperAdmin) return;
    if (!editingLga.name.trim()) return;
    try {
      const { error } = await supabase
        .from('lgas')
        .update({ name: editingLga.name.trim() })
        .eq('id', editingLga.id);
      if (error) throw error;
      cancelEditLga();
      fetchLgasForState(editingLga.stateId);
    } catch (error) {
      alert('Error updating LGA: ' + error.message);
    }
  };

  const toggleLgaActive = async (lgaId, currentActive, stateId) => {
    if (!isSuperAdmin) return;
    try {
      const { error } = await supabase
        .from('lgas')
        .update({ active: !currentActive })
        .eq('id', lgaId);
      if (error) throw error;
      fetchLgasForState(stateId);
    } catch (error) {
      alert('Error toggling LGA: ' + error.message);
    }
  };

  if (loading) return <div className="loading">Loading states...</div>;

  return (
    <div className="admin-states">
      <div className="header">
        <h1>Manage States & LGAs</h1>
        <p>Add, edit, or disable states and their local government areas</p>
        {!isSuperAdmin && (
          <div className="permission-warning">You need superadmin privileges to make changes.</div>
        )}
      </div>

      {isSuperAdmin && (
        <div className="add-state">
          <input
            type="text"
            placeholder="State name (e.g., Lagos)"
            value={newState}
            onChange={(e) => setNewState(e.target.value)}
            className="state-input"
          />
          <input
            type="text"
            placeholder="State value (e.g., lagos)"
            value={newStateValue}
            onChange={(e) => setNewStateValue(e.target.value)}
            className="state-value-input"
          />
          <button onClick={handleAddState} className="btn-add">
            <Plus size={18} /> Add State
          </button>
        </div>
      )}

      <div className="states-list">
        {states.map(state => (
          <div key={state.id} className="state-item">
            <div className="state-header" onClick={() => toggleState(state.id)}>
              <div className="state-title">
                {expandedState === state.id ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                {editingStateId === state.id && isSuperAdmin ? (
                  <>
                    <input
                      type="text"
                      value={editStateName}
                      onChange={(e) => setEditStateName(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="edit-input"
                    />
                    <input
                      type="text"
                      value={editStateValue}
                      onChange={(e) => setEditStateValue(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="edit-input"
                    />
                  </>
                ) : (
                  <span className="state-name">{state.name} ({state.value})</span>
                )}
                <span className={`status-badge ${state.active ? 'active' : 'inactive'}`}>
                  {state.active ? 'Active' : 'Inactive'}
                </span>
              </div>
              {isSuperAdmin && (
                <div className="state-actions" onClick={(e) => e.stopPropagation()}>
                  {editingStateId === state.id ? (
                    <>
                      <button onClick={() => saveEditState(state.id)} className="action-btn save">
                        <Save size={16} />
                      </button>
                      <button onClick={cancelEditState} className="action-btn cancel">
                        <X size={16} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => startEditState(state)} className="action-btn edit">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => toggleStateActive(state.id, state.active)} className="action-btn toggle">
                        {state.active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button onClick={() => handleDeleteState(state.id)} className="action-btn delete">
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {expandedState === state.id && (
              <div className="lgas-section">
                <div className="lgas-header">
                  <h4>Local Government Areas (LGAs)</h4>
                </div>

                {isSuperAdmin && (
                  <div className="add-lga">
                    <input
                      type="text"
                      placeholder="New LGA name..."
                      value={newLga[state.id] || ''}
                      onChange={(e) => setNewLga(prev => ({ ...prev, [state.id]: e.target.value }))}
                      className="lga-input"
                    />
                    <button onClick={() => handleAddLga(state.id)} className="btn-add-lga">
                      <Plus size={16} /> Add LGA
                    </button>
                  </div>
                )}

                <div className="lgas-list">
                  {(lgas[state.id] || []).map(lga => (
                    <div key={lga.id} className="lga-item">
                      {editingLga.id === lga.id && isSuperAdmin ? (
                        <>
                          <input
                            type="text"
                            value={editingLga.name}
                            onChange={(e) => setEditingLga({ ...editingLga, name: e.target.value })}
                            className="edit-input"
                          />
                          <button onClick={saveEditLga} className="lga-action-btn save">
                            <Save size={14} />
                          </button>
                          <button onClick={cancelEditLga} className="lga-action-btn cancel">
                            <X size={14} />
                          </button>
                        </>
                      ) : (
                        <>
                          <MapPin size={16} className="lga-icon" />
                          <span className="lga-name">{lga.name}</span>
                          <span className={`status-badge small ${lga.active ? 'active' : 'inactive'}`}>
                            {lga.active ? 'Active' : 'Inactive'}
                          </span>
                          {isSuperAdmin && (
                            <>
                              <button onClick={() => startEditLga(lga)} className="lga-action-btn">
                                <Edit2 size={14} />
                              </button>
                              <button onClick={() => toggleLgaActive(lga.id, lga.active, state.id)} className="lga-action-btn">
                                {lga.active ? 'Deactivate' : 'Activate'}
                              </button>
                              <button onClick={() => handleDeleteLga(lga.id, state.id)} className="lga-action-btn delete">
                                <Trash2 size={14} />
                              </button>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                  {(!lgas[state.id] || lgas[state.id].length === 0) && (
                    <p className="no-lgas">No LGAs added yet.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminStates;