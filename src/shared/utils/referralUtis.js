// src/shared/utils/referralUtils.js

export const REFERRAL_CONFIG = {
    // Commission for posted houses that get rented
    POSTER_COMMISSION_RATE: 0.01, // 1%
    
    // Reward for successful referrals
    REFERRAL_REWARD_AMOUNT: 5000,
    
    // Qualification criteria for referral reward
    QUALIFICATION_CRITERIA: {
      RENTAL_COMPLETED: 'rental_completed',
      HOUSE_POSTED_AND_RENTED: 'house_posted_and_rented'
    }
  };
  
  // Calculate commission for poster
  export const calculatePosterCommission = (rentalAmount) => {
    return rentalAmount * REFERRAL_CONFIG.POSTER_COMMISSION_RATE;
  };
  
  // Check if referral qualifies for reward
  export const checkReferralQualification = (referredUser) => {
    const qualifications = [];
    
    // Check if referred user has rented any property
    if (referredUser.rentals && referredUser.rentals.length > 0) {
      qualifications.push({
        type: REFERRAL_CONFIG.QUALIFICATION_CRITERIA.RENTAL_COMPLETED,
        amount: REFERRAL_CONFIG.REFERRAL_REWARD_AMOUNT,
        triggerEvent: `Rented ${referredUser.rentals.length} properties`
      });
    }
    
    // Check if referred user posted houses that got rented
    if (referredUser.postedHouses && referredUser.postedHouses.some(house => house.rented)) {
      const rentedHouses = referredUser.postedHouses.filter(house => house.rented);
      qualifications.push({
        type: REFERRAL_CONFIG.QUALIFICATION_CRITERIA.HOUSE_POSTED_AND_RENTED,
        amount: REFERRAL_CONFIG.REFERRAL_REWARD_AMOUNT,
        triggerEvent: `Posted ${rentedHouses.length} houses that got rented`
      });
    }
    
    return qualifications;
  };
  
  // Generate referral link
  export const generateReferralLink = (userId) => {
    const baseUrl = window.location.origin;
    const referralCode = `RENTEASY-${userId.slice(0, 8).toUpperCase()}`;
    return `${baseUrl}/signup?ref=${referralCode}`;
  };
  
  // Track referral signup
  export const trackReferralSignup = (referrerId, referredUserId) => {
    const referral = {
      referrerId,
      referredUserId,
      signupDate: new Date().toISOString(),
      status: 'pending',
      rewards: [],
      createdAt: new Date().toISOString()
    };
    
    // Save to localStorage (in real app, this would be API call)
    const referrals = JSON.parse(localStorage.getItem('referrals') || '[]');
    referrals.push(referral);
    localStorage.setItem('referrals', JSON.stringify(referrals));
    
    return referral;
  };
  
  // Award commission for posted house
  export const awardPosterCommission = (posterId, propertyId, rentalAmount) => {
    const commission = calculatePosterCommission(rentalAmount);
    
    const commissionRecord = {
      id: `comm_${Date.now()}`,
      posterId,
      propertyId,
      rentalAmount,
      commissionRate: REFERRAL_CONFIG.POSTER_COMMISSION_RATE,
      commissionAmount: commission,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    // Save to localStorage
    const commissions = JSON.parse(localStorage.getItem('commissions') || '[]');
    commissions.push(commissionRecord);
    localStorage.setItem('commissions', JSON.stringify(commissions));
    
    return commissionRecord;
  };