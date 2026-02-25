// src/modules/providers/pages/ProviderReferral.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../shared/context/AuthContext';
import { supabase } from '../../../shared/lib/supabaseClient';
import ProviderPageTemplate from '../templates/ProviderPageTemplate';
import {
  FaUserFriends, FaShareAlt, FaGift, FaMoneyBill,
  FaChartLine, FaCopy, FaQrcode, FaLink,
  FaEnvelope, FaCheckCircle, FaWhatsapp, FaFacebook, FaTwitter,
  FaHistory, FaTrophy, FaCalendarAlt, FaUserPlus
} from 'react-icons/fa';
import './ProviderReferral.css';

const ProviderReferral = () => {
  const { user } = useAuth();
  const [referralStats, setReferralStats] = useState({
    totalReferrals: 0,
    activeReferrals: 0,
    convertedReferrals: 0,
    pendingEarnings: 0,
    totalEarned: 0,
    conversionRate: '0%',
    thisMonth: 0,
    lastMonth: 0
  });

  const [referralProgram] = useState({
    commission: 5000,
    conditions: 'Referred tenant must rent a property through RentEasy',
    reward: '₦5,000 per successful referral',
    terms: [
      'You can refer any user (tenant, landlord, provider, estate firm)',
      'Bonus is only paid when the referred user is a tenant and completes a rental',
      'Tenant must rent a property listed on RentEasy',
      'Commission paid after 7 days of successful rental',
      'No limit on number of referrals'
    ]
  });

  const [referrals, setReferrals] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  const [referralLink, setReferralLink] = useState('');
  const [shareMethod, setShareMethod] = useState('link');
  const [showQRCode, setShowQRCode] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (user?.id) {
      setReferralLink(`https://renteasy.com/signup?ref=${user.id}`);
      fetchReferralData();
    }
  }, [user]);

  const fetchReferralData = async () => {
    setLoading(true);
    try {
      // 1. Fetch all referrals for current user (any referred role)
      const { data: referralsData, error } = await supabase
        .from('referrals')
        .select(`
          *,
          referred:referred_id (
            full_name,
            email,
            role
          )
        `)
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setReferrals(referralsData || []);

      // Compute stats – only count conversions when earnings > 0
      const total = referralsData.length;
      const converted = referralsData.filter(r => r.earnings > 0).length;
      const active = referralsData.filter(r => r.status === 'pending' && !r.earnings).length; // pending referrals
      const totalEarned = referralsData.reduce((sum, r) => sum + (r.earnings || 0), 0);
      const pendingEarnings = referralsData
        .filter(r => r.status === 'converted' && r.earnings === 0) // waiting for rental? adjust as needed
        .reduce((sum, r) => sum + 5000, 0);

      const conversionRate = total ? Math.round((converted / total) * 100) + '%' : '0%';

      // Monthly stats
      const now = new Date();
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

      const thisMonth = referralsData.filter(r => new Date(r.created_at) >= thisMonthStart).length;
      const lastMonth = referralsData.filter(r => {
        const d = new Date(r.created_at);
        return d >= lastMonthStart && d <= lastMonthEnd;
      }).length;

      setReferralStats({
        totalReferrals: total,
        activeReferrals: active,
        convertedReferrals: converted,
        pendingEarnings,
        totalEarned,
        conversionRate,
        thisMonth,
        lastMonth
      });

      // 2. Leaderboard: top referrers by earnings (all users)
      const { data: leaderboardData, error: leaderError } = await supabase
        .from('referrals')
        .select(`
          referrer_id,
          profiles!inner(full_name),
          sum(earnings) as total_earnings,
          count(*) as total_referrals,
          count(*) filter (where earnings > 0) as converted_count
        `)
        .gt('earnings', 0) // only those with earnings
        .group('referrer_id, profiles.full_name')
        .order('total_earnings', { ascending: false })
        .limit(10);

      if (leaderError) throw leaderError;

      // Format leaderboard
      const formattedLeaderboard = (leaderboardData || []).map((entry, index) => ({
        rank: index + 1,
        name: entry.profiles.full_name || 'Anonymous',
        referrals: entry.total_referrals,
        converted: entry.converted_count,
        earnings: entry.total_earnings,
        isCurrentUser: entry.referrer_id === user.id
      }));

      setLeaderboard(formattedLeaderboard);
    } catch (error) {
      console.error('Error fetching referral data:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareMethods = [
    { id: 'link', label: 'Link', icon: <FaLink /> },
    { id: 'email', label: 'Email', icon: <FaEnvelope /> },
    { id: 'whatsapp', label: 'WhatsApp', icon: <FaWhatsapp /> },
    { id: 'facebook', label: 'Facebook', icon: <FaFacebook /> },
    { id: 'twitter', label: 'Twitter', icon: <FaTwitter /> }
  ];

  const getStatusColor = (status) => {
    switch(status) {
      case 'converted': return '#4caf50';
      case 'active': return '#2196f3';
      case 'pending': return '#ff9800';
      case 'expired': return '#f44336';
      default: return '#666';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'converted': return '💰';
      case 'active': return '👤';
      case 'pending': return '⏳';
      case 'expired': return '❌';
      default: return '👤';
    }
  };

  const handleShare = (method) => {
    let shareUrl = '';
    switch(method) {
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=Join%20RentEasy%20using%20my%20referral%20link:%20${encodeURIComponent(referralLink)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=Join%20RentEasy%20using%20my%20referral%20link&url=${encodeURIComponent(referralLink)}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=Join%20RentEasy&body=Use%20my%20referral%20link:%20${encodeURIComponent(referralLink)}`;
        break;
      default:
        return;
    }
    window.open(shareUrl, '_blank');
  };

  if (loading) {
    return <div className="loading">Loading referral data...</div>;
  }

  return (
    <ProviderPageTemplate
      title="Referral Program"
      subtitle="Earn money by referring friends to RentEasy"
      actions={
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button className="btn-secondary">
            <FaHistory style={{ marginRight: '0.5rem' }} />
            Earnings History
          </button>
          <button className="btn-primary">
            <FaShareAlt style={{ marginRight: '0.5rem' }} />
            Share Program
          </button>
        </div>
      }
    >
      {/* Stats Overview */}
      <div className="provider-grid" style={{ marginBottom: '2rem' }}>
        <div className="provider-card stats-card" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <div className="card-header">
            <h3 className="card-title" style={{ color: 'white' }}>Total Referrals</h3>
            <FaUserFriends style={{ color: 'white', fontSize: '1.5rem' }} />
          </div>
          <div className="stats-number" style={{ color: 'white' }}>{referralStats.totalReferrals}</div>
          <div className="stats-label" style={{ color: 'rgba(255,255,255,0.9)' }}>
            People referred
          </div>
        </div>

        <div className="provider-card stats-card" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
          <div className="card-header">
            <h3 className="card-title" style={{ color: 'white' }}>Converted</h3>
            <FaUserPlus style={{ color: 'white', fontSize: '1.5rem' }} />
          </div>
          <div className="stats-number" style={{ color: 'white' }}>{referralStats.convertedReferrals}</div>
          <div className="stats-label" style={{ color: 'rgba(255,255,255,0.9)' }}>
            Successful referrals
          </div>
        </div>

        <div className="provider-card stats-card" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
          <div className="card-header">
            <h3 className="card-title" style={{ color: 'white' }}>Total Earned</h3>
            <FaMoneyBill style={{ color: 'white', fontSize: '1.5rem' }} />
          </div>
          <div className="stats-number" style={{ color: 'white' }}>₦{referralStats.totalEarned.toLocaleString()}</div>
          <div className="stats-label" style={{ color: 'rgba(255,255,255,0.9)' }}>
            From referrals
          </div>
        </div>

        <div className="provider-card stats-card" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
          <div className="card-header">
            <h3 className="card-title" style={{ color: 'white' }}>Conversion Rate</h3>
            <FaChartLine style={{ color: 'white', fontSize: '1.5rem' }} />
          </div>
          <div className="stats-number" style={{ color: 'white' }}>{referralStats.conversionRate}</div>
          <div className="stats-label" style={{ color: 'rgba(255,255,255,0.9)' }}>
            Success rate
          </div>
        </div>
      </div>

      {/* Referral Program Details */}
      <div className="provider-card" style={{ marginBottom: '2rem' }}>
        <div className="card-header">
          <h3 className="card-title">Program Details</h3>
          <div className="reward-badge">
            <FaGift style={{ marginRight: '0.5rem' }} />
            Earn ₦{referralProgram.commission.toLocaleString()} per referral
          </div>
        </div>

        <div className="program-details">
          <div className="detail-section">
            <h4>How It Works</h4>
            <div className="steps">
              <div className="step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <strong>Share Your Link</strong>
                  <p>Share your unique referral link with friends</p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <strong>Friend Signs Up</strong>
                  <p>Your friend signs up using your link</p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <strong>Complete Booking</strong>
                  <p>Friend completes their first booking</p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">4</div>
                <div className="step-content">
                  <strong>Get Paid</strong>
                  <p>You receive ₦{referralProgram.commission.toLocaleString()} after 7 days</p>
                </div>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h4>Terms & Conditions</h4>
            <ul className="terms-list">
              {referralProgram.terms.map((term, index) => (
                <li key={index}>
                  <FaCheckCircle style={{ color: '#4caf50', marginRight: '0.5rem' }} />
                  {term}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Referral Link & Sharing */}
      <div className="provider-card" style={{ marginBottom: '2rem' }}>
        <div className="card-header">
          <h3 className="card-title">Your Referral Link</h3>
          <button
            className="btn-secondary"
            onClick={() => setShowQRCode(!showQRCode)}
          >
            <FaQrcode style={{ marginRight: '0.5rem' }} />
            {showQRCode ? 'Hide QR Code' : 'Show QR Code'}
          </button>
        </div>

        <div className="referral-link-section">
          <div className="link-container">
            <div className="link-display">
              <FaLink style={{ color: '#666', fontSize: '1.2rem' }} />
              <input
                type="text"
                readOnly
                value={referralLink}
                className="link-input"
              />
              <button
                className={`copy-btn ${copied ? 'copied' : ''}`}
                onClick={copyToClipboard}
              >
                <FaCopy style={{ marginRight: '0.5rem' }} />
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>

            <p className="link-note">
              Share this link with friends. You get ₦{referralProgram.commission.toLocaleString()} when they complete their first booking.
            </p>
          </div>

          {showQRCode && (
            <div className="qr-code-section">
              <div className="qr-code-placeholder">
                <div className="qr-code">
                  <FaQrcode style={{ fontSize: '6rem', color: '#1a237e' }} />
                </div>
                <p className="qr-instructions">
                  Scan this QR code with your phone's camera to visit your referral page
                </p>
              </div>
            </div>
          )}

          <div className="share-methods">
            <h4 style={{ marginBottom: '1rem' }}>Share Via</h4>
            <div className="share-buttons">
              {shareMethods.map(method => (
                <button
                  key={method.id}
                  className={`share-btn ${shareMethod === method.id ? 'active' : ''}`}
                  onClick={() => {
                    setShareMethod(method.id);
                    if (method.id !== 'link') {
                      handleShare(method.id);
                    }
                  }}
                >
                  {method.icon}
                  <span>{method.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="provider-grid">
        {/* Referrals List */}
        <div className="provider-card" style={{ gridColumn: 'span 2' }}>
          <div className="card-header">
            <h3 className="card-title">Your Referrals</h3>
            <span className="referrals-count">{referrals.length} total</span>
          </div>

          <div className="referrals-table">
            <div className="table-header">
              <div className="table-row">
                <div className="table-cell">Name</div>
                <div className="table-cell">Date Referred</div>
                <div className="table-cell">Status</div>
                <div className="table-cell">Booking</div>
                <div className="table-cell">Earnings</div>
              </div>
            </div>

            <div className="table-body">
              {referrals.map(referral => (
                <div key={referral.id} className="table-row">
                  <div className="table-cell">
                    <div className="referral-info">
                      <div className="referral-avatar">
                        {referral.referred_name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <div className="referral-name">{referral.referred_name || 'Anonymous'}</div>
                        <div className="referral-email">{referral.referred_email || ''}</div>
                      </div>
                    </div>
                  </div>

                  <div className="table-cell">
                    <div className="referral-date">
                      <FaCalendarAlt style={{ marginRight: '0.3rem', color: '#666' }} />
                      {new Date(referral.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="table-cell">
                    <div
                      className="status-badge"
                      style={{
                        background: getStatusColor(referral.status) + '20',
                        color: getStatusColor(referral.status)
                      }}
                    >
                      <span className="status-icon">{getStatusIcon(referral.status)}</span>
                      <span className="status-text">
                        {referral.status.charAt(0).toUpperCase() + referral.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  <div className="table-cell">
                    {referral.converted_at ? (
                      <div className="booking-info">
                        <div className="service-name">Booking</div>
                        <div className="booking-date">{new Date(referral.converted_at).toLocaleDateString()}</div>
                      </div>
                    ) : (
                      <span className="no-booking">No booking yet</span>
                    )}
                  </div>

                  <div className="table-cell">
                    <div className={`earnings ${referral.earnings > 0 ? 'positive' : 'pending'}`}>
                      {referral.earnings > 0 ? `₦${referral.earnings.toLocaleString()}` : '—'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="table-summary">
            <div className="summary-item">
              <strong>Total Conversions:</strong>
              <span>{referralStats.convertedReferrals}</span>
            </div>
            <div className="summary-item">
              <strong>Total Earnings:</strong>
              <span className="earnings-total">₦{referralStats.totalEarned.toLocaleString()}</span>
            </div>
            <div className="summary-item">
              <strong>Pending:</strong>
              <span className="earnings-pending">₦{referralStats.pendingEarnings.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="provider-card">
          <div className="card-header">
            <h3 className="card-title">Referral Leaderboard</h3>
            <FaTrophy style={{ color: '#ff9800', fontSize: '1.5rem' }} />
          </div>

          <div className="leaderboard">
            {leaderboard.map((entry, index) => (
              <div
                key={entry.rank}
                className={`leaderboard-entry ${entry.isCurrentUser ? 'current-user' : ''}`}
              >
                <div className="rank">
                  <span className="rank-number">{entry.rank}</span>
                  {entry.rank <= 3 && (
                    <span className="rank-medal">
                      {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : '🥉'}
                    </span>
                  )}
                </div>

                <div className="entry-info">
                  <div className="entry-name">
                    {entry.name}
                    {entry.isCurrentUser && <span className="you-badge">You</span>}
                  </div>
                  <div className="entry-stats">
                    <span>{entry.referrals} referrals</span>
                    <span>•</span>
                    <span>₦{entry.earnings.toLocaleString()}</span>
                  </div>
                </div>

                <div className="entry-earnings">
                  <div className="earnings-amount">₦{entry.earnings.toLocaleString()}</div>
                  <div className="earnings-label">earned</div>
                </div>
              </div>
            ))}
          </div>

          <div className="leaderboard-stats">
            <div className="stat">
              <div className="stat-value">#{leaderboard.find(e => e.isCurrentUser)?.rank || 'N/A'}</div>
              <div className="stat-label">Your Rank</div>
            </div>
            <div className="stat">
              <div className="stat-value">{referralStats.totalReferrals}</div>
              <div className="stat-label">Your Referrals</div>
            </div>
            <div className="stat">
              <div className="stat-value">₦{referralStats.totalEarned.toLocaleString()}</div>
              <div className="stat-label">Your Earnings</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tips & Strategies */}
      <div className="provider-card" style={{ marginTop: '2rem' }}>
        <div className="card-header">
          <h3 className="card-title">Tips to Get More Referrals</h3>
        </div>

        <div className="tips-grid">
          <div className="tip-card">
            <div className="tip-icon" style={{ background: '#e3f2fd' }}>
              <FaShareAlt style={{ color: '#2196f3' }} />
            </div>
            <div>
              <h4 style={{ margin: '0 0 0.5rem 0' }}>Share on Social Media</h4>
              <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>
                Post your referral link on Facebook, Twitter, and Instagram
              </p>
            </div>
          </div>

          <div className="tip-card">
            <div className="tip-icon" style={{ background: '#e8f5e9' }}>
              <FaEnvelope style={{ color: '#4caf50' }} />
            </div>
            <div>
              <h4 style={{ margin: '0 0 0.5rem 0' }}>Email Your Contacts</h4>
              <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>
                Send personalized emails to your professional network
              </p>
            </div>
          </div>

          <div className="tip-card">
            <div className="tip-icon" style={{ background: '#fff3e0' }}>
              <FaWhatsapp style={{ color: '#ff9800' }} />
            </div>
            <div>
              <h4 style={{ margin: '0 0 0.5rem 0' }}>WhatsApp Groups</h4>
              <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>
                Share in relevant WhatsApp groups and communities
              </p>
            </div>
          </div>

          <div className="tip-card">
            <div className="tip-icon" style={{ background: '#f3e5f5' }}>
              <FaUserFriends style={{ color: '#9c27b0' }} />
            </div>
            <div>
              <h4 style={{ margin: '0 0 0.5rem 0' }}>Tell Satisfied Clients</h4>
              <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>
                Ask happy clients to refer their friends and family
              </p>
            </div>
          </div>
        </div>
      </div>
    </ProviderPageTemplate>
  );
};

export default ProviderReferral;