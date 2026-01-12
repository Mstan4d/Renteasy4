// src/modules/listings/pages/ListingDetailsPage.jsx - UPDATED VERSION
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import { useManager } from '../../../shared/context/ManagerContext'; // Add this import
import ListingDetails from '../components/ListingDetails';
import './ListingDetailsPage.css';

const ListingDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { canManagerVerify, canManagerAccept, getNearbyManagers, managers } = useManager(); // Add manager context
  const [listing, setListing] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNearby, setIsNearby] = useState(false);

  useEffect(() => {
    loadListing();
  }, [id, location.state]);

  useEffect(() => {
    if (listing && user?.role === 'manager') {
      checkProximity();
    }
  }, [listing, user]);

  const loadListing = () => {
    // Try to get listing from location state first (from Home page)
    if (location.state?.listing) {
      setListing(location.state.listing);
      setIsLoading(false);
      return;
    }

    // If not in state, try to get from localStorage
    const savedListings = JSON.parse(localStorage.getItem('listings')) || [];
    
    // Also include mock listings
    const mockListings = [
      { 
        id: 'mock_1', 
        title: "2 Bedroom Flat in Lekki", 
        price: 1500000, 
        description: "Spacious · Gated estate", 
        images: [
          "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800",
          "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800",
          "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800"
        ], 
        location: "Lekki, Lagos", 
        state: "Lagos", 
        lga: "Lekki",
        userId: 'landlord_001',
        posterName: 'Verified Properties Ltd.',
        posterId: 'landlord_001',
        posterRole: 'landlord',
        userRole: 'landlord',
        userVerified: true,
        verified: true,
        verificationLevel: 'premium',
        postedDate: '2024-12-10',
        amenities: ['24/7 Security', 'Swimming Pool', 'Gym'],
        propertyType: 'Apartment',
        address: 'Lekki Phase 1, Lagos',
        timestamp: '2024-12-10T10:00:00Z',
        reviews: [],
        coordinates: { lat: 6.428055, lng: 3.452222 },
        commissionRate: 7.5,
        managerCommission: 2.5,
        rentEasyCommission: 3.5
      },
      { 
        id: 'mock_2', 
        title: "3 Bedroom Duplex in Abuja", 
        price: 2500000, 
        description: "Luxury duplex with garden", 
        images: [
          "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800"
        ], 
        location: "Garki, Abuja", 
        state: "Abuja", 
        lga: "Garki",
        userId: 'tenant_001',
        posterName: 'Outgoing Tenant',
        posterId: 'tenant_001',
        posterRole: 'tenant',
        userRole: 'tenant',
        userVerified: true,
        verified: false,
        verificationLevel: 'basic',
        postedDate: '2024-12-12',
        amenities: ['Garden', 'Parking', 'Security'],
        propertyType: 'Duplex',
        address: 'Garki, Abuja',
        timestamp: '2024-12-12T14:30:00Z',
        reviews: [],
        coordinates: { lat: 9.057075, lng: 7.471308 },
        commissionRate: 7.5,
        managerCommission: 2.5,
        rentEasyCommission: 3.5
      }
    ];

    const allListings = [...savedListings, ...mockListings];
    const foundListing = allListings.find(l => l.id === id);
    
    if (foundListing) {
      setListing(foundListing);
    } else {
      // If still not found, try to get from currentListing in localStorage
      const currentListing = JSON.parse(localStorage.getItem('currentListing'));
      if (currentListing && currentListing.id === id) {
        setListing(currentListing);
      }
    }
    
    setIsLoading(false);
  };

  const checkProximity = () => {
    if (!listing?.coordinates) {
      setIsNearby(false);
      return;
    }

    const nearbyManagers = getNearbyManagers(listing);
    const userManager = managers.find(m => m.userId === user.id);
    
    if (userManager) {
      const isUserNearby = nearbyManagers.some(m => m.id === userManager.id);
      setIsNearby(isUserNearby);
    } else {
      setIsNearby(false);
    }
  };

  const handleBack = () => {
    navigate('/listings');
  };

  // BUSINESS RULE: Contact button handler
  const handleContact = () => {
    if (!user) {
      navigate('/login', { state: { from: `/listings/${id}` } });
      return;
    }
    
    if (!listing) return;

    // BUSINESS RULE 1: Check if user is trying to contact themselves
    if (user.id === listing.posterId) {
      alert('You cannot contact yourself for your own listing');
      return;
    }

    // BUSINESS RULE 2: If tenant posts, incoming tenants must go through manager
    if (listing.userRole === 'tenant') {
      // Check if manager is assigned
      if (listing.managedById) {
        const contactData = {
          listingId: listing.id,
          title: listing.title,
          posterName: listing.posterName,
          posterId: listing.posterId,
          managerId: listing.managedById,
          managerName: listing.managedBy,
          type: 'tenant_listing',
          userVerified: listing.userVerified,
          price: listing.price,
          state: listing.state,
          lga: listing.lga
        };
        
        localStorage.setItem('activeContact', JSON.stringify(contactData));
        navigate(`/dashboard/messages?listing=${encodeURIComponent(listing.id)}&type=tenant_listing`);
      } else {
        alert('This listing is being assigned to a manager. Please check back soon.');
      }
      return;
    }
    
    // BUSINESS RULE 3: Landlord listings - direct contact with manager monitoring
    if (listing.userRole === 'landlord') {
      const contactData = {
        listingId: listing.id,
        title: listing.title,
        posterName: listing.posterName,
        posterId: listing.posterId,
        type: 'landlord_listing',
        userVerified: listing.userVerified,
        price: listing.price,
        state: listing.state,
        lga: listing.lga,
        // Include manager info if assigned
        managerId: listing.managedById,
        managerName: listing.managedBy
      };
      
      localStorage.setItem('activeContact', JSON.stringify(contactData));
      navigate(`/dashboard/messages?listing=${encodeURIComponent(listing.id)}&type=landlord_listing`);
      return;
    }
    
    // BUSINESS RULE 4: Estate Firm listings - direct contact, NO manager involvement
    if (listing.userRole === 'estate-firm') {
      const contactData = {
        listingId: listing.id,
        title: listing.title,
        posterName: listing.posterName,
        posterId: listing.posterId,
        type: 'estate_firm_listing',
        userVerified: listing.userVerified,
        price: listing.price,
        state: listing.state,
        lga: listing.lga,
        commissionRate: 0
      };
      
      localStorage.setItem('activeContact', JSON.stringify(contactData));
      navigate(`/dashboard/messages?listing=${encodeURIComponent(listing.id)}&type=estate_firm_listing`);
      return;
    }
  };

  // BUSINESS RULE: Verify listing with KYC check
  const handleVerify = () => {
    if (!user) {
      navigate('/login');
      return;
    }

    // BUSINESS RULE: Managers must have KYC to verify
    if (user?.role === 'manager') {
      if (!canManagerVerify(user.id)) {
        alert('You must complete KYC verification before you can verify listings.');
        return;
      }
      
      // BUSINESS RULE: Managers can only verify listings they manage
      if (listing.managedById !== user.id) {
        alert('You can only verify listings that you are managing.');
        return;
      }
    }

    if (listing) {
      // Update listing verification status
      const allListings = JSON.parse(localStorage.getItem('listings')) || [];
      const updatedListings = allListings.map(l => 
        l.id === listing.id ? { 
          ...l, 
          verified: true, 
          status: 'approved',
          approvedAt: new Date().toISOString(),
          approvedBy: user?.name,
          approvedById: user?.id,
          // BUSINESS RULE: If manager verifies, they become permanently assigned
          ...(user?.role === 'manager' && {
            managedBy: user?.name,
            managedById: user?.id,
            isManaged: true
          })
        } : l
      );
      
      localStorage.setItem('listings', JSON.stringify(updatedListings));
      
      // Update current listing
      setListing(prev => ({ 
        ...prev, 
        verified: true, 
        status: 'approved',
        approvedAt: new Date().toISOString(),
        approvedBy: user?.name,
        approvedById: user?.id,
        ...(user?.role === 'manager' && {
          managedBy: user?.name,
          managedById: user?.id,
          isManaged: true
        })
      }));
      
      // Add to admin activities
      const activities = JSON.parse(localStorage.getItem('adminActivities') || '[]');
      activities.unshift({
        id: Date.now(),
        action: `Approved listing: ${listing?.title}`,
        type: 'listing',
        admin: user?.name,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem('adminActivities', JSON.stringify(activities.slice(0, 100)));
      
      alert('Listing verified successfully!');
    }
  };

  // BUSINESS RULE: Verify user (admin only)
  const handleVerifyUser = () => {
    if (user?.role !== 'admin') {
      alert('Only admins can verify users.');
      return;
    }

    if (listing) {
      const allListings = JSON.parse(localStorage.getItem('listings')) || [];
      const updatedListings = allListings.map(l => 
        l.id === listing.id ? { 
          ...l, 
          userVerified: true,
          userVerifiedAt: new Date().toISOString(),
          userVerifiedBy: user?.name
        } : l
      );
      
      localStorage.setItem('listings', JSON.stringify(updatedListings));
      
      setListing(prev => ({ 
        ...prev, 
        userVerified: true,
        userVerifiedAt: new Date().toISOString(),
        userVerifiedBy: user?.name
      }));
      
      // Add to admin activities
      const activities = JSON.parse(localStorage.getItem('adminActivities') || '[]');
      activities.unshift({
        id: Date.now(),
        action: `Verified user: ${listing?.posterName} (${listing?.userRole})`,
        type: 'user',
        admin: user?.name,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem('adminActivities', JSON.stringify(activities.slice(0, 100)));
      
      alert('User verified successfully!');
    }
  };

  // BUSINESS RULE: Reject listing (admin only)
  const handleReject = (reason = 'Does not meet guidelines') => {
    if (user?.role !== 'admin') {
      alert('Only admins can reject listings.');
      return;
    }

    if (!window.confirm('Are you sure you want to reject this listing?')) return;
    
    if (listing) {
      const allListings = JSON.parse(localStorage.getItem('listings')) || [];
      const updatedListings = allListings.map(l => 
        l.id === listing.id ? { 
          ...l, 
          verified: false,
          rejected: true,
          status: 'rejected',
          rejectionReason: reason,
          rejectedAt: new Date().toISOString(),
          rejectedBy: user?.name
        } : l
      );
      
      localStorage.setItem('listings', JSON.stringify(updatedListings));
      
      setListing(prev => ({ 
        ...prev, 
        verified: false,
        rejected: true,
        status: 'rejected',
        rejectionReason: reason,
        rejectedAt: new Date().toISOString(),
        rejectedBy: user?.name
      }));
      
      // Add to admin activities
      const activities = JSON.parse(localStorage.getItem('adminActivities') || '[]');
      activities.unshift({
        id: Date.now(),
        action: `Rejected listing: ${listing?.title}`,
        type: 'listing',
        admin: user?.name,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem('adminActivities', JSON.stringify(activities.slice(0, 100)));
      
      alert('Listing rejected!');
    }
  };

  // BUSINESS RULE: Accept to manage listing with KYC and proximity checks
  const handleAcceptToManage = () => {
    // BUSINESS RULE: Only managers can accept to manage
    if (user?.role !== 'manager') {
      alert('Only managers can accept to manage listings.');
      return;
    }

    // BUSINESS RULE: Managers must have KYC
    if (!canManagerAccept(user.id)) {
      alert('You must complete KYC verification before you can manage listings.');
      return;
    }

    // BUSINESS RULE: Check proximity (1km radius)
    if (!isNearby) {
      alert('You must be within 1km radius of the property to manage it.');
      return;
    }

    // BUSINESS RULE: Only for tenant and landlord listings, NOT estate firm
    if (listing.userRole === 'estate-firm') {
      alert('Estate firm listings do not require manager management.');
      return;
    }

    // Check if already managed
    if (listing.isManaged) {
      alert('This listing is already being managed!');
      return;
    }

    // Get current managed listings
    const managedListings = JSON.parse(localStorage.getItem('managedListings') || '[]');
    const alreadyManaged = managedListings.find(l => l.listingId === listing.id);
    
    if (alreadyManaged) {
      alert('This listing is already being managed in the system!');
      return;
    }

    // BUSINESS RULE: Add to managed listings
    const newManagedListing = {
      listingId: listing.id,
      title: listing.title,
      state: listing.state,
      lga: listing.lga,
      price: listing.price,
      acceptedAt: new Date().toISOString(),
      managerName: user?.name,
      managerId: user?.id,
      status: 'active',
      posterRole: listing.userRole,
      commissionRate: 7.5,
      managerCommission: 2.5,
      rentEasyCommission: 4
    };
    
    localStorage.setItem('managedListings', JSON.stringify([...managedListings, newManagedListing]));

    // Update listing
    const allListings = JSON.parse(localStorage.getItem('listings')) || [];
    const updatedListings = allListings.map(l => 
      l.id === listing.id ? { 
        ...l, 
        isManaged: true,
        managedBy: user?.name,
        managedById: user?.id,
        managedAt: new Date().toISOString(),
        managerAssigned: true,
        commissionRate: 7.5,
        managerCommission: 2.5,
        rentEasyCommission: 4
      } : l
    );
    
    localStorage.setItem('listings', JSON.stringify(updatedListings));
    
    setListing(prev => ({ 
      ...prev, 
      isManaged: true,
      managedBy: user?.name,
      managedById: user?.id,
      managedAt: new Date().toISOString(),
      managerAssigned: true,
      commissionRate: 7.5,
      managerCommission: 2.5,
      rentEasyCommission: 4
    }));

    // BUSINESS RULE: Notify other managers that listing is taken
    // This would be implemented in the ManagerContext
    
    // BUSINESS RULE: If this is a tenant listing, setup manager chat
    if (listing.userRole === 'tenant') {
      setupManagerChat(user.id);
    }
    
    alert('You are now managing this listing!');
  };

  // Setup manager chat for tenant listings
  const setupManagerChat = (managerId) => {
    const chats = JSON.parse(localStorage.getItem('chats') || '[]');
    
    // Check if chat already exists
    const existingChat = chats.find(c => c.listingId === listing.id);
    
    if (!existingChat) {
      const newChat = {
        id: `chat_${Date.now()}`,
        listingId: listing.id,
        participants: {
          tenant: listing.posterId,
          manager: managerId,
          admin: null
        },
        messages: [],
        type: 'tenant_manager_chat',
        createdAt: new Date().toISOString(),
        status: 'active'
      };
      
      localStorage.setItem('chats', JSON.stringify([...chats, newChat]));
    }
  };

  // Get verification type for badge
  const getVerificationType = (listing) => {
    if (listing.userRole === 'estate-firm') return 'estate';
    if (listing.userRole === 'landlord') return 'landlord';
    if (listing.userRole === 'tenant') return 'tenant';
    return 'user';
  };

  // Get listing status for display
  const getListingStatus = (listing) => {
    if (listing.rejected) return 'rejected';
    if (listing.verified && listing.status === 'approved') return 'verified';
    if (listing.status === 'pending' || (!listing.verified && !listing.rejected)) return 'pending';
    return 'unknown';
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading listing details...</p>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="not-found-container">
        <h2>Listing Not Found</h2>
        <p>The listing you're looking for doesn't exist or has been removed.</p>
        <button onClick={() => navigate('/listings')} className="btn-primary">
          Back to Listings
        </button>
      </div>
    );
  }

  return (
    <div className="listing-details-page">
      <ListingDetails
        listing={listing}
        onBack={handleBack}
        onContact={handleContact}
        onVerify={handleVerify}
        onVerifyUser={handleVerifyUser}
        onReject={handleReject}
        onAcceptToManage={handleAcceptToManage}
        userRole={user?.role}
        getVerificationType={getVerificationType}
        getListingStatus={getListingStatus}
        isNearby={isNearby}
        canManagerVerify={user?.role === 'manager' ? canManagerVerify(user.id) : false}
        canManagerAccept={user?.role === 'manager' ? canManagerAccept(user.id) : false}
      />
    </div>
  );
};

export default ListingDetailsPage;