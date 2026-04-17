// src/modules/auth/pages/Terms.jsx
import React from 'react';
import './LegalPages.css';

const Terms = () => (
  <div className="legal-page">
    <div className="legal-container">
      <h1>Terms & Conditions</h1>
      <p>Last updated: April 3, 2026</p>
      <h2>1. Acceptance of Terms</h2>
      <p>By accessing or using RentEasy, you agree to be bound by these Terms...</p>
      <h2>2. User Roles</h2>
      <p>RentEasy provides different user roles: Tenant, Landlord, Property Manager, Service Provider, Estate Firm, Admin.</p>
      <h2>3. Commission Structure</h2>
      <p>For standard listings, a 7.5% commission applies (Manager 2.5%, Referrer 1.5%, RentEasy 3.5%). Estate firms pay 0% commission with active subscription.</p>
      <h2>4. Property Verification</h2>
      <p>Managers must verify properties onsite before they can be marked as verified.</p>
      <h2>5. Payments and Withdrawals</h2>
      <p>Commission payouts are processed within 24-48 hours after admin approval.</p>
      {/* Add more sections as needed */}
    </div>
  </div>
);
export default Terms;