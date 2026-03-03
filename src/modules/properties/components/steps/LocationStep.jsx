// src/components/post-property/steps/LocationStep.jsx
import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../../../../shared/lib/supabaseClient';
import './LocationStep.css';

const LocationStep = ({ formData, updateFormData, onNext }) => {
  const [isGeolocating, setIsGeolocating] = useState(false);
  const [locationCaptured, setLocationCaptured] = useState(!!formData.coordinates?.lat);
  const [states, setStates] = useState([]);
  const [lgas, setLgas] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch all active states on mount
  useEffect(() => {
    fetchStates();
  }, []);

  // Fetch LGAs when selected state changes
  useEffect(() => {
    if (formData.state) {
      fetchLgas(formData.state);
    } else {
      setLgas([]);
    }
  }, [formData.state]);

  const fetchStates = async () => {
    const { data, error } = await supabase
      .from('states')
      .select('id, name')
      .eq('active', true)
      .order('name');
    if (!error) setStates(data || []);
  };

  const fetchLgas = async (stateName) => {
    // First get state id
    const { data: stateData } = await supabase
      .from('states')
      .select('id')
      .eq('name', stateName)
      .single();
    if (!stateData) return;

    const { data, error } = await supabase
      .from('lgas')
      .select('name')
      .eq('state_id', stateData.id)
      .eq('active', true)
      .order('name');
    if (!error) setLgas(data || []);
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setIsGeolocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        // Save coordinates
        updateFormData({
          coordinates: { lat: latitude, lng: longitude }
        });

        // Optionally reverse geocode using a free service (e.g., OpenStreetMap Nominatim)
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          if (data && data.display_name) {
            updateFormData({ address: data.display_name });
          }
        } catch (error) {
          console.error('Reverse geocoding failed:', error);
          // Keep existing address or leave empty
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

  const handleStateChange = (e) => {
    const selectedState = e.target.value;
    updateFormData({ state: selectedState, lga: '' }); // reset LGA
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
            <p>{locationCaptured ? "Manager will be notified of this exact spot." : "Required for 2.5% commission eligibility."}</p>
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
            value={formData.address || ''}
            onChange={(e) => updateFormData({ address: e.target.value })}
            placeholder="No 1. RentEasy Street, Lekki, Lagos"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="state">State *</label>
          <select
            id="state"
            value={formData.state || ''}
            onChange={handleStateChange}
            required
          >
            <option value="">Select State</option>
            {states.map(s => (
              <option key={s.id} value={s.name}>{s.name}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="lga">LGA *</label>
          <select
            id="lga"
            value={formData.lga || ''}
            onChange={(e) => updateFormData({ lga: e.target.value })}
            disabled={!formData.state || lgas.length === 0}
            required
          >
            <option value="">Select LGA</option>
            {lgas.map(lga => (
              <option key={lga.name} value={lga.name}>{lga.name}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="city">City/Town *</label>
          <input
            type="text"
            id="city"
            value={formData.city || ''}
            onChange={(e) => updateFormData({ city: e.target.value })}
            placeholder="e.g., Victoria Island"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="landmark">Landmark</label>
          <input
            type="text"
            id="landmark"
            value={formData.landmark || ''}
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