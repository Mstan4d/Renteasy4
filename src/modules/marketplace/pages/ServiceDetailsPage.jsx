import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../../shared/lib/supabaseClient';
import { useAuth } from '../../../shared/context/AuthContext';
import { messagesService } from '../../../shared/services/messagesService';
import { 
  Building, ArrowLeft, Calendar, DollarSign, MapPin, 
  Phone, Mail, Globe, Star, CheckCircle, Clock, MessageSquare 
} from 'lucide-react';
import './ServiceDetailsPage.css';

const ServiceDetailsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const itemId = searchParams.get('id');
  const itemType = searchParams.get('type');
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!itemId || !itemType) {
      setError('Missing item information');
      setLoading(false);
      return;
    }
    const fetchData = async () => {
      setLoading(true);
      try {
        if (itemType === 'estate-service') {
          const { data, error } = await supabase
            .from('estate_services')
            .select(`
              *,
              estate_firm:estate_firm_id (
                id,
                firm_name,
                verification_status,
                user_id,
                logo_url,
                contact_phone,
                contact_email,
                website
              )
            `)
            .eq('id', itemId)
            .single();
          if (error) throw error;
          setItem(data);
        } 
        else if (itemType === 'estate-firm') {
          const { data, error } = await supabase
            .from('estate_firm_profiles')
            .select('*')
            .eq('id', itemId)
            .single();
          if (error) throw error;
          setItem(data);
        } 
        else if (itemType === 'service-provider') {
          const { data, error } = await supabase
            .from('service_providers')
            .select(`
              *,
              user_profile:user_id (id, full_name, email, phone)
            `)
            .eq('id', itemId)
            .single();
          if (error) throw error;
          setItem(data);
        } 
        else {
          throw new Error('Invalid item type');
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [itemId, itemType]);

  const handleContact = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!item) {
      alert('Loading provider details, please wait...');
      return;
    }
    let providerUserId = null;

    try {
      if (itemType === 'estate-service') {
        if (item.estate_firm_id) {
          const { data: firm, error } = await supabase
            .from('estate_firm_profiles')
            .select('user_id')
            .eq('id', item.estate_firm_id)
            .single();
          if (error) throw error;
          providerUserId = firm?.user_id;
        }
      } 
      else if (itemType === 'estate-firm') {
        // Fetch directly from the estate_firm_profiles table using the item.id
        const { data: firm, error } = await supabase
          .from('estate_firm_profiles')
          .select('user_id')
          .eq('id', item.id)
          .single();
        if (error) throw error;
        providerUserId = firm?.user_id;
      } 
      else if (itemType === 'service-provider') {
        providerUserId = item.user_id;
      }

      if (!providerUserId) {
        console.error('Provider user ID missing. Item:', item);
        alert('Provider information missing. Please try again later.');
        return;
      }
      if (providerUserId === user.id) {
        alert('You cannot contact yourself');
        return;
      }
const result = await messagesService.initiateProviderChat(providerUserId, user.id, user.role);
      navigate(`/dashboard/messages/chat/${result.chatId}`);
    } catch (err) {
      console.error(err);
      alert('Failed to start chat: ' + (err.message || 'Unknown error'));
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!item) return <div className="not-found">Item not found</div>;

  const itemTitle = item.title || item.firm_name || item.business_name || 'Details';

  // Render different sections based on type
  const renderProviderInfo = () => {
    if (itemType === 'estate-service' && item.estate_firm) {
      const firm = item.estate_firm;
      return (
        <div className="provider-info">
          <Building size={24} />
          <span>{firm.firm_name}</span>
          {firm.verification_status === 'verified' && <CheckCircle size={16} className="verified-icon" />}
        </div>
      );
    }
    if (itemType === 'estate-firm') {
      return (
        <div className="provider-info">
          <Building size={24} />
          <span>{item.firm_name}</span>
          {item.verification_status === 'verified' && <CheckCircle size={16} className="verified-icon" />}
        </div>
      );
    }
    if (itemType === 'service-provider') {
      return (
        <div className="provider-info">
          <span>{item.business_name || item.user_profile?.full_name}</span>
          {item.verification_status === 'verified' && <CheckCircle size={16} className="verified-icon" />}
        </div>
      );
    }
    return null;
  };

  const renderDetails = () => {
    if (itemType === 'estate-service') {
      return (
        <>
          <p className="description">{item.description}</p>
          <div className="details-grid">
            <div className="detail-item">
              <DollarSign size={18} />
              <div>
                <span className="label">Pricing</span>
                <span className="value">
                  {item.price_model === 'fixed' && `₦${item.price?.toLocaleString()} fixed`}
                  {item.price_model === 'hourly' && `₦${item.hourly_rate}/hour`}
                  {item.price_model === 'percentage' && `${item.percentage}% of transaction`}
                  {item.price_model === 'quote' && 'Quote based'}
                  {!item.price_model && 'Contact for pricing'}
                </span>
              </div>
            </div>
            <div className="detail-item">
              <MapPin size={18} />
              <div>
                <span className="label">Location</span>
                <span className="value">{item.location}</span>
              </div>
            </div>
            {item.duration && <div className="detail-item"><Clock size={18} /><div><span>Duration</span><span>{item.duration}</span></div></div>}
          </div>
          {item.features?.length > 0 && <div className="features-section"><h3>Features</h3><div className="tags">{item.features.map((f,i)=><span key={i} className="tag">{f}</span>)}</div></div>}
          {item.benefits?.length > 0 && <div className="benefits-section"><h3>Benefits</h3><ul>{item.benefits.map((b,i)=><li key={i}>{b}</li>)}</ul></div>}
          {item.requirements?.length > 0 && <div className="requirements-section"><h3>Requirements</h3><ul>{item.requirements.map((r,i)=><li key={i}>{r}</li>)}</ul></div>}
        </>
      );
    }
    if (itemType === 'estate-firm') {
      return (
        <>
          <p className="description">{item.description || 'Professional estate management firm'}</p>
          <div className="details-grid">
            <div className="detail-item"><MapPin size={18} /><div><span>Location</span><span>{item.address || 'Nigeria'}</span></div></div>
</div>
        </>
      );
    }
    if (itemType === 'service-provider') {
      return (
        <>
          <p className="description">{item.description}</p>
          <div className="details-grid">
            <div className="detail-item"><MapPin size={18} /><div><span>Location</span><span>{item.location}</span></div></div>
            <div className="detail-item"><DollarSign size={18} /><div><span>Price Range</span><span>{item.price_range_low && item.price_range_high ? `₦${item.price_range_low} - ₦${item.price_range_high}` : 'Contact for quote'}</span></div></div>
          </div>
          {item.services?.length > 0 && <div className="features-section"><h3>Services</h3><div className="tags">{item.services.map((s,i)=><span key={i} className="tag">{s}</span>)}</div></div>}
        </>
      );
    }
    return null;
  };

  const renderContactCard = () => {
    let contactPhone = null, contactEmail = null, website = null;
    if (itemType === 'estate-service' && item.estate_firm) {
      contactPhone = item.estate_firm.contact_phone;
      contactEmail = item.estate_firm.contact_email;
      website = item.estate_firm.website;
    } else if (itemType === 'estate-firm') {
      contactPhone = item.contact_phone;
      contactEmail = item.contact_email;
      website = item.website;
    } else if (itemType === 'service-provider') {
      contactPhone = item.user_profile?.phone;
      contactEmail = item.user_profile?.email;
      website = item.user_profile?.website;
    }
    return (
      <div className="contact-card">
        <h3>Contact Provider</h3>
        {contactPhone && <p><Phone size={16} /> {contactPhone}</p>}
        {contactEmail && <p><Mail size={16} /> {contactEmail}</p>}
        {website && <p><Globe size={16} /> <a href={website} target="_blank" rel="noopener noreferrer">{website}</a></p>}
        <button className="btn-primary" onClick={handleContact} disabled={!item}>
          <MessageSquare size={16} /> Send Message
        </button>
      </div>
    );
  };

  return (
    <div className="service-details-page">
      <button className="back-button" onClick={() => navigate('/marketplace')}>
        <ArrowLeft size={20} /> Back to Marketplace
      </button>
      <div className="service-header">
        <h1>{itemTitle}</h1>
        {renderProviderInfo()}
      </div>
      <div className="service-content">
        <div className="main-info">
          {renderDetails()}
        </div>
        <div className="sidebar">
          {renderContactCard()}
        </div>
      </div>
    </div>
  );
};

export default ServiceDetailsPage;