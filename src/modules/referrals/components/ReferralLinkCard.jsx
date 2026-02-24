// src/modules/referrals/components/ReferralLinkCard.jsx
import React, { useState } from 'react';
import { Copy, Share2, Gift, CheckCircle } from 'lucide-react';

const ReferralLinkCard = ({ userId }) => {
  const [copied, setCopied] = useState(false);
  const referralLink = `https://renteasy.ng/join?ref=${userId}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="referral-card">
      <div className="referral-header">
        <Gift className="icon-gift" size={32} />
        <div>
          <h3>Your Referral Engine</h3>
          <p>Earn 1.5% on every property deal closed via your link.</p>
        </div>
      </div>

      <div className="link-box">
        <input type="text" readOnly value={referralLink} />
        <button onClick={copyToClipboard} className={copied ? 'copied' : ''}>
          {copied ? <CheckCircle size={18} /> : <Copy size={18} />}
          <span>{copied ? 'Copied!' : 'Copy'}</span>
        </button>
      </div>

      <div className="referral-stats">
        <div className="stat">
          <span className="label">Commission Rate</span>
          <span className="value">1.5%</span>
        </div>
        <div className="stat">
          <span className="label">Joining Bonus</span>
          <span className="value text-green">₦5,000</span>
        </div>
      </div>
    </div>
  );
};