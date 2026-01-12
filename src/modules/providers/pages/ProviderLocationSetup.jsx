import React, { useState, useEffect } from 'react';
import ProviderPageTemplate from '../templates/ProviderPageTemplate';
import { 
  FaMapMarkerAlt, FaMap, FaLocationArrow, FaRulerCombined, 
  FaPlus, FaEdit, FaTrash, FaSave, FaSync, FaCheckCircle,
  FaTimesCircle, FaRoad, FaCar, FaWalking, FaClock
} from 'react-icons/fa';

const ProviderLocationSetup = () => {
  const [serviceAreas, setServiceAreas] = useState([
    {
      id: 1,
      name: 'Lagos Mainland',
      center: { lat: 6.5244, lng: 3.3792 },
      radius: 10, // in kilometers
      radiusUnit: 'km',
      type: 'radius',
      address: 'Lagos Mainland, Lagos',
      priceAdjustment: 0,
      description: 'Mainland areas including Ikeja, Surulere, Yaba',
      active: true,
      coverage: 85,
      estimatedTravelTime: '30-45 mins'
    },
    {
      id: 2,
      name: 'Lagos Island',
      center: { lat: 6.4550, lng: 3.3841 },
      radius: 8,
      radiusUnit: 'km',
      type: 'radius',
      address: 'Lagos Island, Lagos',
      priceAdjustment: 1500,
      description: 'Island areas including VI, Ikoyi, Lekki',
      active: true,
      coverage: 75,
      estimatedTravelTime: '45-60 mins'
    },
    {
      id: 3,
      name: 'Ibadan Central',
      center: { lat: 7.3775, lng: 3.9470 },
      radius: 15,
      radiusUnit: 'km',
      type: 'radius',
      address: 'Ibadan, Oyo State',
      priceAdjustment: 5000,
      description: 'Central Ibadan areas',
      active: false,
      coverage: 60,
      estimatedTravelTime: '1-2 hours'
    },
    {
      id: 4,
      name: 'Custom Zone 1',
      type: 'custom',
      points: [
        { lat: 6.5244, lng: 3.3792 },
        { lat: 6.5344, lng: 3.3892 },
        { lat: 6.5144, lng: 3.3992 }
      ],
      address: 'Custom defined area',
      priceAdjustment: 2000,
      description: 'Manually defined service zone',
      active: true,
      coverage: 40,
      estimatedTravelTime: '20-30 mins'
    }
  ]);

  const [currentLocation, setCurrentLocation] = useState({
    lat: 6.5244,
    lng: 3.3792,
    address: 'Lagos, Nigeria'
  });

  const [newArea, setNewArea] = useState({
    name: '',
    type: 'radius',
    centerLat: '',
    centerLng: '',
    radius: '',
    radiusUnit: 'km',
    address: '',
    priceAdjustment: '',
    description: '',
    active: true
  });

  const [showMap, setShowMap] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedArea, setSelectedArea] = useState(null);
  const [mapType, setMapType] = useState('radius');

  useEffect(() => {
    // Simulate getting current location
    const getLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setCurrentLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              address: 'Your current location'
            });
          },
          () => {
            console.log('Geolocation not available or denied');
          }
        );
      }
    };
    getLocation();
  }, []);

  const handleSaveArea = () => {
    if (!newArea.name || !newArea.address) {
      alert('Please fill in required fields');
      return;
    }

    if (selectedArea) {
      // Update existing area
      setServiceAreas(areas => areas.map(area => 
        area.id === selectedArea.id 
          ? {
              ...area,
              ...newArea,
              radius: newArea.radius ? parseInt(newArea.radius) : undefined,
              center: newArea.centerLat && newArea.centerLng 
                ? { lat: parseFloat(newArea.centerLat), lng: parseFloat(newArea.centerLng) }
                : area.center,
              priceAdjustment: parseInt(newArea.priceAdjustment) || 0
            }
          : area
      ));
    } else {
      // Add new area
      const newAreaItem = {
        id: serviceAreas.length + 1,
        name: newArea.name,
        type: newArea.type,
        center: newArea.centerLat && newArea.centerLng 
          ? { lat: parseFloat(newArea.centerLat), lng: parseFloat(newArea.centerLng) }
          : currentLocation,
        radius: newArea.radius ? parseInt(newArea.radius) : 10,
        radiusUnit: newArea.radiusUnit,
        address: newArea.address,
        priceAdjustment: parseInt(newArea.priceAdjustment) || 0,
        description: newArea.description,
        active: newArea.active,
        coverage: Math.floor(Math.random() * 30) + 50,
        estimatedTravelTime: `${Math.floor(Math.random() * 30) + 20}-${Math.floor(Math.random() * 30) + 40} mins`
      };

      setServiceAreas([...serviceAreas, newAreaItem]);
    }

    setShowAddModal(false);
    setSelectedArea(null);
    setNewArea({
      name: '',
      type: 'radius',
      centerLat: '',
      centerLng: '',
      radius: '',
      radiusUnit: 'km',
      address: '',
      priceAdjustment: '',
      description: '',
      active: true
    });
  };

  const handleEditArea = (area) => {
    setSelectedArea(area);
    setNewArea({
      name: area.name,
      type: area.type,
      centerLat: area.center?.lat?.toString() || '',
      centerLng: area.center?.lng?.toString() || '',
      radius: area.radius?.toString() || '',
      radiusUnit: area.radiusUnit || 'km',
      address: area.address,
      priceAdjustment: area.priceAdjustment?.toString() || '',
      description: area.description,
      active: area.active
    });
    setShowAddModal(true);
  };

  const handleToggleAreaStatus = (id) => {
    setServiceAreas(areas => areas.map(area => 
      area.id === id ? { ...area, active: !area.active } : area
    ));
  };

  const handleUseCurrentLocation = () => {
    setNewArea({
      ...newArea,
      centerLat: currentLocation.lat.toString(),
      centerLng: currentLocation.lng.toString()
    });
  };

  const stats = {
    totalAreas: serviceAreas.length,
    activeAreas: serviceAreas.filter(area => area.active).length,
    totalCoverage: serviceAreas.reduce((sum, area) => sum + (area.active ? area.coverage : 0), 0),
    averageRadius: Math.round(serviceAreas.reduce((sum, area) => sum + (area.radius || 0), 0) / serviceAreas.length)
  };

  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    // Simplified distance calculation
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const checkLocationInArea = (lat, lng) => {
    const activeAreas = serviceAreas.filter(area => area.active);
    for (const area of activeAreas) {
      if (area.type === 'radius' && area.center) {
        const distance = calculateDistance(lat, lng, area.center.lat, area.center.lng);
        if (distance <= area.radius) {
          return area;
        }
      }
    }
    return null;
  };

  return (
    <ProviderPageTemplate
      title="Service Area Setup"
      subtitle="Define where you provide your services"
      actions={
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            className="btn-secondary"
            onClick={() => setShowMap(!showMap)}
          >
            <FaMap style={{ marginRight: '0.5rem' }} />
            {showMap ? 'Hide Map' : 'Show Map'}
          </button>
          <button 
            className="btn-primary"
            onClick={() => setShowAddModal(true)}
          >
            <FaPlus style={{ marginRight: '0.5rem' }} />
            Add Service Area
          </button>
        </div>
      }
    >
      {/* Stats Overview */}
      <div className="provider-grid" style={{ marginBottom: '2rem' }}>
        <div className="provider-card stats-card" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
          <div className="card-header">
            <h3 className="card-title" style={{ color: 'white' }}>Service Areas</h3>
            <FaMapMarkerAlt style={{ color: 'white', fontSize: '1.5rem' }} />
          </div>
          <div className="stats-number" style={{ color: 'white' }}>{stats.totalAreas}</div>
          <div className="stats-label" style={{ color: 'rgba(255,255,255,0.9)' }}>
            Defined areas
          </div>
        </div>

        <div className="provider-card stats-card" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
          <div className="card-header">
            <h3 className="card-title" style={{ color: 'white' }}>Active Areas</h3>
            <FaCheckCircle style={{ color: 'white', fontSize: '1.5rem' }} />
          </div>
          <div className="stats-number" style={{ color: 'white' }}>{stats.activeAreas}</div>
          <div className="stats-label" style={{ color: 'rgba(255,255,255,0.9)' }}>
            Currently active
          </div>
        </div>

        <div className="provider-card stats-card" style={{ background: 'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)' }}>
          <div className="card-header">
            <h3 className="card-title" style={{ color: 'white' }}>Coverage</h3>
            <FaRulerCombined style={{ color: 'white', fontSize: '1.5rem' }} />
          </div>
          <div className="stats-number" style={{ color: 'white' }}>{stats.totalCoverage}%</div>
          <div className="stats-label" style={{ color: 'rgba(255,255,255,0.9)' }}>
            Total area coverage
          </div>
        </div>

        <div className="provider-card stats-card" style={{ background: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)' }}>
          <div className="card-header">
            <h3 className="card-title" style={{ color: 'white' }}>Avg. Radius</h3>
            <FaLocationArrow style={{ color: 'white', fontSize: '1.5rem' }} />
          </div>
          <div className="stats-number" style={{ color: 'white' }}>{stats.averageRadius}km</div>
          <div className="stats-label" style={{ color: 'rgba(255,255,255,0.9)' }}>
            Average service radius
          </div>
        </div>
      </div>

      {/* Map Preview */}
      {showMap && (
        <div className="provider-card" style={{ marginBottom: '2rem' }}>
          <div className="card-header">
            <h3 className="card-title">Service Area Map</h3>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                className={`map-type-btn ${mapType === 'radius' ? 'active' : ''}`}
                onClick={() => setMapType('radius')}
              >
                Radius View
              </button>
              <button 
                className={`map-type-btn ${mapType === 'coverage' ? 'active' : ''}`}
                onClick={() => setMapType('coverage')}
              >
                Coverage View
              </button>
            </div>
          </div>
          
          <div className="map-preview">
            <div className="map-container">
              {/* Simplified map representation */}
              <div className="map-background">
                {serviceAreas
                  .filter(area => area.active)
                  .map(area => (
                    <div 
                      key={area.id}
                      className={`map-area ${area.type}`}
                      style={{
                        left: `${((area.center?.lng || 0) + 180) / 360 * 100}%`,
                        top: `${(90 - (area.center?.lat || 0)) / 180 * 100}%`,
                        width: area.radius ? `${area.radius * 2}px` : '60px',
                        height: area.radius ? `${area.radius * 2}px` : '60px'
                      }}
                      title={area.name}
                    />
                  ))}
                <div 
                  className="current-location"
                  style={{
                    left: `${((currentLocation.lng || 0) + 180) / 360 * 100}%`,
                    top: `${(90 - (currentLocation.lat || 0)) / 180 * 100}%`
                  }}
                  title="Your Location"
                />
              </div>
            </div>
            
            <div className="map-legend">
              <div className="legend-item">
                <div className="legend-color" style={{ background: '#4caf50' }}></div>
                <span>Active Service Area</span>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{ background: '#ff9800' }}></div>
                <span>Your Location</span>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{ background: '#f44336' }}></div>
                <span>Outside Service Area</span>
              </div>
            </div>
          </div>
          
          <div className="map-stats">
            <div className="map-stat">
              <FaMapMarkerAlt />
              <div>
                <strong>{serviceAreas.filter(a => a.active).length}</strong>
                <span>Active Areas</span>
              </div>
            </div>
            <div className="map-stat">
              <FaRulerCombined />
              <div>
                <strong>{stats.totalCoverage}%</strong>
                <span>City Coverage</span>
              </div>
            </div>
            <div className="map-stat">
              <FaCar />
              <div>
                <strong>15-45 min</strong>
                <span>Avg. Travel Time</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Service Areas List */}
      <div className="provider-card">
        <div className="card-header">
          <h3 className="card-title">Service Areas ({serviceAreas.length})</h3>
          <p className="card-subtitle">Manage your service coverage zones</p>
        </div>

        <div className="service-areas-list">
          {serviceAreas.map(area => {
            const locationStatus = checkLocationInArea(currentLocation.lat, currentLocation.lng);
            const isInArea = locationStatus?.id === area.id;

            return (
              <div key={area.id} className={`service-area-item ${area.active ? 'active' : 'inactive'}`}>
                <div className="area-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div className="area-icon">
                      <FaMapMarkerAlt />
                    </div>
                    <div>
                      <h4 style={{ margin: 0 }}>{area.name}</h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.3rem' }}>
                        <span className="area-type">{area.type}</span>
                        {isInArea && area.active && (
                          <span className="in-area-badge">
                            <FaLocationArrow /> You're in this area
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="area-status">
                    <button 
                      className={`status-toggle ${area.active ? 'active' : 'inactive'}`}
                      onClick={() => handleToggleAreaStatus(area.id)}
                    >
                      {area.active ? 'Active' : 'Inactive'}
                    </button>
                  </div>
                </div>

                <div className="area-details">
                  <div className="detail-row">
                    <div className="detail-item">
                      <FaMapMarkerAlt />
                      <div>
                        <strong>Location</strong>
                        <span>{area.address}</span>
                      </div>
                    </div>
                    
                    {area.type === 'radius' && (
                      <div className="detail-item">
                        <FaRulerCombined />
                        <div>
                          <strong>Radius</strong>
                          <span>{area.radius} {area.radiusUnit}</span>
                        </div>
                      </div>
                    )}
                    
                    <div className="detail-item">
                      <FaRoad />
                      <div>
                        <strong>Travel Time</strong>
                        <span>{area.estimatedTravelTime}</span>
                      </div>
                    </div>
                  </div>

                  <div className="detail-row">
                    <div className="detail-item">
                      <FaClock />
                      <div>
                        <strong>Coverage</strong>
                        <div className="coverage-bar">
                          <div 
                            className="coverage-fill"
                            style={{ width: `${area.coverage}%` }}
                          />
                          <span className="coverage-text">{area.coverage}%</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="detail-item">
                      <FaMap />
                      <div>
                        <strong>Price Adjustment</strong>
                        <span className={`price-adjustment ${area.priceAdjustment > 0 ? 'positive' : area.priceAdjustment < 0 ? 'negative' : 'neutral'}`}>
                          {area.priceAdjustment > 0 ? '+' : ''}{area.priceAdjustment ? `₦${area.priceAdjustment.toLocaleString()}` : 'None'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {area.description && (
                    <div className="area-description">
                      <p style={{ margin: 0 }}>{area.description}</p>
                    </div>
                  )}
                </div>

                <div className="area-actions">
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      className="btn-secondary"
                      onClick={() => handleEditArea(area)}
                    >
                      <FaEdit /> Edit
                    </button>
                    <button 
                      className="btn-secondary"
                      onClick={() => {
                        if (window.confirm('Delete this service area?')) {
                          setServiceAreas(serviceAreas.filter(a => a.id !== area.id));
                        }
                      }}
                      style={{ background: '#f44336', color: 'white' }}
                    >
                      <FaTrash /> Delete
                    </button>
                  </div>
                  
                  <div className="area-meta">
                    {area.active ? (
                      <span className="meta-badge active">
                        <FaCheckCircle /> Accepting bookings
                      </span>
                    ) : (
                      <span className="meta-badge inactive">
                        <FaTimesCircle /> Not accepting bookings
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Test Location Check */}
      <div className="provider-card" style={{ marginTop: '2rem' }}>
        <div className="card-header">
          <h3 className="card-title">Test Service Availability</h3>
        </div>
        
        <div className="test-location">
          <div className="test-form">
            <div className="form-group">
              <label className="form-label">Check if you service a location</label>
              <div className="location-input-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter an address or coordinates"
                  defaultValue="Lagos, Nigeria"
                />
                <button className="btn-primary">
                  <FaLocationArrow /> Check
                </button>
              </div>
            </div>
          </div>
          
          <div className="test-result">
            <div className="result-header">
              <FaMapMarkerAlt />
              <div>
                <h4 style={{ margin: 0 }}>Lagos, Nigeria</h4>
                <p style={{ margin: '0.3rem 0 0', color: '#666' }}>
                  6.5244° N, 3.3792° E
                </p>
              </div>
            </div>
            
            <div className="result-details">
              <div className="result-item">
                <strong>Service Available:</strong>
                <span className="result-badge available">
                  <FaCheckCircle /> Yes
                </span>
              </div>
              <div className="result-item">
                <strong>Service Area:</strong>
                <span>Lagos Mainland</span>
              </div>
              <div className="result-item">
                <strong>Price Adjustment:</strong>
                <span>No additional charge</span>
              </div>
              <div className="result-item">
                <strong>Estimated Travel:</strong>
                <span>30-45 minutes</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '700px' }}>
            <div className="modal-header">
              <h3>{selectedArea ? 'Edit Service Area' : 'Add New Service Area'}</h3>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>×</button>
            </div>

            <div className="modal-body">
              <div className="provider-grid">
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Area Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newArea.name}
                    onChange={(e) => setNewArea({...newArea, name: e.target.value})}
                    placeholder="e.g., Lagos Mainland, Ikeja Zone"
                  />
                </div>

                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Address *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newArea.address}
                    onChange={(e) => setNewArea({...newArea, address: e.target.value})}
                    placeholder="Full address of the area center"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Area Type</label>
                  <select
                    className="form-control"
                    value={newArea.type}
                    onChange={(e) => setNewArea({...newArea, type: e.target.value})}
                  >
                    <option value="radius">Radius (Circular)</option>
                    <option value="custom">Custom Polygon</option>
                  </select>
                </div>

                {newArea.type === 'radius' && (
                  <>
                    <div className="form-group">
                      <label className="form-label">Center Latitude</label>
                      <div className="input-with-action">
                        <input
                          type="number"
                          step="any"
                          className="form-control"
                          value={newArea.centerLat}
                          onChange={(e) => setNewArea({...newArea, centerLat: e.target.value})}
                          placeholder="e.g., 6.5244"
                        />
                        <button 
                          className="input-action-btn"
                          onClick={handleUseCurrentLocation}
                          title="Use current location"
                        >
                          <FaLocationArrow />
                        </button>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Center Longitude</label>
                      <input
                        type="number"
                        step="any"
                        className="form-control"
                        value={newArea.centerLng}
                        onChange={(e) => setNewArea({...newArea, centerLng: e.target.value})}
                        placeholder="e.g., 3.3792"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Radius</label>
                      <div className="input-with-unit">
                        <input
                          type="number"
                          className="form-control"
                          value={newArea.radius}
                          onChange={(e) => setNewArea({...newArea, radius: e.target.value})}
                          placeholder="10"
                        />
                        <select
                          className="unit-select"
                          value={newArea.radiusUnit}
                          onChange={(e) => setNewArea({...newArea, radiusUnit: e.target.value})}
                        >
                          <option value="km">km</option>
                          <option value="mi">miles</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}

                <div className="form-group">
                  <label className="form-label">Price Adjustment</label>
                  <div className="input-with-prefix">
                    <span className="input-prefix">₦</span>
                    <input
                      type="number"
                      className="form-control"
                      value={newArea.priceAdjustment}
                      onChange={(e) => setNewArea({...newArea, priceAdjustment: e.target.value})}
                      placeholder="0"
                    />
                  </div>
                  <small className="form-text">
                    Additional charge or discount for this area
                  </small>
                </div>

                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={newArea.description}
                    onChange={(e) => setNewArea({...newArea, description: e.target.value})}
                    placeholder="Describe this service area..."
                  />
                </div>

                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="checkbox"
                      checked={newArea.active}
                      onChange={(e) => setNewArea({...newArea, active: e.target.checked})}
                    />
                    <span>Active (Accepting bookings)</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowAddModal(false)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleSaveArea}>
                <FaSave style={{ marginRight: '0.5rem' }} />
                {selectedArea ? 'Update Area' : 'Add Area'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .map-preview {
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 8px;
          margin-bottom: 1rem;
        }
        
        .map-container {
          height: 400px;
          background: #e3f2fd;
          border-radius: 8px;
          position: relative;
          overflow: hidden;
          margin-bottom: 1rem;
        }
        
        .map-background {
          width: 100%;
          height: 100%;
          position: relative;
          background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
        }
        
        .map-area {
          position: absolute;
          border-radius: 50%;
          background: rgba(76, 175, 80, 0.3);
          border: 2px solid #4caf50;
          transform: translate(-50%, -50%);
        }
        
        .map-area.radius {
          background: rgba(33, 150, 243, 0.3);
          border-color: #2196f3;
        }
        
        .map-area.custom {
          background: rgba(156, 39, 176, 0.3);
          border-color: #9c27b0;
          border-radius: 4px;
        }
        
        .current-location {
          position: absolute;
          width: 12px;
          height: 12px;
          background: #ff9800;
          border: 2px solid white;
          border-radius: 50%;
          transform: translate(-50%, -50%);
          box-shadow: 0 0 10px rgba(0,0,0,0.3);
        }
        
        .map-legend {
          display: flex;
          gap: 2rem;
          flex-wrap: wrap;
          padding: 1rem;
          background: white;
          border-radius: 8px;
          border: 1px solid #e0e0e0;
        }
        
        .legend-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .legend-color {
          width: 20px;
          height: 20px;
          border-radius: 4px;
        }
        
        .map-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-top: 1rem;
        }
        
        .map-stat {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: white;
          border-radius: 8px;
          border: 1px solid #e0e0e0;
        }
        
        .map-stat svg {
          font-size: 2rem;
          color: #1a237e;
        }
        
        .map-type-btn {
          padding: 0.5rem 1rem;
          border: 1px solid #ddd;
          background: white;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .map-type-btn.active {
          background: #1a237e;
          color: white;
          border-color: #1a237e;
        }
        
        .service-areas-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        
        .service-area-item {
          padding: 1.5rem;
          border: 2px solid #e0e0e0;
          border-radius: 12px;
          transition: all 0.3s ease;
        }
        
        .service-area-item.active {
          border-color: #4caf50;
          background: linear-gradient(135deg, #f1f8e9 0%, #e8f5e9 100%);
        }
        
        .service-area-item.inactive {
          border-color: #f5f5f5;
          background: #fafafa;
          opacity: 0.8;
        }
        
        .area-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        
        .area-icon {
          width: 50px;
          height: 50px;
          background: #1a237e;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
        }
        
        .area-type {
          background: #e8f0fe;
          color: #1a237e;
          padding: 0.3rem 0.8rem;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: capitalize;
        }
        
        .in-area-badge {
          background: #4caf50;
          color: white;
          padding: 0.3rem 0.8rem;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }
        
        .area-details {
          margin: 1.5rem 0;
        }
        
        .detail-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 1.5rem;
        }
        
        .detail-item {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
        }
        
        .detail-item svg {
          color: #1a237e;
          font-size: 1.2rem;
          margin-top: 0.2rem;
        }
        
        .detail-item div {
          flex: 1;
        }
        
        .detail-item strong {
          display: block;
          margin-bottom: 0.3rem;
          color: #333;
        }
        
        .detail-item span {
          color: #666;
        }
        
        .coverage-bar {
          height: 8px;
          background: #e0e0e0;
          border-radius: 4px;
          position: relative;
          margin-top: 0.5rem;
        }
        
        .coverage-fill {
          height: 100%;
          background: linear-gradient(135deg, #4caf50 0%, #8bc34a 100%);
          border-radius: 4px;
          transition: width 0.3s ease;
        }
        
        .coverage-text {
          position: absolute;
          right: 0;
          top: -20px;
          font-size: 0.8rem;
          font-weight: 600;
          color: #333;
        }
        
        .price-adjustment {
          font-weight: 600;
          font-size: 1.1rem;
        }
        
        .price-adjustment.positive {
          color: #4caf50;
        }
        
        .price-adjustment.negative {
          color: #f44336;
        }
        
        .price-adjustment.neutral {
          color: #666;
        }
        
        .area-description {
          padding: 1rem;
          background: white;
          border-radius: 8px;
          border-left: 4px solid #1a237e;
          margin-top: 1rem;
        }
        
        .area-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 1rem;
          border-top: 1px solid #e0e0e0;
        }
        
        .meta-badge {
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.9rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .meta-badge.active {
          background: #e8f5e9;
          color: #2e7d32;
        }
        
        .meta-badge.inactive {
          background: #f5f5f5;
          color: #757575;
        }
        
        .test-location {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        
        .location-input-group {
          display: flex;
          gap: 0.5rem;
        }
        
        .location-input-group .form-control {
          flex: 1;
        }
        
        .test-result {
          padding: 1.5rem;
          background: #f8f9fa;
          border-radius: 12px;
          border: 1px solid #e0e0e0;
        }
        
        .result-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        
        .result-header svg {
          font-size: 2rem;
          color: #1a237e;
        }
        
        .result-details {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
        }
        
        .result-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.8rem;
          background: white;
          border-radius: 8px;
          border: 1px solid #e0e0e0;
        }
        
        .result-badge {
          padding: 0.3rem 0.8rem;
          border-radius: 12px;
          font-size: 0.9rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }
        
        .result-badge.available {
          background: #e8f5e9;
          color: #2e7d32;
        }
        
        .input-with-action {
          position: relative;
        }
        
        .input-action-btn {
          position: absolute;
          right: 0.5rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #666;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .input-action-btn:hover {
          color: #1a237e;
        }
        
        .input-with-unit {
          display: flex;
          gap: 0.5rem;
        }
        
        .input-with-unit .form-control {
          flex: 1;
        }
        
        .unit-select {
          width: 80px;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 0.8rem;
          background: white;
        }
        
        .input-with-prefix {
          position: relative;
        }
        
        .input-prefix {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: #666;
          font-weight: 600;
        }
        
        .input-with-prefix .form-control {
          padding-left: 2.5rem;
        }
        
        @media (max-width: 768px) {
          .detail-row {
            grid-template-columns: 1fr;
          }
          
          .area-header {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
          }
          
          .area-actions {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
          }
          
          .location-input-group {
            flex-direction: column;
          }
          
          .map-stats {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </ProviderPageTemplate>
  );
};

export default ProviderLocationSetup;