import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { supabase } from '../../../../shared/lib/supabaseClient';
import './LocationStep.css';

const LocationStep = ({ formData, updateFormData }) => {
  const [isGeolocating, setIsGeolocating] = useState(false);
  const [locationCaptured, setLocationCaptured] = useState(!!formData.coordinates?.lat);
  const [states, setStates] = useState([]);
  const [lgas, setLgas] = useState([]);
  const [loadingStates, setLoadingStates] = useState(true);
  const [loadingLgas, setLoadingLgas] = useState(false);

  // Fetch active states on mount
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
    setLoadingStates(true);
    try {
      const { data, error } = await supabase
        .from('states')
        .select('id, name')
        .eq('active', true)
        .order('name');
      if (error) throw error;
      setStates(data || []);
    } catch (error) {
      console.error('Error fetching states:', error);
      // Fallback to static list
      setStates([
        { id: 1, name: 'Lagos' },
        { id: 2, name: 'Abuja' },
        // ... add other states
      ]);
    } finally {
      setLoadingStates(false);
    }
  };

  const fetchLgas = async (stateName) => {
    setLoadingLgas(true);
    try {
      // First get state id from the name
      const { data: stateData, error: stateError } = await supabase
        .from('states')
        .select('id')
        .eq('name', stateName)
        .single();
      if (stateError) throw stateError;
      if (!stateData) {
        setLgas([]);
        return;
      }

      const { data, error } = await supabase
        .from('lgas')
        .select('name')
        .eq('state_id', stateData.id)
        .eq('active', true)
        .order('name');
      if (error) throw error;
      setLgas(data || []);
    } catch (error) {
      console.error('Error fetching LGAs:', error);
      // Fallback to static mapping
      const localLgas = {
        'Lagos': ['Ikeja', 'Agege', 'Alimosho', 'Amuwo-Odofin', 'Apapa', 'Badagry', 'Epe', 'Eti-Osa', 'Ibeju-Lekki', 'Ifako-Ijaiye', 'Ikorodu', 'Kosofe', 'Lagos Island', 'Lagos Mainland', 'Mushin', 'Ojo', 'Oshodi-Isolo', 'Shomolu', 'Surulere'],
        'Abuja': ['Abuja Municipal', 'Bwari', 'Gwagwalada', 'Kuje', 'Kwali', 'Abaji']
      };
      setLgas(localLgas[stateName]?.map(name => ({ name })) || []);
    } finally {
      setLoadingLgas(false);
    }
  };

  // Simplified geolocation (like ManagerRadius)
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser. Please enter the address manually.');
      return;
    }

    setIsGeolocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        updateFormData({
          coordinates: { lat: latitude, lng: longitude }
        });
        setIsGeolocating(false);
        setLocationCaptured(true);
        alert('📍 Location detected successfully!');
      },
      (error) => {
        setIsGeolocating(false);
        let message = 'Could not detect location. ';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message += 'Please enable location permissions in your browser and try again, or enter the address manually.';
            break;
          case error.POSITION_UNAVAILABLE:
            message += 'Location information is unavailable. Please enter the address manually.';
            break;
          case error.TIMEOUT:
            message += 'Location request timed out. Please try again or enter manually.';
            break;
          default:
            message += 'Please enter the address manually.';
        }
        alert(message);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleStateChange = (e) => {
    const selectedState = e.target.value;
    updateFormData({ state: selectedState, lga: '' });
  };

  return (
    <div className="location-step">
      <div className="step-header">
        <h2>Location Details</h2>
        <p className="step-description">
          We use your GPS to notify the nearest RentEasy Manager for verification.
        </p>
      </div>

      {/* Geolocation Card */}
      <div className={`geo-card ${locationCaptured ? 'success' : ''}`}>
        <div className="geo-content">
          <Navigation size={28} className="geo-icon" />
          <div className="geo-text">
            <h4>{locationCaptured ? "GPS Coordinates Locked" : "Pin Your Location"}</h4>
            <p>
              {locationCaptured 
                ? "Manager will be notified of this exact spot." 
                : "Required for 2.5% commission eligibility."}
            </p>
          </div>
        </div>
        <button
          type="button"
          className={`btn-capture ${isGeolocating ? 'loading' : ''}`}
          onClick={getCurrentLocation}
          disabled={isGeolocating}
        >
          {isGeolocating ? (
            <>
              <Loader size={18} className="spinner" />
              Locating...
            </>
          ) : locationCaptured ? (
            <>
              <CheckCircle size={18} />
              Location Locked
            </>
          ) : (
            <>
              <Navigation size={18} />
              Get Current Location
            </>
          )}
        </button>
      </div>

      <div className="form-grid">
        <div className="form-group full-width">
          <label htmlFor="address">
            <MapPin size={16} /> Full Address *
          </label>
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
            disabled={loadingStates}
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
            disabled={!formData.state || loadingLgas}
            required
          >
            <option value="">
              {loadingLgas ? 'Loading LGAs...' : 'Select LGA'}
            </option>
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
          <span>
            <b>Note:</b> Accurate GPS location helps managers verify your house faster.
          </span>
        </div>
      )}
    </div>
  );
};

export default LocationStep;