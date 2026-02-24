// src/modules/providers/components/BoostPanel.jsx
import React, { useState, useEffect } from 'react';
import { Zap, TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../../shared/context/AuthContext';
import { supabase } from '../../../shared/lib/supabaseClient';
import './BoostPanel.css';

const BoostPanel = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [boostPackages, setBoostPackages] = useState([]);
  const [activeBoost, setActiveBoost] = useState(null);
  const [showBoostOptions, setShowBoostOptions] = useState(false);

  // Fetch boost packages and active boost on mount
  useEffect(() => {
    if (!user) return;
    fetchBoostPackages();
    fetchActiveBoost();
  }, [user]);

  const fetchBoostPackages = async () => {
    try {
      const { data, error } = await supabase
        .from('boost_packages')
        .select('*')
        .order('price', { ascending: true });
      if (error) throw error;
      setBoostPackages(data || []);
    } catch (err) {
      console.error('Error fetching boost packages:', err);
    }
  };

  const fetchActiveBoost = async () => {
    try {
      const { data, error } = await supabase
        .from('active_boosts')
        .select('*, package:boost_packages(*)')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .gte('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      setActiveBoost(data);
    } catch (err) {
      console.error('Error fetching active boost:', err);
    }
  };

  const handleBoostPurchase = async (pkg) => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      // Calculate expiry date
      const startsAt = new Date();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + pkg.duration_days);

      const { data, error } = await supabase
        .from('active_boosts')
        .insert([{
          user_id: user.id,
          package_id: pkg.id,
          started_at: startsAt.toISOString(),
          expires_at: expiresAt.toISOString(),
          status: 'active'
        }])
        .select()
        .single();

      if (error) throw error;

      // Refresh active boost
      setActiveBoost(data);
      setShowBoostOptions(false);
    } catch (err) {
      console.error('Boost purchase error:', err);
      setError(err.message || 'Failed to activate boost. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // If boosted, show active panel
  if (activeBoost) {
    return (
      <div className="boost-panel active">
        <div className="boost-content">
          <div className="boost-status">
            <Zap size={20} color="#f59e0b" />
            <div className="boost-text">
              <strong>Boosted Profile</strong>
              <span>
                Active until {new Date(activeBoost.expires_at).toLocaleDateString()}
              </span>
            </div>
          </div>
          <span className="boost-badge">
            <TrendingUp size={14} />
            BOOSTED
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="boost-panel">
      <div className="boost-content">
        <div className="boost-promo">
          <Zap size={20} color="#6b7280" />
          <div className="boost-text">
            <strong>Boost Your Visibility</strong>
            <span>Get more clients with paid boost</span>
          </div>
        </div>

        <button
          className="btn btn-small btn-outline"
          onClick={() => setShowBoostOptions(!showBoostOptions)}
          disabled={loading}
        >
          <TrendingUp size={14} />
          {showBoostOptions ? 'Hide Options' : 'View Boost Options'}
        </button>

        {showBoostOptions && (
          <div className="boost-options">
            <div className="options-header">
              <h4>Boost Options</h4>
              <p>Appear above non‑boosted providers</p>
            </div>

            {error && (
              <div className="boost-error">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <div className="options-grid">
              {boostPackages.map(pkg => (
                <div key={pkg.id} className="boost-option">
                  <h5>{pkg.name}</h5>
                  <div className="option-price">₦{pkg.price.toLocaleString()}</div>
                  <p>{pkg.duration_days} days visibility</p>
                  <button
                    className="btn btn-small btn-primary"
                    onClick={() => handleBoostPurchase(pkg)}
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : 'Select'}
                  </button>
                </div>
              ))}
            </div>

            <div className="boost-note">
              <Clock size={14} />
              <p>Boost is separate from subscription and verification</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BoostPanel;