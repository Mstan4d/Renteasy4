import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FaRocket,
  FaFire,
  FaCrown,
  FaStar,
  FaCheckCircle,
  FaClock,
  FaCalendarAlt,
  FaArrowRight,
  FaChartLine,
  FaUsers,
  FaEye,
  FaMoneyBillWave,
  FaArrowLeft,
  FaQuestionCircle,
  FaShieldAlt,
  FaGem
} from 'react-icons/fa';

const ProviderBoost = () => {
  const navigate = useNavigate();
  const [activeBoost, setActiveBoost] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [boostHistory, setBoostHistory] = useState([]);
  const [userStats, setUserStats] = useState({
    profileViews: 0,
    bookingRequests: 0,
    conversionRate: '0%',
    avgResponseTime: '0 hours'
  });

  // Boost Plans
  const boostPlans = [
    {
      id: 'basic',
      name: 'Basic Boost',
      icon: <FaRocket />,
      description: 'Increase visibility for 7 days',
      duration: 7,
      price: 1500,
      features: [
        '50% more profile views',
        'Appear in "Featured" section',
        'Priority in search results',
        'Boost badge on profile'
      ],
      stats: {
        profileViewsIncrease: '50%',
        bookingIncrease: '25%',
        position: 'Top 10 results'
      },
      popular: false,
      color: '#3B82F6'
    },
    {
      id: 'premium',
      name: 'Premium Boost',
      icon: <FaFire />,
      description: 'Maximum visibility for 14 days',
      duration: 14,
      price: 2500,
      features: [
        '100% more profile views',
        'Appear in "Top Picks" section',
        'Highest priority in search',
        'Verified + Boosted badge',
        'Analytics dashboard access'
      ],
      stats: {
        profileViewsIncrease: '100%',
        bookingIncrease: '50%',
        position: 'Top 3 results'
      },
      popular: true,
      color: '#8B5CF6'
    },
    {
      id: 'enterprise',
      name: 'Enterprise Boost',
      icon: <FaCrown />,
      description: 'Ultimate visibility for 30 days',
      duration: 30,
      price: 4000,
      features: [
        '200% more profile views',
        'Featured on homepage',
        'Exclusive "Top Provider" badge',
        'Advanced analytics',
        'Priority support',
        'Custom promotion options'
      ],
      stats: {
        profileViewsIncrease: '200%',
        bookingIncrease: '75%',
        position: '#1 in category'
      },
      popular: false,
      color: '#F59E0B'
    }
  ];

  useEffect(() => {
    // Simulate API calls
    fetchBoostData();
    fetchUserStats();
  }, []);

  const fetchBoostData = () => {
    setTimeout(() => {
      // Mock active boost
      setActiveBoost({
        id: 'premium',
        name: 'Premium Boost',
        activatedAt: '2024-01-10T10:00:00',
        expiresAt: '2024-01-24T10:00:00',
        status: 'active',
        remainingDays: 10
      });

      // Mock boost history
      setBoostHistory([
        {
          id: 'boost-001',
          plan: 'Basic Boost',
          date: '2023-12-01',
          price: 1500,
          status: 'completed',
          duration: 7,
          results: {
            profileViews: '+45%',
            bookings: '+18%'
          }
        },
        {
          id: 'boost-002',
          plan: 'Premium Boost',
          date: '2023-10-15',
          price: 2500,
          status: 'completed',
          duration: 14,
          results: {
            profileViews: '+92%',
            bookings: '+43%'
          }
        }
      ]);
    }, 1000);
  };

  const fetchUserStats = () => {
    setTimeout(() => {
      setUserStats({
        profileViews: 1247,
        bookingRequests: 89,
        conversionRate: '7.1%',
        avgResponseTime: '2.3 hours'
      });
    }, 800);
  };

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
  };

  const handlePurchaseBoost = () => {
    if (!selectedPlan) return;
    
    setLoading(true);
    
    // Simulate purchase process
    setTimeout(() => {
      setLoading(false);
      alert(`Successfully purchased ${selectedPlan.name}! Redirecting to payment...`);
      // In real app, redirect to payment gateway
      navigate('/dashboard/provider/boost-history');
    }, 1500);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-NG', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const calculateRemainingTime = (expiryDate) => {
    const expiry = new Date(expiryDate);
    const now = new Date();
    const diffTime = expiry - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      {/* Header */}
      <div style={{ 
        background: 'white', 
        borderBottom: '1px solid #e0e0e0',
        padding: '1rem 0'
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          padding: '0 1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link 
              to="/dashboard/provider"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#1a237e',
                textDecoration: 'none',
                fontWeight: '600'
              }}
            >
              <FaArrowLeft />
              Back to Dashboard
            </Link>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Link 
              to="/dashboard/provider/boost-history"
              style={{
                padding: '0.5rem 1rem',
                background: '#1a237e',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '0.9rem'
              }}
            >
              Boost History
            </Link>
          </div>
        </div>
      </div>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
        {/* Page Header */}
        <div style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '12px',
          padding: '2rem',
          color: 'white',
          marginBottom: '2rem',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <FaRocket style={{ fontSize: '2.5rem' }} />
              Boost Your Visibility
            </h1>
            <p style={{ margin: 0, fontSize: '1.1rem', opacity: 0.9, maxWidth: '600px' }}>
              Get more profile views, increase booking requests, and stand out in the marketplace with our powerful boost plans.
            </p>
          </div>
          
          {/* Stats Cards */}
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginTop: '2rem'
          }}>
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.1)', 
              padding: '1rem',
              borderRadius: '8px',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Profile Views</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{userStats.profileViews.toLocaleString()}</div>
            </div>
            
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.1)', 
              padding: '1rem',
              borderRadius: '8px',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Booking Requests</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{userStats.bookingRequests}</div>
            </div>
            
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.1)', 
              padding: '1rem',
              borderRadius: '8px',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Conversion Rate</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{userStats.conversionRate}</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
          {/* Main Content */}
          <div>
            {/* Active Boost Status */}
            {activeBoost && (
              <div style={{ 
                background: 'white',
                borderRadius: '12px',
                padding: '1.5rem',
                marginBottom: '2rem',
                borderLeft: '4px solid #10B981'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <FaGem style={{ color: '#10B981' }} />
                      <h3 style={{ margin: 0, color: '#1a237e' }}>Active Boost: {activeBoost.name}</h3>
                    </div>
                    <p style={{ margin: '0 0 1rem 0', color: '#666' }}>
                      Your profile is currently boosted and visible to more users
                    </p>
                    
                    <div style={{ display: 'flex', gap: '2rem' }}>
                      <div>
                        <div style={{ fontSize: '0.9rem', color: '#666' }}>Activated</div>
                        <div style={{ fontWeight: '600' }}>{formatDate(activeBoost.activatedAt)}</div>
                      </div>
                      
                      <div>
                        <div style={{ fontSize: '0.9rem', color: '#666' }}>Expires In</div>
                        <div style={{ fontWeight: '600', color: '#10B981' }}>
                          {activeBoost.remainingDays} days
                        </div>
                      </div>
                      
                      <div>
                        <div style={{ fontSize: '0.9rem', color: '#666' }}>Status</div>
                        <div style={{ 
                          padding: '0.25rem 0.75rem',
                          background: '#D1FAE5',
                          color: '#059669',
                          borderRadius: '20px',
                          fontSize: '0.85rem',
                          fontWeight: '600',
                          display: 'inline-block'
                        }}>
                          Active
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      onClick={() => setActiveBoost(null)}
                      style={{
                        padding: '0.5rem 1rem',
                        background: '#FEE2E2',
                        border: '1px solid #EF4444',
                        borderRadius: '8px',
                        color: '#DC2626',
                        cursor: 'pointer',
                        fontWeight: '600'
                      }}
                    >
                      Cancel Boost
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Boost Plans */}
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{ margin: '0 0 1.5rem 0', color: '#1a237e' }}>
                Choose Your Boost Plan
              </h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {boostPlans.map((plan) => (
                  <div 
                    key={plan.id}
                    onClick={() => handleSelectPlan(plan)}
                    style={{
                      background: 'white',
                      borderRadius: '12px',
                      padding: '1.5rem',
                      border: `2px solid ${selectedPlan?.id === plan.id ? plan.color : '#e0e0e0'}`,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      ...(selectedPlan?.id === plan.id && {
                        boxShadow: `0 8px 32px rgba(${plan.id === 'basic' ? '59, 130, 246' : plan.id === 'premium' ? '139, 92, 246' : '245, 158, 11'}, 0.2)`
                      })
                    }}
                  >
                    {plan.popular && (
                      <div style={{
                        position: 'absolute',
                        top: '-12px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: plan.color,
                        color: 'white',
                        padding: '0.25rem 1rem',
                        borderRadius: '20px',
                        fontSize: '0.85rem',
                        fontWeight: '600'
                      }}>
                        MOST POPULAR
                      </div>
                    )}
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                          <div style={{ 
                            width: '48px',
                            height: '48px',
                            borderRadius: '12px',
                            background: plan.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '1.5rem'
                          }}>
                            {plan.icon}
                          </div>
                          <div>
                            <h3 style={{ margin: 0, color: plan.color }}>{plan.name}</h3>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>{plan.description}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '2rem', fontWeight: '700', color: plan.color }}>
                          ₦{plan.price.toLocaleString()}
                        </div>
                        <div style={{ fontSize: '0.9rem', color: '#666' }}>
                          for {plan.duration} days
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ marginBottom: '1.5rem' }}>
                      <h4 style={{ margin: '0 0 0.75rem 0', color: '#333' }}>Key Features</h4>
                      <ul style={{ 
                        margin: 0,
                        paddingLeft: '1.5rem',
                        listStyleType: 'none'
                      }}>
                        {plan.features.map((feature, index) => (
                          <li key={index} style={{ 
                            marginBottom: '0.5rem',
                            color: '#555',
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '0.5rem'
                          }}>
                            <FaCheckCircle style={{ color: plan.color, marginTop: '0.25rem', flexShrink: 0 }} />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div style={{ 
                      background: '#f8f9fa',
                      padding: '1rem',
                      borderRadius: '8px',
                      marginBottom: '1.5rem'
                    }}>
                      <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.95rem', color: '#333' }}>Expected Results</h4>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '1.25rem', fontWeight: '700', color: plan.color }}>
                            {plan.stats.profileViewsIncrease}
                          </div>
                          <div style={{ fontSize: '0.85rem', color: '#666' }}>Profile Views</div>
                        </div>
                        
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '1.25rem', fontWeight: '700', color: plan.color }}>
                            {plan.stats.bookingIncrease}
                          </div>
                          <div style={{ fontSize: '0.85rem', color: '#666' }}>Bookings</div>
                        </div>
                        
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '1.25rem', fontWeight: '700', color: plan.color }}>
                            {plan.stats.position}
                          </div>
                          <div style={{ fontSize: '0.85rem', color: '#666' }}>Position</div>
                        </div>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => handleSelectPlan(plan)}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: selectedPlan?.id === plan.id ? plan.color : '#f1f5f9',
                        border: 'none',
                        borderRadius: '8px',
                        color: selectedPlan?.id === plan.id ? 'white' : plan.color,
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      {selectedPlan?.id === plan.id ? (
                        <>
                          <FaCheckCircle /> Selected
                        </>
                      ) : (
                        <>
                          Select This Plan
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Purchase Button */}
            {selectedPlan && (
              <div style={{ 
                background: 'white',
                borderRadius: '12px',
                padding: '1.5rem',
                position: 'sticky',
                bottom: '1rem',
                boxShadow: '0 -4px 20px rgba(0,0,0,0.1)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ margin: '0 0 0.5rem 0', color: '#1a237e' }}>
                      Purchase {selectedPlan.name}
                    </h3>
                    <p style={{ margin: 0, color: '#666' }}>
                      Total: <strong style={{ color: selectedPlan.color, fontSize: '1.2rem' }}>
                        ₦{selectedPlan.price.toLocaleString()}
                      </strong> for {selectedPlan.duration} days
                    </p>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button 
                      onClick={() => setSelectedPlan(null)}
                      style={{
                        padding: '0.75rem 1.5rem',
                        background: 'white',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        color: '#666',
                        cursor: 'pointer',
                        fontWeight: '600'
                      }}
                    >
                      Cancel
                    </button>
                    
                    <button 
                      onClick={handlePurchaseBoost}
                      disabled={loading}
                      style={{
                        padding: '0.75rem 1.5rem',
                        background: selectedPlan.color,
                        border: 'none',
                        borderRadius: '8px',
                        color: 'white',
                        cursor: 'pointer',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      {loading ? (
                        <>
                          <div className="loading-spinner-small"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <FaMoneyBillWave />
                          Purchase Now
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div>
            {/* How It Works */}
            <div style={{ 
              background: 'white',
              borderRadius: '12px',
              padding: '1.5rem',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{ margin: '0 0 1rem 0', color: '#1a237e', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FaQuestionCircle />
                How Boosting Works
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: '#E3F2FD',
                    color: '#1a237e',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '700',
                    flexShrink: 0
                  }}>
                    1
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', color: '#333' }}>Select Your Plan</div>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem', color: '#666' }}>
                      Choose duration and features that match your goals
                    </p>
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: '#E3F2FD',
                    color: '#1a237e',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '700',
                    flexShrink: 0
                  }}>
                    2
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', color: '#333' }}>Make Payment</div>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem', color: '#666' }}>
                      Secure payment through RentEasy wallet or bank transfer
                    </p>
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: '#E3F2FD',
                    color: '#1a237e',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '700',
                    flexShrink: 0
                  }}>
                    3
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', color: '#333' }}>Get Boosted</div>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem', color: '#666' }}>
                      Instant activation with visible results in 24 hours
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Boost History */}
            <div style={{ 
              background: 'white',
              borderRadius: '12px',
              padding: '1.5rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, color: '#1a237e', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FaClock />
                  Boost History
                </h3>
                <Link 
                  to="/dashboard/provider/boost-history"
                  style={{
                    fontSize: '0.9rem',
                    color: '#1a237e',
                    textDecoration: 'none',
                    fontWeight: '600'
                  }}
                >
                  View All
                </Link>
              </div>
              
              {boostHistory.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                  <FaRocket style={{ fontSize: '2rem', marginBottom: '0.5rem', color: '#ddd' }} />
                  <p style={{ margin: 0 }}>No boost history yet</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {boostHistory.map((boost) => (
                    <div key={boost.id} style={{ 
                      padding: '1rem',
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <div style={{ fontWeight: '600', color: '#333' }}>{boost.plan}</div>
                        <div style={{ fontSize: '0.9rem', color: '#666' }}>{formatDate(boost.date)}</div>
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <div>
                          <div style={{ fontSize: '0.9rem', color: '#666' }}>Results</div>
                          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem' }}>
                            <span style={{ color: '#10B981' }}>{boost.results.profileViews} views</span>
                            <span style={{ color: '#3B82F6' }}>{boost.results.bookings} bookings</span>
                          </div>
                        </div>
                        
                        <div style={{ fontWeight: '700', color: '#1a237e' }}>
                          ₦{boost.price.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <style jsx>{`
        .loading-spinner-small {
          width: 20px;
          height: 20px;
          border: 2px solid #f3f3f3;
          border-top: 2px solid #1a237e;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @media (max-width: 1024px) {
          main > div {
            grid-template-columns: 1fr;
          }
        }
        
        @media (max-width: 768px) {
          .boost-plans-grid {
            grid-template-columns: 1fr;
          }
          
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        
        @media (max-width: 480px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
          
          .purchase-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default ProviderBoost;