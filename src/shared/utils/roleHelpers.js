// src/shared/utils/roleHelpers.js
import { supabase } from '../lib/supabaseClient';

// Get current user's role and staff status
export const getUserRole = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('estate_firm_profiles')
      .select('staff_role, is_staff_account, parent_estate_firm_id')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error || !data) {
      return { role: 'principal', isStaff: false, parentFirmId: null };
    }
    
    return {
      role: data.staff_role || 'principal',
      isStaff: data.is_staff_account || false,
      parentFirmId: data.parent_estate_firm_id
    };
  } catch (error) {
    console.error('Error getting user role:', error);
    return { role: 'principal', isStaff: false, parentFirmId: null };
  }
};

// Check if user can view a specific property
export const canViewProperty = (userRole, propertyCreatorId, currentUserId) => {
  if (userRole === 'principal') return true;
  if (userRole === 'executive') return true;
  if (userRole === 'associate') return propertyCreatorId === currentUserId;
  return false;
};

// Check if user can edit a property
export const canEditProperty = (userRole, propertyCreatorId, currentUserId) => {
  if (userRole === 'principal') return true;
  if (userRole === 'executive') return true;
  if (userRole === 'associate') return propertyCreatorId === currentUserId;
  return false;
};

// Check if user can delete a property
export const canDeleteProperty = (userRole) => {
  return userRole === 'principal';
};

// Check if user can view landlords
export const canViewLandlords = (userRole) => {
  return userRole !== 'associate';
};

// Check if user can manage staff
export const canManageStaff = (userRole) => {
  return userRole === 'principal';
};