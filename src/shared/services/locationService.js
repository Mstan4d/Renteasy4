// src/shared/services/locationService.js
import { supabase } from '../lib/supabaseClient';

export const locationService = {
  async getStates(onlyActive = true) {
    let query = supabase.from('states').select('id, name, value').order('name');
    if (onlyActive) query = query.eq('active', true);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async getLGAsForState(stateValue, onlyActive = true) {
    // First get state id
    const { data: state, error: stateError } = await supabase
      .from('states')
      .select('id')
      .eq('value', stateValue)
      .single();
    if (stateError || !state) return [];

    let query = supabase
      .from('lgas')
      .select('name')
      .eq('state_id', state.id)
      .order('name');
    if (onlyActive) query = query.eq('active', true);
    const { data, error } = await query;
    if (error) return [];
    return data.map(l => l.name);
  },

  /**
   * Detect user's location using browser geolocation, falling back to IP.
   * Returns { state, lga, city } or null if detection fails.
   */
  async detectUserLocation() {
    // Try browser geolocation first
    if (navigator.geolocation) {
      try {
        const position = await new Promise((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 5000,
            maximumAge: 10 * 60 * 1000, // 10 minutes
          })
        );
        const { latitude, longitude } = position.coords;
        // Reverse geocode using OpenStreetMap Nominatim (free, no API key required)
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
        );
        const data = await res.json();
        const address = data.address;
        return {
          state: address.state,
          lga: address.county || address.city_district,
          city: address.city || address.town,
        };
      } catch (err) {
        console.warn('Geolocation failed, falling back to IP');
      }
    }

    // Fallback to IP geolocation (ipapi.co – 1000 requests/month free)
    try {
      const res = await fetch('https://ipapi.co/json/');
      const data = await res.json();
      return {
        state: data.region,
        lga: null, // IP services usually don't give LGA
        city: data.city,
      };
    } catch (err) {
      console.warn('IP geolocation failed');
      return null;
    }
  },
};