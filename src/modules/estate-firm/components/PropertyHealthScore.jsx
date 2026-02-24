import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, AlertCircle, Home, Shield,
  Calendar, Wrench, Star, CheckCircle, XCircle
} from 'lucide-react';
import { supabase } from '../../../shared/lib/supabaseClient';
import './PropertyHealthScore.css';

const PropertyHealthScore = ({ propertyId }) => {
  const [property, setProperty] = useState(null);
  const [healthScore, setHealthScore] = useState(0);
  const [inspections, setInspections] = useState([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [newScore, setNewScore] = useState(0);

  useEffect(() => {
    if (propertyId) {
      loadPropertyHealthData();
    }
  }, [propertyId]);

  const loadPropertyHealthData = async () => {
    try {
      setLoading(true);

      // Load property details
      const { data: propertyData, error: propertyError } = await supabase
        .from('listings')
        .select('*')
        .eq('id', propertyId)
        .single();

      if (propertyError) throw propertyError;
      setProperty(propertyData);

      // Load property health score
      const { data: healthData, error: healthError } = await supabase
        .from('property_health_scores')
        .select('*')
        .eq('property_id', propertyId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!healthError && healthData) {
        setHealthScore(healthData.score || 75);
      } else {
        // Calculate default score based on property status and age
        const propertyAge = new Date() - new Date(propertyData.created_at);
        const ageInMonths = propertyAge / (1000 * 60 * 60 * 24 * 30);
        let baseScore = 75;
        
        if (propertyData.status === 'occupied') baseScore += 10;
        if (ageInMonths < 12) baseScore += 15;
        if (ageInMonths > 60) baseScore -= 10;
        
        setHealthScore(Math.max(0, Math.min(100, baseScore)));
      }

      // Load recent inspections
      const { data: inspectionsData } = await supabase
        .from('property_inspections')
        .select('*')
        .eq('property_id', propertyId)
        .order('inspection_date', { ascending: false })
        .limit(3);

      setInspections(inspectionsData || []);

      // Load recent maintenance requests
      const { data: maintenanceData } = await supabase
        .from('maintenance_requests')
        .select('*')
        .eq('property_id', propertyId)
        .eq('status', 'open')
        .order('created_at', { ascending: false })
        .limit(5);

      setMaintenanceRequests(maintenanceData || []);

    } catch (error) {
      console.error('Error loading property health data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateScore = async () => {
    if (!propertyId || newScore < 0 || newScore > 100) return;

    try {
      const { error } = await supabase
        .from('property_health_scores')
        .insert({
          property_id: propertyId,
          score: newScore,
          notes: 'Manual update',
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      setHealthScore(newScore);
      setShowScoreModal(false);
      setNewScore(0);

      // Log activity
      await supabase.from('activities').insert({
        user_id: property?.estate_firm_id,
        type: 'property_health',
        action: 'update_score',
        description: `Updated health score for ${property?.title} to ${newScore}`,
        created_at: new Date().toISOString()
      });

      alert('Health score updated successfully!');

    } catch (error) {
      console.error('Error updating health score:', error);
      alert('Failed to update health score. Please try again.');
    }
  };

  const scheduleInspection = async () => {
    if (!propertyId) return;

    try {
      const inspectionDate = new Date();
      inspectionDate.setDate(inspectionDate.getDate() + 7); // Schedule for next week

      const { error } = await supabase
        .from('property_inspections')
        .insert({
          property_id: propertyId,
          inspection_date: inspectionDate.toISOString(),
          status: 'scheduled',
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      alert('Inspection scheduled successfully!');

      // Refresh inspections list
      await loadPropertyHealthData();

    } catch (error) {
      console.error('Error scheduling inspection:', error);
      alert('Failed to schedule inspection. Please try again.');
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return { color: '#10b981', label: 'Excellent', icon: <Shield color="#10b981" /> };
    if (score >= 60) return { color: '#3b82f6', label: 'Good', icon: <TrendingUp color="#3b82f6" /> };
    if (score >= 40) return { color: '#f59e0b', label: 'Fair', icon: <AlertCircle color="#f59e0b" /> };
    return { color: '#ef4444', label: 'Poor', icon: <TrendingDown color="#ef4444" /> };
  };

  const getRecommendations = (score) => {
    if (score >= 80) return [
      'Property in excellent condition',
      'Continue regular maintenance schedule',
      'Consider value-adding upgrades'
    ];
    if (score >= 60) return [
      'Schedule routine maintenance',
      'Check for minor repairs',
      'Consider cosmetic upgrades'
    ];
    if (score >= 40) return [
      'Needs attention soon',
      'Schedule comprehensive inspection',
      'Plan for major repairs'
    ];
    return [
      'Urgent attention needed',
      'Schedule immediate inspection',
      'Consider major renovation or sale'
    ];
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading || !property) {
    return (
      <div className="property-health-card loading">
        <div className="spinner"></div>
        <p>Loading health score...</p>
      </div>
    );
  }

  const scoreData = getScoreColor(healthScore);
  const recommendations = getRecommendations(healthScore);
  const lastInspection = inspections.length > 0 ? inspections[0] : null;
  const pendingMaintenance = maintenanceRequests.length;

  return (
    <div className="property-health-card">
      <div className="health-header">
        <div className="property-info">
          <div className="property-title">
            <Home size={16} />
            <h4>{property.title}</h4>
            <span className={`property-status ${property.status}`}>
              {property.status}
            </span>
          </div>
          <p className="property-location">{property.address}</p>
        </div>
        
        <div className="health-score-display">
          <div 
            className="score-circle"
            style={{ 
              background: `conic-gradient(${scoreData.color} ${healthScore * 3.6}deg, #f3f4f6 0deg)` 
            }}
          >
            <div className="score-inner">
              <span className="score-value">{healthScore}</span>
              <span className="score-label">/100</span>
            </div>
          </div>
          <div className="score-rating">
            {scoreData.icon}
            <span style={{ color: scoreData.color }}>{scoreData.label}</span>
          </div>
        </div>
      </div>

      <div className="health-details">
        <div className="detail-item">
          <span className="label">Last Inspection</span>
          <span className="value">
            {lastInspection 
              ? formatDate(lastInspection.inspection_date)
              : 'No inspections'
            }
          </span>
        </div>
        <div className="detail-item">
          <span className="label">Maintenance Pending</span>
          <span className="value">
            {pendingMaintenance > 0 ? (
              <span className="pending-maintenance">
                {pendingMaintenance} requests
              </span>
            ) : 'None'}
          </span>
        </div>
        <div className="detail-item">
          <span className="label">Property Age</span>
          <span className="value">
            {Math.floor((new Date() - new Date(property.created_at)) / (1000 * 60 * 60 * 24 * 30))} months
          </span>
        </div>
      </div>

      <div className="health-metrics">
        <h5>Recent Activity</h5>
        <div className="metrics-grid">
          <div className="metric-item">
            <Calendar size={16} />
            <div>
              <span className="metric-value">{inspections.length}</span>
              <span className="metric-label">Inspections</span>
            </div>
          </div>
          <div className="metric-item">
            <Wrench size={16} />
            <div>
              <span className="metric-value">{maintenanceRequests.length}</span>
              <span className="metric-label">Open Requests</span>
            </div>
          </div>
          <div className="metric-item">
            <Star size={16} />
            <div>
              <span className="metric-value">4.7</span>
              <span className="metric-label">Tenant Rating</span>
            </div>
          </div>
        </div>
      </div>

      <div className="health-recommendations">
        <h5>Recommendations:</h5>
        <ul>
          {recommendations.map((rec, index) => (
            <li key={index}>
              <div className="recommendation-dot" style={{ backgroundColor: scoreData.color }}></div>
              {rec}
            </li>
          ))}
        </ul>
      </div>

      <div className="health-actions">
        <button 
          className="btn btn-sm btn-outline"
          onClick={scheduleInspection}
        >
          Schedule Inspection
        </button>
        <button 
          className="btn btn-sm btn-outline"
          onClick={() => {
            // View maintenance requests
            alert(`Viewing ${maintenanceRequests.length} maintenance requests`);
          }}
        >
          View Maintenance
        </button>
        <button 
          className="btn btn-sm" 
          style={{ backgroundColor: scoreData.color, color: 'white' }}
          onClick={() => setShowScoreModal(true)}
        >
          Update Score
        </button>
      </div>

      {/* Update Score Modal */}
      {showScoreModal && (
        <div className="modal-overlay" onClick={() => setShowScoreModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Update Health Score</h3>
              <button 
                className="modal-close"
                onClick={() => setShowScoreModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="score-input">
                <label>New Health Score (0-100)</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={newScore}
                  onChange={(e) => setNewScore(parseInt(e.target.value))}
                  className="score-slider"
                />
                <div className="score-display">
                  <span 
                    className="score-value-large"
                    style={{ color: getScoreColor(newScore).color }}
                  >
                    {newScore}
                  </span>
                  <span className="score-label">/100</span>
                  <span className="score-rating-label">
                    {getScoreColor(newScore).label}
                  </span>
                </div>
              </div>
              
              <div className="score-notes">
                <label>Notes (Optional)</label>
                <textarea
                  placeholder="Add notes about why the score was updated..."
                  className="notes-textarea"
                />
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn btn-outline"
                onClick={() => setShowScoreModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleUpdateScore}
              >
                Update Score
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyHealthScore;