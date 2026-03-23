// src/shared/utils/listingUtils.js
import { supabase } from '../lib/supabaseClient';

/**
 * Create a new listing in Supabase (replaces localStorage version)
 * @param {Object} listingData - The listing details (title, price, state, lga, etc.)
 * @param {Object} user - The current user object (must include id, name, role, verified)
 * @returns {Promise<Object>} The created listing record
 */
export async function createNewListing(listingData, user) {
  try {
    // 1. Construct the listing object for insertion
    const newListing = {
      title: listingData.title,
      description: listingData.description || '',
      address: listingData.address,
      city: listingData.city,
      state: listingData.state,
      lga: listingData.lga,
      price: listingData.price,
      rent_frequency: listingData.rent_frequency || 'yearly',
      bedrooms: listingData.bedrooms,
      bathrooms: listingData.bathrooms,
      area: listingData.area,
      images: listingData.images || [],
      status: 'pending',
      verified: false,
      user_verified: user?.verified || false,
      rejected: false,
      posted_date: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString(),
      poster_name: user?.name || 'Anonymous User',
      user_role: user?.role || 'user',
      poster_id: user?.id,
      user_id: user?.id,
      views: 0,
      inquiries: 0,
      needs_admin_approval: true,
      is_managed: false,
      estate_firm_id: user?.role === 'estate_firm' ? user?.id : null,
      landlord_id: user?.role === 'landlord' ? user?.id : null,
    };

    const { data, error } = await supabase
      .from('listings')
      .insert([newListing])
      .select()
      .single();

    if (error) throw error;
    const createdListing = data;

    // 2. Create admin notification
    await supabase.from('admin_activities').insert({
      title: 'New Listing Requires Approval',
      message: `${listingData.title} (₦${listingData.price?.toLocaleString()}) in ${listingData.state}`,
      type: 'listing',
      read: false,
      timestamp: new Date().toISOString(),
      data: { listingId: createdListing.id, userId: user?.id }
    });

    // 3. Add to admin activities log
    await supabase.from('admin_activities').insert({
      action: `New listing posted: ${listingData.title} by ${user?.name}`,
      type: 'listing',
      admin: 'System',
      timestamp: new Date().toISOString()
    });

    // 4. Notify managers in the area
    const { data: managers, error: managerError } = await supabase
      .from('managers')
      .select('id')
      .or(`assigned_states.cs.{${listingData.state}},assigned_lgas.cs.{${listingData.lga}}`);

    if (!managerError && managers && managers.length > 0) {
      const managerNotifications = managers.map(manager => ({
        manager_id: manager.id,
        title: 'New Listing in Your Area',
        message: `${listingData.title} in ${listingData.lga}, ${listingData.state}`,
        type: 'listing',
        read: false,
        timestamp: new Date().toISOString(),
        listing_id: createdListing.id
      }));

      await supabase
        .from('manager_notifications')
        .insert(managerNotifications);
    }

    return createdListing;
  } catch (err) {
    console.error('Error in createNewListing:', err);
    throw err;
  }
}

/**
 * Create a listing directly from a unit (convenience wrapper for estate firms)
 * @param {Object} unit - The unit object (must have rent_amount, unit_number, etc.)
 * @param {Object} property - The property object (must have name, address, etc.)
 * @param {string} estateFirmId - The estate firm profile ID
 * @param {Array} extraFees - Optional extra fees to include in the listing
 * @returns {Promise<Object>} The created listing record
 */
export async function createListingFromUnit(unit, property, estateFirmId = null, extraFees = []) {
  // Build a user-like object for the estate firm
  const user = {
    id: estateFirmId,
    role: 'estate_firm',
    name: 'Estate Firm', // You can later fetch the actual firm name
    verified: true,
  };

  const listingData = {
    title: `${property.name} - Unit ${unit.unit_number}`,
    description: property.description || `${unit.bedrooms} bedroom, ${unit.bathrooms} bathroom unit available.`,
    address: property.address,
    city: property.city,
    state: property.state,
    lga: property.lga,
    price: unit.rent_amount,
    rent_frequency: unit.rent_frequency,
    bedrooms: unit.bedrooms,
    bathrooms: unit.bathrooms,
    area: unit.area_sqm,
    images: property.images || [],
    extra_fees: extraFees,         // <-- add extra fees
    commission_rate: 0,            // <-- estate firm pays 0% commission
    estate_firm_id: estateFirmId,  // <-- set the estate firm ID
  };

  // Pass the user object to the generic create function
  const createdListing = await createNewListing(listingData, user);
  return createdListing;
}

/**
 * Update an existing listing (for editing)
 * @param {string} listingId - The ID of the listing to update
 * @param {Object} updateData - The fields to update (e.g., extra_fees, images, title, etc.)
 * @returns {Promise<Object>} The updated listing record
 */
export async function updateListing(listingId, updateData) {
  const { data, error } = await supabase
    .from('listings')
    .update(updateData)
    .eq('id', listingId)
    .select()
    .single();

  if (error) throw error;
  return data;
}