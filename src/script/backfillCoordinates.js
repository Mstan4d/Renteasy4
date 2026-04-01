// src/scripts/backfillCoordinates.js
// Run this in browser console or as a Node script to backfill existing listings

import { supabase } from '../shared/lib/supabaseClient';
import { getCoordinatesFromAddress, batchGeocodeListings } from '../shared/utils/geocoding';

export const backfillListingsCoordinates = async () => {
  console.log('Starting backfill of listing coordinates...');
  
  // Get all listings without coordinates
  const { data: listings, error } = await supabase
    .from('listings')
    .select('id, title, address, city, state, lat, lng')
    .or('lat.is.null,lng.is.null');
  
  if (error) {
    console.error('Error fetching listings:', error);
    return;
  }
  
  console.log(`Found ${listings.length} listings without coordinates`);
  
  let updated = 0;
  let failed = 0;
  
  for (const listing of listings) {
    try {
      console.log(`Processing listing ${listing.id}: ${listing.title}`);
      
      const coords = await getCoordinatesFromAddress(
        listing.address,
        listing.city,
        listing.state
      );
      
      if (coords) {
        const { error: updateError } = await supabase
          .from('listings')
          .update({
            lat: coords.lat,
            lng: coords.lng
          })
          .eq('id', listing.id);
        
        if (updateError) {
          console.error(`Error updating listing ${listing.id}:`, updateError);
          failed++;
        } else {
          console.log(`✅ Updated listing ${listing.id}: ${coords.lat}, ${coords.lng}`);
          updated++;
        }
      } else {
        console.warn(`⚠️ No coordinates for listing ${listing.id}`);
        failed++;
      }
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`Error processing listing ${listing.id}:`, error);
      failed++;
    }
  }
  
  console.log(`\n=== Backfill Complete ===`);
  console.log(`Updated: ${updated}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total: ${listings.length}`);
};

// Run in browser console:
// import { backfillListingsCoordinates } from './src/scripts/backfillCoordinates.js';
// backfillListingsCoordinates();