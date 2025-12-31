//Export function for creating new listings (used by PostPropertyPage)
export const createNewListing = (listingData, user) => {
  // Get existing listings
  const existingListings = JSON.parse(localStorage.getItem('listings') || '[]');
  
  // Create new listing with proper structure
  const newListing = {
    id: `listing_${Date.now()}`,
    ...listingData,
    verified: false, // NOT verified by admin yet
    userVerified: user?.verified || false, // User verification status
    rejected: false, // Not rejected
    status: 'pending', // Pending admin approval
    postedDate: new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
    timestamp: new Date().toISOString(),
    posterName: user?.name || 'Anonymous User',
    userRole: user?.role || 'user',
    posterId: user?.id,
    userId: user?.id,
    views: 0,
    inquiries: 0,
    needsAdminApproval: true, // Flag for admin dashboard
    isManaged: false // Not yet managed by anyone
  };
  
  // Add to existing listings
  const updatedListings = [...existingListings, newListing];
  localStorage.setItem('listings', JSON.stringify(updatedListings));
  
  // Create admin notification
  const notifications = JSON.parse(localStorage.getItem('adminNotifications') || '[]');
  notifications.unshift({
    id: Date.now(),
    title: 'New Listing Requires Approval',
    message: `${listingData.title} (₦${listingData.price?.toLocaleString()}) in ${listingData.state}`,
    type: 'listing',
    read: false,
    timestamp: new Date().toISOString(),
    data: { listingId: newListing.id, userId: user?.id }
  });
  localStorage.setItem('adminNotifications', JSON.stringify(notifications));
  
  // Add to admin activities log
  const activities = JSON.parse(localStorage.getItem('adminActivities') || '[]');
  activities.unshift({
    id: Date.now(),
    action: `New listing posted: ${listingData.title} by ${user?.name}`,
    type: 'listing',
    admin: 'System',
    timestamp: new Date().toISOString()
  });
  localStorage.setItem('adminActivities', JSON.stringify(activities.slice(0, 100)));
  
  // Also notify managers in the area
  const managers = JSON.parse(localStorage.getItem('managers') || '[]');
  const areaManagers = managers.filter(manager => 
    manager.assignedStates?.includes(listingData.state) || 
    manager.assignedLGAs?.some(lga => lga === listingData.lga)
  );
  
  if (areaManagers.length > 0) {
    const managerNotifications = JSON.parse(localStorage.getItem('managerNotifications') || '[]');
    areaManagers.forEach(manager => {
      managerNotifications.unshift({
        id: Date.now() + Math.random(),
        title: 'New Listing in Your Area',
        message: `${listingData.title} in ${listingData.lga}, ${listingData.state}`,
        type: 'listing',
        read: false,
        timestamp: new Date().toISOString(),
        managerId: manager.id,
        listingId: newListing.id
      });
    });
    localStorage.setItem('managerNotifications', JSON.stringify(managerNotifications));
  }
  
  return newListing;
};