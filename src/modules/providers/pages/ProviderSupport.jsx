// src/modules/providers/pages/ProviderSupport.jsx
import React, { useState } from 'react';
import { 
  MessageSquare, Phone, Mail, HelpCircle,
  Search, Clock, CheckCircle, AlertCircle,
  FileText, ExternalLink, ChevronRight,
  Users, BookOpen, Settings, Shield
} from 'lucide-react';

const ProviderSupport = () => {
  const [activeTab, setActiveTab] = useState('faq');
  const [searchQuery, setSearchQuery] = useState('');

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
        { q: 'What is the commission structure?', a: '7.5% total commission (4% RentEasy, 2.5% Manager, 1% Referrer).' },
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

  const supportTickets = [
    { id: 'TKT-001', subject: 'Payment delay issue', status: 'resolved', date: '2024-01-15' },
    { id: 'TKT-002', subject: 'Booking cancellation', status: 'in-progress', date: '2024-01-14' },
    { id: 'TKT-003', subject: 'Profile verification', status: 'open', date: '2024-01-13' }
  ];

  const styles = {
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '1rem',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    },
    header: {
      marginBottom: '2rem'
    },
    title: {
      fontSize: '1.875rem',
      fontWeight: '700',
      color: '#1f2937',
      marginBottom: '0.5rem'
    },
    subtitle: {
      color: '#6b7280',
      fontSize: '1rem'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '1rem',
      marginBottom: '2rem'
    },
    statCard: {
      background: 'white',
      borderRadius: '0.75rem',
      padding: '1.5rem',
      border: '1px solid #e5e7eb',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem'
    },
    statIcon: {
      width: '3rem',
      height: '3rem',
      borderRadius: '0.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#eff6ff'
    },
    statContent: {
      flex: 1
    },
    statTitle: {
      fontSize: '0.875rem',
      color: '#6b7280',
      marginBottom: '0.25rem'
    },
    statValue: {
      fontSize: '1.5rem',
      fontWeight: '700',
      color: '#1f2937'
    },
    searchBox: {
      position: 'relative',
      marginBottom: '2rem'
    },
    searchInput: {
      width: '100%',
      padding: '1rem 1rem 1rem 3rem',
      border: '2px solid #e5e7eb',
      borderRadius: '0.75rem',
      fontSize: '1rem',
      color: '#1f2937',
      transition: 'border-color 0.2s'
    },
    searchIcon: {
      position: 'absolute',
      left: '1rem',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#9ca3af'
    },
    tabs: {
      display: 'flex',
      gap: '0.5rem',
      marginBottom: '2rem',
      overflowX: 'auto',
      scrollbarWidth: 'none'
    },
    tab: {
      padding: '0.75rem 1.5rem',
      border: 'none',
      background: 'transparent',
      color: '#6b7280',
      fontWeight: '500',
      cursor: 'pointer',
      borderRadius: '0.5rem',
      whiteSpace: 'nowrap',
      transition: 'all 0.2s'
    },
    activeTab: {
      background: '#2563eb',
      color: 'white'
    },
    faqSection: {
      background: 'white',
      borderRadius: '0.75rem',
      border: '1px solid #e5e7eb',
      overflow: 'hidden'
    },
    faqHeader: {
      padding: '1.5rem',
      borderBottom: '1px solid #e5e7eb'
    },
    faqTitle: {
      fontSize: '1.125rem',
      fontWeight: '600',
      color: '#1f2937'
    },
    faqGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '1.5rem',
      padding: '1.5rem'
    },
    categoryCard: {
      background: '#f9fafb',
      borderRadius: '0.75rem',
      padding: '1.5rem',
      border: '1px solid #e5e7eb'
    },
    categoryHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      marginBottom: '1rem'
    },
    categoryIcon: {
      color: '#2563eb'
    },
    categoryTitle: {
      fontSize: '1rem',
      fontWeight: '600',
      color: '#1f2937'
    },
    questionList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem'
    },
    questionItem: {
      padding: '0.75rem',
      background: 'white',
      borderRadius: '0.5rem',
      border: '1px solid #e5e7eb',
      cursor: 'pointer',
      transition: 'all 0.2s'
    },
    questionText: {
      fontWeight: '500',
      color: '#374151',
      marginBottom: '0.25rem'
    },
    answerText: {
      fontSize: '0.875rem',
      color: '#6b7280',
      lineHeight: '1.5'
    },
    contactGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '1.5rem',
      marginTop: '2rem'
    },
    contactCard: {
      background: 'white',
      borderRadius: '0.75rem',
      padding: '1.5rem',
      border: '1px solid #e5e7eb',
      textAlign: 'center',
      transition: 'transform 0.2s'
    },
    contactIcon: {
      width: '3rem',
      height: '3rem',
      borderRadius: '50%',
      background: '#eff6ff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 1rem'
    },
    contactTitle: {
      fontSize: '1.125rem',
      fontWeight: '600',
      color: '#1f2937',
      marginBottom: '0.5rem'
    },
    contactDescription: {
      color: '#6b7280',
      fontSize: '0.875rem',
      marginBottom: '1rem',
      lineHeight: '1.5'
    },
    contactButton: {
      padding: '0.5rem 1rem',
      background: '#2563eb',
      color: 'white',
      border: 'none',
      borderRadius: '0.5rem',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'background-color 0.2s'
    },
    ticketsSection: {
      background: 'white',
      borderRadius: '0.75rem',
      border: '1px solid #e5e7eb',
      padding: '1.5rem',
      marginTop: '2rem'
    },
    ticketsHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1.5rem'
    },
    ticketsTitle: {
      fontSize: '1.125rem',
      fontWeight: '600',
      color: '#1f2937'
    },
    newTicketButton: {
      padding: '0.5rem 1rem',
      background: '#10b981',
      color: 'white',
      border: 'none',
      borderRadius: '0.5rem',
      fontWeight: '500',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    ticketsList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem'
    },
    ticketItem: {
      padding: '1rem',
      border: '1px solid #e5e7eb',
      borderRadius: '0.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    ticketInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem'
    },
    ticketId: {
      fontFamily: 'monospace',
      fontWeight: '600',
      color: '#1f2937'
    },
    ticketSubject: {
      color: '#374151'
    },
    ticketStatus: {
      padding: '0.25rem 0.75rem',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      fontWeight: '600'
    },
    statusResolved: {
      background: '#d1fae5',
      color: '#065f46'
    },
    statusInProgress: {
      background: '#fef3c7',
      color: '#92400e'
    },
    statusOpen: {
      background: '#fee2e2',
      color: '#991b1b'
    },
    emptyState: {
      textAlign: 'center',
      padding: '3rem 1rem'
    },
    emptyIcon: {
      width: '4rem',
      height: '4rem',
      background: '#f3f4f6',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 1rem'
    },
    emptyTitle: {
      fontSize: '1.25rem',
      fontWeight: '600',
      color: '#1f2937',
      marginBottom: '0.5rem'
    },
    emptyText: {
      color: '#6b7280'
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Help & Support</h1>
        <p style={styles.subtitle}>Get help with your account, bookings, payments, and more</p>
      </div>

      {/* Quick Stats */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>
            <CheckCircle size={24} color="#2563eb" />
          </div>
          <div style={styles.statContent}>
            <div style={styles.statTitle}>Avg. Response Time</div>
            <div style={styles.statValue}>2.4 hours</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>
            <MessageSquare size={24} color="#10b981" />
          </div>
          <div style={styles.statContent}>
            <div style={styles.statTitle}>Support Tickets</div>
            <div style={styles.statValue}>3 Active</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>
            <HelpCircle size={24} color="#8b5cf6" />
          </div>
          <div style={styles.statContent}>
            <div style={styles.statTitle}>FAQs Answered</div>
            <div style={styles.statValue}>48</div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div style={styles.searchBox}>
        <input
          type="text"
          placeholder="Search for help articles, FAQs, or topics..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={styles.searchInput}
        />
        <Search style={styles.searchIcon} size={20} />
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        {['faq', 'contact', 'tickets', 'resources'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              ...styles.tab,
              ...(activeTab === tab ? styles.activeTab : {})
            }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* FAQ Section */}
      {activeTab === 'faq' && (
        <div style={styles.faqSection}>
          <div style={styles.faqHeader}>
            <h2 style={styles.faqTitle}>Frequently Asked Questions</h2>
          </div>
          <div style={styles.faqGrid}>
            {faqCategories.map((category) => (
              <div key={category.id} style={styles.categoryCard}>
                <div style={styles.categoryHeader}>
                  <div style={styles.categoryIcon}>
                    {category.icon}
                  </div>
                  <h3 style={styles.categoryTitle}>{category.title}</h3>
                </div>
                <div style={styles.questionList}>
                  {category.questions.map((item, index) => (
                    <div key={index} style={styles.questionItem}>
                      <div style={styles.questionText}>{item.q}</div>
                      <div style={styles.answerText}>{item.a}</div>
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
          <div style={styles.contactGrid}>
            <div style={styles.contactCard}>
              <div style={styles.contactIcon}>
                <MessageSquare size={24} color="#2563eb" />
              </div>
              <h3 style={styles.contactTitle}>Live Chat</h3>
              <p style={styles.contactDescription}>
                Chat with our support team in real-time for quick assistance
              </p>
              <button style={styles.contactButton}>Start Chat</button>
            </div>
            
            <div style={styles.contactCard}>
              <div style={styles.contactIcon}>
                <Mail size={24} color="#10b981" />
              </div>
              <h3 style={styles.contactTitle}>Email Support</h3>
              <p style={styles.contactDescription}>
                Send us an email and we'll respond within 24 hours
              </p>
              <button style={styles.contactButton}>Email Us</button>
            </div>
            
            <div style={styles.contactCard}>
              <div style={styles.contactIcon}>
                <Phone size={24} color="#8b5cf6" />
              </div>
              <h3 style={styles.contactTitle}>Phone Support</h3>
              <p style={styles.contactDescription}>
                Call our support line for immediate assistance
              </p>
              <button style={styles.contactButton}>Call Now</button>
            </div>
          </div>

          <div style={styles.ticketsSection}>
            <div style={styles.ticketsHeader}>
              <h3 style={styles.ticketsTitle}>Your Support Tickets</h3>
              <button style={styles.newTicketButton}>
                <FileText size={16} />
                New Ticket
              </button>
            </div>
            
            {supportTickets.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>
                  <MessageSquare size={32} color="#9ca3af" />
                </div>
                <h4 style={styles.emptyTitle}>No support tickets</h4>
                <p style={styles.emptyText}>Create your first support ticket to get help</p>
              </div>
            ) : (
              <div style={styles.ticketsList}>
                {supportTickets.map((ticket) => (
                  <div key={ticket.id} style={styles.ticketItem}>
                    <div style={styles.ticketInfo}>
                      <div style={styles.ticketId}>{ticket.id}</div>
                      <div style={styles.ticketSubject}>{ticket.subject}</div>
                      <div style={styles.ticketDate}>{ticket.date}</div>
                    </div>
                    <div style={{
                      ...styles.ticketStatus,
                      ...styles[`status${ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1).replace('-', '')}`]
                    }}>
                      {ticket.status}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tickets Section */}
      {activeTab === 'tickets' && (
        <div style={styles.ticketsSection}>
          <div style={styles.ticketsHeader}>
            <h2 style={styles.ticketsTitle}>Support Tickets</h2>
            <button style={styles.newTicketButton}>
              <FileText size={16} />
              New Ticket
            </button>
          </div>
          
          <div style={styles.ticketsList}>
            {supportTickets.map((ticket) => (
              <div key={ticket.id} style={styles.ticketItem}>
                <div style={styles.ticketInfo}>
                  <div style={styles.ticketId}>{ticket.id}</div>
                  <div style={styles.ticketSubject}>{ticket.subject}</div>
                  <div style={{color: '#6b7280', fontSize: '0.875rem'}}>
                    Created: {ticket.date}
                  </div>
                </div>
                <div style={{
                  ...styles.ticketStatus,
                  ...styles[`status${ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1).replace('-', '')}`]
                }}>
                  {ticket.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderSupport;