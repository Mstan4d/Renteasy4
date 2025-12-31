// src/modules/properties/components/steps/LocationStep.jsx
import React, { useState, useCallback } from 'react';
import { MapPin, Navigation, Search, AlertCircle } from 'lucide-react';
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';
import './LocationStep.css';

// Google Maps configuration
const mapContainerStyle = {
  width: '100%',
  height: '300px',
  borderRadius: '8px'
};

const defaultCenter = {
  lat: 9.081999, // Nigeria center coordinates
  lng: 8.675277
};

const LocationStep = ({ formData, updateFormData }) => {
  const [map, setMap] = useState(null);
  const [autocomplete, setAutocomplete] = useState(null);
  const [isGeolocating, setIsGeolocating] = useState(false);
  const [showMapInstructions, setShowMapInstructions] = useState(false);

  // Get API key from environment
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  // Only load Google Maps if API key exists
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: googleMapsApiKey || '',
    libraries: ['places']
  });

  // Nigerian states and LGAs
  const nigerianStates = [
    { value: 'abuja', label: 'Abuja (FCT)' },
    { value: 'lagos', label: 'Lagos' },
    { value: 'rivers', label: 'Rivers' },
    { value: 'oyo', label: 'Oyo' },
    { value: 'kano', label: 'Kano' },
    { value: 'edo', label: 'Edo' },
    { value: 'delta', label: 'Delta' },
    { value: 'ogun', label: 'Ogun' },
    { value: 'ondo', label: 'Ondo' },
    { value: 'enugu', label: 'Enugu' },
    { value: 'akwa-ibom', label: 'Akwa Ibom' },
    { value: 'cross-river', label: 'Cross River' },
    { value: 'others', label: 'Others' }
  ];

  // LGAs based on selected state (simplified)
  const getLGAs = (state) => {
    const lgas = {
      'lagos': ['Lekki', 'Ikeja', 'Victoria Island', 'Surulere', 'Yaba', 'Apapa', 'Others'],
      'abuja': ['Garki', 'Wuse', 'Maitama', 'Asokoro', 'Gwarinpa', 'Kubwa', 'Others'],
      'rivers': ['Port Harcourt', 'Obio/Akpor', 'Ikwerre', 'Etche', 'Others'],
      'others': ['Select LGA first']
    };
    return lgas[state] || lgas['others'];
  };

  // Handle map load
  const onMapLoad = useCallback((map) => {
    setMap(map);
  }, []);

  // Handle address search via Places Autocomplete
  const onLoadAutocomplete = (autocomplete) => {
    setAutocomplete(autocomplete);
  };

  const onPlaceChanged = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      if (place.geometry) {
        const location = place.geometry.location;
        const lat = location.lat();
        const lng = location.lng();
        
        updateFormData({
          address: place.formatted_address,
          coordinates: { lat, lng }
        });

        // Move map to location
        if (map) {
          map.panTo({ lat, lng });
          map.setZoom(15);
        }
      }
    }
  };

  // Use browser geolocation
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setIsGeolocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        updateFormData({
          coordinates: { lat, lng }
        });

        // Reverse geocode to get address
        if (window.google && window.google.maps) {
          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode({ location: { lat, lng } }, (results, status) => {
            if (status === 'OK' && results[0]) {
              updateFormData({
                address: results[0].formatted_address
              });
            }
          });
        }

        if (map) {
          map.panTo({ lat, lng });
          map.setZoom(15);
        }
        
        setIsGeolocating(false);
      },
      (error) => {
        alert('Unable to retrieve your location');
        console.error('Geolocation error:', error);
        setIsGeolocating(false);
      }
    );
  };

  // Handle manual coordinate input
  const handleCoordinateChange = (field, value) => {
    const coordinates = { ...formData.coordinates, [field]: parseFloat(value) || 0 };
    updateFormData({ coordinates });
    
    if (map && coordinates.lat && coordinates.lng) {
      map.panTo(coordinates);
    }
  };

  // Handle marker drag
  const onMarkerDragEnd = (event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    
    updateFormData({
      coordinates: { lat, lng }
    });

    // Reverse geocode new location
    if (window.google && window.google.maps) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results[0]) {
          updateFormData({
            address: results[0].formatted_address
          });
        }
      });
    }
  };

  // Show map instructions
  const showMapSetupInstructions = () => {
    setShowMapInstructions(true);
  };

  // If no API key, show instructions
  if (!googleMapsApiKey) {
    return (
      <div className="location-step">
        <div className="step-header">
          <h2>Location Details</h2>
          <p className="step-description">
            Provide the exact location of the property. This helps potential tenants find and visit the property.
          </p>
        </div>

        <div className="form-grid">
          {/* Address Input */}
          <div className="form-group full-width">
            <label htmlFor="address">
              <MapPin size={16} />
              Full Address *
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={(e) => updateFormData({ address: e.target.value })}
              placeholder="Enter full address (e.g., 123 Main Street, Lekki, Lagos)"
              required
            />
          </div>

          {/* State Selection */}
          <div className="form-group">
            <label htmlFor="state">State *</label>
            <select
              id="state"
              name="state"
              value={formData.state}
              onChange={(e) => updateFormData({ state: e.target.value, lga: '' })}
              required
            >
              <option value="">Select State</option>
              {nigerianStates.map(state => (
                <option key={state.value} value={state.value}>
                  {state.label}
                </option>
              ))}
            </select>
          </div>

          {/* LGA Selection */}
          <div className="form-group">
            <label htmlFor="lga">LGA / Local Council *</label>
            <select
              id="lga"
              name="lga"
              value={formData.lga}
              onChange={(e) => updateFormData({ lga: e.target.value })}
              disabled={!formData.state}
              required
            >
              <option value="">Select LGA</option>
              {formData.state && getLGAs(formData.state).map(lga => (
                <option key={lga} value={lga.toLowerCase()}>
                  {lga}
                </option>
              ))}
            </select>
            {!formData.state && (
              <small className="help-text">Select a state first</small>
            )}
          </div>

          {/* Coordinates */}
          <div className="form-group">
            <label htmlFor="latitude">Latitude</label>
            <input
              type="number"
              id="latitude"
              name="latitude"
              value={formData.coordinates?.lat || ''}
              onChange={(e) => handleCoordinateChange('lat', e.target.value)}
              placeholder="e.g., 9.081999"
              step="0.000001"
            />
          </div>

          <div className="form-group">
            <label htmlFor="longitude">Longitude</label>
            <input
              type="number"
              id="longitude"
              name="longitude"
              value={formData.coordinates?.lng || ''}
              onChange={(e) => handleCoordinateChange('lng', e.target.value)}
              placeholder="e.g., 8.675277"
              step="0.000001"
            />
          </div>
        </div>

        {/* Map Instructions */}
        <div className="map-instructions-container">
          <div className="map-instruction-header">
            <AlertCircle size={24} className="instruction-icon" />
            <h3>Google Maps Integration</h3>
          </div>
          <p>
            To enable interactive maps and location search, you need to set up a Google Maps API key.
          </p>
          
          <div className="instruction-steps">
            <h4>Setup Instructions:</h4>
            <ol>
              <li>Go to <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer">Google Cloud Console</a></li>
              <li>Create a new project or select existing one</li>
              <li>Enable "Maps JavaScript API" and "Places API"</li>
              <li>Create an API key</li>
              <li>Add to your .env file as: <code>VITE_GOOGLE_MAPS_API_KEY=your_key_here</code></li>
              <li>Restart your development server</li>
            </ol>
          </div>
          
          <div className="map-fallback-note">
            <p>
              <strong>Note:</strong> You can still post properties without Google Maps by manually entering the address and coordinates.
              The location will still be displayed to potential tenants.
            </p>
          </div>
        </div>

        {/* Location Notes */}
        <div className="location-notes">
          <h4>Location Guidelines:</h4>
          <ul>
            <li>Provide exact address for easy property inspection</li>
            <li>Use landmarks if street address is not available</li>
            <li>Ensure location is accessible for potential tenants</li>
            <li>Accurate location reduces disputes and improves trust</li>
          </ul>
        </div>
      </div>
    );
  }

  // If there's a load error
  if (loadError) {
    return (
      <div className="map-error">
        <AlertCircle size={24} />
        <h3>Unable to load Google Maps</h3>
        <p>Please check your API key configuration.</p>
        <p>You can still enter location details manually.</p>
      </div>
    );
  }

  return (
    <div className="location-step">
      <div className="step-header">
        <h2>Location Details</h2>
        <p className="step-description">
          Provide the exact location of the property. This helps potential tenants find and visit the property.
        </p>
      </div>

      <div className="form-grid">
        {/* Address Input */}
        <div className="form-group full-width">
          <label htmlFor="address">
            <MapPin size={16} />
            Full Address *
          </label>
          <div className="search-container">
            {isLoaded && (
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={(e) => updateFormData({ address: e.target.value })}
                placeholder="Enter full address or search..."
                ref={(input) => {
                  if (input && isLoaded) {
                    const autocomplete = new window.google.maps.places.Autocomplete(input, {
                      types: ['address'],
                      componentRestrictions: { country: 'ng' }
                    });
                    autocomplete.addListener('place_changed', onPlaceChanged);
                  }
                }}
              />
            )}
            <Search className="search-icon" size={18} />
          </div>
        </div>

        {/* State Selection */}
        <div className="form-group">
          <label htmlFor="state">State *</label>
          <select
            id="state"
            name="state"
            value={formData.state}
            onChange={(e) => updateFormData({ state: e.target.value, lga: '' })}
            required
          >
            <option value="">Select State</option>
            {nigerianStates.map(state => (
              <option key={state.value} value={state.value}>
                {state.label}
              </option>
            ))}
          </select>
        </div>

        {/* LGA Selection */}
        <div className="form-group">
          <label htmlFor="lga">LGA / Local Council *</label>
          <select
            id="lga"
            name="lga"
            value={formData.lga}
            onChange={(e) => updateFormData({ lga: e.target.value })}
            disabled={!formData.state}
            required
          >
            <option value="">Select LGA</option>
            {formData.state && getLGAs(formData.state).map(lga => (
              <option key={lga} value={lga.toLowerCase()}>
                {lga}
              </option>
            ))}
          </select>
          {!formData.state && (
            <small className="help-text">Select a state first</small>
          )}
        </div>

        {/* Coordinates */}
        <div className="form-group">
          <label htmlFor="latitude">Latitude</label>
          <input
            type="number"
            id="latitude"
            name="latitude"
            value={formData.coordinates?.lat || ''}
            onChange={(e) => handleCoordinateChange('lat', e.target.value)}
            placeholder="e.g., 9.081999"
            step="0.000001"
          />
        </div>

        <div className="form-group">
          <label htmlFor="longitude">Longitude</label>
          <input
            type="number"
            id="longitude"
            name="longitude"
            value={formData.coordinates?.lng || ''}
            onChange={(e) => handleCoordinateChange('lng', e.target.value)}
            placeholder="e.g., 8.675277"
            step="0.000001"
          />
        </div>
      </div>

      {/* Map Container */}
      <div className="map-container">
        <div className="map-header">
          <h3>
            <MapPin size={18} />
            Property Location Map
          </h3>
          <button
            type="button"
            className="btn btn-outline"
            onClick={getCurrentLocation}
            disabled={isGeolocating || !isLoaded}
          >
            <Navigation size={16} />
            {isGeolocating ? 'Detecting...' : 'Use My Location'}
          </button>
        </div>
        
        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            zoom={formData.coordinates?.lat ? 15 : 6}
            center={formData.coordinates?.lat ? formData.coordinates : defaultCenter}
            onLoad={onMapLoad}
            options={{
              streetViewControl: false,
              mapTypeControl: false,
              fullscreenControl: false
            }}
          >
            {formData.coordinates?.lat && (
              <Marker
                position={formData.coordinates}
                draggable={true}
                onDragEnd={onMarkerDragEnd}
                title="Property Location"
              />
            )}
          </GoogleMap>
        ) : (
          <div className="map-placeholder">
            <div className="loading-spinner"></div>
            <p>Loading map...</p>
          </div>
        )}
        
        <div className="map-instructions">
          <p>
            <strong>Instructions:</strong> 
            Drag the marker to adjust location, or search for address above.
            Coordinates will update automatically.
          </p>
        </div>
      </div>

      {/* Location Notes */}
      <div className="location-notes">
        <h4>Location Guidelines:</h4>
        <ul>
          <li>Provide exact address for easy property inspection</li>
          <li>Use landmarks if street address is not available</li>
          <li>Ensure location is accessible for potential tenants</li>
          <li>Accurate location reduces disputes and improves trust</li>
        </ul>
      </div>
    </div>
  );
};

export default LocationStep;