// src/modules/listings/pages/ListingDetailsPage.jsx - SUPABASE VERSION
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import { useManager } from '../../../shared/context/ManagerContext';
import { listingsService } from '../../../shared/services/listingsService';
import { messagesService } from '../../../shared/services/messagesService';
import RentEasyLoader from '../../../shared/components/RentEasyLoader';
import ListingDetails from '../components/ListingDetails';
import './ListingDetailsPage.css';

const ListingDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { canManagerVerify, canManagerAccept, getNearbyManagers } = useManager();
  
  const [listing, setListing] = useState(null);
  const [loading, setloading] = useState(true);
  const [isNearby, setIsNearby] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);

  useEffect(() => {
    loadListing();
  }, [id]);

  useEffect(() => {
    if (listing && user?.role === 'manager') {
      checkProximity();
    }
  }, [listing, user]);

  const loadListing = async () => {
    try {
      setIsLoading(true);
      
      // Try to get from location state first
      if (location.state?.listing) {
        setListing(location.state.listing);
        setIsLoading(false);
        return;
      }

      // Fetch from Supabase
      const fetchedListing = await listingsService.getById(id);
      
      if (fetchedListing) {
        setListing(fetchedListing);
      } else {
        console.error('Listing not found');
        // Could redirect to 404 page
      }
    } catch (error) {
      console.error('Error loading listing:', error);
      // Handle error appropriately
    } finally {
      setIsLoading(false);
    }
  };

  const checkProximity = () => {
    if (!listing?.coordinates) {
      setIsNearby(false);
      return;
    }

    const nearbyManagers = getNearbyManagers(listing);
    const isUserNearby = nearbyManagers.some(m => m.userId === user?.id);
    setIsNearby(isUserNearby);
  };

  const handleBack = () => {
    navigate('/listings');
  };

  // BUSINESS RULE: Contact button handler with Supabase
  const handleContact = async () => {
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

    try {
      setLoadingAction(true);
      
      // Use messagesService to initiate contact
      const result = await messagesService.initiateContact(listing.id, user.id, user.role);
      
      if (result?.chatId) {
        navigate(`/dashboard/messages/chat/${result.chatId}`);
      } else {
        alert('Failed to initiate contact. Please try again.');
      }
    } catch (error) {
      console.error('Error initiating contact:', error);
      alert(error.message || 'Failed to initiate contact');
    } finally {
      setLoadingAction(false);
    }
  };

  // BUSINESS RULE: Verify listing with KYC check (Supabase)
  const handleVerify = async () => {
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

    if (!window.confirm('Are you sure you want to verify this listing?')) return;

    try {
      setLoadingAction(true);
      await listingsService.verify(id, user.id);
      
      // Refresh listing
      await loadListing();
      alert('Listing verified successfully!');
    } catch (error) {
      console.error('Error verifying listing:', error);
      alert(error.message || 'Failed to verify listing');
    } finally {
      setLoadingAction(false);
    }
  };

  // BUSINESS RULE: Verify user (admin only)
  const handleVerifyUser = async () => {
    if (user?.role !== 'admin') {
      alert('Only admins can verify users.');
      return;
    }

    if (!window.confirm(`Are you sure you want to verify ${listing.posterName}?`)) return;

    try {
      setLoadingAction(true);
      // Note: You'll need a usersService for this
      // await usersService.verifyUser(listing.posterId, user.id);
      alert('User verification functionality coming soon');
    } catch (error) {
      console.error('Error verifying user:', error);
      alert(error.message || 'Failed to verify user');
    } finally {
      setLoadingAction(false);
    }
  };

  // BUSINESS RULE: Reject listing (admin only)
  const handleReject = async (reason = 'Does not meet guidelines') => {
    if (user?.role !== 'admin') {
      alert('Only admins can reject listings.');
      return;
    }

    const customReason = prompt('Enter rejection reason (or use default):', reason);
    if (customReason === null) return;

    if (!window.confirm('Are you sure you want to reject this listing?')) return;
    
    try {
      setLoadingAction(true);
      await listingsService.reject(id, customReason, user.id);
      
      // Refresh listing
      await loadListing();
      alert('Listing rejected!');
    } catch (error) {
      console.error('Error rejecting listing:', error);
      alert(error.message || 'Failed to reject listing');
    } finally {
      setLoadingAction(false);
    }
  };

  // BUSINESS RULE: Accept to manage listing with KYC and proximity checks (Supabase)
  const handleAcceptToManage = async () => {
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
    if (listing.posterRole === 'estate-firm') {
      alert('Estate firm listings do not require manager management.');
      return;
    }

    // BUSINESS RULE: Check if already managed
    if (listing.isManaged) {
      alert('This listing is already being managed!');
      return;
    }

    if (!window.confirm('Are you sure you want to manage this listing? This action cannot be undone.')) return;

    try {
      setLoadingAction(true);
      await listingsService.acceptToManage(id, user.id);
      
      // BUSINESS RULE: Only one manager per listing
      // The service should handle this rule
      
      // Refresh listing
      await loadListing();
      alert('You are now managing this listing!');
    } catch (error) {
      console.error('Error accepting to manage:', error);
      alert(error.message || 'Failed to accept management. It may already be managed by someone else.');
    } finally {
      setLoadingAction(false);
    }
  };

  // Get verification type for badge
  const getVerificationType = () => {
    if (listing.posterRole === 'estate-firm') return 'estate';
    if (listing.posterRole === 'landlord') return 'landlord';
    if (listing.posterRole === 'tenant') return 'tenant';
    return 'user';
  };

  // Get listing status for display
  const getListingStatus = () => {
    if (listing.rejected || listing.status === 'rejected') return 'rejected';
    if (listing.verified && listing.status === 'approved') return 'verified';
    if (listing.status === 'pending' || (!listing.verified && !listing.rejected)) return 'pending';
    return 'unknown';
  };


if (loading) {
  return <RentEasyLoader message="Loading Listings..." fullScreen />;
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
      {loadingAction && (
        <div className="action-loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      )}
      
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