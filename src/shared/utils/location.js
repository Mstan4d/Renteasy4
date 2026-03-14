// src/shared/utils/location.js

export async function detectUserLocation() {
  // Try browser geolocation first
  if (navigator.geolocation) {
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 5000,
          maximumAge: 10 * 60 * 1000, // 10 minutes
        });
      });
      const { latitude, longitude } = position.coords;
      // Reverse geocode to get state/city (you can use a service like OpenStreetMap Nominatim)
      const geoResponse = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
      );
      const geoData = await geoResponse.json();
      const address = geoData.address;
      return {
        state: address.state || address.region || null,
        city: address.city || address.town || address.village || null,
        lat: latitude,
        lng: longitude,
      };
    } catch (err) {
      console.warn('Geolocation failed:', err);
    }
  }

  // Fallback: IP geolocation (using ipapi.co)
  try {
    const ipResponse = await fetch('https://ipapi.co/json/');
    const ipData = await ipResponse.json();
    return {
      state: ipData.region,
      city: ipData.city,
      lat: ipData.latitude,
      lng: ipData.longitude,
    };
  } catch (err) {
    console.warn('IP geolocation failed:', err);
  }

  // If all fails, return null (no location filter)
  return null;
}