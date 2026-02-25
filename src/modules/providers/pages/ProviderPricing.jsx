// src/modules/providers/pages/ProviderPricing.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../shared/context/AuthContext';
import { supabase } from '../../../shared/lib/supabaseClient';
import ProviderPageTemplate from '../templates/ProviderPageTemplate';
import {
  FaPlus, FaEdit, FaTrash, FaCheck, FaTimes, FaTag,
  FaClock, FaUsers, FaStar, FaPercent, FaCopy
} from 'react-icons/fa';
import './ProviderPricing.css';

const ProviderPricing = () => {
  const { user } = useAuth();
  const [pricingPlans, setPricingPlans] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedDiscount, setSelectedDiscount] = useState(null);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [providerPlans, setProviderPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(false);

  const [newPlan, setNewPlan] = useState({
    name: '',
    description: '',
    price: '',
    currency: '₦',
    type: 'fixed',
    unit: '',
    minHours: 1,
    duration: '',
    features: '',
    popular: false,
    active: true,
    serviceCategory: ''
  });

  const [newDiscount, setNewDiscount] = useState({
    name: '',
    code: '',
    type: 'percentage',
    value: '',
    minAmount: '',
    maxUses: '',
    validUntil: '',
    active: true
  });

  const serviceCategories = ['Cleaning', 'Painting', 'Plumbing', 'Electrical', 'Maintenance', 'Renovation', 'Landscaping'];

  // Fetch data on mount
  useEffect(() => {
    if (user?.id) {
      fetchPricingPlans();
      fetchDiscounts();
    }
  }, [user]);

  const fetchPricingPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('pricing_plans')
        .select('*')
        .eq('provider_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPricingPlans(data || []);
    } catch (error) {
      console.error('Error fetching pricing plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDiscounts = async () => {
    try {
      const { data, error } = await supabase
        .from('discounts')
        .select('*')
        .eq('provider_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDiscounts(data || []);
    } catch (error) {
      console.error('Error fetching discounts:', error);
    }
  };

  const handleSavePlan = async () => {
    if (!newPlan.name || !newPlan.price || !newPlan.serviceCategory) {
      alert('Please fill in required fields');
      return;
    }

    const features = newPlan.features.split('\n').filter(f => f.trim());

    const planData = {
      provider_id: user.id,
      name: newPlan.name,
      description: newPlan.description,
      price: parseFloat(newPlan.price),
      currency: newPlan.currency,
      type: newPlan.type,
      unit: newPlan.type === 'per_unit' ? newPlan.unit : null,
      min_hours: newPlan.type === 'hourly' ? parseInt(newPlan.minHours) : null,
      duration: newPlan.duration,
      features,
      popular: newPlan.popular,
      active: newPlan.active,
      service_category: newPlan.serviceCategory
    };

    try {
      if (selectedPlan) {
        // Update
        const { error } = await supabase
          .from('pricing_plans')
          .update(planData)
          .eq('id', selectedPlan.id);
        if (error) throw error;
      } else {
        // Insert
        const { error } = await supabase
          .from('pricing_plans')
          .insert([planData]);
        if (error) throw error;
      }

      await fetchPricingPlans();
      setShowPlanModal(false);
      resetPlanForm();
    } catch (error) {
      console.error('Error saving plan:', error);
      alert('Failed to save plan');
    }
  };

  const handleSaveDiscount = async () => {
    if (!newDiscount.name || !newDiscount.code || !newDiscount.value) {
      alert('Please fill in required fields');
      return;
    }

    const discountData = {
      provider_id: user.id,
      name: newDiscount.name,
      code: newDiscount.code.toUpperCase(),
      type: newDiscount.type,
      value: parseFloat(newDiscount.value),
      min_amount: parseFloat(newDiscount.minAmount) || 0,
      max_uses: parseInt(newDiscount.maxUses) || 1000,
      used: selectedDiscount ? selectedDiscount.used : 0,
      valid_until: newDiscount.validUntil || null,
      active: newDiscount.active
    };

    try {
      if (selectedDiscount) {
        // Update
        const { error } = await supabase
          .from('discounts')
          .update(discountData)
          .eq('id', selectedDiscount.id);
        if (error) throw error;
      } else {
        // Insert
        const { error } = await supabase
          .from('discounts')
          .insert([discountData]);
        if (error) throw error;
      }

      await fetchDiscounts();
      setShowDiscountModal(false);
      resetDiscountForm();
    } catch (error) {
      console.error('Error saving discount:', error);
      alert('Failed to save discount');
    }
  };

  const handleTogglePlanStatus = async (id) => {
    const plan = pricingPlans.find(p => p.id === id);
    if (!plan) return;
    try {
      const { error } = await supabase
        .from('pricing_plans')
        .update({ active: !plan.active })
        .eq('id', id);
      if (error) throw error;
      setPricingPlans(plans =>
        plans.map(p => p.id === id ? { ...p, active: !p.active } : p)
      );
    } catch (error) {
      console.error('Error toggling plan status:', error);
    }
  };

  const handleToggleDiscountStatus = async (id) => {
    const discount = discounts.find(d => d.id === id);
    if (!discount) return;
    try {
      const { error } = await supabase
        .from('discounts')
        .update({ active: !discount.active })
        .eq('id', id);
      if (error) throw error;
      setDiscounts(ds =>
        ds.map(d => d.id === id ? { ...d, active: !d.active } : d)
      );
    } catch (error) {
      console.error('Error toggling discount status:', error);
    }
  };

  const handleDeletePlan = async (id) => {
    if (!window.confirm('Delete this pricing plan?')) return;
    try {
      const { error } = await supabase
        .from('pricing_plans')
        .delete()
        .eq('id', id);
      if (error) throw error;
      setPricingPlans(plans => plans.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting plan:', error);
    }
  };

  const handleDeleteDiscount = async (id) => {
    if (!window.confirm('Delete this discount?')) return;
    try {
      const { error } = await supabase
        .from('discounts')
        .delete()
        .eq('id', id);
      if (error) throw error;
      setDiscounts(ds => ds.filter(d => d.id !== id));
    } catch (error) {
      console.error('Error deleting discount:', error);
    }
  };

  const handleEditPlan = (plan) => {
    setSelectedPlan(plan);
    setNewPlan({
      name: plan.name,
      description: plan.description || '',
      price: plan.price.toString(),
      currency: plan.currency,
      type: plan.type,
      unit: plan.unit || '',
      minHours: plan.min_hours || 1,
      duration: plan.duration || '',
      features: plan.features.join('\n'),
      popular: plan.popular,
      active: plan.active,
      serviceCategory: plan.service_category
    });
    setShowPlanModal(true);
  };

  const handleEditDiscount = (discount) => {
    setSelectedDiscount(discount);
    setNewDiscount({
      name: discount.name,
      code: discount.code,
      type: discount.type,
      value: discount.value.toString(),
      minAmount: discount.min_amount.toString(),
      maxUses: discount.max_uses.toString(),
      validUntil: discount.valid_until || '',
      active: discount.active
    });
    setShowDiscountModal(true);
  };

  const resetPlanForm = () => {
    setSelectedPlan(null);
    setNewPlan({
      name: '',
      description: '',
      price: '',
      currency: '₦',
      type: 'fixed',
      unit: '',
      minHours: 1,
      duration: '',
      features: '',
      popular: false,
      active: true,
      serviceCategory: ''
    });
  };

  const resetDiscountForm = () => {
    setSelectedDiscount(null);
    setNewDiscount({
      name: '',
      code: '',
      type: 'percentage',
      value: '',
      minAmount: '',
      maxUses: '',
      validUntil: '',
      active: true
    });
  };
  

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    alert(`Copied: ${code}`);
  };

  const calculateUsage = (used, maxUses) => {
    return maxUses ? Math.round((used / maxUses) * 100) : 0;
  };

  const stats = {
    totalPlans: pricingPlans.length,
    activePlans: pricingPlans.filter(plan => plan.active).length,
    popularPlans: pricingPlans.filter(plan => plan.popular).length,
    totalDiscounts: discounts.length,
    activeDiscounts: discounts.filter(d => d.active).length
  };

  if (loading) return <div className="loading">Loading pricing data...</div>;

  return (
    <ProviderPageTemplate
      title="Pricing & Packages"
      subtitle="Manage your service packages and discounts"
      actions={
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            className="btn-secondary"
            onClick={() => {
              resetDiscountForm();
              setShowDiscountModal(true);
            }}
          >
            <FaTag style={{ marginRight: '0.5rem' }} />
            Add Discount
          </button>
          <button
            className="btn-primary"
            onClick={() => {
              resetPlanForm();
              setShowPlanModal(true);
            }}
          >
            <FaPlus style={{ marginRight: '0.5rem' }} />
            Add Pricing Plan
          </button>
        </div>
      }
    >
      {/* Stats Overview */}
      <div className="provider-grid" style={{ marginBottom: '2rem' }}>
        <div className="provider-card">
          <div className="card-header">
            <h3 className="card-title">Total Plans</h3>
            <FaTag style={{ color: '#1a237e', fontSize: '1.5rem' }} />
          </div>
          <div className="stats-number">{stats.totalPlans}</div>
          <div className="stats-label">Pricing plans</div>
        </div>

        <div className="provider-card">
          <div className="card-header">
            <h3 className="card-title">Active Plans</h3>
            <FaCheck style={{ color: '#4caf50', fontSize: '1.5rem' }} />
          </div>
          <div className="stats-number">{stats.activePlans}</div>
          <div className="stats-label">Currently active</div>
        </div>

        <div className="provider-card">
          <div className="card-header">
            <h3 className="card-title">Popular Plans</h3>
            <FaStar style={{ color: '#ff9800', fontSize: '1.5rem' }} />
          </div>
          <div className="stats-number">{stats.popularPlans}</div>
          <div className="stats-label">Marked as popular</div>
        </div>

        <div className="provider-card">
          <div className="card-header">
            <h3 className="card-title">Active Discounts</h3>
            <FaPercent style={{ color: '#9c27b0', fontSize: '1.5rem' }} />
          </div>
          <div className="stats-number">{stats.activeDiscounts}</div>
          <div className="stats-label">Discount codes</div>
        </div>
      </div>

      {/* Pricing Plans Section */}
      <div className="provider-card" style={{ marginBottom: '2rem' }}>
        <div className="card-header">
          <h3 className="card-title">Pricing Plans</h3>
          <p className="card-subtitle">Manage your service packages and pricing</p>
        </div>

        <div className="pricing-plans-grid">
          {pricingPlans.map(plan => (
            <div key={plan.id} className={`pricing-plan ${plan.popular ? 'popular' : ''}`}>
              {plan.popular && (
                <div className="popular-badge">
                  <FaStar /> Most Popular
                </div>
              )}

              <div className="plan-header">
                <div>
                  <h4 className="plan-name">{plan.name}</h4>
                  <p className="plan-description">{plan.description}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="plan-price">
                    {plan.currency}{plan.price.toLocaleString()}
                    {plan.type === 'hourly' && <span className="plan-unit">/hour</span>}
                    {plan.type === 'per_unit' && <span className="plan-unit">/{plan.unit}</span>}
                    {plan.type === 'monthly' && <span className="plan-unit">/month</span>}
                  </div>
                  <div className="plan-type">{plan.type.replace('_', ' ')}</div>
                </div>
              </div>

              <div className="plan-details">
                <div className="detail-item">
                  <FaTag />
                  <span>{plan.service_category}</span>
                </div>
                {plan.duration && (
                  <div className="detail-item">
                    <FaClock />
                    <span>{plan.duration}</span>
                  </div>
                )}
                <div className="detail-item">
                  <FaCheck style={{ color: plan.active ? '#4caf50' : '#f44336' }} />
                  <span>{plan.active ? 'Active' : 'Inactive'}</span>
                </div>
              </div>

              <div className="plan-features">
                <h5>Features:</h5>
                <ul>
                  {plan.features.map((feature, index) => (
                    <li key={index}>
                      <FaCheck style={{ color: '#4caf50', fontSize: '0.9rem' }} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="plan-actions">
                <button
                  className={`status-toggle ${plan.active ? 'active' : 'inactive'}`}
                  onClick={() => handleTogglePlanStatus(plan.id)}
                >
                  {plan.active ? 'Active' : 'Inactive'}
                </button>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    className="btn-secondary"
                    onClick={() => handleEditPlan(plan)}
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="btn-secondary"
                    onClick={() => handleDeletePlan(plan.id)}
                    style={{ background: '#f44336', color: 'white' }}
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Discounts Section */}
      <div className="provider-card">
        <div className="card-header">
          <h3 className="card-title">Discount Codes</h3>
          <p className="card-subtitle">Create and manage promotional discounts</p>
        </div>

        <div className="discounts-table">
          <div className="table-header">
            <div className="table-row">
              <div className="table-cell" style={{ width: '20%' }}>Discount Name</div>
              <div className="table-cell" style={{ width: '15%' }}>Code</div>
              <div className="table-cell" style={{ width: '15%' }}>Type & Value</div>
              <div className="table-cell" style={{ width: '15%' }}>Usage</div>
              <div className="table-cell" style={{ width: '15%' }}>Valid Until</div>
              <div className="table-cell" style={{ width: '10%' }}>Status</div>
              <div className="table-cell" style={{ width: '10%' }}>Actions</div>
            </div>
          </div>

          <div className="table-body">
            {discounts.map(discount => (
              <div key={discount.id} className="table-row">
                <div className="table-cell">
                  <strong>{discount.name}</strong>
                  <div style={{ fontSize: '0.8rem', color: '#666' }}>
                    Min: ₦{discount.min_amount?.toLocaleString()}
                  </div>
                </div>

                <div className="table-cell">
                  <div className="discount-code">
                    <code>{discount.code}</code>
                    <button
                      className="copy-btn"
                      onClick={() => handleCopyCode(discount.code)}
                      title="Copy code"
                    >
                      <FaCopy />
                    </button>
                  </div>
                </div>

                <div className="table-cell">
                  <div style={{ fontWeight: '600' }}>
                    {discount.type === 'percentage' ? `${discount.value}%` : `₦${discount.value.toLocaleString()}`}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#666' }}>
                    {discount.type === 'percentage' ? 'Percentage' : 'Fixed Amount'}
                  </div>
                </div>

                <div className="table-cell">
                  <div style={{ marginBottom: '0.3rem' }}>
                    {discount.used} / {discount.max_uses}
                  </div>
                  <div className="usage-bar">
                    <div
                      className="usage-fill"
                      style={{
                        width: `${calculateUsage(discount.used, discount.max_uses)}%`,
                        background: calculateUsage(discount.used, discount.max_uses) > 80 ? '#f44336' :
                                    calculateUsage(discount.used, discount.max_uses) > 50 ? '#ff9800' : '#4caf50'
                      }}
                    />
                  </div>
                </div>

                <div className="table-cell">
                  {discount.valid_until && new Date(discount.valid_until) > new Date() ? (
                    <span style={{ color: '#4caf50', fontWeight: '600' }}>
                      {new Date(discount.valid_until).toLocaleDateString()}
                    </span>
                  ) : (
                    <span style={{ color: '#f44336', fontWeight: '600' }}>
                      Expired
                    </span>
                  )}
                </div>

                <div className="table-cell">
                  <button
                    className={`status-toggle ${discount.active ? 'active' : 'inactive'}`}
                    onClick={() => handleToggleDiscountStatus(discount.id)}
                  >
                    {discount.active ? 'Active' : 'Inactive'}
                  </button>
                </div>

                <div className="table-cell">
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      className="btn-secondary"
                      onClick={() => handleEditDiscount(discount)}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="btn-secondary"
                      onClick={() => handleDeleteDiscount(discount.id)}
                      style={{ background: '#f44336', color: 'white' }}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add/Edit Plan Modal */}
      {showPlanModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '700px' }}>
            <div className="modal-header">
              <h3>{selectedPlan ? 'Edit Pricing Plan' : 'Add New Pricing Plan'}</h3>
              <button className="modal-close" onClick={() => setShowPlanModal(false)}>×</button>
            </div>

            <div className="modal-body">
              <div className="provider-grid">
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Plan Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newPlan.name}
                    onChange={(e) => setNewPlan({...newPlan, name: e.target.value})}
                    placeholder="e.g., Basic Cleaning Package"
                  />
                </div>

                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Description</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newPlan.description}
                    onChange={(e) => setNewPlan({...newPlan, description: e.target.value})}
                    placeholder="Brief description of the plan"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Service Category *</label>
                  <select
                    className="form-control"
                    value={newPlan.serviceCategory}
                    onChange={(e) => setNewPlan({...newPlan, serviceCategory: e.target.value})}
                  >
                    <option value="">Select Category</option>
                    {serviceCategories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Pricing Type</label>
                  <select
                    className="form-control"
                    value={newPlan.type}
                    onChange={(e) => setNewPlan({...newPlan, type: e.target.value})}
                  >
                    <option value="fixed">Fixed Price</option>
                    <option value="hourly">Hourly Rate</option>
                    <option value="per_unit">Per Unit</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Price *</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: '600' }}>{newPlan.currency}</span>
                    <input
                      type="number"
                      className="form-control"
                      value={newPlan.price}
                      onChange={(e) => setNewPlan({...newPlan, price: e.target.value})}
                      placeholder="0"
                    />
                  </div>
                </div>

                {newPlan.type === 'per_unit' && (
                  <div className="form-group">
                    <label className="form-label">Unit</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newPlan.unit}
                      onChange={(e) => setNewPlan({...newPlan, unit: e.target.value})}
                      placeholder="e.g., m², room, item"
                    />
                  </div>
                )}

                {newPlan.type === 'hourly' && (
                  <div className="form-group">
                    <label className="form-label">Minimum Hours</label>
                    <input
                      type="number"
                      className="form-control"
                      value={newPlan.minHours}
                      onChange={(e) => setNewPlan({...newPlan, minHours: e.target.value})}
                      min="1"
                    />
                  </div>
                )}

                {(newPlan.type === 'fixed' || newPlan.type === 'monthly') && (
                  <div className="form-group">
                    <label className="form-label">Duration</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newPlan.duration}
                      onChange={(e) => setNewPlan({...newPlan, duration: e.target.value})}
                      placeholder="e.g., 2-3 hours, Monthly"
                    />
                  </div>
                )}

                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Features (one per line)</label>
                  <textarea
                    className="form-control"
                    rows="4"
                    value={newPlan.features}
                    onChange={(e) => setNewPlan({...newPlan, features: e.target.value})}
                    placeholder="List features of this plan..."
                  />
                </div>

                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="checkbox"
                      checked={newPlan.popular}
                      onChange={(e) => setNewPlan({...newPlan, popular: e.target.checked})}
                    />
                    <span>Mark as Popular Plan</span>
                  </label>
                </div>

                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="checkbox"
                      checked={newPlan.active}
                      onChange={(e) => setNewPlan({...newPlan, active: e.target.checked})}
                    />
                    <span>Active</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowPlanModal(false)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleSavePlan}>
                {selectedPlan ? 'Update Plan' : 'Add Plan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Discount Modal */}
      {showDiscountModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3>{selectedDiscount ? 'Edit Discount' : 'Add New Discount'}</h3>
              <button className="modal-close" onClick={() => setShowDiscountModal(false)}>×</button>
            </div>

            <div className="modal-body">
              <div className="provider-grid">
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Discount Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newDiscount.name}
                    onChange={(e) => setNewDiscount({...newDiscount, name: e.target.value})}
                    placeholder="e.g., First Time Customer Discount"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Discount Code *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newDiscount.code}
                    onChange={(e) => setNewDiscount({...newDiscount, code: e.target.value.toUpperCase()})}
                    placeholder="e.g., WELCOME10"
                    style={{ textTransform: 'uppercase' }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Discount Type</label>
                  <select
                    className="form-control"
                    value={newDiscount.type}
                    onChange={(e) => setNewDiscount({...newDiscount, type: e.target.value})}
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Discount Value *</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {newDiscount.type === 'fixed' && <span>₦</span>}
                    <input
                      type="number"
                      className="form-control"
                      value={newDiscount.value}
                      onChange={(e) => setNewDiscount({...newDiscount, value: e.target.value})}
                      placeholder={newDiscount.type === 'percentage' ? '10' : '5000'}
                    />
                    {newDiscount.type === 'percentage' && <span>%</span>}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Minimum Amount</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>₦</span>
                    <input
                      type="number"
                      className="form-control"
                      value={newDiscount.minAmount}
                      onChange={(e) => setNewDiscount({...newDiscount, minAmount: e.target.value})}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Maximum Uses</label>
                  <input
                    type="number"
                    className="form-control"
                    value={newDiscount.maxUses}
                    onChange={(e) => setNewDiscount({...newDiscount, maxUses: e.target.value})}
                    placeholder="100"
                  />
                </div>

                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Valid Until</label>
                  <input
                    type="date"
                    className="form-control"
                    value={newDiscount.validUntil}
                    onChange={(e) => setNewDiscount({...newDiscount, validUntil: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="checkbox"
                      checked={newDiscount.active}
                      onChange={(e) => setNewDiscount({...newDiscount, active: e.target.checked})}
                    />
                    <span>Active</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowDiscountModal(false)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleSaveDiscount}>
                {selectedDiscount ? 'Update Discount' : 'Add Discount'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ProviderPageTemplate>
  );
};

export default ProviderPricing;