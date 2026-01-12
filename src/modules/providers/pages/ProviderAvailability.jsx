import React, { useState } from 'react';
import ProviderPageTemplate from '../templates/ProviderPageTemplate';
import { FaCalendarAlt, FaClock, FaSave, FaPlus, FaTrash } from 'react-icons/fa';

const ProviderAvailability = () => {
  const [availability, setAvailability] = useState({
    monday: { active: true, slots: [{ from: '09:00', to: '17:00' }] },
    tuesday: { active: true, slots: [{ from: '09:00', to: '17:00' }] },
    wednesday: { active: true, slots: [{ from: '09:00', to: '17:00' }] },
    thursday: { active: true, slots: [{ from: '09:00', to: '17:00' }] },
    friday: { active: true, slots: [{ from: '09:00', to: '17:00' }] },
    saturday: { active: false, slots: [{ from: '10:00', to: '14:00' }] },
    sunday: { active: false, slots: [] }
  });

  const [timeOff, setTimeOff] = useState([
    { id: 1, date: '2024-01-20', reason: 'Public Holiday', recurring: false },
    { id: 2, date: '2024-01-25', reason: 'Personal Day', recurring: false },
    { id: 3, date: '2024-02-14', reason: 'Valentine\'s Day', recurring: true },
  ]);

  const [newTimeOff, setNewTimeOff] = useState({ date: '', reason: '', recurring: false });

  const days = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' },
  ];

  const handleToggleDay = (dayKey) => {
    setAvailability(prev => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        active: !prev[dayKey].active
      }
    }));
  };

  const handleAddSlot = (dayKey) => {
    const day = availability[dayKey];
    const newSlots = [...day.slots, { from: '09:00', to: '17:00' }];
    setAvailability(prev => ({
      ...prev,
      [dayKey]: { ...day, slots: newSlots }
    }));
  };

  const handleUpdateSlot = (dayKey, index, field, value) => {
    const day = availability[dayKey];
    const updatedSlots = day.slots.map((slot, i) => 
      i === index ? { ...slot, [field]: value } : slot
    );
    setAvailability(prev => ({
      ...prev,
      [dayKey]: { ...day, slots: updatedSlots }
    }));
  };

  const handleRemoveSlot = (dayKey, index) => {
    const day = availability[dayKey];
    const updatedSlots = day.slots.filter((_, i) => i !== index);
    setAvailability(prev => ({
      ...prev,
      [dayKey]: { ...day, slots: updatedSlots }
    }));
  };

  const handleAddTimeOff = () => {
    if (!newTimeOff.date || !newTimeOff.reason) {
      alert('Please fill in all fields');
      return;
    }
    
    setTimeOff(prev => [...prev, {
      id: prev.length + 1,
      ...newTimeOff
    }]);
    
    setNewTimeOff({ date: '', reason: '', recurring: false });
  };

  const handleRemoveTimeOff = (id) => {
    setTimeOff(prev => prev.filter(item => item.id !== id));
  };

  const handleSave = () => {
    alert('Availability saved successfully!');
    // In real app, save to API
  };

  return (
    <ProviderPageTemplate
      title="Availability Settings"
      subtitle="Set your working hours and time off"
      actions={
        <button className="btn-primary" onClick={handleSave}>
          <FaSave style={{ marginRight: '0.5rem' }} />
          Save Changes
        </button>
      }
    >
      <div className="provider-grid">
        {/* Weekly Schedule */}
        <div className="provider-card" style={{ gridColumn: 'span 2' }}>
          <div className="card-header">
            <h3 className="card-title">Weekly Schedule</h3>
            <p className="card-subtitle">Set your regular working hours for each day</p>
          </div>

          <div className="weekly-schedule">
            {days.map((day) => {
              const dayData = availability[day.key];
              
              return (
                <div key={day.key} className="day-schedule">
                  <div className="day-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <input
                        type="checkbox"
                        id={`toggle-${day.key}`}
                        checked={dayData.active}
                        onChange={() => handleToggleDay(day.key)}
                        style={{ width: '20px', height: '20px' }}
                      />
                      <label 
                        htmlFor={`toggle-${day.key}`}
                        style={{ 
                          fontWeight: '600',
                          color: dayData.active ? '#1a237e' : '#666'
                        }}
                      >
                        {day.label}
                      </label>
                    </div>
                    
                    {dayData.active && (
                      <button
                        className="btn-secondary"
                        onClick={() => handleAddSlot(day.key)}
                        style={{ padding: '0.3rem 0.8rem', fontSize: '0.9rem' }}
                      >
                        <FaPlus style={{ marginRight: '0.3rem' }} />
                        Add Slot
                      </button>
                    )}
                  </div>

                  {dayData.active ? (
                    <div className="time-slots">
                      {dayData.slots.map((slot, index) => (
                        <div key={index} className="time-slot">
                          <div className="time-inputs">
                            <div className="time-input-group">
                              <label>From</label>
                              <input
                                type="time"
                                value={slot.from}
                                onChange={(e) => handleUpdateSlot(day.key, index, 'from', e.target.value)}
                                className="form-control"
                              />
                            </div>
                            
                            <div className="time-input-group">
                              <label>To</label>
                              <input
                                type="time"
                                value={slot.to}
                                onChange={(e) => handleUpdateSlot(day.key, index, 'to', e.target.value)}
                                className="form-control"
                              />
                            </div>
                          </div>
                          
                          {dayData.slots.length > 1 && (
                            <button
                              className="remove-slot-btn"
                              onClick={() => handleRemoveSlot(day.key, index)}
                              style={{ 
                                padding: '0.5rem',
                                background: '#f44336',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                              }}
                            >
                              <FaTrash />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
                      <p style={{ margin: 0, color: '#666', fontStyle: 'italic' }}>
                        Not available on this day
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Time Off Management */}
        <div className="provider-card">
          <div className="card-header">
            <h3 className="card-title">Time Off / Holidays</h3>
            <p className="card-subtitle">Schedule days you won't be available</p>
          </div>

          {/* Add New Time Off */}
          <div className="add-time-off">
            <h4 style={{ marginBottom: '1rem' }}>Add Time Off</h4>
            
            <div className="form-group">
              <label className="form-label">Date</label>
              <input
                type="date"
                className="form-control"
                value={newTimeOff.date}
                onChange={(e) => setNewTimeOff({...newTimeOff, date: e.target.value})}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Reason</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g., Public Holiday, Personal Day"
                value={newTimeOff.reason}
                onChange={(e) => setNewTimeOff({...newTimeOff, reason: e.target.value})}
              />
            </div>
            
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  checked={newTimeOff.recurring}
                  onChange={(e) => setNewTimeOff({...newTimeOff, recurring: e.target.checked})}
                />
                Recurring annually
              </label>
            </div>
            
            <button className="btn-primary" onClick={handleAddTimeOff} style={{ width: '100%' }}>
              <FaPlus style={{ marginRight: '0.5rem' }} />
              Add Time Off
            </button>
          </div>

          {/* Time Off List */}
          <div style={{ marginTop: '2rem' }}>
            <h4 style={{ marginBottom: '1rem' }}>Scheduled Time Off</h4>
            
            {timeOff.length === 0 ? (
              <div className="empty-state" style={{ padding: '2rem' }}>
                <FaCalendarAlt style={{ fontSize: '3rem', color: '#ddd', marginBottom: '1rem' }} />
                <p style={{ color: '#666' }}>No time off scheduled</p>
              </div>
            ) : (
              <div className="time-off-list">
                {timeOff.map((item) => (
                  <div key={item.id} className="time-off-item">
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '1.1rem' }}>
                        {new Date(item.date).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </div>
                      <div style={{ color: '#666', marginTop: '0.3rem' }}>
                        {item.reason}
                        {item.recurring && (
                          <span style={{
                            background: '#e8f5e9',
                            color: '#2e7d32',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '12px',
                            fontSize: '0.8rem',
                            marginLeft: '0.5rem'
                          }}>
                            Recurring
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <button
                      className="btn-secondary"
                      onClick={() => handleRemoveTimeOff(item.id)}
                      style={{ padding: '0.5rem' }}
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Availability Summary */}
      <div className="provider-card" style={{ marginTop: '2rem' }}>
        <div className="card-header">
          <h3 className="card-title">Availability Summary</h3>
        </div>
        
        <div className="availability-summary">
          <div className="summary-item">
            <FaCalendarAlt style={{ fontSize: '2rem', color: '#1a237e' }} />
            <div>
              <h4 style={{ margin: '0 0 0.5rem 0' }}>Working Days</h4>
              <p style={{ margin: 0, color: '#666' }}>
                {Object.values(availability).filter(day => day.active).length} days per week
              </p>
            </div>
          </div>
          
          <div className="summary-item">
            <FaClock style={{ fontSize: '2rem', color: '#1a237e' }} />
            <div>
              <h4 style={{ margin: '0 0 0.5rem 0' }}>Total Hours</h4>
              <p style={{ margin: 0, color: '#666' }}>
                {Object.values(availability).reduce((total, day) => {
                  if (!day.active) return total;
                  return total + day.slots.reduce((dayTotal, slot) => {
                    const from = parseInt(slot.from.split(':')[0]);
                    const to = parseInt(slot.to.split(':')[0]);
                    return dayTotal + (to - from);
                  }, 0);
                }, 0)} hours per week
              </p>
            </div>
          </div>
          
          <div className="summary-item">
            <FaCalendarAlt style={{ fontSize: '2rem', color: '#1a237e' }} />
            <div>
              <h4 style={{ margin: '0 0 0.5rem 0' }}>Time Off</h4>
              <p style={{ margin: 0, color: '#666' }}>
                {timeOff.length} days scheduled
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .weekly-schedule {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        
        .day-schedule {
          padding: 1.5rem;
          border: 1px solid #e0e0e0;
          border-radius: 12px;
          transition: all 0.3s ease;
        }
        
        .day-schedule:hover {
          border-color: #1a237e;
        }
        
        .day-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        
        .time-slots {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .time-slot {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .time-inputs {
          display: flex;
          gap: 1rem;
          flex: 1;
        }
        
        .time-input-group {
          flex: 1;
        }
        
        .time-input-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: #333;
        }
        
        .add-time-off {
          padding: 1.5rem;
          background: #f8f9fa;
          border-radius: 12px;
          margin-bottom: 2rem;
        }
        
        .time-off-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .time-off-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          transition: all 0.3s ease;
        }
        
        .time-off-item:hover {
          border-color: #1a237e;
          background: #f8f9fa;
        }
        
        .availability-summary {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
          padding: 1.5rem;
        }
        
        .summary-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.5rem;
          background: #f8f9fa;
          border-radius: 12px;
        }
        
        @media (max-width: 992px) {
          .provider-card[style*="grid-column: span 2"] {
            grid-column: span 1;
          }
          
          .time-inputs {
            flex-direction: column;
          }
          
          .time-slot {
            flex-direction: column;
            align-items: stretch;
          }
          
          .remove-slot-btn {
            align-self: flex-end;
          }
        }
        
        @media (max-width: 768px) {
          .availability-summary {
            grid-template-columns: 1fr;
          }
          
          .day-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
        }
      `}</style>
    </ProviderPageTemplate>
  );
};

export default ProviderAvailability;