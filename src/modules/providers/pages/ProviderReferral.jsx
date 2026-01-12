import React, { useState } from 'react';
import ProviderPageTemplate from '../templates/ProviderPageTemplate';
import {
  FaUserFriends, FaShareAlt, FaGift, FaMoneyBill,
  FaChartLine, FaCopy, FaQrcode, FaLink,
  FaEnvelope, FaCheckCircle, FaWhatsapp, FaFacebook, FaTwitter,
  FaHistory, FaTrophy, FaCalendarAlt, FaUserPlus
} from 'react-icons/fa';

const ProviderReferral = () => {
  const [referralStats, setReferralStats] = useState({
    totalReferrals: 24,
    activeReferrals: 8,
    convertedReferrals: 5,
    pendingEarnings: 12500,
    totalEarned: 37500,
    conversionRate: '21%',
    thisMonth: 3,
    lastMonth: 5
  });

  const [referralProgram] = useState({
    commission: 5000,
    conditions: 'Friend must complete their first booking',
    reward: '₦5,000 per successful referral',
    terms: [
      'Both you and your friend must be active users',
      'Friend must sign up using your referral link',
      'Friend must complete at least one paid booking',
      'Commission paid after 7 days of successful booking',
      'No limit on number of referrals'
    ]
  });

  const [referrals, setReferrals] = useState([
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      dateReferred: '2024-01-10',
      status: 'converted',
      bookingCompleted: '2024-01-15',
      earnings: 5000,
      service: 'House Cleaning'
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane@example.com',
      dateReferred: '2024-01-08',
      status: 'active',
      bookingCompleted: null,
      earnings: 0,
      service: null
    },
    {
      id: 3,
      name: 'Mike Johnson',
      email: 'mike@example.com',
      dateReferred: '2024-01-05',
      status: 'converted',
      bookingCompleted: '2024-01-12',
      earnings: 5000,
      service: 'Painting Service'
    },
    {
      id: 4,
      name: 'Sarah Williams',
      email: 'sarah@example.com',
      dateReferred: '2023-12-28',
      status: 'expired',
      bookingCompleted: null,
      earnings: 0,
      service: null
    },
    {
      id: 5,
      name: 'David Brown',
      email: 'david@example.com',
      dateReferred: '2023-12-20',
      status: 'converted',
      bookingCompleted: '2023-12-28',
      earnings: 5000,
      service: 'Plumbing Repair'
    },
    {
      id: 6,
      name: 'Lisa Anderson',
      email: 'lisa@example.com',
      dateReferred: '2024-01-14',
      status: 'pending',
      bookingCompleted: null,
      earnings: 0,
      service: null
    }
  ]);

  const [leaderboard, setLeaderboard] = useState([
    { rank: 1, name: 'Michael Chen', referrals: 42, earnings: 210000 },
    { rank: 2, name: 'Sarah Johnson', referrals: 35, earnings: 175000 },
    { rank: 3, name: 'David Smith', referrals: 28, earnings: 140000 },
    { rank: 4, name: 'Your Position', referrals: 24, earnings: 37500, isCurrentUser: true },
    { rank: 5, name: 'Emma Wilson', referrals: 22, earnings: 110000 },
    { rank: 6, name: 'James Brown', referrals: 18, earnings: 90000 },
    { rank: 7, name: 'Maria Garcia', referrals: 15, earnings: 75000 }
  ]);

  const [referralLink, setReferralLink] = useState('https://renteasy.com/ref/provider123');
  const [shareMethod, setShareMethod] = useState('link');
  const [showQRCode, setShowQRCode] = useState(false);
  const [copied, setCopied] = useState(false);

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

  const filteredReferrals = referrals;

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
              {filteredReferrals.map(referral => (
                <div key={referral.id} className="table-row">
                  <div className="table-cell">
                    <div className="referral-info">
                      <div className="referral-avatar">
                        {referral.name.charAt(0)}
                      </div>
                      <div>
                        <div className="referral-name">{referral.name}</div>
                        <div className="referral-email">{referral.email}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="table-cell">
                    <div className="referral-date">
                      <FaCalendarAlt style={{ marginRight: '0.3rem', color: '#666' }} />
                      {referral.dateReferred}
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
                    {referral.service ? (
                      <div className="booking-info">
                        <div className="service-name">{referral.service}</div>
                        <div className="booking-date">{referral.bookingCompleted}</div>
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

      <style jsx>{`
        .reward-badge {
          display: inline-flex;
          align-items: center;
          padding: 0.5rem 1rem;
          background: linear-gradient(135deg, #ff9800 0%, #ff5722 100%);
          color: white;
          border-radius: 20px;
          font-weight: 600;
        }
        
        .program-details {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
        }
        
        .detail-section {
          padding: 1rem;
        }
        
        .detail-section h4 {
          margin: 0 0 1rem 0;
          color: #1a237e;
        }
        
        .steps {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        
        .step {
          display: flex;
          gap: 1rem;
        }
        
        .step-number {
          width: 30px;
          height: 30px;
          background: #1a237e;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          flex-shrink: 0;
        }
        
        .step-content {
          flex: 1;
        }
        
        .step-content strong {
          display: block;
          margin-bottom: 0.3rem;
        }
        
        .step-content p {
          margin: 0;
          color: #666;
          font-size: 0.9rem;
        }
        
        .terms-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .terms-list li {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          margin-bottom: 0.8rem;
          font-size: 0.9rem;
          color: #666;
        }
        
        .referral-link-section {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        
        .link-container {
          padding: 1.5rem;
          background: #f8f9fa;
          border-radius: 12px;
        }
        
        .link-display {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }
        
        .link-input {
          flex: 1;
          padding: 0.8rem 1rem;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 0.9rem;
          background: white;
          color: #666;
        }
        
        .copy-btn {
          padding: 0.8rem 1.5rem;
          background: #1a237e;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          transition: all 0.3s ease;
        }
        
        .copy-btn:hover {
          background: #283593;
          transform: translateY(-2px);
        }
        
        .copy-btn.copied {
          background: #4caf50;
        }
        
        .link-note {
          margin: 0;
          color: #666;
          font-size: 0.9rem;
        }
        
        .qr-code-section {
          padding: 2rem;
          background: white;
          border-radius: 12px;
          border: 1px solid #e0e0e0;
          text-align: center;
        }
        
        .qr-code-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }
        
        .qr-code {
          padding: 2rem;
          background: white;
          border-radius: 12px;
          border: 2px dashed #ddd;
        }
        
        .qr-instructions {
          margin: 0;
          color: #666;
          max-width: 300px;
        }
        
        .share-methods {
          padding: 1.5rem;
          background: #f8f9fa;
          border-radius: 12px;
        }
        
        .share-buttons {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        
        .share-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem;
          background: white;
          border: 1px solid #ddd;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          min-width: 80px;
        }
        
        .share-btn:hover {
          border-color: #1a237e;
          transform: translateY(-2px);
        }
        
        .share-btn.active {
          background: #1a237e;
          color: white;
          border-color: #1a237e;
        }
        
        .share-btn svg {
          font-size: 1.5rem;
        }
        
        .share-btn span {
          font-size: 0.8rem;
          font-weight: 600;
        }
        
        .referrals-table {
          width: 100%;
        }
        
        .table-header {
          background: #f8f9fa;
          font-weight: 600;
          color: #333;
          border-bottom: 2px solid #e0e0e0;
        }
        
        .table-row {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 2fr 1fr;
          gap: 1rem;
          padding: 1rem;
          align-items: center;
        }
        
        .table-body .table-row {
          border-bottom: 1px solid #e0e0e0;
          transition: all 0.3s ease;
        }
        
        .table-body .table-row:hover {
          background: #f8f9fa;
        }
        
        .referral-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .referral-avatar {
          width: 40px;
          height: 40px;
          background: #1a237e;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 1.2rem;
        }
        
        .referral-name {
          font-weight: 600;
          margin-bottom: 0.2rem;
        }
        
        .referral-email {
          font-size: 0.8rem;
          color: #666;
        }
        
        .referral-date {
          display: flex;
          align-items: center;
          color: #666;
          font-size: 0.9rem;
        }
        
        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.9rem;
          font-weight: 600;
        }
        
        .status-icon {
          font-size: 1rem;
        }
        
        .booking-info {
          display: flex;
          flex-direction: column;
        }
        
        .service-name {
          font-weight: 600;
          margin-bottom: 0.2rem;
        }
        
        .booking-date {
          font-size: 0.8rem;
          color: #666;
        }
        
        .no-booking {
          color: #666;
          font-style: italic;
        }
        
        .earnings {
          font-weight: 600;
          font-size: 1.1rem;
        }
        
        .earnings.positive {
          color: #4caf50;
        }
        
        .earnings.pending {
          color: #ff9800;
        }
        
        .table-summary {
          display: flex;
          justify-content: space-around;
          padding: 1.5rem;
          background: #f8f9fa;
          border-radius: 12px;
          margin-top: 1rem;
        }
        
        .summary-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }
        
        .summary-item strong {
          color: #666;
          font-size: 0.9rem;
        }
        
        .earnings-total {
          font-size: 1.5rem;
          font-weight: 700;
          color: #4caf50;
        }
        
        .earnings-pending {
          font-size: 1.5rem;
          font-weight: 700;
          color: #ff9800;
        }
        
        .leaderboard {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin: 1rem 0;
          max-height: 400px;
          overflow-y: auto;
        }
        
        .leaderboard-entry {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          border-radius: 8px;
          transition: all 0.3s ease;
        }
        
        .leaderboard-entry:hover {
          background: #f8f9fa;
        }
        
        .leaderboard-entry.current-user {
          background: #e8f0fe;
          border-left: 4px solid #1a237e;
        }
        
        .rank {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.3rem;
          min-width: 40px;
        }
        
        .rank-number {
          font-size: 1.2rem;
          font-weight: 700;
          color: #1a237e;
        }
        
        .rank-medal {
          font-size: 1.2rem;
        }
        
        .entry-info {
          flex: 1;
        }
        
        .entry-name {
          font-weight: 600;
          margin-bottom: 0.3rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .you-badge {
          background: #1a237e;
          color: white;
          padding: 0.2rem 0.5rem;
          border-radius: 12px;
          font-size: 0.7rem;
          font-weight: 600;
        }
        
        .entry-stats {
          display: flex;
          gap: 0.5rem;
          font-size: 0.8rem;
          color: #666;
        }
        
        .entry-earnings {
          text-align: right;
        }
        
        .earnings-amount {
          font-weight: 700;
          color: #4caf50;
          font-size: 1.1rem;
        }
        
        .earnings-label {
          font-size: 0.7rem;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .leaderboard-stats {
          display: flex;
          justify-content: space-around;
          padding: 1.5rem;
          background: #f8f9fa;
          border-radius: 12px;
          margin-top: 1rem;
        }
        
        .leaderboard-stats .stat {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        
        .leaderboard-stats .stat-value {
          font-size: 1.8rem;
          font-weight: 700;
          color: #1a237e;
        }
        
        .leaderboard-stats .stat-label {
          color: #666;
          margin-top: 0.5rem;
          font-size: 0.9rem;
        }
        
        .tips-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-top: 1rem;
        }
        
        .tip-card {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1.5rem;
          background: white;
          border-radius: 12px;
          border: 1px solid #e0e0e0;
          transition: all 0.3s ease;
        }
        
        .tip-card:hover {
          border-color: #1a237e;
          box-shadow: 0 4px 12px rgba(26, 35, 126, 0.1);
        }
        
        .tip-icon {
          width: 50px;
          height: 50px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          flex-shrink: 0;
        }
        
        @media (max-width: 1200px) {
          .provider-card[style*="grid-column: span 2"] {
            grid-column: span 1;
          }
          
          .program-details {
            grid-template-columns: 1fr;
          }
        }
        
        @media (max-width: 768px) {
          .table-row {
            grid-template-columns: 1fr;
            gap: 0.5rem;
          }
          
          .share-buttons {
            flex-direction: column;
          }
          
          .share-btn {
            flex-direction: row;
            justify-content: center;
          }
          
          .table-summary {
            flex-direction: column;
            gap: 1rem;
          }
          
          .leaderboard-stats {
            flex-direction: column;
            gap: 1rem;
          }
          
          .tips-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </ProviderPageTemplate>
  );
};

export default ProviderReferral;