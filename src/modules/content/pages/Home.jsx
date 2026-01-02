import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../../shared/context/AuthContext'
import Header from '../../../shared/components/Header'
import VerifiedBadge, { InlineVerifiedBadge } from '../../../shared/components/VerifiedBadge'
import './Home.css'

const Home = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [allListings, setAllListings] = useState([]) // Store ALL listings
  const [displayedListings, setDisplayedListings] = useState([]) // Random listings to display
  const [searchParams, setSearchParams] = useState({
    location: '',
    price: '',
    state: '',
    lga: ''
  })

  // Function to get random listings
  const getRandomListings = (listingsArray, count = 8) => {
    if (listingsArray.length <= count) return [...listingsArray]
    
    // Create a copy of the array and shuffle it
    const shuffled = [...listingsArray].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, count)
  }

  useEffect(() => {
    // Load REAL listings from localStorage
    const savedListings = JSON.parse(localStorage.getItem('listings')) || []
    
    // Add mock listings for demo
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
        category: 'residential'
      },
      { 
        id: 'mock_2', 
        title: "Self-contain in Garki", 
        price: 400000, 
        description: "Near market · Secure", 
        images: [
          "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
          "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=800",
          "https://images.unsplash.com/photo-1560184897-67f4a3f9a7fa?w=800"
        ], 
        location: "Garki, Abuja", 
        state: "Abuja", 
        lga: "Garki",
        userId: 'landlord_002',
        posterName: 'John Doe',
        userVerified: false,
        verified: false,
        status: 'pending',
        postedDate: '2024-12-12',
        amenities: ['Water Supply', '24/7 Electricity'],
        propertyType: 'Self Contain',
        category: 'residential'
      },
      { 
        id: 'mock_3', 
        title: "3 Bedroom Duplex in Ikeja", 
        price: 3000000, 
        description: "Fully furnished · Parking", 
        images: [
          "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800",
          "https://images.unsplash.com/photo-1560448204-67f1d4b7b1f4?w=800",
          "https://images.unsplash.com/photo-1560448204-67f1d4b7b1f5?w=800"
        ], 
        location: "Ikeja, Lagos", 
        state: "Lagos", 
        lga: "Ikeja",
        userId: 'landlord_003',
        posterName: 'Estate Masters',
        userVerified: true,
        verified: true,
        verificationLevel: 'estate',
        postedDate: '2024-12-11',
        amenities: ['Parking Space', 'Garden', 'Playground', 'CCTV'],
        propertyType: 'Duplex',
        category: 'residential'
      },
      { 
        id: 'mock_4', 
        title: "Studio Apartment in Victoria Island", 
        price: 1800000, 
        description: "Modern · Sea view · Fully serviced", 
        images: [
          "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800",
          "https://images.unsplash.com/photo-1560448204-67f1d4b7b1f6?w=800",
          "https://images.unsplash.com/photo-1560448204-67f1d4b7b1f7?w=800"
        ], 
        location: "Victoria Island, Lagos", 
        state: "Lagos", 
        lga: "Victoria Island",
        userId: 'landlord_004',
        posterName: 'Luxury Homes',
        userVerified: true,
        verified: true,
        verificationLevel: 'premium',
        postedDate: '2024-12-13',
        amenities: ['Sea View', 'Concierge', 'Smart Home'],
        propertyType: 'Studio',
        category: 'residential'
      },
      { 
        id: 'mock_5', 
        title: "Office Space in Abuja Central", 
        price: 5000000, 
        description: "Prime location · Fully serviced", 
        images: [
          "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800",
          "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800",
          "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800"
        ], 
        location: "Central Business District, Abuja", 
        state: "Abuja", 
        lga: "Central",
        userId: 'landlord_005',
        posterName: 'Corporate Spaces Ltd',
        userVerified: true,
        verified: true,
        verificationLevel: 'premium',
        postedDate: '2024-12-14',
        amenities: ['24/7 Power', 'High-Speed Internet', 'Conference Room'],
        propertyType: 'Office',
        category: 'commercial'
      },
      { 
        id: 'mock_6', 
        title: "4-Bedroom Detached House, Port Harcourt", 
        price: 3500000, 
        description: "Family home · Large compound", 
        images: [
          "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800",
          "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800",
          "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800"
        ], 
        location: "GRA Phase 2, Port Harcourt", 
        state: "Rivers", 
        lga: "Port Harcourt",
        userId: 'landlord_006',
        posterName: 'Port Harcourt Properties',
        userVerified: true,
        verified: true,
        verificationLevel: 'standard',
        postedDate: '2024-12-09',
        amenities: ['Security House', 'Parking for 4 cars', 'Garden'],
        propertyType: 'Detached House',
        category: 'residential'
      },
      { 
        id: 'mock_7', 
        title: "Shop Space in Surulere", 
        price: 1200000, 
        description: "High traffic area · Corner shop", 
        images: [
          "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800",
          "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800",
          "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800"
        ], 
        location: "Bode Thomas, Surulere, Lagos", 
        state: "Lagos", 
        lga: "Surulere",
        userId: 'landlord_007',
        posterName: 'Retail Spaces Ltd',
        userVerified: true,
        verified: true,
        verificationLevel: 'standard',
        postedDate: '2024-12-08',
        amenities: ['24/7 Security', 'Parking Space', 'Storage'],
        propertyType: 'Shop',
        category: 'commercial'
      },
      { 
        id: 'mock_8', 
        title: "Mini-Flat in Yaba", 
        price: 800000, 
        description: "Student-friendly · Close to UNILAG", 
        images: [
          "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800",
          "https://images.unsplash.com/photo-1558036117-15e82a2c9a9a?w=800",
          "https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=800"
        ], 
        location: "Yaba, Lagos", 
        state: "Lagos", 
        lga: "Yaba",
        userId: 'landlord_008',
        posterName: 'Student Accommodation',
        userVerified: true,
        verified: true,
        verificationLevel: 'standard',
        postedDate: '2024-12-07',
        amenities: ['24/7 Power', 'Study Area', 'WiFi'],
        propertyType: 'Mini-Flat',
        category: 'residential'
      }
    ]
    
    // Combine all listings
    const combinedListings = [...savedListings, ...mockListings]
    
    // Remove duplicates by ID
    const uniqueListings = combinedListings.filter((listing, index, self) =>
      index === self.findIndex(l => l.id === listing.id)
    )
    
    setAllListings(uniqueListings)
    
    // Get RANDOM listings for display (8 random properties)
    const randomListings = getRandomListings(uniqueListings, 8)
    setDisplayedListings(randomListings)
  }, [])

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

  const handleSearch = (e) => {
    e.preventDefault()
    
    const { location, price } = searchParams
    
    // Filter listings based on search criteria
    const filtered = allListings.filter(listing => {
      const matchesLocation = !location || 
        (listing.location && listing.location.toLowerCase().includes(location.toLowerCase())) ||
        (listing.title && listing.title.toLowerCase().includes(location.toLowerCase())) ||
        (listing.state && listing.state.toLowerCase().includes(location.toLowerCase())) ||
        (listing.lga && listing.lga.toLowerCase().includes(location.toLowerCase()))
      
      const matchesPrice = !price || (listing.price && listing.price <= parseInt(price))
      
      return matchesLocation && matchesPrice
    })
    
    // Get RANDOM listings from filtered results
    const randomFilteredListings = getRandomListings(filtered, 8)
    setDisplayedListings(randomFilteredListings)
    
    // Smooth scroll to listings
    const listingsSection = document.getElementById('listings')
    if (listingsSection) {
      setTimeout(() => {
        listingsSection.scrollIntoView({ behavior: 'smooth' })
      }, 100)
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
    // Navigate to listing details with the listing ID
    navigate(`/listings/${listing.id}`, { state: { listing } })
  }

  // Get first image for card display
  const getFirstImage = (listing) => {
    if (listing.images && listing.images.length > 0) {
      return listing.images[0]
    }
    return listing.image || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400'
  }

  // Function to get verification badge type
  const getVerificationType = (listing) => {
    if (listing.userRole === 'estate-firm') return 'estate'
    if (listing.verificationLevel === 'premium') return 'property'
    if (listing.userVerified && listing.userRole === 'landlord') return 'landlord'
    if (listing.userVerified && listing.userRole === 'tenant') return 'tenant'
    return 'user'
  }

  // Function to get listing status for display
  const getListingStatus = (listing) => {
    if (listing.rejected) return { text: 'Rejected', class: 'rejected' }
    if (listing.verified && listing.status === 'approved') return { text: 'Verified', class: 'verified' }
    if (listing.status === 'pending' || (!listing.verified && !listing.rejected)) return { text: 'Pending', class: 'pending' }
    return { text: 'Unknown', class: 'unknown' }
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

  return (
    <>
      <Header />
      
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
                <div className="input-icon">
                </div>
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
                <div className="input-icon">
                </div>
                <input
                  type="number"
                  name="price"
                  value={searchParams.price}
                  onChange={handleInputChange}
                  placeholder="💰 Minimum budget"
                  className="search-input"
                />
              </div>

              <button type="submit" className="search-button">
                <span className="search-icon">🔍</span>
                Search Properties
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
                Discover random properties from our database - refreshed on every visit!
              </p>
            </div>
            <div className="filter-options">
              <button 
                className="filter-btn primary"
                onClick={() => refreshRandomListings('verified')}
              >
                ✅ Show Verified Only
              </button>
              <button 
                className="filter-btn"
                onClick={() => refreshRandomListings('all')}
              >
                🔄 Get New Random Listings
              </button>
              <Link to="/listings" className="view-all-btn">
                View All Listings →
              </Link>
            </div>
          </div>
          
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
                 {/* <div className="random-badge">
                        Random Pick
                     </div> */}
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
                      
                      {/* Property Type Badge */}
                      <div className="property-type-badge">
                        <span className={`type-tag ${listing.category || 'residential'}`}>
                          {listing.propertyType || 'Apartment'}
                        </span>
                      </div>
                      
                      {/* Verification Info */}
                      <div className="property-verification-info">
                        {isUserVerified && (
                          <span className="verification-detail verified">
                            <span className="verification-icon">✓</span>
                            Verified {listing.userRole || 'User'}
                          </span>
                        )}
                        
                        {!isUserVerified && (
                          <span className="verification-detail unverified">
                            <span className="verification-icon">⚠️</span>
                            Unverified
                          </span>
                        )}
                        
                        {isPropertyVerified && (
                          <span className="verification-detail property-verified">
                            <span className="verification-icon">🏠</span>
                            Property Verified
                          </span>
                        )}
                      </div>
                      
                      {/* Amenities */}
                      {listing.amenities && listing.amenities.length > 0 && (
                        <div className="property-amenities">
                          {listing.amenities.slice(0, 3).map((amenity, index) => (
                            <span key={index} className="amenity-tag">
                              {amenity}
                            </span>
                          ))}
                          {listing.amenities.length > 3 && (
                            <span className="amenity-tag">+{listing.amenities.length - 3} more</span>
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
                            {listing.posterName || listing.landlordName || 'Unknown'}
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
                <p>No properties match your search</p>
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
    </>
  )
}

export default Home