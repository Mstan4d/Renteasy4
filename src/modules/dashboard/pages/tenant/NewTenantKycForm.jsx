// src/modules/verification/components/NewTenantKYCForm.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Upload, Banknote, CheckCircle, Info } from 'lucide-react';
import { supabase } from '../../../../shared/lib/supabaseClient';
import { useAuth } from '../../../../shared/context/AuthContext';
import './NewTenantKYCForm.css';

const NewTenantKYCForm = ({ user }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState({ idFront: null, selfie: null });
  const [previews, setPreviews] = useState({ idFront: null, selfie: null });

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file && file.size < 5 * 1024 * 1024) {
      setFiles(prev => ({ ...prev, [type]: file }));
      setPreviews(prev => ({ ...prev, [type]: URL.createObjectURL(file) }));
    } else {
      alert("File too large. Please keep it under 5MB.");
    }
  };

  const handleSubmit = async () => {
    if (!files.idFront || !files.selfie) {
      alert("Please upload both your ID and a Selfie to proceed.");
      return;
    }

    setLoading(true);
    try {
      // 1. Upload to Supabase Storage (Identity bucket)
      // Logic for folder: /kyc/tenants/{user_id}/...
      
      // 2. Update Profile status
      // In a real app, this would trigger an Admin notification
      await new Promise(res => setTimeout(res, 2000)); // Simulating upload

      navigate('/verify/status');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="new-kyc-card">
      {/* Reward Header */}
      <div className="reward-header">
        <div className="reward-badge">
          <Banknote size={20} />
          <span>Reward Eligible</span>
        </div>
        <h2>Activate Your Earning Profile</h2>
        <p>Complete verification to unlock your <strong>1.5% commission</strong> on referrals and claim your <strong>₦5,000</strong> tenant bonus.</p>
      </div>

      <div className="kyc-body">
        <section className="upload-section">
          <div className="upload-item">
            <label>Government ID Front</label>
            <div className={`upload-dropzone ${previews.idFront ? 'active' : ''}`}>
              {previews.idFront ? (
                <img src={previews.idFront} alt="ID Preview" />
              ) : (
                <div className="placeholder">
                  <Upload size={32} />
                  <span>Upload NIN, PVC or License</span>
                </div>
              )}
              <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'idFront')} />
            </div>
          </div>

          <div className="upload-item">
            <label>Selfie with ID</label>
            <div className={`upload-dropzone ${previews.selfie ? 'active' : ''}`}>
              {previews.selfie ? (
                <img src={previews.selfie} alt="Selfie Preview" />
              ) : (
                <div className="placeholder">
                  <ShieldCheck size={32} />
                  <span>Take a clear selfie</span>
                </div>
              )}
              <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'selfie')} />
            </div>
          </div>
        </section>

        <div className="info-box">
          <Info size={18} />
          <p>Your data is encrypted. We only use this to verify your identity for financial payouts.</p>
        </div>

        <button 
          className="submit-kyc-btn" 
          disabled={loading}
          onClick={handleSubmit}
        >
          {loading ? "Verifying..." : "Complete Verification & Claim Bonus"}
        </button>
      </div>
    </div>
  );
};

export default NewTenantKYCForm;