// src/shared/utils/commissionCalculator.js
export const calculateCommission = (price, posterRole) => {
  // BUSINESS RULE: Estate firms have 0% commission
  if (posterRole === 'estate_firm') {
    return {
      total: 0,
      manager: 0,
      poster: 0,
      rentEasy: 0
    };
  }

  // BUSINESS RULE: Regular commission is 7.5%
  const total = price * 0.075;
  return {
    total: parseFloat(total.toFixed(2)),
    manager: parseFloat((price * 0.025).toFixed(2)), // 2.5%
    poster: parseFloat((price * 0.015).toFixed(2)),  // 1.5%
    rentEasy: parseFloat((price * 0.035).toFixed(2)) // 3.5%
  };
};

// Format currency for Nigeria
export const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '₦0';
  return `₦${amount.toLocaleString('en-NG')}`;
};