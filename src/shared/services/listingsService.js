// src/shared/services/listingsService.js
import { supabase } from '../lib/supabaseClient';

// Helper to transform raw database row into frontend-friendly structure
const transformListing = (item) => {
  // Handle amenities: could be array, string, or null
  let amenities = [];
  if (Array.isArray(item.amenities)) {
    amenities = item.amenities;
  } else if (typeof item.amenities === 'string') {
    amenities = item.amenities.split(',').map(a => a.trim()).filter(Boolean);
  }

  // Ensure images is an array
  const images = item.images || item.image_urls || [];

  return {
    id: item.id,
    title: item.title || '',
    description: item.description || '',
    price: item.price || item.rent_amount || 0,
    state: item.state,
    city: item.city,
    lga: item.lga,
    address: item.address,
    landmark: item.landmark,
    propertyType: item.property_type,
    status: item.status,
    verified: item.is_verified,
    userVerified: item.user?.verified || false,
    posterRole: item.poster_role,
    posterName: item.poster_name || item.user?.name || 'Unknown',
    posterId: item.user_id,
    posterPhone: item.poster_phone || item.user?.phone,
    images,
    amenities,
    bedrooms: item.bedrooms,
    bathrooms: item.bathrooms,
    area: item.area,
    coordinates: item.coordinates,
    isManaged: item.is_managed,
    managedBy: item.manager?.full_name,
    managedById: item.managed_by,
    managedAt: item.managed_at,
    commissionRate: item.commission_rate,
    verificationLevel: item.verification_level,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    postedDate: item.posted_date,
    approvedAt: item.approved_at,
    approvedBy: item.approved_by,
    rejected: item.rejected,
    rejectedAt: item.rejected_at,
    rejectedBy: item.rejected_by,
    rentedAt: item.rented_at,
    rentedTo: item.rented_to,
    // For compatibility with existing code that uses `postedBy`
    userRole: item.poster_role,
    postedBy: {
      id: item.user?.id,
      isVerified: item.user?.verified || false,
      fullName: item.user?.name,
      email: item.user?.email,
      role: item.user?.role,
      phone: item.user?.phone,
      avatar_url: item.user?.avatar_url
    },
    // Tenant info (if rented)
    tenant: item.tenant ? {
      id: item.tenant.id,
      name: item.tenant.full_name,
      phone: item.tenant.phone,
      email: item.tenant.email
    } : null
  };
};

export const listingsService = {
  // Get all listings with filters
  async getAll(filters = {}) {
    try {
      let query = supabase
        .from('listings')
        .select(`
          *,
          user:user_id (
            id, name, email, role, verified, phone, avatar_url, created_at
          ),
          manager:managed_by (
            id, name, phone, avatar_url
          ),
          tenant:rented_to (
            id, name, phone, email
          )
        `)
        .eq('is_active', true);

      // Show both pending and approved listings by default
      if (!filters.status || filters.status === 'all') {
        query = query.in('status', ['pending', 'approved']);
      } else if (filters.status === 'verified') {
        query = query.eq('is_verified', true).eq('status', 'approved');
      } else if (filters.status === 'approved') {
        query = query.eq('status', 'approved');
      } else if (filters.status === 'pending') {
        query = query.eq('status', 'pending');
      } else if (filters.status === 'rejected') {
        query = query.eq('status', 'rejected');
      }

      // Apply other filters
      if (filters.state) query = query.eq('state', filters.state);
      if (filters.lga) query = query.eq('lga', filters.lga);
      if (filters.propertyType) query = query.eq('property_type', filters.propertyType);
      if (filters.minPrice) query = query.gte('price', parseFloat(filters.minPrice));
      if (filters.maxPrice) query = query.lte('price', parseFloat(filters.maxPrice));
      if (filters.posterRole && filters.posterRole !== 'all') {
        query = query.eq('poster_role', filters.posterRole);
      }
      if (filters.searchQuery) {
        query = query.or(
          `title.ilike.%${filters.searchQuery}%,description.ilike.%${filters.searchQuery}%,address.ilike.%${filters.searchQuery}%,city.ilike.%${filters.searchQuery}%,state.ilike.%${filters.searchQuery}%`
        );
      }
      if (filters.verifiedOnly) {
        query = query.eq('is_verified', true);
      }

      // Apply sorting
      switch (filters.sortBy) {
        case 'price_low':
          query = query.order('price', { ascending: true });
          break;
        case 'price_high':
          query = query.order('price', { ascending: false });
          break;
        case 'verified':
          query = query.order('is_verified', { ascending: false });
          break;
        case 'pending':
          query = query.order('created_at', { ascending: false });
          break;
        case 'user_verified':
          // This requires a join, so we'll handle it differently
          break;
        case 'newest':
        default:
          query = query.order('created_at', { ascending: false });
          break;
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transform each item using the helper
      return (data || []).map(item => transformListing(item));
    } catch (error) {
      console.error('Error fetching listings:', error);
      throw error;
    }
  },

  // Get listing by ID
  async getById(id) {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select(`
          *,
          user:user_id (
            id, name, email, role, verified, phone, avatar_url, created_at
          ),
          manager:managed_by (
            id, name, phone, avatar_url
          ),
          tenant:rented_to (
            id, name, phone, email
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) return null;

      // Transform the data using the same helper
      return transformListing(data);
    } catch (error) {
      console.error('Error fetching listing:', error);
      throw error;
    }
  },

  // Create a new listing
  async create(listingData) {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not authenticated');

      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userData.user.id)
        .single();

      const listing = {
        user_id: userData.user.id,
        title: listingData.title,
        description: listingData.description,
        price: parseFloat(listingData.price),
        state: listingData.state,
        city: listingData.city,
        lga: listingData.lga,
        address: listingData.address,
        landmark: listingData.landmark,
        property_type: listingData.property_type,
        bedrooms: parseInt(listingData.bedrooms) || null,
        bathrooms: parseInt(listingData.bathrooms) || null,
        area: listingData.area,
        amenities: listingData.amenities || [],
        images: listingData.images || [],
        poster_role: listingData.poster_role || profile.role,
        poster_name: listingData.poster_name || profile.name,
        poster_phone: listingData.poster_phone || profile.phone,
        status: 'pending',
        is_verified: false,
        user_verified: profile.verified || false,
        is_active: true,
        commission_rate: 7.5,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('listings')
        .insert([listing])
        .select()
        .single();

      if (error) throw error;

      // Notify nearby managers if listing is from tenant or landlord
      if (['tenant', 'landlord'].includes(listing.poster_role)) {
        await this.notifyNearbyManagers(data.id);
      }

      return data;
    } catch (error) {
      console.error('Error creating listing:', error);
      throw error;
    }
  },

  // Update listing
  async update(id, updates) {
    try {
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('listings')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating listing:', error);
      throw error;
    }
  },

  // Delete listing (soft delete)
  async delete(id) {
    try {
      const { error } = await supabase
        .from('listings')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting listing:', error);
      throw error;
    }
  },

  // Verify listing (admin/manager)
  async verify(id, verifiedById) {
    try {
      const { data, error } = await supabase
        .from('listings')
        .update({
          is_verified: true,
          status: 'approved',
          verification_level: 'verified',
          verified_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Log admin activity
      await this.logAdminActivity(verifiedById, 'verify_listing', 'listing', id, {
        action: 'verified',
        timestamp: new Date().toISOString()
      });

      return data;
    } catch (error) {
      console.error('Error verifying listing:', error);
      throw error;
    }
  },

  // Reject listing (admin only)
  async reject(id, reason = 'Does not meet guidelines', rejectedById) {
    try {
      const { data, error } = await supabase
        .from('listings')
        .update({
          is_verified: false,
          rejected: true,
          status: 'rejected',
          rejection_reason: reason,
          rejected_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Log admin activity
      await this.logAdminActivity(rejectedById, 'reject_listing', 'listing', id, {
        action: 'rejected',
        reason: reason,
        timestamp: new Date().toISOString()
      });

      return data;
    } catch (error) {
      console.error('Error rejecting listing:', error);
      throw error;
    }
  },

  // Mark as rented
  async markAsRented(listingId, tenantId, confirmedById) {
    try {
      const listing = await this.getById(listingId);
      if (!listing) throw new Error('Listing not found');

      // Calculate commissions
      const totalCommission = listing.price * 0.075;
      const managerCommission = listing.price * 0.025;
      const posterCommission = listing.price * 0.015;
      const rentEasyCommission = listing.price * 0.035;

      // Update listing status
      const { data: updatedListing, error: listingError } = await supabase
        .from('listings')
        .update({
          status: 'rented',
          rented_at: new Date().toISOString(),
          rented_to: tenantId,
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', listingId)
        .select()
        .single();

      if (listingError) throw listingError;

      return updatedListing;
    } catch (error) {
      console.error('Error marking as rented:', error);
      throw error;
    }
  },

  // Accept to manage listing (manager)
  async acceptToManage(listingId, managerId) {
    try {
      // Check if manager is verified
      const { data: managerProfile } = await supabase
        .from('profiles')
        .select('verified')
        .eq('id', managerId)
        .eq('role', 'manager')
        .single();

      if (!managerProfile?.verified) {
        throw new Error('Manager must complete KYC verification before managing listings');
      }

      // Check if listing is already managed
      const listing = await this.getById(listingId);
      if (listing.isManaged) {
        throw new Error('This listing is already being managed');
      }

      // Update listing with manager info
      const { data, error } = await supabase
        .from('listings')
        .update({
          is_managed: true,
          managed_by: managerId,
          managed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', listingId)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error accepting to manage:', error);
      throw error;
    }
  },

  // Get user's listings
  async getUserListings(userId) {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user listings:', error);
      throw error;
    }
  },

  // Notify nearby managers
  async notifyNearbyManagers(listingId) {
    try {
      const listing = await this.getById(listingId);
      
      // Get all verified managers
      const { data: managers, error: managerError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('role', 'manager')
        .eq('verified', true);

      if (managerError) throw managerError;

      // Create notifications
      const notifications = managers.map(manager => ({
        manager_id: manager.id,
        listing_id: listingId,
        notification_type: 'new_listing',
        title: 'New Listing Available',
        message: `New ${listing.posterRole} listing in ${listing.city || listing.state}. Price: ₦${listing.price?.toLocaleString()}`,
        created_at: new Date().toISOString()
      }));

      if (notifications.length > 0) {
        await supabase
          .from('manager_notifications')
          .insert(notifications);
      }
    } catch (error) {
      console.error('Error notifying managers:', error);
    }
  },

  // Log admin activity
  async logAdminActivity(adminId, action, type, entityId, details = {}) {
    try {
      const { error } = await supabase
        .from('admin_activities')
        .insert([{
          admin_id: adminId,
          action: action,
          type: type,
          entity_id: entityId,
          details: details,
          created_at: new Date().toISOString()
        }]);

      if (error) throw error;
    } catch (error) {
      console.error('Error logging admin activity:', error);
    }
  }
};