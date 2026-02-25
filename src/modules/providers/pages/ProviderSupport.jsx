// src/modules/providers/pages/ProviderSupport.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../shared/context/AuthContext';
import { supabase } from '../../../shared/lib/supabaseClient';
import {
  MessageSquare, Phone, Mail, HelpCircle,
  Search, Clock, CheckCircle, AlertCircle,
  FileText, ExternalLink, ChevronRight,
  Users, BookOpen, Settings, Shield,
  PlusCircle
} from 'lucide-react';
import './ProviderSupport.css';

const ProviderSupport = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('faq');
  const [searchQuery, setSearchQuery] = useState('');
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Static FAQ data (you can move to database if needed)
  const faqCategories = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: <Settings size={20} />,
      questions: [
        { q: 'How do I register as a service provider?', a: 'Click "Register as Provider" on the homepage and fill in your details.' },
        { q: 'What documents do I need for verification?', a: 'Valid ID, proof of address, and professional certificates.' },
        { q: 'How long does verification take?', a: 'Typically 2-3 business days after document submission.' }
      ]
    },
    {
      id: 'payments',
      title: 'Payments & Earnings',
      icon: <CheckCircle size={20} />,
      questions: [
        { q: 'How do I withdraw my earnings?', a: 'Go to Payouts page, select withdrawal method and amount.' },
        { q: 'What is the commission structure?', a: '7.5% total commission (3.5% RentEasy, 2.5% Manager, 1.5% Referrer).' },
        { q: 'When are payments processed?', a: 'Withdrawals are processed within 1-3 business days.' }
      ]
    },
    {
      id: 'bookings',
      title: 'Bookings & Services',
      icon: <BookOpen size={20} />,
      questions: [
        { q: 'How do I manage my bookings?', a: 'Use the Calendar page to view and manage all bookings.' },
        { q: 'Can I set my availability?', a: 'Yes, use the Availability settings in your profile.' },
        { q: 'How do I update my services?', a: 'Go to Services page to add, edit, or remove services.' }
      ]
    },
    {
      id: 'account',
      title: 'Account & Settings',
      icon: <Shield size={20} />,
      questions: [
        { q: 'How do I update my profile?', a: 'Navigate to Profile Settings page to edit your information.' },
        { q: 'Can I change my service areas?', a: 'Yes, in Location Setup under settings.' },
        { q: 'How do I delete my account?', a: 'Contact support for account deletion requests.' }
      ]
    }
  ];

  useEffect(() => {
    if (user?.id) {
      fetchTickets();
    }
  }, [user]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewTicket = () => {
    // Placeholder: open a modal or navigate to ticket creation page
    alert('New ticket creation – coming soon!');
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'resolved': return { background: '#d1fae5', color: '#065f46' };
      case 'in-progress': return { background: '#fef3c7', color: '#92400e' };
      case 'open': return { background: '#fee2e2', color: '#991b1b' };
      default: return { background: '#e5e7eb', color: '#374151' };
    }
  };

  return (
    <div className="support-container">
      {/* Header */}
      <div className="support-header">
        <h1 className="support-title">Help & Support</h1>
        <p className="support-subtitle">Get help with your account, bookings, payments, and more</p>
      </div>

      {/* Quick Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <Clock size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Avg. Response Time</div>
            <div className="stat-value">2.4 hours</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <MessageSquare size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Support Tickets</div>
            <div className="stat-value">{tickets.filter(t => t.status !== 'resolved').length} Active</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <HelpCircle size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">FAQs Answered</div>
            <div className="stat-value">48</div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="search-box">
        <input
          type="text"
          placeholder="Search for help articles, FAQs, or topics..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
        <Search className="search-icon" size={20} />
      </div>

      {/* Tabs */}
      <div className="support-tabs">
        {['faq', 'contact', 'tickets', 'resources'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`tab-button ${activeTab === tab ? 'active' : ''}`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* FAQ Section */}
      {activeTab === 'faq' && (
        <div className="faq-section">
          <div className="faq-header">
            <h2 className="faq-title">Frequently Asked Questions</h2>
          </div>
          <div className="faq-grid">
            {faqCategories.map((category) => (
              <div key={category.id} className="category-card">
                <div className="category-header">
                  <div className="category-icon">
                    {category.icon}
                  </div>
                  <h3 className="category-title">{category.title}</h3>
                </div>
                <div className="question-list">
                  {category.questions.map((item, index) => (
                    <div key={index} className="question-item">
                      <div className="question-text">{item.q}</div>
                      <div className="answer-text">{item.a}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contact Section */}
      {activeTab === 'contact' && (
        <div>
          <div className="contact-grid">
            <div className="contact-card">
              <div className="contact-icon">
                <MessageSquare size={24} />
              </div>
              <h3 className="contact-title">Live Chat</h3>
              <p className="contact-description">
                Chat with our support team in real-time for quick assistance
              </p>
              <button className="contact-button">Start Chat</button>
            </div>
            
            <div className="contact-card">
              <div className="contact-icon">
                <Mail size={24} />
              </div>
              <h3 className="contact-title">Email Support</h3>
              <p className="contact-description">
                Send us an email and we'll respond within 24 hours
              </p>
              <button className="contact-button">Email Us</button>
            </div>
            
            <div className="contact-card">
              <div className="contact-icon">
                <Phone size={24} />
              </div>
              <h3 className="contact-title">Phone Support</h3>
              <p className="contact-description">
                Call our support line for immediate assistance
              </p>
              <button className="contact-button">Call Now</button>
            </div>
          </div>

          <div className="tickets-section">
            <div className="tickets-header">
              <h3 className="tickets-title">Your Support Tickets</h3>
              <button className="new-ticket-button" onClick={handleNewTicket}>
                <PlusCircle size={16} />
                New Ticket
              </button>
            </div>
            
            {loading ? (
              <div className="loading-state">Loading tickets...</div>
            ) : tickets.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <MessageSquare size={32} />
                </div>
                <h4 className="empty-title">No support tickets</h4>
                <p className="empty-text">Create your first support ticket to get help</p>
              </div>
            ) : (
              <div className="tickets-list">
                {tickets.map((ticket) => {
                  const statusStyle = getStatusColor(ticket.status);
                  return (
                    <div key={ticket.id} className="ticket-item">
                      <div className="ticket-info">
                        <div className="ticket-id">{ticket.id.slice(0, 8)}</div>
                        <div className="ticket-subject">{ticket.subject}</div>
                        <div className="ticket-date">
                          {new Date(ticket.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <div 
                        className="ticket-status"
                        style={{
                          backgroundColor: statusStyle.background,
                          color: statusStyle.color
                        }}
                      >
                        {ticket.status}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tickets Section */}
      {activeTab === 'tickets' && (
        <div className="tickets-section">
          <div className="tickets-header">
            <h2 className="tickets-title">Support Tickets</h2>
            <button className="new-ticket-button" onClick={handleNewTicket}>
              <PlusCircle size={16} />
              New Ticket
            </button>
          </div>
          
          {loading ? (
            <div className="loading-state">Loading tickets...</div>
          ) : tickets.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <MessageSquare size={32} />
              </div>
              <h4 className="empty-title">No support tickets</h4>
              <p className="empty-text">Create your first support ticket</p>
            </div>
          ) : (
            <div className="tickets-list">
              {tickets.map((ticket) => {
                const statusStyle = getStatusColor(ticket.status);
                return (
                  <div key={ticket.id} className="ticket-item">
                    <div className="ticket-info">
                      <div className="ticket-id">{ticket.id.slice(0, 8)}</div>
                      <div className="ticket-subject">{ticket.subject}</div>
                      <div className="ticket-date">
                        Created: {new Date(ticket.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div 
                      className="ticket-status"
                      style={{
                        backgroundColor: statusStyle.background,
                        color: statusStyle.color
                      }}
                    >
                      {ticket.status}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProviderSupport;