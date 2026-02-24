// src/modules/manager/pages/ManagerRadius.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../shared/context/AuthContext'
import './ManagerRadius.css'

const ManagerRadius = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  
  const [radius, setRadius] = useState(1) // Default 1km
  const [selectedAreas, setSelectedAreas] = useState([])
  const [availableStates, setAvailableStates] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [mapLocation, setMapLocation] = useState(null)

  // Nigerian states and LGAs
  const nigerianStates = [
    {
      name: 'Lagos',
      lgas: ['Ikeja', 'Agege', 'Alimosho', 'Amuwo-Odofin', 'Apapa', 'Badagry', 'Epe', 'Eti-Osa', 'Ibeju-Lekki', 'Ifako-Ijaiye', 'Ikorodu', 'Kosofe', 'Lagos Island', 'Lagos Mainland', 'Mushin', 'Ojo', 'Oshodi-Isolo', 'Shomolu', 'Surulere']
    },
    {
      name: 'Abuja',
      lgas: ['Abuja Municipal', 'Bwari', 'Gwagwalada', 'Kuje', 'Kwali', 'Abaji']
    },
    {
      name: 'Rivers',
      lgas: ['Port Harcourt', 'Obio-Akpor', 'Okrika', 'Ogu–Bolo', 'Eleme', 'Tai', 'Gokana', 'Khana', 'Oyigbo', 'Opobo–Nkoro', 'Andoni', 'Bonny', 'Degema', 'Asari-Toru', 'Akuku-Toru', 'Abua–Odual', 'Ahoada East', 'Ahoada West', 'Ogba–Egbema–Ndoni', 'Emohua', 'Ikwerre', 'Etche', 'Omuma']
    },
    {
      name: 'Oyo',
      lgas: ['Ibadan North', 'Ibadan North-East', 'Ibadan North-West', 'Ibadan South-East', 'Ibadan South-West', 'Akinyele', 'Egbeda', 'Lagelu', 'Oluyole', 'Ona Ara', 'Ido', 'Afijio', 'Atiba', 'Atisbo', 'Saki East', 'Saki West', 'Iseyin', 'Itesiwaju', 'Iwajowa', 'Kajola', 'Ogbomosho North', 'Ogbomosho South', 'Ogo Oluwa', 'Olorunsogo', 'Irepo', 'Ibarapa Central', 'Ibarapa East', 'Ibarapa North', 'Orelope', 'Ori Ire', 'Oyo East', 'Oyo West', 'Surulere']
    },
    {
      name: 'Kano',
      lgas: ['Dala', 'Fagge', 'Gabasawa', 'Gaya', 'Gwale', 'Kano Municipal', 'Kumbotso', 'Kura', 'Madobi', 'Minjibir', 'Nasarawa', 'Rano', 'Rimin Gado', 'Tarauni', 'Tofa', 'Tsanyawa', 'Ungogo', 'Warawa', 'Wudil']
    }
  ]

  useEffect(() => {
    loadManagerSettings()
  }, [])

  const loadManagerSettings = () => {
    // Load manager settings from localStorage
    const managers = JSON.parse(localStorage.getItem('managers') || '[]')
    const managerSettings = managers.find(m => m.userId === user.id)
    
    if (managerSettings) {
      setRadius(managerSettings.radius || 1)
      setSelectedAreas(managerSettings.areas || [])
      setMapLocation(managerSettings.location || null)
    }
    
    // Set available states
    setAvailableStates(nigerianStates)
    setLoading(false)
  }

  const handleRadiusChange = (value) => {
    setRadius(parseInt(value))
  }

  const toggleArea = (state, lga) => {
    const areaId = `${state}-${lga}`
    setSelectedAreas(prev => {
      if (prev.some(a => a.id === areaId)) {
        return prev.filter(a => a.id !== areaId)
      } else {
        return [...prev, { id: areaId, state, lga }]
      }
    })
  }

  const isAreaSelected = (state, lga) => {
    const areaId = `${state}-${lga}`
    return selectedAreas.some(a => a.id === areaId)
  }

  const handleSaveSettings = async () => {
  setSaving(true);

  const { error } = await supabase
    .from('profiles')
    .update({
      notification_radius_km: radius,
      preferred_lgas: selectedAreas.map(a => a.lga),
      // Update location if mapLocation exists
      last_location: mapLocation 
        ? `POINT(${mapLocation.lng} ${mapLocation.lat})` 
        : null
    })
    .eq('id', user.id);

  if (error) {
    alert("Error saving settings: " + error.message);
  } else {
    alert("✅ Settings synced to RentEasy Cloud!");
  }
  setSaving(false);
};

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            timestamp: new Date().toISOString()
          }
          setMapLocation(location)
          alert('📍 Location detected successfully!')
        },
        (error) => {
          alert('Unable to get location. Please enable location services.')
        }
      )
    } else {
      alert('Geolocation is not supported by your browser.')
    }
  }

  const calculateCoverage = () => {
    // Each LGA counts as coverage
    return selectedAreas.length
  }

  const getNotificationEstimate = () => {
    // Rough estimate: 5-20 listings per LGA per month
    const baseEstimate = selectedAreas.length * 10
    const radiusMultiplier = radius * 1.5
    return Math.floor(baseEstimate * radiusMultiplier)
  }

  if (loading) {
    return <div className="loading">Loading settings...</div>
  }

  return (
    <div className="manager-radius">
      {/* HEADER */}
      <div className="page-header">
        <div>
          <h1>📍 Area & Radius Settings</h1>
          <p>Configure your coverage area for proximity notifications</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/dashboard/manager')}
        >
          Back to Dashboard
        </button>
      </div>

      {/* SETTINGS SUMMARY */}
      <div className="settings-summary">
        <div className="summary-card">
          <div className="summary-icon">📍</div>
          <div className="summary-content">
            <div className="summary-label">Coverage Radius</div>
            <div className="summary-value">{radius} km</div>
            <div className="summary-sub">From your location</div>
          </div>
        </div>
        
        <div className="summary-card">
          <div className="summary-icon">🏙️</div>
          <div className="summary-content">
            <div className="summary-label">Selected Areas</div>
            <div className="summary-value">{selectedAreas.length} LGAs</div>
            <div className="summary-sub">{calculateCoverage()} areas covered</div>
          </div>
        </div>
        
        <div className="summary-card">
          <div className="summary-icon">🔔</div>
          <div className="summary-content">
            <div className="summary-label">Monthly Estimate</div>
            <div className="summary-value">~{getNotificationEstimate()} listings</div>
            <div className="summary-sub">Based on your settings</div>
          </div>
        </div>
        
        <div className="summary-card">
          <div className="summary-icon">💰</div>
          <div className="summary-content">
            <div className="summary-label">Potential Earnings</div>
            <div className="summary-value">
              ₦{(getNotificationEstimate() * 50000).toLocaleString()}
            </div>
            <div className="summary-sub">Monthly estimate</div>
          </div>
        </div>
      </div>

      {/* SETTINGS CONFIGURATION */}
      <div className="settings-configuration">
        {/* RADIUS SETTING */}
        <div className="config-section radius">
          <div className="section-header">
            <h3>📏 Notification Radius</h3>
            <p>Set how far from your location you want to receive notifications</p>
          </div>
          
          <div className="radius-slider">
            <input
              type="range"
              min="1"
              max="10"
              step="0.5"
              value={radius}
              onChange={(e) => handleRadiusChange(e.target.value)}
              className="slider"
            />
            <div className="slider-labels">
              <span>1km</span>
              <span>5km</span>
              <span>10km</span>
            </div>
            <div className="radius-display">
              <span className="radius-value">{radius} km</span>
              <span className="radius-info">Proximity radius</span>
            </div>
          </div>
          
          <div className="radius-info-cards">
            <div className="info-card">
              <div className="card-icon">📍</div>
              <div className="card-content">
                <strong>1-2 km</strong>
                <p>Close proximity, immediate notifications</p>
              </div>
            </div>
            <div className="info-card">
              <div className="card-icon">🚗</div>
              <div className="card-content">
                <strong>3-5 km</strong>
                <p>Moderate distance, good coverage</p>
              </div>
            </div>
            <div className="info-card">
              <div className="card-icon">🗺️</div>
              <div className="card-content">
                <strong>6-10 km</strong>
                <p>Wide coverage, more opportunities</p>
              </div>
            </div>
          </div>
        </div>

        {/* AREA SELECTION */}
        <div className="config-section areas">
          <div className="section-header">
            <h3>🏙️ Select Areas</h3>
            <p>Choose specific LGAs where you want to operate</p>
          </div>
          
          <div className="areas-selection">
            <div className="states-list">
              {availableStates.map(state => (
                <div key={state.name} className="state-section">
                  <div className="state-header">
                    <h4>{state.name}</h4>
                    <button 
                      className="btn-select-all"
                      onClick={() => {
                        const allSelected = state.lgas.every(lga => 
                          isAreaSelected(state.name, lga)
                        )
                        
                        if (allSelected) {
                          // Deselect all
                          setSelectedAreas(prev => 
                            prev.filter(area => area.state !== state.name)
                          )
                        } else {
                          // Select all
                          const newAreas = state.lgas.map(lga => ({
                            id: `${state.name}-${lga}`,
                            state: state.name,
                            lga
                          }))
                          setSelectedAreas(prev => [
                            ...prev.filter(area => area.state !== state.name),
                            ...newAreas
                          ])
                        }
                      }}
                    >
                      {state.lgas.every(lga => isAreaSelected(state.name, lga)) 
                        ? 'Deselect All' 
                        : 'Select All'}
                    </button>
                  </div>
                  
                  <div className="lgas-grid">
                    {state.lgas.map(lga => (
                      <button
                        key={lga}
                        className={`lga-btn ${isAreaSelected(state.name, lga) ? 'selected' : ''}`}
                        onClick={() => toggleArea(state.name, lga)}
                      >
                        {lga}
                        {isAreaSelected(state.name, lga) && (
                          <span className="selected-icon">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="selected-areas-preview">
              <div className="preview-header">
                <h4>Selected Areas ({selectedAreas.length})</h4>
                {selectedAreas.length > 0 && (
                  <button 
                    className="btn-clear"
                    onClick={() => setSelectedAreas([])}
                  >
                    Clear All
                  </button>
                )}
              </div>
              
              {selectedAreas.length === 0 ? (
                <div className="empty-selection">
                  <div className="empty-icon">🗺️</div>
                  <p>No areas selected</p>
                  <small>Select LGAs to receive notifications</small>
                </div>
              ) : (
                <div className="selected-list">
                  {selectedAreas.map(area => (
                    <div key={area.id} className="selected-area">
                      <span className="area-name">{area.lga}</span>
                      <span className="area-state">{area.state}</span>
                      <button 
                        className="btn-remove"
                        onClick={() => toggleArea(area.state, area.lga)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="coverage-info">
                <div className="info-item">
                  <span className="label">Total Coverage:</span>
                  <span className="value">{calculateCoverage()} areas</span>
                </div>
                <div className="info-item">
                  <span className="label">Estimated Listings:</span>
                  <span className="value">~{getNotificationEstimate()}/month</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* LOCATION SETTINGS */}
        <div className="config-section location">
          <div className="section-header">
            <h3>📍 Your Location</h3>
            <p>Set your current location for accurate proximity calculations</p>
          </div>
          
          <div className="location-settings">
            <div className="location-actions">
              <button 
                className="btn btn-primary"
                onClick={getCurrentLocation}
              >
                📍 Use Current Location
              </button>
              <button 
                className="btn btn-outline"
                onClick={() => {
                  const lat = parseFloat(prompt('Enter latitude:'))
                  const lng = parseFloat(prompt('Enter longitude:'))
                  if (!isNaN(lat) && !isNaN(lng)) {
                    setMapLocation({ lat, lng })
                    alert('Location set manually')
                  }
                }}
              >
                📍 Set Manually
              </button>
            </div>
            
            {mapLocation && (
              <div className="location-display">
                <div className="location-info">
                  <div className="info-item">
                    <span className="label">Latitude:</span>
                    <span className="value">{mapLocation.lat.toFixed(6)}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Longitude:</span>
                    <span className="value">{mapLocation.lng.toFixed(6)}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Last Updated:</span>
                    <span className="value">
                      {new Date(mapLocation.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            <div className="location-note">
              <div className="note-icon">ℹ️</div>
              <div className="note-content">
                <strong>Note:</strong>
                <p>Your location is used to calculate distance to listings. 
                Enable location services for automatic updates or set manually.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SAVE BUTTON */}
      <div className="save-section">
        <div className="save-info">
          <div className="info-icon">💡</div>
          <div className="info-content">
            <strong>Optimization Tip</strong>
            <p>Select 3-5 LGAs close to your location for optimal notifications and manageable workload.</p>
          </div>
        </div>
        
        <button 
          className="btn btn-save"
          onClick={handleSaveSettings}
          disabled={saving}
        >
          {saving ? 'Saving...' : '💾 Save Settings'}
        </button>
      </div>

      {/* NOTIFICATION EXPLANATION */}
      <div className="notification-explanation">
        <h3>🔔 How Notifications Work</h3>
        <div className="explanation-grid">
          <div className="explanation-card">
            <div className="card-icon">📍</div>
            <div className="card-content">
              <h4>Proximity Based</h4>
              <p>You receive notifications for listings within your set radius from your location.</p>
            </div>
          </div>
          
          <div className="explanation-card">
            <div className="card-icon">🏃‍♂️</div>
            <div className="card-content">
              <h4>First Come, First Serve</h4>
              <p>First manager to accept a listing gets 2.5% commission.</p>
            </div>
          </div>
          
          <div className="explanation-card">
            <div className="card-icon">⏰</div>
            <div className="card-content">
              <h4>15-Minute Window</h4>
              <p>Notifications expire after 15 minutes if not accepted.</p>
            </div>
          </div>
          
          <div className="explanation-card">
            <div className="card-icon">💰</div>
            <div className="card-content">
              <h4>Commission Guaranteed</h4>
              <p>Once accepted, you're guaranteed 2.5% commission if property rents.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ManagerRadius