import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../../shared/context/AuthContext'
import { supabase } from '../../../shared/lib/supabaseClient' // Add Supabase import
import VerifiedBadge, { InlineVerifiedBadge } from '../../../shared/components/VerifiedBadge'
import './Home.css'

const Home = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [allListings, setAllListings] = useState([])
  const [displayedListings, setDisplayedListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchParams, setSearchParams] = useState({
    location: '',
    price: '',
    state: '',
    lga: ''
  })

  // Function to get random listings
  const getRandomListings = (listingsArray, count = 8) => {
    if (listingsArray.length <= count) return [...listingsArray]
    
    const shuffled = [...listingsArray].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, count)
  }

  useEffect(() => {
    fetchListingsFromSupabase()
  }, [])

  const fetchListingsFromSupabase = async () => {
  try {
    setLoading(true)
    
    // ✅ FIXED: Fetch both pending and approved listings
    const { data: listings, error } = await supabase
      .from('listings')
      .select(`
        *,
        user:user_id (id, full_name, email, role, verified, phone, avatar_url, created_at)
      `)
      // ✅ CRITICAL: Show BOTH pending and approved listings
      .in('status', ['pending', 'approved'])
      // ✅ CRITICAL: Only active listings
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Error fetching listings:', error)
      loadMockListings()
      return
    }

    console.log('📊 Fetched listings from Supabase:', listings.length)

    // Transform Supabase data
    const transformedListings = listings.map(listing => {
      // Get price (could be price or rent_amount)
      const price = listing.price || listing.rent_amount || 0;
      
      return {
        id: listing.id,
        title: listing.title || 'No title',
        price: parseFloat(price),
        description: listing.description || 'No description',
        images: listing.images || [],
        location: listing.address || listing.landmark || 'No address',
        state: listing.state || '',
        lga: listing.lga || '',
        userId: listing.user_id,
        posterName: listing.user?.full_name || 'Unknown',
        userVerified: listing.user?.verified || false,
        verified: listing.is_verified || false,
        verificationLevel: listing.verification_level || 'standard',
        postedDate: new Date(listing.created_at).toLocaleDateString(),
        amenities: listing.amenities || [],
        propertyType: listing.property_type || 'Apartment',
        category: listing.category || 'residential',
        status: listing.status, // This is 'pending' or 'approved'
        is_active: listing.is_active,
        bedrooms: listing.bedrooms,
        bathrooms: listing.bathrooms,
        area: listing.area,
        coordinates: listing.coordinates,
        posterRole: listing.poster_role,
        commissionRate: listing.commission_rate
      }
    })

    setAllListings(transformedListings)
    
    // Get RANDOM listings for display
    const randomListings = getRandomListings(transformedListings, 8)
    setDisplayedListings(randomListings)

  } catch (error) {
    console.error('Error in fetchListingsFromSupabase:', error)
    loadMockListings()
  } finally {
    setLoading(false)
  }
}

  const loadMockListings = () => {
    // Your existing mock listings data
    const mockListings = [
      // ... (keep your existing mock listings)
    ]
    
    setAllListings(mockListings)
    const randomListings = getRandomListings(mockListings, 8)
    setDisplayedListings(randomListings)
  }

  // FIXED: Hero button scrolls to search section
  const scrollToSearch = () => {
    const searchSection = document.getElementById('search')
    if (searchSection) {
      searchSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      })
    }
  }
const handleSearch = async (e) => {
  e.preventDefault()
  
  try {
    setLoading(true)
    
    // Build query for Supabase
    let query = supabase
      .from('listings')
      .select(`
        *,
        user:user_id (id, full_name, email, role, verified, phone, avatar_url, created_at)
      `)
      .eq('is_active', true)
      .in('status', ['pending', 'approved']) // ✅ Show both pending and approved

    // Add location filter if provided
    if (searchParams.location) {
      query = query.or(
        `title.ilike.%${searchParams.location}%,` +
        `address.ilike.%${searchParams.location}%,` +
        `state.ilike.%${searchParams.location}%,` +
        `lga.ilike.%${searchParams.location}%,` +
        `city.ilike.%${searchParams.location}%`
      )
    }

    // Add price filter if provided
    if (searchParams.price) {
      query = query.lte('price', parseInt(searchParams.price))
    }

    // Add state filter if provided
    if (searchParams.state) {
      query = query.eq('state', searchParams.state)
    }

    // Add LGA filter if provided
    if (searchParams.lga) {
      query = query.eq('lga', searchParams.lga)
    }

    const { data: listings, error } = await query
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) throw error

    // Transform the data
    const transformedListings = listings.map(listing => {
      const price = listing.price || listing.rent_amount || 0;
      
      return {
        id: listing.id,
        title: listing.title || 'No title',
        price: parseFloat(price),
        description: listing.description || 'No description',
        images: listing.images || [],
        location: listing.address || listing.landmark || 'No address',
        state: listing.state || '',
        lga: listing.lga || '',
        userId: listing.user_id,
        posterName: listing.user?.full_name || 'Unknown',
        userVerified: listing.user?.verified || false,
        verified: listing.is_verified || false,
        verificationLevel: listing.verification_level || 'standard',
        postedDate: new Date(listing.created_at).toLocaleDateString(),
        amenities: listing.amenities || [],
        propertyType: listing.property_type || 'Apartment',
        category: listing.category || 'residential',
        status: listing.status
      }
    })

    // Get RANDOM listings from filtered results
    const randomFilteredListings = getRandomListings(transformedListings, 8)
    setDisplayedListings(randomFilteredListings)

  } catch (error) {
    console.error('Search error:', error)
    
    // Fallback to client-side filtering
    const filtered = allListings.filter(listing => {
      const matchesLocation = !searchParams.location || 
        (listing.location && listing.location.toLowerCase().includes(searchParams.location.toLowerCase())) ||
        (listing.title && listing.title.toLowerCase().includes(searchParams.location.toLowerCase())) ||
        (listing.state && listing.state.toLowerCase().includes(searchParams.location.toLowerCase())) ||
        (listing.lga && listing.lga.toLowerCase().includes(searchParams.location.toLowerCase()))
      
      const matchesPrice = !searchParams.price || (listing.price && listing.price <= parseInt(searchParams.price))
      
      return matchesLocation && matchesPrice
    })
    
    const randomFilteredListings = getRandomListings(filtered, 8)
    setDisplayedListings(randomFilteredListings)
    
  } finally {
    setLoading(false)
    
    // Smooth scroll to listings
    const listingsSection = document.getElementById('listings')
    if (listingsSection) {
      setTimeout(() => {
        listingsSection.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    }
  }
}

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setSearchParams(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const openMap = (location) => {
    const query = encodeURIComponent(location)
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank')
  }

  // FIXED: View Listing Details - navigate to listing details page
  const viewListingDetails = (listing) => {
    navigate(`/listings/${listing.id}`)
  }

  // Get first image for card display
const getFirstImage = (listing) => {
  if (listing.images && listing.images.length > 0) {
    const image = listing.images[0];
    
    // Handle blob URLs
    if (image && image.startsWith('blob:')) {
      return 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400';
    }
    
    return image;
  }
  
  // Default property images based on type
  const defaultImages = {
    'apartment': 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400',
    'house': 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400',
    'villa': 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w-400',
    'commercial': 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=400',
    'default': 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400'
  };
  
  const type = listing.propertyType?.toLowerCase() || 'default';
  return defaultImages[type] || defaultImages.default;
}

  // Function to get verification badge type
  // Function to get verification badge type
const getVerificationType = (listing) => {
  // Check user role or poster role
  const role = listing.posterRole || listing.user?.role || 'user';
  
  if (role === 'estate-firm') return 'estate';
  if (role === 'landlord') return 'landlord';
  if (role === 'tenant') return 'tenant';
  if (listing.verificationLevel === 'premium') return 'property';
  if (listing.userVerified) return 'landlord';
  return 'user';
}
  // Function to get listing status for display
const getListingStatus = (listing) => {
  // Handle database status values
  const status = listing.status?.toLowerCase() || 'pending';
  
  if (status === 'rejected') {
    return { text: 'Rejected', class: 'rejected' };
  }
  
  if (listing.verified && status === 'approved') {
    return { text: 'Verified', class: 'verified' };
  }
  
  if (status === 'pending' || (!listing.verified && status !== 'approved')) {
    return { text: 'Pending', class: 'pending' };
  }
  
  if (status === 'approved') {
    return { text: 'Available', class: 'available' };
  }
  
  return { text: 'Available', class: 'available' };
}
  // Function to refresh with new random listings
  const refreshRandomListings = (filterType = 'all') => {
    let listingsToFilter = allListings
    
    if (filterType === 'verified') {
      listingsToFilter = allListings.filter(listing => listing.verified)
    }
    
    const newRandomListings = getRandomListings(listingsToFilter, 8)
    setDisplayedListings(newRandomListings)
  }

  // Helper function to safely get amenities as an array
const getAmenitiesArray = (listing) => {
  if (!listing.amenities) return [];
  
  // If it's already an array, return it
  if (Array.isArray(listing.amenities)) {
    return listing.amenities;
  }
  
  // If it's a string, try to parse it
  if (typeof listing.amenities === 'string') {
    // Try to parse as JSON first
    try {
      const parsed = JSON.parse(listing.amenities);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {
      // If not JSON, split by comma
      return listing.amenities.split(',').map(item => item.trim()).filter(Boolean);
    }
  }
  
  return [];
};

  return (
    // REMOVED: <Header /> - PublicLayout already includes it
    <main className="home-container">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">Find Apartments Easily Without Agents</h1>
          <p className="hero-subtitle">
            Rent directly from outgoing tenants and verified landlords.
          </p>
        </div>
      </section>

      {/* Enhanced Search Section */}
      <section className="search-section" id="search">
        <div className="search-header">
          <h2 className="search-title">Find Your Perfect Home</h2>
          <p className="search-subtitle">Search thousands of verified properties from direct landlords</p>
        </div>
        
        <form className="search-form" onSubmit={handleSearch}>
          <div className="form-row">
            <div className="form-group">
              <input
                type="text"
                name="location"
                value={searchParams.location}
                onChange={handleInputChange}
                placeholder="📍 Enter city, state, or landmark..."
                className="search-input"
              />
            </div>

            <div className="form-group">
              <input
                type="number"
                name="price"
                value={searchParams.price}
                onChange={handleInputChange}
                placeholder="💰 Maximum budget"
                className="search-input"
              />
            </div>

            <button type="submit" className="search-button" disabled={loading}>
              <span className="search-icon">🔍</span>
              {loading ? 'Searching...' : 'Search Properties'}
            </button>
          </div>
          
          <div className="search-tips">
            <span className="tip">💡 Try: "Lagos" | "₦500,000" | "2 Bedroom"</span>
            <span className="tip">✅ Only verified landlords</span>
            <span className="tip">🏠 Direct from owners</span>
          </div>
        </form>
      </section>

      {/* Listings Section */}
      <section className="listings-section" id="listings">
        <div className="section-header">
          <div className="header-left">
            <h2 className="section-title">Featured Properties</h2>
            <p className="section-subtitle">
              {loading ? 'Loading properties...' : 'Discover random properties from our database - refreshed on every visit!'}
            </p>
          </div>
          <div className="filter-options">
            <button 
              className="filter-btn primary"
              onClick={() => refreshRandomListings('verified')}
              disabled={loading}
            >
              ✅ Show Verified Only
            </button>
            <button 
              className="filter-btn"
              onClick={() => refreshRandomListings('all')}
              disabled={loading}
            >
              🔄 Get New Random Listings
            </button>
            <Link to="/listings" className="view-all-btn">
              View All Listings →
            </Link>
          </div>
        </div>
        
        {loading ? (
          <div className="loading-listings">
            <div className="loading-spinner"></div>
            <p>Loading properties...</p>
          </div>
        ) : (
          <>
            <div className="listings-grid">
              {displayedListings.length > 0 ? (
                displayedListings.map((listing) => {
                  const verificationType = getVerificationType(listing)
                  const status = getListingStatus(listing)
                  const isUserVerified = listing.userVerified
                  const isPropertyVerified = listing.verified
                  
                  return (
                    <div key={listing.id} className={`property-card ${status.class}`}>
                      {/* Property Image */}
                      <div className="property-image-container">
                        <img 
                          src={getFirstImage(listing)} 
                          alt={listing.title} 
                          className="property-image" 
                        />
                        
                        {/* Status Badge */}
                        <div className="property-status-badge">
                          <span className={`status-dot ${status.class}`}></span>
                          {status.text}
                        </div>
                        
                        {/* Verified Badge Overlay */}
                        {isUserVerified && (
                          <div className="property-verified-overlay">
                            <VerifiedBadge 
                              type={verificationType} 
                              size="small"
                              showTooltip={true}
                            />
                          </div>
                        )}
                        
                        {/* Premium Badge */}
                        {listing.verificationLevel === 'premium' && (
                          <div className="premium-badge">
                            👑 Premium
                          </div>
                        )}
                      </div>
                      
                      {/* Property Content */}
                      <div className="property-content">
                        <div className="property-header">
                          <h3>{listing.title}</h3>
                          {isUserVerified && (
                            <div className="property-verification-status">
                              <InlineVerifiedBadge type={verificationType} />
                            </div>
                          )}
                        </div>
                        
                        <p className="property-price">₦{listing.price?.toLocaleString() || '0'}</p>
                        <p className="property-desc">{listing.description}</p>
                        
                        {/* Property Details */}
                        <div className="property-details">
                          {listing.bedrooms && <span>🛏️ {listing.bedrooms} bed</span>}
                          {listing.bathrooms && <span>🚿 {listing.bathrooms} bath</span>}
                          {listing.area && <span>📐 {listing.area} sq ft</span>}
                        </div>
                        
                        {/* Amenities */}
                       {getAmenitiesArray(listing).length > 0 && (
  <div className="property-amenities">
    {getAmenitiesArray(listing).slice(0, 3).map((amenity, index) => (
      <span key={index} className="amenity-tag">
        {amenity}
      </span>
    ))}
    {getAmenitiesArray(listing).length > 3 && (
      <span className="amenity-tag">+{getAmenitiesArray(listing).length - 3} more</span>
    )}
  </div>
)}
                        <p className="property-location">
                          <span className="location-icon">📍</span>
                          {listing.location || `${listing.lga}, ${listing.state}`}
                        </p>
                        
                        <div className="property-footer">
                          <div className="landlord-info">
                            <span className="landlord-name">
                              {listing.posterName || 'Unknown'}
                            </span>
                            <span className="posted-date">
                              {listing.postedDate || 'Recently'}
                            </span>
                          </div>
                          
                          <div className="property-actions">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation()
                                openMap(listing.location || `${listing.lga}, ${listing.state}`)
                              }}
                              className="map-button"
                            >
                              📍 Map
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation()
                                viewListingDetails(listing)
                              }}
                              className="details-button"
                            >
                              🔍 Details
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="no-results">
                  <div className="no-results-icon">🏠</div>
                  <p>No properties found</p>
                  <button 
                    onClick={() => {
                      const newRandomListings = getRandomListings(allListings, 8)
                      setDisplayedListings(newRandomListings)
                      setSearchParams({ location: '', price: '', state: '', lga: '' })
                    }}
                    className="reset-search-btn"
                  >
                    Show Random Properties
                  </button>
                </div>
              )}
            </div>
            
            {/* Refresh Button */}
            <div className="refresh-section">
              <button 
                className="refresh-btn"
                onClick={() => refreshRandomListings('all')}
              >
                🔄 Show Different Random Properties
              </button>
              <p className="refresh-hint">
                The properties shown are randomly selected from our database. 
                Click above to see different properties!
              </p>
            </div>
          </>
        )}
      </section>

      {/* Promo Sections */}
      <section className="promo-section">
        <div className="promo-card manager-promo">
          <div className="promo-header">
            <h2>Hire a Verified Property Manager</h2>
            <VerifiedBadge type="estate" size="small" />
          </div>
          <p>
            Connect with top-rated managers and trusted property firms to manage your property seamlessly. 
            Filter by location and ratings to find the perfect fit.
          </p>
          <Link to="/services?category=estate-management" className="promo-button">
            Find a Manager
          </Link>
        </div>

        <div className="promo-card verify-promo">
          <div className="promo-header">
            <h2>Are You a Landlord?</h2>
            <VerifiedBadge type="landlord" size="small" />
          </div>
          <p>
            Get your property verified and attract serious tenants directly — 
            no agents, no stress. Verified landlords get 3x more responses!
          </p>
          <Link to="/verify" className="promo-button">
            Get Verified Now
          </Link>
        </div>
      </section>

      {/* Verification Stats */}
      <div className="verification-stats">
        <h3>Why Get Verified?</h3>
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-number">3x</div>
            <div className="stat-label">More Responses</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">50%</div>
            <div className="stat-label">Faster Transactions</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">90%</div>
            <div className="stat-label">Higher Trust Score</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">⭐</div>
            <div className="stat-label">Priority Placement</div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default Home