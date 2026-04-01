// src/shared/utils/geocoding.js - Updated version

/**
 * Get coordinates from LGA and State
 * @param {string} state - State name
 * @param {string} lga - Local Government Area name
 * @returns {Promise<{lat: number, lng: number, radius: number, source: string}>}
 */
export const getCoordinatesFromLGA = async (state, lga) => {
  if (!state || !lga) return null;
  
  try {
    // Query the location_coordinates table
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
    
    // Fallback to state centroid
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
  
  return {
    ...stateCentroids[state],
    source: 'state_centroid',
    accuracy: 'state'
  };
};

/**
 * Get coordinates from address with LGA/State fallback
 * Priority: Exact Address > LGA > State > Default
 */
export const getCoordinatesWithFallback = async (address, city, state, lga) => {
  // Step 1: Try exact address (most accurate)
  if (address && address.trim().length > 5) {
    const exactCoords = await geocodeAddress(address, city, state);
    if (exactCoords && exactCoords.accuracy === 'exact') {
      return { ...exactCoords, source: 'exact_address' };
    }
  }
  
  // Step 2: Try LGA (good accuracy)
  if (lga && state) {
    const lgaCoords = await getCoordinatesFromLGA(state, lga);
    if (lgaCoords && lgaCoords.source === 'lga_database') {
      return lgaCoords;
    }
  }
  
  // Step 3: Try city (moderate accuracy)
  if (city) {
    const cityCoords = await getCityCoordinates(city, state);
    if (cityCoords) {
      return cityCoords;
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

// Helper to get city coordinates (could be extended)
const getCityCoordinates = async (city, state) => {
  // You can expand this with a city database
  const cityMap = {
    'Ikeja': { lat: 6.6059, lng: 3.3492, radius: 3 },
    'Victoria Island': { lat: 6.4254, lng: 3.4205, radius: 2 },
    'Lekki': { lat: 6.4610, lng: 3.6090, radius: 5 },
    'Surulere': { lat: 6.5030, lng: 3.3580, radius: 2 },
    'Yaba': { lat: 6.4989, lng: 3.3513, radius: 2 }
  };
  
  return cityMap[city] || null;
};