import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import { supabase } from '../../../shared/lib/supabaseClient';
import RentEasyLoader from '../../../shared/components/RentEasyLoader';
import ListingCard from '../../listings/components/ListingCard'; // adjust path if needed
import './Home.css';

const ITEMS_TO_SHOW = 8;
const BOOST_RATIO = 0.8;

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [allListings, setAllListings] = useState([]);
  const [displayedListings, setDisplayedListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useState({
    location: '',
    price: '',
    state: '',
    lga: ''
  });
  const [userLocation, setUserLocation] = useState({
    state: null,
    lga: null,
    lat: null,
    lng: null
  });
  const [boostedUserIds, setBoostedUserIds] = useState([]);

  // Fetch user location
  useEffect(() => {
    if (user) {
      const fetchUserProfile = async () => {
        const { data, error } = await supabase
          .from('profiles')
          .select('state, lga, lat, lng')
          .eq('id', user.id)
          .single();
        if (!error && data) {
          setUserLocation({
            state: data.state,
            lga: data.lga,
            lat: data.lat,
            lng: data.lng
          });
        }
      };
      fetchUserProfile();
    }
  }, [user]);

  // Fetch boosted users
  useEffect(() => {
    const fetchBoostedUsers = async () => {
      const { data, error } = await supabase
        .from('active_boosts')
        .select('user_id')
        .eq('status', 'active')
        .gte('expires_at', new Date().toISOString());
      if (!error && data) {
        setBoostedUserIds(data.map(b => b.user_id));
      }
    };
    fetchBoostedUsers();
  }, []);

  // Fetch listings
  useEffect(() => {
    fetchListingsFromSupabase();
  }, [userLocation.state, userLocation.lga, boostedUserIds]);

  const fetchListingsFromSupabase = async () => {
    try {
      setLoading(true);
      const { data: listings, error } = await supabase
        .from('listings')
        .select('*')
        .in('status', ['pending', 'approved'])
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Collect IDs for related data
      const estateFirmIds = listings.map(l => l.estate_firm_id).filter(Boolean);
      const landlordIds = listings.map(l => l.landlord_id).filter(Boolean);
      const tenantIds = listings.map(l => l.tenant_id).filter(Boolean);

      // Fetch related data in parallel
      const [estateFirmsRes, landlordsRes, tenantsRes] = await Promise.all([
        estateFirmIds.length
          ? supabase.from('estate_firm_profiles').select('id, firm_name, logo_url, verification_status').in('id', estateFirmIds)
          : { data: [] },
        landlordIds.length
          ? supabase.from('profiles').select('id, full_name, name, avatar_url, kyc_status').in('id', landlordIds)
          : { data: [] },
        tenantIds.length
          ? supabase.from('profiles').select('id, full_name, name, avatar_url, kyc_status').in('id', tenantIds)
          : { data: [] }
      ]);

      const estateFirmMap = Object.fromEntries((estateFirmsRes.data || []).map(ef => [ef.id, ef]));
      const landlordMap = Object.fromEntries((landlordsRes.data || []).map(l => [l.id, l]));
      const tenantMap = Object.fromEntries((tenantsRes.data || []).map(t => [t.id, t]));

      const transformedListings = (listings || []).map(listing => {
        let posterRole = null;
        let posterName = 'Anonymous';
        let posterAvatar = null;
        let userVerified = false;

        if (listing.estate_firm_id && estateFirmMap[listing.estate_firm_id]) {
          const firm = estateFirmMap[listing.estate_firm_id];
          posterRole = 'estate-firm';
          posterName = firm.firm_name || 'Estate Firm';
          posterAvatar = firm.logo_url;
          userVerified = firm.verification_status === 'verified';
        } else if (listing.landlord_id && landlordMap[listing.landlord_id]) {
          const landlord = landlordMap[listing.landlord_id];
          posterRole = 'landlord';
          posterName = landlord.full_name || landlord.name || 'Landlord';
          posterAvatar = landlord.avatar_url;
          userVerified = landlord.kyc_status === 'approved';
        } else if (listing.tenant_id && tenantMap[listing.tenant_id]) {
          const tenant = tenantMap[listing.tenant_id];
          posterRole = 'tenant';
          posterName = tenant.full_name || tenant.name || 'Tenant';
          posterAvatar = tenant.avatar_url;
          userVerified = tenant.kyc_status === 'approved';
        }

        return {
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
          userId: listing.estate_firm_id || listing.landlord_id || listing.tenant_id,
          posterRole,
          posterName,
          posterAvatar,
          userVerified,
          verified: listing.verified || false,
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
          commissionRate: listing.commission_rate,
          extra_fees: listing.extra_fees,
          created_at: listing.created_at,
          // Add video support
    video_url: listing.video_url || null,           // Single video URL
    video_urls: listing.video_urls || [],           // Multiple video URLs
    has_video: !!(listing.video_url || (listing.video_urls && listing.video_urls.length > 0))
        };
      });

      setAllListings(transformedListings);

      // Boost and location sorting (same as before)
      const boosted = transformedListings.filter(l => boostedUserIds.includes(l.userId));
      const nonBoosted = transformedListings.filter(l => !boostedUserIds.includes(l.userId));
      const shuffledBoosted = shuffleArray(boosted);
      const shuffledNonBoosted = shuffleArray(nonBoosted);

      const boostedNeeded = Math.min(Math.round(ITEMS_TO_SHOW * BOOST_RATIO), shuffledBoosted.length);
      const nonBoostedNeeded = Math.min(ITEMS_TO_SHOW - boostedNeeded, shuffledNonBoosted.length);

      const selectedBoosted = shuffledBoosted.slice(0, boostedNeeded);
      const selectedNonBoosted = shuffledNonBoosted.slice(0, nonBoostedNeeded);

      const combined = [];
      const maxLen = Math.max(selectedBoosted.length, selectedNonBoosted.length);
      for (let i = 0; i < maxLen; i++) {
        if (i < selectedBoosted.length) combined.push(selectedBoosted[i]);
        if (i < selectedNonBoosted.length) combined.push(selectedNonBoosted[i]);
      }

      setDisplayedListings(combined.slice(0, ITEMS_TO_SHOW));

    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const shuffleArray = (array) => {
    const a = [...array];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  const refreshRandomListings = (filterType = 'all') => {
    let sourceList = allListings;
    if (filterType === 'verified') {
      sourceList = sourceList.filter(l => l.verified);
    }
    const boosted = sourceList.filter(l => boostedUserIds.includes(l.userId));
    const nonBoosted = sourceList.filter(l => !boostedUserIds.includes(l.userId));
    const shuffledBoosted = shuffleArray(boosted);
    const shuffledNonBoosted = shuffleArray(nonBoosted);
    const boostedNeeded = Math.min(Math.round(ITEMS_TO_SHOW * BOOST_RATIO), shuffledBoosted.length);
    const nonBoostedNeeded = Math.min(ITEMS_TO_SHOW - boostedNeeded, shuffledNonBoosted.length);
    const selectedBoosted = shuffledBoosted.slice(0, boostedNeeded);
    const selectedNonBoosted = shuffledNonBoosted.slice(0, nonBoostedNeeded);

    const combined = [];
    for (let i = 0; i < Math.max(selectedBoosted.length, selectedNonBoosted.length); i++) {
      if (i < selectedBoosted.length) combined.push(selectedBoosted[i]);
      if (i < selectedNonBoosted.length) combined.push(selectedNonBoosted[i]);
    }
    setDisplayedListings(combined.slice(0, ITEMS_TO_SHOW));
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // For simplicity, just refresh from Supabase with the same filters
      await fetchListingsFromSupabase();
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
      const listingsSection = document.getElementById('listings');
      if (listingsSection) {
        setTimeout(() => listingsSection.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({ ...prev, [name]: value }));
  };

  const viewListingDetails = (listing) => {
    navigate(`/listings/${listing.id}`);
  };

  const tenantListings = allListings.filter(l => l.posterRole === 'tenant');

  if (loading) {
    return <RentEasyLoader message="Loading..." fullScreen />;
  }

  return (
    <main className="home-container">
      {/* HERO SECTION */}
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

      {/* HORIZONTAL SCROLL SECTION – LATEST FROM TENANTS */}
      {tenantListings.length > 0 && (
        <div className="horizontal-scroll-section">
          <div className="section-header">
            <h2 className="section-title">Latest from Outgoing Tenants</h2>
          </div>
          <div className="scroll-container">
            {tenantListings.map(listing => (
              <div key={listing.id} className="scroll-item">
                <ListingCard
                  listing={listing}
                  onViewDetails={() => viewListingDetails(listing)}
                  onContact={() => {}}
                  onVerify={() => {}}
                  userRole={user?.role}
                />
              </div>
            ))}
          </div>
        </div>
      )}

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
                displayedListings.map((listing) => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    onViewDetails={() => viewListingDetails(listing)}
                    onContact={() => {}}
                    onVerify={() => {}}
                    userRole={user?.role}
                  />
                ))
              ) : (
                <div className="no-results">
                  <div className="no-results-icon">🏠</div>
                  <p>No properties match your criteria.</p>
                  <button
                    onClick={() => {
                      setSearchParams({ location: '', price: '', state: '', lga: '' });
                      fetchListingsFromSupabase();
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
                Showing boosted and nearby properties first.
                <button className="refresh-link" onClick={() => refreshRandomListings('all')}>
                  Show different
                </button>
              </p>
            </div>
          </>
        )}
      </section>

      {/* PROMO CARDS & STATS – unchanged */}
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
  );
};

export default Home;