import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import ListingDetails from '../components/ListingDetails';
import './ListingDetailsPage.css';

const ListingDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [listing, setListing] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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
        userVerified: true,
        verified: true,
        verificationLevel: 'premium',
        postedDate: '2024-12-10',
        amenities: ['24/7 Security', 'Swimming Pool', 'Gym'],
        propertyType: 'Apartment',
        address: 'Lekki Phase 1, Lagos',
        timestamp: '2024-12-10T10:00:00Z',
        reviews: []
      },
      // Add other mock listings...
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
  }, [id, location.state]);

  const handleBack = () => {
    navigate('/listings');
  };

  const handleContact = () => {
    if (!user) {
      navigate('/login', { state: { from: `/listings/${id}` } });
      return;
    }
    
    if (listing && listing.userId) {
      // Navigate to messaging page with this user
      navigate(`/messages?user=${listing.userId}`, { 
        state: { 
          listingId: listing.id,
          listingTitle: listing.title 
        }
      });
    } else {
      alert('Contact information not available for this listing.');
    }
  };

  const handleVerify = () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (listing) {
      // Update listing verification status
      const allListings = JSON.parse(localStorage.getItem('listings')) || [];
      const updatedListings = allListings.map(l => 
        l.id === listing.id ? { ...l, verified: true, status: 'approved' } : l
      );
      
      localStorage.setItem('listings', JSON.stringify(updatedListings));
      
      // Update current listing
      setListing(prev => ({ ...prev, verified: true, status: 'approved' }));
      
      alert('Listing verified successfully!');
    }
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
        userRole={user?.role}
      />
    </div>
  );
};

export default ListingDetailsPage;