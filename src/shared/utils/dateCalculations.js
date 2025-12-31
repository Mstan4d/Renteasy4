import { differenceInDays, addDays, isBefore, isAfter } from 'date-fns';

/**
 * Calculate days remaining until a date
 * @param {string|Date} endDate - The expiry date
 * @returns {number} Days remaining (negative if overdue)
 */
export const calculateDaysRemaining = (endDate) => {
  const today = new Date();
  const expiry = new Date(endDate);
  return differenceInDays(expiry, today);
};

/**
 * Get countdown status based on days remaining
 * @param {number} daysRemaining - Days until expiry
 * @returns {string} Status: 'critical', 'warning', 'normal', 'expired'
 */
export const getCountdownStatus = (daysRemaining) => {
  if (daysRemaining <= 0) return 'expired';
  if (daysRemaining <= 7) return 'critical';
  if (daysRemaining <= 30) return 'warning';
  return 'normal';
};

/**
 * Calculate next payment date based on frequency
 * @param {string} frequency - 'yearly', 'biannually', 'quarterly', 'monthly'
 * @param {Date} lastPaymentDate - Last payment date
 * @returns {Date} Next payment due date
 */
export const calculateNextPaymentDate = (frequency, lastPaymentDate) => {
  const lastDate = new Date(lastPaymentDate);
  
  switch (frequency) {
    case 'yearly':
      return addDays(lastDate, 365);
    case 'biannually':
      return addDays(lastDate, 182);
    case 'quarterly':
      return addDays(lastDate, 91);
    case 'monthly':
      return addDays(lastDate, 30);
    default:
      return addDays(lastDate, 30);
  }
};

/**
 * Check if payment is overdue
 * @param {Date} dueDate - Payment due date
 * @param {number} gracePeriod - Grace period in days
 * @returns {boolean} True if payment is overdue
 */
export const isPaymentOverdue = (dueDate, gracePeriod = 7) => {
  const today = new Date();
  const graceEndDate = addDays(new Date(dueDate), gracePeriod);
  return isAfter(today, graceEndDate);
};

/**
 * Calculate late fee amount
 * @param {number} rentAmount - Original rent amount
 * @param {number} daysOverdue - Days payment is overdue
 * @param {number} dailyPenaltyRate - Daily penalty rate (e.g., 0.05 for 5%)
 * @returns {number} Late fee amount
 */
export const calculateLateFee = (rentAmount, daysOverdue, dailyPenaltyRate = 0.05) => {
  if (daysOverdue <= 0) return 0;
  return rentAmount * dailyPenaltyRate * daysOverdue;
};

/**
 * Get renewal recommendation based on market trends
 * @param {Object} property - Property object
 * @param {Object} marketData - Current market data
 * @returns {Object} Renewal recommendation
 */
export const getRenewalRecommendation = (property, marketData) => {
  const currentRent = property.rentAmount;
  const marketAverage = marketData.averageRentForArea;
  const rentIncreasePercentage = ((marketAverage - currentRent) / currentRent) * 100;
  
  let recommendation = 'maintain';
  let suggestedRent = currentRent;
  
  if (rentIncreasePercentage > 15) {
    recommendation = 'increase';
    suggestedRent = currentRent * 1.1; // 10% increase
  } else if (rentIncreasePercentage < -10) {
    recommendation = 'decrease';
    suggestedRent = currentRent * 0.95; // 5% decrease to retain tenant
  }
  
  return {
    recommendation,
    suggestedRent,
    marketAverage,
    rentIncreasePercentage: Math.round(rentIncreasePercentage)
  };
};

/**
 * Generate payment schedule for a lease
 * @param {Date} startDate - Lease start date
 * @param {Date} endDate - Lease end date
 * @param {string} frequency - Payment frequency
 * @param {number} amount - Payment amount
 * @returns {Array} Array of payment dates and amounts
 */
export const generatePaymentSchedule = (startDate, endDate, frequency, amount) => {
  const schedule = [];
  let currentDate = new Date(startDate);
  const end = new Date(endDate);
  
  while (isBefore(currentDate, end)) {
    schedule.push({
      dueDate: new Date(currentDate),
      amount,
      status: 'pending'
    });
    
    // Move to next payment date
    switch (frequency) {
      case 'yearly':
        currentDate = addDays(currentDate, 365);
        break;
      case 'biannually':
        currentDate = addDays(currentDate, 182);
        break;
      case 'quarterly':
        currentDate = addDays(currentDate, 91);
        break;
      case 'monthly':
        currentDate = addDays(currentDate, 30);
        break;
    }
  }
  
  return schedule;
};

/**
 * Calculate vacancy period cost
 * @param {number} dailyRent - Daily rent amount
 * @param {number} vacancyDays - Number of days property is vacant
 * @param {number} marketingCost - Cost to market the property
 * @returns {number} Total vacancy cost
 */
export const calculateVacancyCost = (dailyRent, vacancyDays, marketingCost = 0) => {
  const lostRent = dailyRent * vacancyDays;
  return lostRent + marketingCost;
};

export default {
  calculateDaysRemaining,
  getCountdownStatus,
  calculateNextPaymentDate,
  isPaymentOverdue,
  calculateLateFee,
  getRenewalRecommendation,
  generatePaymentSchedule,
  calculateVacancyCost
};