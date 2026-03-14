// src/modules/marketplace/pages/ServiceDetailsPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../../shared/lib/supabaseClient';
import { useAuth } from '../../../shared/context/AuthContext';
import { messagesService } from '../../../shared/services/messagesService'; // ✅ import
import { 
  Building, ArrowLeft, Calendar, DollarSign, MapPin, 
  Phone, Mail, Globe, Star, CheckCircle, Clock, MessageSquare 
} from 'lucide-react';
import './ServiceDetailsPage.css';

const ServiceDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [service, setService] = useState(null);
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchService();
  }, [id]);

  const fetchService = async () => {
    try {
      const { data: serviceData, error: serviceError } = await supabase
        .from('estate_services')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (serviceError) throw serviceError;
      if (!serviceData) {
        setError('Service not found');
        setLoading(false);
        return;
      }
      setService(serviceData);

      if (serviceData.estate_firm_id) {
        const { data: firmData, error: firmError } = await supabase
          .from('estate_firm_profiles')
          .select('firm_name, verification_status, rating')
          .eq('id', serviceData.estate_firm_id)
          .maybeSingle();

        if (firmError) {
          console.error('Error fetching firm:', firmError);
        } else {
          setProvider(firmData || null);
        }
      }
    } catch (err) {
      console.error('Error fetching service:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleContact = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      const providerId = service.estate_firm_id;
      const result = await messagesService.initiateProviderChat(providerId, user.id, user.role);
      if (result?.chatId) {
        navigate(`/dashboard/messages/chat/${result.chatId}`);
      } else {
        alert('Failed to start chat. Please try again.');
      }
    } catch (error) {
      console.error('Error starting chat:', error);
      alert(error.message || 'Failed to start chat');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!service) return <div className="not-found">Service not found</div>;

  return (
    <div className="service-details-page">
      <button className="back-button" onClick={() => navigate('/services')}>
        <ArrowLeft size={20} /> Back to Marketplace
      </button>

      <div className="service-header">
        <h1>{service.title}</h1>
        <div className="provider-info">
          <Building size={24} />
          <span>{provider?.firm_name || 'Estate Firm'}</span>
          {provider?.verification_status === 'verified' && (
            <CheckCircle size={16} className="verified-icon" />
          )}
        </div>
      </div>

      <div className="service-content">
        <div className="main-info">
          <p className="description">{service.description}</p>

          <div className="details-grid">
            <div className="detail-item">
              <DollarSign size={18} />
              <div>
                <span className="label">Pricing</span>
                <span className="value">
                  {service.price_model === 'fixed' && `₦${service.price?.toLocaleString()} fixed`}
                  {service.price_model === 'hourly' && `₦${service.hourly_rate}/hour`}
                  {service.price_model === 'percentage' && `${service.percentage}% of transaction`}
                  {service.price_model === 'quote' && 'Quote based'}
                  {!service.price_model && 'Contact for pricing'}
                </span>
              </div>
            </div>

            <div className="detail-item">
              <MapPin size={18} />
              <div>
                <span className="label">Location</span>
                <span className="value">{service.location}</span>
              </div>
            </div>

            {service.duration && (
              <div className="detail-item">
                <Clock size={18} />
                <div>
                  <span className="label">Duration</span>
                  <span className="value">{service.duration}</span>
                </div>
              </div>
            )}
          </div>

          {service.features?.length > 0 && (
            <div className="features-section">
              <h3>Features</h3>
              <div className="tags">
                {service.features.map((f, i) => <span key={i} className="tag">{f}</span>)}
              </div>
            </div>
          )}

          {service.benefits?.length > 0 && (
            <div className="benefits-section">
              <h3>Benefits</h3>
              <ul>
                {service.benefits.map((b, i) => <li key={i}>{b}</li>)}
              </ul>
            </div>
          )}

          {service.requirements?.length > 0 && (
            <div className="requirements-section">
              <h3>Requirements</h3>
              <ul>
                {service.requirements.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </div>
          )}
        </div>

        <div className="sidebar">
          <div className="contact-card">
            <h3>Contact Provider</h3>
            {service.contact_phone && (
              <p><Phone size={16} /> {service.contact_phone}</p>
            )}
            {service.contact_email && (
              <p><Mail size={16} /> {service.contact_email}</p>
            )}
            {service.website && (
              <p><Globe size={16} /> <a href={service.website} target="_blank" rel="noopener noreferrer">{service.website}</a></p>
            )}
            <button className="btn-primary" onClick={handleContact}>
              <MessageSquare size={16} /> Send Message
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetailsPage;