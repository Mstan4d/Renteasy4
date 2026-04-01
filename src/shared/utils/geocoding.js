// src/shared/utils/geocoding.js - Complete version
import { supabase } from '../lib/supabaseClient';

/**
 * Get coordinates from LGA and State
 */
export const getCoordinatesFromLGA = async (state, lga) => {
  if (!state || !lga) return null;
  
  try {
    const { data, error } = await supabase
      .from('location_coordinates')
      .select('lat, lng, radius_km')
      .eq('state', state)
      .eq('lga', lga)
      .maybeSingle();
    
    if (data && data.lat && data.lng) {
      return {
        lat: data.lat,
        lng: data.lng,
        radius: data.radius_km || 5,
        source: 'lga_database',
        accuracy: 'lga'
      };
    }
    
    return getStateCentroid(state);
    
  } catch (error) {
    console.error('Error getting LGA coordinates:', error);
    return getStateCentroid(state);
  }
};

/**
 * Get state centroid coordinates
 */
export const getStateCentroid = (state) => {
  const stateCentroids = {
    'Lagos': { lat: 6.5244, lng: 3.3792, radius: 15 },
    'FCT': { lat: 9.0765, lng: 7.3986, radius: 20 },
    'Rivers': { lat: 4.8156, lng: 7.0498, radius: 25 },
    'Oyo': { lat: 7.3775, lng: 3.9470, radius: 30 },
    'Kano': { lat: 12.0022, lng: 8.5919, radius: 25 },
    'Ogun': { lat: 6.9981, lng: 3.4737, radius: 20 },
    'Delta': { lat: 5.4644, lng: 6.2152, radius: 30 },
    'Edo': { lat: 6.3176, lng: 5.6145, radius: 25 },
    'Enugu': { lat: 6.4618, lng: 7.5577, radius: 20 },
    'Anambra': { lat: 6.2204, lng: 6.9375, radius: 25 }
  };
  
  const centroid = stateCentroids[state];
  if (centroid) {
    return {
      ...centroid,
      source: 'state_centroid',
      accuracy: 'state'
    };
  }
  
  // Default to Lagos if state not found
  return {
    lat: 6.5244,
    lng: 3.3792,
    radius: 50,
    source: 'default',
    accuracy: 'default'
  };
};

/**
 * Get city coordinates
 */
const getCityCoordinates = async (city, state) => {
  const cityMap = {
    'Ikeja': { lat: 6.6059, lng: 3.3492, radius: 3 },
    'Victoria Island': { lat: 6.4254, lng: 3.4205, radius: 2 },
    'Lekki': { lat: 6.4610, lng: 3.6090, radius: 5 },
    'Surulere': { lat: 6.5030, lng: 3.3580, radius: 2 },
    'Yaba': { lat: 6.4989, lng: 3.3513, radius: 2 },
    'Abuja': { lat: 9.0765, lng: 7.3986, radius: 10 },
    'Port Harcourt': { lat: 4.8156, lng: 7.0498, radius: 10 },
    'Ibadan': { lat: 7.3775, lng: 3.9470, radius: 10 }
  };
  
  return cityMap[city] || null;
};

/**
 * Get coordinates with fallback - Main function for advanced use
 */
export const getCoordinatesWithFallback = async (address, city, state, lga) => {
  // Step 1: Try exact address (most accurate) - simplified version
  if (address && address.trim().length > 5) {
    // For now, skip exact geocoding and go to LGA
    console.log('Address provided, but using LGA for now:', address);
  }
  
  // Step 2: Try LGA (good accuracy)
  if (lga && state) {
    const lgaCoords = await getCoordinatesFromLGA(state, lga);
    if (lgaCoords && lgaCoords.accuracy === 'lga') {
      return lgaCoords;
    }
  }
  
  // Step 3: Try city (moderate accuracy)
  if (city) {
    const cityCoords = await getCityCoordinates(city, state);
    if (cityCoords) {
      return {
        ...cityCoords,
        source: 'city_database',
        accuracy: 'city'
      };
    }
  }
  
  // Step 4: Try state centroid (fallback)
  if (state) {
    return getStateCentroid(state);
  }
  
  // Step 5: Default to Lagos
  return {
    lat: 6.5244,
    lng: 3.3792,
    radius: 50,
    source: 'default',
    accuracy: 'default'
  };
};

/**
 * Main function used by PostPropertyPage
 * Returns coordinates in the format expected by the page
 */
export const getCoordinatesFromAddress = async (address, city, state, lga) => {
  try {
    const result = await getCoordinatesWithFallback(address, city, state, lga);
    
    if (result && result.lat && result.lng) {
      console.log(`Coordinates obtained: ${result.accuracy} accuracy`, result);
      return {
        lat: result.lat,
        lng: result.lng
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error in getCoordinatesFromAddress:', error);
    return null;
  }
};

// Export the geocodeAddress function if needed by other parts
export const geocodeAddress = async (address, city, state) => {
  // Simplified version - you can expand this
  return getCoordinatesWithFallback(address, city, state, null);
};