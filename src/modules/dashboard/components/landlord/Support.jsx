// src/modules/dashboard/components/landlord/Support.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../shared/context/AuthContext';
import './Support.css';

const Support = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('help');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    category: 'general',
    subject: '',
    message: '',
    priority: 'medium'
  });

  const goBack = () => {
    navigate('/dashboard/landlord');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      alert('Support request submitted successfully! Our team will contact you within 24 hours.');
      setFormData({
        category: 'general',
        subject: '',
        message: '',
        priority: 'medium'
      });
    } catch (error) {
      alert('Failed to submit support request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const faqs = [
    {
      question: 'How do I withdraw my earnings?',
      answer: 'You can withdraw your earnings by going to Wallet > Withdraw Funds. Select your bank and enter the amount. Withdrawals are processed within 24 hours.',
      category: 'payments'
    },
    {
      question: 'How is commission calculated?',
      answer: 'Commission is 7.5% of the monthly rent for each successful rental. This is automatically deducted and added to your wallet balance.',
      category: 'commission'
    },
    {
      question: 'How do I verify my property?',
      answer: 'Go to Properties > Select Property > Click "Verify Property". Our team will schedule a physical inspection within 3-5 business days.',
      category: 'verification'
    },
    {
      question: 'What happens if my tenant delays payment?',
      answer: 'We send automated reminders to tenants. If payment is delayed beyond 7 days, you can contact our support team for assistance.',
      category: 'tenants'
    },
    {
      question: 'How do I update my bank details?',
      answer: 'Go to Profile > Bank Details section. You can update your bank information there. Changes take effect immediately.',
      category: 'account'
    },
    {
      question: 'Can I list multiple properties?',
      answer: 'Yes, you can list unlimited properties. Each property goes through our verification process to ensure quality.',
      category: 'properties'
    }
  ];

  const supportContacts = [
    { type: 'Phone', value: '+234 800 123 4567', icon: '📞', hours: '24/7' },
    { type: 'Email', value: 'support@renteasy.com', icon: '📧', hours: 'Within 24 hours' },
    { type: 'Live Chat', value: 'Click to start chat', icon: '💬', hours: '9AM-6PM (Weekdays)' },
    { type: 'Office', value: '123 Victoria Island, Lagos', icon: '🏢', hours: '9AM-5PM (Mon-Fri)' }
  ];

  return (
    <div className="support-container">
      {/* Header */}
      <div className="support-header">
        <button className="btn btn-back" onClick={goBack}>
          ← Back to Dashboard
        </button>
        <h1>Support Center</h1>
        <p>Get help with your account, properties, and payments</p>
      </div>

      {/* Support Tabs */}
      <div className="support-tabs">
        <button 
          className={`tab-btn ${activeTab === 'help' ? 'active' : ''}`}
          onClick={() => setActiveTab('help')}
        >
          🆘 Get Help
        </button>
        <button 
          className={`tab-btn ${activeTab === 'faq' ? 'active' : ''}`}
          onClick={() => setActiveTab('faq')}
        >
          ❓ FAQ
        </button>
        <button 
          className={`tab-btn ${activeTab === 'contact' ? 'active' : ''}`}
          onClick={() => setActiveTab('contact')}
        >
          📞 Contact
        </button>
        <button 
          className={`tab-btn ${activeTab === 'tickets' ? 'active' : ''}`}
          onClick={() => setActiveTab('tickets')}
        >
          📋 My Tickets
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        
        {/* Get Help Tab */}
        {activeTab === 'help' && (
          <div className="help-content">
            <div className="content-grid">
              <div className="left-column">
                <div className="form-card">
                  <h3>Submit Support Request</h3>
                  <form onSubmit={handleSubmit}>
                    <div className="form-group">
                      <label htmlFor="category">Issue Category</label>
                      <select
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="general">General Inquiry</option>
                        <option value="payments">Payment Issues</option>
                        <option value="properties">Property Management</option>
                        <option value="tenants">Tenant Issues</option>
                        <option value="verification">Verification Problems</option>
                        <option value="technical">Technical Support</option>
                        <option value="account">Account Issues</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="subject">Subject</label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        required
                        placeholder="Brief description of your issue"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="priority">Priority Level</label>
                      <div className="priority-buttons">
                        <button
                          type="button"
                          className={`priority-btn ${formData.priority === 'low' ? 'active' : ''}`}
                          onClick={() => setFormData(prev => ({ ...prev, priority: 'low' }))}
                        >
                          Low
                        </button>
                        <button
                          type="button"
                          className={`priority-btn ${formData.priority === 'medium' ? 'active' : ''}`}
                          onClick={() => setFormData(prev => ({ ...prev, priority: 'medium' }))}
                        >
                          Medium
                        </button>
                        <button
                          type="button"
                          className={`priority-btn ${formData.priority === 'high' ? 'active' : ''}`}
                          onClick={() => setFormData(prev => ({ ...prev, priority: 'high' }))}
                        >
                          High
                        </button>
                        <button
                          type="button"
                          className={`priority-btn ${formData.priority === 'urgent' ? 'active' : ''}`}
                          onClick={() => setFormData(prev => ({ ...prev, priority: 'urgent' }))}
                        >
                          Urgent
                        </button>
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="message">Detailed Description</label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                        rows="8"
                        placeholder="Please provide detailed information about your issue..."
                      />
                      <small className="help-text">
                        Include property IDs, transaction references, or error messages if applicable.
                      </small>
                    </div>

                    <div className="form-actions">
                      <button
                        type="button"
                        className="btn btn-outline"
                        onClick={goBack}
                        disabled={isSubmitting}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Submitting...' : 'Submit Request'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              <div className="right-column">
                <div className="info-card">
                  <h3>💡 Before You Submit</h3>
                  <ul className="tips-list">
                    <li>Check our FAQ section - your question might already be answered</li>
                    <li>Include relevant property IDs or transaction references</li>
                    <li>For urgent issues, use the Urgent priority level</li>
                    <li>Our response time is usually within 24 hours</li>
                    <li>Keep your contact information updated for faster support</li>
                  </ul>
                </div>

                <div className="info-card">
                  <h3>⏱️ Expected Response Times</h3>
                  <div className="response-times">
                    <div className="time-item">
                      <span className="priority urgent">Urgent</span>
                      <span className="time">2-4 hours</span>
                    </div>
                    <div className="time-item">
                      <span className="priority high">High</span>
                      <span className="time">4-8 hours</span>
                    </div>
                    <div className="time-item">
                      <span className="priority medium">Medium</span>
                      <span className="time">24 hours</span>
                    </div>
                    <div className="time-item">
                      <span className="priority low">Low</span>
                      <span className="time">48 hours</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FAQ Tab */}
        {activeTab === 'faq' && (
          <div className="faq-content">
            <div className="faq-header">
              <h2>Frequently Asked Questions</h2>
              <input
                type="text"
                placeholder="Search FAQs..."
                className="search-input"
              />
            </div>

            <div className="faq-categories">
              <button className="category-btn active">All Categories</button>
              <button className="category-btn">Payments</button>
              <button className="category-btn">Properties</button>
              <button className="category-btn">Tenants</button>
              <button className="category-btn">Commission</button>
              <button className="category-btn">Account</button>
            </div>

            <div className="faq-list">
              {faqs.map((faq, index) => (
                <div key={index} className="faq-item">
                  <div className="faq-question">
                    <h4>{faq.question}</h4>
                    <span className="expand-btn">+</span>
                  </div>
                  <div className="faq-answer">
                    <p>{faq.answer}</p>
                    <div className="faq-meta">
                      <span className="category-tag">{faq.category}</span>
                      <button className="btn btn-sm btn-outline">
                        Was this helpful?
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="faq-footer">
              <h3>Still have questions?</h3>
              <p>Can't find what you're looking for? Contact our support team directly.</p>
              <button 
                className="btn btn-primary"
                onClick={() => setActiveTab('help')}
              >
                Contact Support
              </button>
            </div>
          </div>
        )}

        {/* Contact Tab */}
        {activeTab === 'contact' && (
          <div className="contact-content">
            <div className="contact-grid">
              {supportContacts.map((contact, index) => (
                <div key={index} className="contact-card">
                  <div className="contact-icon">{contact.icon}</div>
                  <div className="contact-info">
                    <h4>{contact.type}</h4>
                    <p className="contact-value">{contact.value}</p>
                    <p className="contact-hours">{contact.hours}</p>
                  </div>
                  <button className="btn btn-outline">
                    {contact.type === 'Live Chat' ? 'Start Chat' : 'Contact'}
                  </button>
                </div>
              ))}
            </div>

            <div className="contact-info-section">
              <div className="info-card">
                <h3>📋 Business Hours</h3>
                <div className="business-hours">
                  <div className="day">
                    <span>Monday - Friday</span>
                    <span>9:00 AM - 6:00 PM</span>
                  </div>
                  <div className="day">
                    <span>Saturday</span>
                    <span>10:00 AM - 4:00 PM</span>
                  </div>
                  <div className="day">
                    <span>Sunday</span>
                    <span>Emergency Support Only</span>
                  </div>
                </div>
              </div>

              <div className="info-card">
                <h3>📍 Visit Our Office</h3>
                <div className="office-info">
                  <p><strong>RentEasy Head Office</strong></p>
                  <p>123 Victoria Island</p>
                  <p>Lagos, Nigeria</p>
                  <p>P.O. Box 12345</p>
                </div>
                <button className="btn btn-outline">
                  📍 Get Directions
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tickets Tab */}
        {activeTab === 'tickets' && (
          <div className="tickets-content">
            <div className="tickets-header">
              <h2>My Support Tickets</h2>
              <button className="btn btn-primary">
                + New Ticket
              </button>
            </div>

            <div className="tickets-table">
              <div className="table-header">
                <div className="header-cell">Ticket ID</div>
                <div className="header-cell">Subject</div>
                <div className="header-cell">Category</div>
                <div className="header-cell">Status</div>
                <div className="header-cell">Date</div>
                <div className="header-cell">Actions</div>
              </div>

              <div className="table-body">
                {[
                  { id: 'TICK-001', subject: 'Withdrawal not processed', category: 'Payments', status: 'resolved', date: '2024-12-15' },
                  { id: 'TICK-002', subject: 'Property verification delay', category: 'Verification', status: 'in-progress', date: '2024-12-10' },
                  { id: 'TICK-003', subject: 'Tenant payment reminder', category: 'Tenants', status: 'open', date: '2024-12-05' },
                  { id: 'TICK-004', subject: 'Commission calculation query', category: 'Commission', status: 'resolved', date: '2024-11-28' },
                  { id: 'TICK-005', subject: 'Account verification', category: 'Account', status: 'closed', date: '2024-11-20' }
                ].map(ticket => (
                  <div key={ticket.id} className="table-row">
                    <div className="table-cell ticket-id">{ticket.id}</div>
                    <div className="table-cell subject">{ticket.subject}</div>
                    <div className="table-cell category">{ticket.category}</div>
                    <div className="table-cell">
                      <span className={`status-badge ${ticket.status}`}>
                        {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                      </span>
                    </div>
                    <div className="table-cell date">
                      {new Date(ticket.date).toLocaleDateString()}
                    </div>
                    <div className="table-cell actions">
                      <button className="btn btn-sm btn-outline">
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="ticket-stats">
              <div className="stat-card">
                <h4>Open Tickets</h4>
                <div className="stat-value">1</div>
              </div>
              <div className="stat-card">
                <h4>In Progress</h4>
                <div className="stat-value">1</div>
              </div>
              <div className="stat-card">
                <h4>Resolved</h4>
                <div className="stat-value">2</div>
              </div>
              <div className="stat-card">
                <h4>Avg. Response Time</h4>
                <div className="stat-value">12h</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Support;