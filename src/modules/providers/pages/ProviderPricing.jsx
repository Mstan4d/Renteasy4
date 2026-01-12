import React, { useState } from 'react';
import ProviderPageTemplate from '../templates/ProviderPageTemplate';
import { 
  FaPlus, FaEdit, FaTrash, FaCheck, FaTimes, FaTag, 
  FaClock, FaUsers, FaStar, FaPercent, FaCopy
} from 'react-icons/fa';

const ProviderPricing = () => {
  const [pricingPlans, setPricingPlans] = useState([
    {
      id: 1,
      name: 'Basic Cleaning',
      description: 'Standard cleaning for small apartments',
      price: 15000,
      currency: '₦',
      type: 'fixed',
      duration: '2-3 hours',
      features: [
        'Dusting and wiping surfaces',
        'Vacuuming and mopping',
        'Kitchen and bathroom cleaning',
        'Trash removal'
      ],
      popular: true,
      active: true,
      serviceCategory: 'Cleaning'
    },
    {
      id: 2,
      name: 'Deep Cleaning',
      description: 'Thorough cleaning for all spaces',
      price: 30000,
      currency: '₦',
      type: 'fixed',
      duration: '4-6 hours',
      features: [
        'Everything in Basic',
        'Window cleaning',
        'Appliance cleaning',
        'Carpet shampooing',
        'Disinfection'
      ],
      popular: false,
      active: true,
      serviceCategory: 'Cleaning'
    },
    {
      id: 3,
      name: 'Painting Service',
      description: 'Professional painting per square meter',
      price: 2500,
      currency: '₦',
      type: 'per_unit',
      unit: 'per m²',
      features: [
        'Surface preparation',
        'Primer application',
        'Two coats of paint',
        'Cleanup'
      ],
      popular: true,
      active: true,
      serviceCategory: 'Painting'
    },
    {
      id: 4,
      name: 'Plumbing Consultation',
      description: 'Hourly rate for plumbing services',
      price: 5000,
      currency: '₦',
      type: 'hourly',
      minHours: 1,
      features: [
        'Diagnosis of issues',
        'Minor repairs',
        'Parts recommendation',
        'Maintenance advice'
      ],
      popular: false,
      active: true,
      serviceCategory: 'Plumbing'
    },
    {
      id: 5,
      name: 'Monthly Maintenance',
      description: 'Monthly package for regular maintenance',
      price: 45000,
      currency: '₦',
      type: 'monthly',
      duration: 'Monthly',
      features: [
        '4 visits per month',
        'Regular cleaning',
        'Minor repairs',
        'Priority support',
        '20% discount on parts'
      ],
      popular: false,
      active: false,
      serviceCategory: 'Maintenance'
    }
  ]);

  const [discounts, setDiscounts] = useState([
    {
      id: 1,
      name: 'First Time Customer',
      code: 'WELCOME10',
      type: 'percentage',
      value: 10,
      minAmount: 0,
      maxUses: 100,
      used: 45,
      validUntil: '2024-03-31',
      active: true
    },
    {
      id: 2,
      name: 'Bulk Booking',
      code: 'BULK15',
      type: 'percentage',
      value: 15,
      minAmount: 50000,
      maxUses: 50,
      used: 12,
      validUntil: '2024-06-30',
      active: true
    },
    {
      id: 3,
      name: 'Referral Discount',
      code: 'REFER20',
      type: 'fixed',
      value: 5000,
      minAmount: 20000,
      maxUses: 1000,
      used: 89,
      validUntil: '2024-12-31',
      active: true
    }
  ]);

  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedDiscount, setSelectedDiscount] = useState(null);

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

  const handleSavePlan = () => {
    if (!newPlan.name || !newPlan.price || !newPlan.serviceCategory) {
      alert('Please fill in required fields');
      return;
    }

    const features = newPlan.features.split('\n').filter(f => f.trim());
    
    if (selectedPlan) {
      // Update existing plan
      setPricingPlans(plans => plans.map(plan => 
        plan.id === selectedPlan.id 
          ? { 
              ...plan,
              ...newPlan,
              price: parseInt(newPlan.price),
              features,
              minHours: newPlan.type === 'hourly' ? parseInt(newPlan.minHours) : undefined,
              unit: newPlan.type === 'per_unit' ? newPlan.unit : undefined
            }
          : plan
      ));
    } else {
      // Add new plan
      const newPlanItem = {
        id: pricingPlans.length + 1,
        name: newPlan.name,
        description: newPlan.description,
        price: parseInt(newPlan.price),
        currency: newPlan.currency,
        type: newPlan.type,
        unit: newPlan.type === 'per_unit' ? newPlan.unit : undefined,
        minHours: newPlan.type === 'hourly' ? parseInt(newPlan.minHours) : undefined,
        duration: newPlan.duration,
        features,
        popular: newPlan.popular,
        active: newPlan.active,
        serviceCategory: newPlan.serviceCategory
      };

      setPricingPlans([...pricingPlans, newPlanItem]);
    }

    setShowPlanModal(false);
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

  const handleSaveDiscount = () => {
    if (!newDiscount.name || !newDiscount.code || !newDiscount.value) {
      alert('Please fill in required fields');
      return;
    }

    if (selectedDiscount) {
      // Update existing discount
      setDiscounts(discounts => discounts.map(discount => 
        discount.id === selectedDiscount.id 
          ? { 
              ...discount,
              ...newDiscount,
              value: parseInt(newDiscount.value),
              minAmount: parseInt(newDiscount.minAmount) || 0,
              maxUses: parseInt(newDiscount.maxUses) || 1000
            }
          : discount
      ));
    } else {
      // Add new discount
      const newDiscountItem = {
        id: discounts.length + 1,
        name: newDiscount.name,
        code: newDiscount.code,
        type: newDiscount.type,
        value: parseInt(newDiscount.value),
        minAmount: parseInt(newDiscount.minAmount) || 0,
        maxUses: parseInt(newDiscount.maxUses) || 1000,
        used: 0,
        validUntil: newDiscount.validUntil,
        active: newDiscount.active
      };

      setDiscounts([...discounts, newDiscountItem]);
    }

    setShowDiscountModal(false);
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

  const handleEditPlan = (plan) => {
    setSelectedPlan(plan);
    setNewPlan({
      name: plan.name,
      description: plan.description,
      price: plan.price.toString(),
      currency: plan.currency,
      type: plan.type,
      unit: plan.unit || '',
      minHours: plan.minHours || 1,
      duration: plan.duration || '',
      features: plan.features.join('\n'),
      popular: plan.popular,
      active: plan.active,
      serviceCategory: plan.serviceCategory
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
      minAmount: discount.minAmount.toString(),
      maxUses: discount.maxUses.toString(),
      validUntil: discount.validUntil,
      active: discount.active
    });
    setShowDiscountModal(true);
  };

  const handleTogglePlanStatus = (id) => {
    setPricingPlans(plans => plans.map(plan => 
      plan.id === id ? { ...plan, active: !plan.active } : plan
    ));
  };

  const handleToggleDiscountStatus = (id) => {
    setDiscounts(discounts => discounts.map(discount => 
      discount.id === id ? { ...discount, active: !discount.active } : discount
    ));
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    alert(`Copied: ${code}`);
  };

  const calculateUsage = (used, maxUses) => {
    return Math.round((used / maxUses) * 100);
  };

  const stats = {
    totalPlans: pricingPlans.length,
    activePlans: pricingPlans.filter(plan => plan.active).length,
    popularPlans: pricingPlans.filter(plan => plan.popular).length,
    totalDiscounts: discounts.length,
    activeDiscounts: discounts.filter(d => d.active).length
  };

  return (
    <ProviderPageTemplate
      title="Pricing & Packages"
      subtitle="Manage your service packages and discounts"
      actions={
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            className="btn-secondary"
            onClick={() => setShowDiscountModal(true)}
          >
            <FaTag style={{ marginRight: '0.5rem' }} />
            Add Discount
          </button>
          <button 
            className="btn-primary"
            onClick={() => setShowPlanModal(true)}
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
          <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#1a237e', textAlign: 'center' }}>
            {stats.totalPlans}
          </div>
          <div style={{ textAlign: 'center', color: '#666', marginTop: '0.5rem' }}>
            Pricing plans
          </div>
        </div>

        <div className="provider-card">
          <div className="card-header">
            <h3 className="card-title">Active Plans</h3>
            <FaCheck style={{ color: '#4caf50', fontSize: '1.5rem' }} />
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#4caf50', textAlign: 'center' }}>
            {stats.activePlans}
          </div>
          <div style={{ textAlign: 'center', color: '#666', marginTop: '0.5rem' }}>
            Currently active
          </div>
        </div>

        <div className="provider-card">
          <div className="card-header">
            <h3 className="card-title">Popular Plans</h3>
            <FaStar style={{ color: '#ff9800', fontSize: '1.5rem' }} />
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#ff9800', textAlign: 'center' }}>
            {stats.popularPlans}
          </div>
          <div style={{ textAlign: 'center', color: '#666', marginTop: '0.5rem' }}>
            Marked as popular
          </div>
        </div>

        <div className="provider-card">
          <div className="card-header">
            <h3 className="card-title">Active Discounts</h3>
            <FaPercent style={{ color: '#9c27b0', fontSize: '1.5rem' }} />
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#9c27b0', textAlign: 'center' }}>
            {stats.activeDiscounts}
          </div>
          <div style={{ textAlign: 'center', color: '#666', marginTop: '0.5rem' }}>
            Discount codes
          </div>
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
                  <span>{plan.serviceCategory}</span>
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
                    onClick={() => {
                      if (window.confirm('Delete this pricing plan?')) {
                        setPricingPlans(pricingPlans.filter(p => p.id !== plan.id));
                      }
                    }}
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
                    Min: ₦{discount.minAmount.toLocaleString()}
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
                    {discount.used} / {discount.maxUses}
                  </div>
                  <div className="usage-bar">
                    <div 
                      className="usage-fill"
                      style={{ 
                        width: `${calculateUsage(discount.used, discount.maxUses)}%`,
                        background: calculateUsage(discount.used, discount.maxUses) > 80 ? '#f44336' : 
                                   calculateUsage(discount.used, discount.maxUses) > 50 ? '#ff9800' : '#4caf50'
                      }}
                    />
                  </div>
                </div>
                
                <div className="table-cell">
                  {new Date(discount.validUntil) > new Date() ? (
                    <span style={{ color: '#4caf50', fontWeight: '600' }}>
                      {new Date(discount.validUntil).toLocaleDateString()}
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
                      onClick={() => {
                        if (window.confirm('Delete this discount?')) {
                          setDiscounts(discounts.filter(d => d.id !== discount.id));
                        }
                      }}
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

      <style jsx>{`
        .pricing-plans-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
        }
        
        .pricing-plan {
          background: white;
          border: 2px solid #e0e0e0;
          border-radius: 12px;
          padding: 1.5rem;
          position: relative;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
        }
        
        .pricing-plan:hover {
          border-color: #1a237e;
          box-shadow: 0 8px 15px rgba(26, 35, 126, 0.1);
        }
        
        .pricing-plan.popular {
          border-color: #ff9800;
          background: linear-gradient(135deg, #fff8e1 0%, #fff3e0 100%);
        }
        
        .popular-badge {
          position: absolute;
          top: -12px;
          right: 1.5rem;
          background: linear-gradient(135deg, #ff9800 0%, #ff5722 100%);
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .plan-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1.5rem;
        }
        
        .plan-name {
          margin: 0 0 0.5rem 0;
          font-size: 1.3rem;
          font-weight: 700;
          color: #1a237e;
        }
        
        .plan-description {
          margin: 0;
          color: #666;
          font-size: 0.9rem;
        }
        
        .plan-price {
          font-size: 1.8rem;
          font-weight: 700;
          color: #1a237e;
          line-height: 1;
        }
        
        .plan-unit {
          font-size: 1rem;
          color: #666;
          font-weight: 500;
        }
        
        .plan-type {
          font-size: 0.8rem;
          color: #666;
          text-transform: capitalize;
          margin-top: 0.3rem;
        }
        
        .plan-details {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5rem;
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 8px;
          flex-wrap: wrap;
        }
        
        .detail-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          color: #666;
        }
        
        .plan-features {
          flex: 1;
          margin-bottom: 1.5rem;
        }
        
        .plan-features h5 {
          margin: 0 0 0.5rem 0;
          color: #333;
        }
        
        .plan-features ul {
          margin: 0;
          padding-left: 1.2rem;
        }
        
        .plan-features li {
          margin-bottom: 0.5rem;
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          color: #666;
          font-size: 0.9rem;
        }
        
        .plan-features li span {
          flex: 1;
        }
        
        .plan-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: auto;
        }
        
        .status-toggle {
          padding: 0.5rem 1rem;
          border-radius: 20px;
          border: none;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .status-toggle.active {
          background: #e8f5e9;
          color: #2e7d32;
        }
        
        .status-toggle.inactive {
          background: #f5f5f5;
          color: #757575;
        }
        
        .status-toggle:hover {
          transform: translateY(-2px);
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        /* Discounts Table */
        .discounts-table {
          width: 100%;
        }
        
        .table-header {
          background: #f8f9fa;
          font-weight: 600;
          color: #333;
          border-bottom: 2px solid #e0e0e0;
        }
        
        .table-body .table-row {
          border-bottom: 1px solid #e0e0e0;
          transition: all 0.3s ease;
        }
        
        .table-body .table-row:hover {
          background: #f8f9fa;
        }
        
        .table-row {
          display: flex;
          padding: 1rem;
        }
        
        .table-cell {
          padding: 0.5rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        
        .discount-code {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .discount-code code {
          background: #f0f0f0;
          padding: 0.3rem 0.6rem;
          border-radius: 4px;
          font-family: monospace;
          font-weight: 600;
          color: #1a237e;
        }
        
        .copy-btn {
          background: none;
          border: none;
          color: #666;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .copy-btn:hover {
          color: #1a237e;
        }
        
        .usage-bar {
          height: 6px;
          background: #e0e0e0;
          border-radius: 3px;
          overflow: hidden;
        }
        
        .usage-fill {
          height: 100%;
          transition: width 0.3s ease;
        }
        
        @media (max-width: 768px) {
          .pricing-plans-grid {
            grid-template-columns: 1fr;
          }
          
          .table-row {
            flex-direction: column;
            gap: 1rem;
          }
          
          .table-cell {
            width: 100% !important;
          }
          
          .plan-header {
            flex-direction: column;
            gap: 1rem;
          }
          
          .plan-actions {
            flex-direction: column;
            gap: 1rem;
          }
        }
      `}</style>
    </ProviderPageTemplate>
  );
};

export default ProviderPricing;