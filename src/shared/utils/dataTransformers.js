// src/shared/utils/dataTransformers.js

export const transformListing = (item) => {
  return {
    id: item.id,
    _id: item.id,
    title: item.title,
    description: item.description,
    price: item.price,
    state: item.state,
    city: item.city,
    lga: item.lga,
    address: item.address,
    propertyType: item.property_type,
    status: item.status,
    verified: item.verified,
    userVerified: item.profiles?.verified || false,
    posterRole: item.poster_role,
    posterName: item.poster_name || item.profiles?.name,
    posterId: item.user_id,
    images: item.images || [],
    amenities: item.amenities || [],
    bedrooms: item.bedrooms,
    bathrooms: item.bathrooms,
    area: item.area,
    createdAt: item.created_at,
    isManaged: item.is_managed,
    managedBy: item.manager?.name,
    managedById: item.managed_by,
    commissionRate: item.commission_rate,
    userRole: item.poster_role,
    postedBy: {
      isVerified: item.profiles?.verified || false,
      fullName: item.profiles?.name
    }
  };
};

// Use it in your service:
// return data.map(item => transformListing(item));