import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../../shared/context/AuthContext'
import { supabase } from '../../../shared/lib/supabaseClient'
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
  const [userLocation, setUserLocation] = useState({
    state: null,
    lga: null,
    lat: null,
    lng: null
  })

  // ========== FETCH USER PROFILE ==========
  useEffect(() => {
    if (user) {
      const fetchUserProfile = async () => {
        const { data, error } = await supabase
          .from('profiles')
          .select('state, lga, lat, lng')
          .eq('id', user.id)
          .single()
        if (!error && data) {
          setUserLocation({
            state: data.state,
            lga: data.lga,
            lat: data.lat,
            lng: data.lng
          })
        }
      }
      fetchUserProfile()
    }
  }, [user])

  // ========== FETCH ALL LISTINGS ==========
  useEffect(() => {
    fetchListingsFromSupabase()
  }, [userLocation.state, userLocation.lga]) // re‑fetch if user location changes

  const fetchListingsFromSupabase = async () => {
    try {
      setLoading(true)

      const { data: listings, error } = await supabase
        .from('listings')
        .select(`
          *,
          user:user_id (id, name, email, role, verified, phone, avatar_url, created_at)
        `)
        .in('status', ['pending', 'approved'])
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) {
        console.error('Error fetching listings:', error)
        loadMockListings()
        return
      }

      // Transform data
      const transformedListings = listings.map(listing => ({
        id: listing.id,
        title: listing.title || 'No title',
        price: parseFloat(listing.price || listing.rent_amount || 0),
        description: listing.description || 'No description',
        images: listing.images || [],
        location: listing.address || listing.landmark || 'No address',
        state: listing.state || '',
        lga: listing.lga || '',
        lat: listing.lat,
        lng: listing.lng,
        userId: listing.user_id,
        posterName: listing.user?.full_name || 'Unknown',
        userVerified: listing.user?.verified || false,
        verified: listing.is_verified || false,
        verificationLevel: listing.verification_level || 'standard',
        postedDate: new Date(listing.created_at).toLocaleDateString(),
        amenities: listing.amenities || [],
        propertyType: listing.property_type || 'Apartment',
        category: listing.category || 'residential',
        status: listing.status,
        bedrooms: listing.bedrooms,
        bathrooms: listing.bathrooms,
        area: listing.area,
        coordinates: listing.coordinates,
        posterRole: listing.poster_role,
        commissionRate: listing.commission_rate
      }))

      setAllListings(transformedListings)

      // Sort by location relevance
      const sorted = sortListingsByLocation(transformedListings, userLocation)
      // Keep top 50 sorted
      setAllListings(sorted)

      // Take top 20 and pick 8 random from them
      const top20 = sorted.slice(0, 20)
      setDisplayedListings(getRandomItems(top20, 8))

    } catch (error) {
      console.error('Error in fetchListingsFromSupabase:', error)
      loadMockListings()
    } finally {
      setLoading(false)
    }
  }

  // Fallback mock data (keep your existing mockListings array if you have one)
  const loadMockListings = () => {
    const mockListings = [
      // ... your existing mock listings ...
    ]
    setAllListings(mockListings)
    const top20 = mockListings.slice(0, 20)
    setDisplayedListings(getRandomItems(top20, 8))
  }

  // ========== LOCATION SORTING ==========
  const sortListingsByLocation = (listings, userLoc) => {
    // If user not logged in or no location info, just shuffle randomly
    if (!user || (!userLoc.state && !userLoc.lga && !userLoc.lat && !userLoc.lng)) {
      return [...listings].sort(() => Math.random() - 0.5)
    }

    return [...listings].sort((a, b) => {
      const scoreA = getLocationScore(a, userLoc)
      const scoreB = getLocationScore(b, userLoc)
      if (scoreA !== scoreB) return scoreB - scoreA
      // Same score: randomize
      return Math.random() - 0.5
    })
  }

  const getLocationScore = (listing, userLoc) => {
    let score = 0

    // Exact LGA match gets highest score
    if (listing.lga && userLoc.lga && listing.lga.toLowerCase() === userLoc.lga.toLowerCase()) {
      score = 3
    }
    // Same state but different LGA
    else if (listing.state && userLoc.state && listing.state.toLowerCase() === userLoc.state.toLowerCase()) {
      score = 2
    }
    // If coordinates available, compute distance (closer = higher score)
    else if (listing.lat && listing.lng && userLoc.lat && userLoc.lng) {
      const distance = haversineDistance(
        userLoc.lat, userLoc.lng,
        listing.lat, listing.lng
      )
      // Score based on distance: closer = higher (max 1.5, min 0)
      score = Math.max(0, 1.5 - distance / 50) // within 50km gives positive score
    }

    return score
  }

  // Haversine formula to calculate distance in km between two lat/lng points
  const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371 // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  // ========== SEARCH HANDLER ==========
  const handleSearch = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      let query = supabase
        .from('listings')
        .select(`
          *,
          user:user_id (id, name, email, role, verified, phone, avatar_url, created_at)
        `)
        .eq('is_active', true)
        .in('status', ['pending', 'approved'])

      if (searchParams.location) {
        query = query.or(
          `title.ilike.%${searchParams.location}%,` +
          `address.ilike.%${searchParams.location}%,` +
          `state.ilike.%${searchParams.location}%,` +
          `lga.ilike.%${searchParams.location}%,` +
          `city.ilike.%${searchParams.location}%`
        )
      }

      if (searchParams.price) {
        query = query.lte('price', parseInt(searchParams.price))
      }

      if (searchParams.state) {
        query = query.eq('state', searchParams.state)
      }

      if (searchParams.lga) {
        query = query.eq('lga', searchParams.lga)
      }

      const { data: listings, error } = await query
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error

      // Transform
      const transformed = listings.map(listing => ({
        id: listing.id,
        title: listing.title || 'No title',
        price: parseFloat(listing.price || listing.rent_amount || 0),
        description: listing.description || 'No description',
        images: listing.images || [],
        location: listing.address || listing.landmark || 'No address',
        state: listing.state || '',
        lga: listing.lga || '',
        lat: listing.lat,
        lng: listing.lng,
        userId: listing.user_id,
        posterName: listing.user?.name || 'Unknown',
        userVerified: listing.user?.verified || false,
        verified: listing.is_verified || false,
        verificationLevel: listing.verification_level || 'standard',
        postedDate: new Date(listing.created_at).toLocaleDateString(),
        amenities: listing.amenities || [],
        propertyType: listing.property_type || 'Apartment',
        category: listing.category || 'residential',
        status: listing.status,
        bedrooms: listing.bedrooms,
        bathrooms: listing.bathrooms,
        area: listing.area
      }))

      // Sort search results by location relevance too
      const sorted = sortListingsByLocation(transformed, userLocation)
      const top20 = sorted.slice(0, 20)
      setDisplayedListings(getRandomItems(top20, 8))

    } catch (error) {
      console.error('Search error:', error)
      // Fallback to client‑side filtering (keep your existing fallback)
    } finally {
      setLoading(false)
      const listingsSection = document.getElementById('listings')
      if (listingsSection) {
        setTimeout(() => listingsSection.scrollIntoView({ behavior: 'smooth' }), 100)
      }
    }
  }

  // ========== UTILITIES ==========
  const getRandomItems = (arr, count) => {
    if (arr.length <= count) return [...arr]
    const shuffled = [...arr].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, count)
  }

  const refreshRandomListings = (filterType = 'all') => {
    let sourceList = allListings
    if (filterType === 'verified') {
      sourceList = sourceList.filter(l => l.verified)
    }
    const top20 = sourceList.slice(0, 20)
    const newRandom = getRandomItems(top20, 8)
    setDisplayedListings(newRandom)
  }

  const getFirstImage = (listing) => {
    if (listing.images && listing.images.length > 0) {
      const image = listing.images[0]
      if (image && image.startsWith('blob:')) {
        return 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400'
      }
      return image
    }
    const defaultImages = {
      'apartment': 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400',
      'house': 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400',
      'villa': 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400',
      'commercial': 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=400',
      'default': 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400'
    }
    const type = listing.propertyType?.toLowerCase() || 'default'
    return defaultImages[type] || defaultImages.default
  }

  const getVerificationType = (listing) => {
    const role = listing.posterRole || listing.user?.role || 'user'
    if (role === 'estate-firm') return 'estate'
    if (role === 'landlord') return 'landlord'
    if (role === 'tenant') return 'tenant'
    if (listing.verificationLevel === 'premium') return 'property'
    if (listing.userVerified) return 'landlord'
    return 'user'
  }

  const getListingStatus = (listing) => {
    const status = listing.status?.toLowerCase() || 'pending'
    if (status === 'rejected') return { text: 'Rejected', class: 'rejected' }
    if (listing.verified && status === 'approved') return { text: 'Verified', class: 'verified' }
    if (status === 'pending' || (!listing.verified && status !== 'approved')) return { text: 'Pending', class: 'pending' }
    if (status === 'approved') return { text: 'Available', class: 'available' }
    return { text: 'Available', class: 'available' }
  }

  const getAmenitiesArray = (listing) => {
    if (!listing.amenities) return []
    if (Array.isArray(listing.amenities)) return listing.amenities
    if (typeof listing.amenities === 'string') {
      try {
        const parsed = JSON.parse(listing.amenities)
        if (Array.isArray(parsed)) return parsed
      } catch (e) {
        return listing.amenities.split(',').map(item => item.trim()).filter(Boolean)
      }
    }
    return []
  }

  const openMap = (location) => {
    const query = encodeURIComponent(location)
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank')
  }

  const viewListingDetails = (listing) => {
    navigate(`/listings/${listing.id}`)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setSearchParams(prev => ({ ...prev, [name]: value }))
  }

  // ========== RENDER ==========
  return (
    <main className="home-container">
      {/* HERO SECTION with integrated search */}
      <section className="hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">Find Your Perfect Home</h1>
          <p className="hero-subtitle">
            Rent directly from outgoing tenants and verified landlords — no agents, no stress.
          </p>

          <form onSubmit={handleSearch} className="hero-search-form">
            <div className="search-row">
              <input
                type="text"
                name="location"
                value={searchParams.location}
                onChange={handleInputChange}
                placeholder="Enter city, state, or landmark..."
                className="search-input"
              />
              <select
                name="price"
                value={searchParams.price}
                onChange={handleInputChange}
                className="search-select"
              >
                <option value="">Max Price</option>
                <option value="100000">₦100,000</option>
                <option value="200000">₦200,000</option>
                <option value="500000">₦500,000</option>
                <option value="1000000">₦1,000,000</option>
                <option value="2000000">₦2,000,000+</option>
              </select>
              <button type="submit" className="search-button" disabled={loading}>
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
            <div className="search-tips">
              <span className="tip">🏠 2,500+ properties</span>
              <span className="tip">✅ Verified landlords</span>
              <span className="tip">📍 Direct from owners</span>
            </div>
          </form>
        </div>
      </section>

      {/* FEATURED PROPERTIES SECTION */}
      <section className="listings-section" id="listings">
        <div className="section-header">
          <h2 className="section-title">Featured Properties</h2>
          <div className="header-actions">
            <button
              className="filter-btn"
              onClick={() => refreshRandomListings('verified')}
              disabled={loading}
            >
              ✅ Verified only
            </button>
            <button
              className="filter-btn refresh-btn"
              onClick={() => refreshRandomListings('all')}
              disabled={loading}
            >
              🔄 Refresh
            </button>
            <Link to="/listings" className="view-all-link">
              View all <span>→</span>
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
                  const amenities = getAmenitiesArray(listing)

                  return (
                    <div key={listing.id} className={`property-card ${status.class}`}>
                      <div className="property-image-container">
                        <img
                          src={getFirstImage(listing)}
                          alt={listing.title}
                          className="property-image"
                        />
                        <div className="property-status-badge">
                          <span className={`status-dot ${status.class}`}></span>
                          {status.text}
                        </div>
                        {isUserVerified && (
                          <div className="property-verified-badge">
                            <VerifiedBadge type={verificationType} size="small" showTooltip={true} />
                          </div>
                        )}
                        {listing.verificationLevel === 'premium' && (
                          <div className="premium-badge">👑 Premium</div>
                        )}
                      </div>

                      <div className="property-content">
                        <h3 className="property-title">{listing.title}</h3>
                        <p className="property-price">₦{listing.price?.toLocaleString()}</p>

                        <div className="property-details">
                          {listing.bedrooms && <span>🛏️ {listing.bedrooms} bed</span>}
                          {listing.bathrooms && <span>🚿 {listing.bathrooms} bath</span>}
                          {listing.area && <span>📐 {listing.area} sq ft</span>}
                        </div>

                        {amenities.length > 0 && (
                          <div className="property-amenities">
                            {amenities.slice(0, 3).map((amenity, idx) => (
                              <span key={idx} className="amenity-tag">{amenity}</span>
                            ))}
                            {amenities.length > 3 && (
                              <span className="amenity-tag">+{amenities.length - 3}</span>
                            )}
                          </div>
                        )}

                        <p className="property-location">
                          <span className="location-icon">📍</span>
                          {listing.location || `${listing.lga}, ${listing.state}`}
                        </p>

                        <div className="property-footer">
                          <div className="landlord-info">
                            <span className="landlord-name">{listing.posterName}</span>
                            <span className="posted-date">{listing.postedDate}</span>
                          </div>
                          <div className="action-buttons">
                            <button
                              onClick={() => openMap(listing.location || `${listing.lga}, ${listing.state}`)}
                              className="map-btn"
                            >
                              Map
                            </button>
                            <button
                              onClick={() => viewListingDetails(listing)}
                              className="details-btn"
                            >
                              Details
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
                  <p>No properties match your criteria.</p>
                  <button
                    onClick={() => {
                      setSearchParams({ location: '', price: '', state: '', lga: '' })
                      fetchListingsFromSupabase()
                    }}
                    className="reset-search-btn"
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </div>

            <div className="refresh-section">
              <p className="refresh-hint">
                Showing random properties from the most relevant locations.
                <button className="refresh-link" onClick={() => refreshRandomListings('all')}>
                  Show different
                </button>
              </p>
            </div>
          </>
        )}
      </section>

      {/* PROMO CARDS */}
      <section className="promo-section">
        <div className="promo-card manager-promo">
          <div className="promo-icon">🏢</div>
          <h3>Hire a Verified Property Manager</h3>
          <p>
            Connect with top‑rated managers and trusted property firms to manage your property seamlessly.
          </p>
          <Link to="/services?category=estate-management" className="promo-button">
            Find a Manager →
          </Link>
        </div>

        <div className="promo-card verify-promo">
          <div className="promo-icon">✅</div>
          <h3>Are You a Landlord?</h3>
          <p>
            Get your property verified and attract serious tenants directly — verified landlords get 3x more responses.
          </p>
          <Link to="/verify" className="promo-button">
            Get Verified Now →
          </Link>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="stats-section">
        <h3>Why Choose RentEasy?</h3>
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
            <div className="stat-label">Higher Trust</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">⭐</div>
            <div className="stat-label">Priority Placement</div>
          </div>
        </div>
      </section>
    </main>
  )
}

export default Home