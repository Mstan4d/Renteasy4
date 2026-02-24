import React, { useState } from 'react';
import { MapPin, Navigation, AlertCircle, CheckCircle } from 'lucide-react';
import './LocationStep.css';

const LocationStep = ({ formData, updateFormData, onNext }) => {
  const [isGeolocating, setIsGeolocating] = useState(false);
  const [locationCaptured, setLocationCaptured] = useState(!!formData.coordinates?.lat);

  // States & LGAs logic remains same as your foundation document
  const nigerianStates = [
    { value: 'abuja', label: 'Abuja (FCT)' },
    { value: 'lagos', label: 'Lagos' },
    { value: 'rivers', label: 'Rivers' },
    // ... add others
  ];

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setIsGeolocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        
        // Save coordinates silently for the PostGIS POINT logic
        updateFormData({
          coordinates: { lat: latitude, lng: longitude }
        });

        // Use Google Reverse Geocoding to fill the address if available
        if (window.google && window.google.maps) {
          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode({ location: { lat: latitude, lng: longitude } }, (results, status) => {
            if (status === 'OK' && results[0]) {
              updateFormData({ address: results[0].formatted_address });
            }
          });
        }
        
        setIsGeolocating(false);
        setLocationCaptured(true);
      },
      (error) => {
        setIsGeolocating(false);
        alert('Could not detect location. Please type the address manually.');
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  return (
    <div className="location-step">
      <div className="step-header">
        <h2>Location Details</h2>
        <p className="step-description">
          We use your GPS to notify the nearest RentEasy Manager for verification.
        </p>
      </div>

      {/* PROMINENT GPS BUTTON */}
      <div className={`geo-card ${locationCaptured ? 'success' : ''}`}>
        <div className="geo-content">
          <Navigation size={28} className="geo-icon" />
          <div className="geo-text">
            <h4>{locationCaptured ? "GPS Coordinates Locked" : "Click to Pin Location"}</h4>
            <p>{locationCaptured ? "Manager will be notified of this exact spot." : "Required for 1.5% commission eligibility."}</p>
          </div>
        </div>
        <button 
          type="button" 
          className="btn-capture"
          onClick={getCurrentLocation}
          disabled={isGeolocating}
        >
          {isGeolocating ? "Locating..." : locationCaptured ? <CheckCircle size={20} /> : "Get Location"}
        </button>
      </div>

      <div className="form-grid">
        <div className="form-group full-width">
          <label htmlFor="address"><MapPin size={16} /> Full Address *</label>
          <input
            type="text"
            id="address"
            value={formData.address}
            onChange={(e) => updateFormData({ address: e.target.value })}
            placeholder="No 1. RentEasy Street, Lekki, Lagos"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="state">State *</label>
          <select
            id="state"
            value={formData.state}
            onChange={(e) => updateFormData({ state: e.target.value, lga: '' })}
            required
          >
            <option value="">Select State</option>
            {nigerianStates.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="lga">LGA *</label>
          <select
            id="lga"
            value={formData.lga}
            onChange={(e) => updateFormData({ lga: e.target.value })}
            disabled={!formData.state}
            required
          >
            <option value="">Select LGA</option>
            {/* Populate based on state as per your helper function */}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="city">City/Town *</label>
          <input
            type="text"
            value={formData.city}
            onChange={(e) => updateFormData({ city: e.target.value })}
            placeholder="e.g., Victoria Island"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="landmark">Landmark</label>
          <input
            type="text"
            value={formData.landmark}
            onChange={(e) => updateFormData({ landmark: e.target.value })}
            placeholder="e.g., Near Eko Hotel"
          />
        </div>
      </div>

      {!locationCaptured && (
        <div className="alert-banner">
          <AlertCircle size={18} />
          <span><b>Note:</b> Accurate GPS location helps managers verify your house faster.</span>
        </div>
      )}
    </div>
  );
};

export default LocationStep;