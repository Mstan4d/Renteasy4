import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../shared/context/AuthContext';
import { supabase } from '../../../../shared/lib/supabaseClient';
import { 
  LifeBuoy, HelpCircle, Phone, MessageSquare, 
  Clock, ArrowLeft, Send, CheckCircle2, AlertCircle 
} from 'lucide-react';
import './Support.css';

const Support = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('help');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tickets, setTickets] = useState([]);
  
  const [formData, setFormData] = useState({
    category: 'general',
    subject: '',
    message: '',
    priority: 'medium'
  });

  useEffect(() => {
    if (user && activeTab === 'tickets') fetchUserTickets();
  }, [user, activeTab]);

  const fetchUserTickets = async () => {
    const { data, error } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (!error) setTickets(data);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('support_tickets')
        .insert([{
          user_id: user.id,
          ...formData,
          status: 'open'
        }]);

      if (error) throw error;

      alert('Support request submitted! Ticket ID generated.');
      setFormData({ category: 'general', subject: '', message: '', priority: 'medium' });
      setActiveTab('tickets'); // Take them to see their new ticket
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="support-page">
      <header className="support-header-nav">
        <button className="back-btn-square" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </button>
        <div className="title-area">
          <h1>Support Center</h1>
          <p>We're here to help you grow your portfolio</p>
        </div>
      </header>

      {/* Modern Tab Bar */}
      <nav className="support-nav">
        <button className={activeTab === 'help' ? 'active' : ''} onClick={() => setActiveTab('help')}>
          <MessageSquare size={18} /> Help Desk
        </button>
        <button className={activeTab === 'faq' ? 'active' : ''} onClick={() => setActiveTab('faq')}>
          <HelpCircle size={18} /> FAQs
        </button>
        <button className={activeTab === 'tickets' ? 'active' : ''} onClick={() => setActiveTab('tickets')}>
          <LifeBuoy size={18} /> My Tickets
        </button>
      </nav>

      <main className="support-body">
        {activeTab === 'help' && (
          <div className="help-grid">
            <form onSubmit={handleSubmit} className="ticket-form">
              <h3>Create New Ticket</h3>
              <div className="form-row">
                <div className="field">
                  <label>Category</label>
                  <select name="category" value={formData.category} onChange={handleInputChange}>
                    <option value="payments">Payments & Commission</option>
                    <option value="listings">Property Listings</option>
                    <option value="verification">Verification</option>
                    <option value="technical">App Issues</option>
                  </select>
                </div>
                <div className="field">
                  <label>Priority</label>
                  <select name="priority" value={formData.priority} onChange={handleInputChange}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High (Urgent)</option>
                  </select>
                </div>
              </div>
              <div className="field">
                <label>Subject</label>
                <input name="subject" value={formData.subject} onChange={handleInputChange} placeholder="e.g. Withdrawal issue" required />
              </div>
              <div className="field">
                <label>Message</label>
                <textarea name="message" value={formData.message} onChange={handleInputChange} rows="5" placeholder="Describe your problem..." required />
              </div>
              <button type="submit" className="submit-ticket-btn" disabled={isSubmitting}>
                {isSubmitting ? 'Sending...' : 'Send Request'} <Send size={16} />
              </button>
            </form>

            <div className="quick-contact">
              <div className="contact-box whatsapp">
                <div className="icon">💬</div>
                <h4>WhatsApp Support</h4>
                <p>Chat with an agent instantly.</p>
                <a 
                  href="https://chat.whatsapp.com/BpDxhPPDvri5kkSJCeuXFT" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn-chat"
                >
                  Start Chat
                </a>
              </div>
              <div className="contact-box email">
                <div className="icon">📧</div>
                <h4>Email Us</h4>
                <p>renteasyapartmentsearch@gmail.com</p>
                <a 
                  href="mailto:renteasyapartmentsearch@gmail.com" 
                  className="btn-email"
                >
                  Send Email
                </a>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'faq' && (
          <div className="faq-wrapper">
            <div className="faq-card">
              <h4>How is the commission calculated?</h4>
              <p>Our commission rate is a flat <strong>1.5%</strong> of the monthly rent for any property you post that gets rented through the platform. This is credited to your wallet once the admin verifies the rental.</p>
            </div>
            <div className="faq-card">
              <h4>How long does payout take?</h4>
              <p>Once you mark a property as rented, it enters 'Admin Review'. Manual payouts are typically processed within 24-48 business hours.</p>
            </div>
          </div>
        )}

        {activeTab === 'tickets' && (
          <div className="tickets-list">
            {tickets.length > 0 ? tickets.map(t => (
              <div key={t.id} className="ticket-item">
                <div className="ticket-main">
                  <span className={`status-pill ${t.status}`}>{t.status}</span>
                  <h4>{t.subject}</h4>
                  <small>{new Date(t.created_at).toLocaleDateString()}</small>
                </div>
                <button className="view-btn">View Details</button>
              </div>
            )) : <div className="empty-state">No tickets found.</div>}
          </div>
        )}
      </main>
    </div>
  );
};

export default Support;