// src/modules/providers/pages/ProviderCalendar.jsx
import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, MapPin, User, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../../shared/context/AuthContext';
import { supabase } from '../../../shared/lib/supabaseClient';
import './ProviderCalendar.css';

const ProviderCalendar = () => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('month'); // 'month', 'week', 'day'
  const [bookings, setBookings] = useState([]);
  const [availability, setAvailability] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;
    fetchData();
  }, [user, currentDate]);

  const fetchData = async () => {
  setLoading(true);
  setError(null);
  try {
    // Get start and end of current month for filtering
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const startDate = new Date(year, month, 1).toISOString().split('T')[0];
    const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];

    // Fetch service_requests for this provider within date range
    const { data: requests, error: reqError } = await supabase
      .from('service_requests')
      .select(`
        id,
        service_type,
        client:client_id (full_name),
        scheduled_date,
        status,
        created_at
      `)
      .eq('provider_id', user.id)
      .gte('scheduled_date', startDate)
      .lte('scheduled_date', endDate)
      .order('scheduled_date', { ascending: true });

    if (reqError) throw reqError;

    // Transform to component's expected format with fallbacks
    const transformed = (requests || []).map(req => {
      // Determine color based on status
      let color = 'gray';
      if (req.status === 'confirmed' || req.status === 'scheduled') color = 'green';
      else if (req.status === 'pending') color = 'yellow';
      else if (req.status === 'completed') color = 'blue';

      return {
        id: req.id,
        title: req.service_type || 'Service',
        client: req.client?.full_name || 'Client',
        date: req.scheduled_date,
        time: 'All day', // placeholder – add if you have a time column
        location: 'Location not specified', // placeholder
        status: req.status,
        color
      };
    });

    setBookings(transformed);

    // Fetch provider availability (optional)
    const { data: availData, error: availError } = await supabase
      .from('provider_availability')
      .select('*')
      .eq('provider_id', user.id)
      .maybeSingle();

    if (availError && availError.code !== 'PGRST116') throw availError;
    setAvailability(availData || null);

  } catch (err) {
    console.error('Error fetching calendar data:', err);
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    const days = [];
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  // Stats calculation
  const currentMonthBookings = bookings.filter(b => {
    const bDate = new Date(b.date);
    return bDate.getMonth() === currentDate.getMonth() && bDate.getFullYear() === currentDate.getFullYear();
  });
  const bookingsThisMonth = currentMonthBookings.length;

  const confirmedThisMonth = currentMonthBookings.filter(b => b.status === 'confirmed' || b.status === 'scheduled').length;

  // Next available slot – from upcoming bookings or availability
  const nextBooking = bookings.find(b => new Date(b.date) >= new Date() && (b.status === 'scheduled' || b.status === 'confirmed'));
  const nextSlotText = nextBooking 
    ? `${new Date(nextBooking.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ${nextBooking.time}` 
    : 'None';

  const days = getDaysInMonth(currentDate);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (loading) {
    return (
      <div className="provider-calendar-loading">
        <div className="loading-spinner"></div>
        <p>Loading your calendar...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="provider-calendar-error">
        <AlertCircle size={48} />
        <h3>Failed to load calendar</h3>
        <p>{error}</p>
        <button onClick={fetchData} className="retry-button">Retry</button>
      </div>
    );
  }

  return (
    <div className="provider-calendar-container">
      {/* Header */}
      <div className="calendar-header">
        <div className="header-left">
          <h1>Service Calendar</h1>
          <p className="text-gray-600">Manage your bookings and availability</p>
        </div>
        
        <div className="header-right">
          <div className="calendar-navigation">
            <button
              onClick={() => navigateMonth('prev')}
              className="nav-button"
            >
              <ChevronLeft size={20} />
            </button>
            <h2 className="current-month">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <button
              onClick={() => navigateMonth('next')}
              className="nav-button"
            >
              <ChevronRight size={20} />
            </button>
          </div>
          
          <div className="view-controls">
            {['month', 'week', 'day'].map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`view-button ${view === v ? 'active' : 'inactive'}`}
              >
                {v}
              </button>
            ))}
          </div>
          
          <button className="set-availability-button">
            Set Availability
          </button>
        </div>
      </div>

      {/* Calendar View */}
      {view === 'month' && (
        <div className="calendar-container">
          {/* Week Days Header */}
          <div className="week-days-header">
            {weekDays.map((day) => (
              <div key={day} className="week-day-cell">
                {day}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="days-grid">
            {days.map((day, index) => {
              const dayString = day.toISOString().split('T')[0];
              const dayBookings = bookings.filter(
                booking => booking.date === dayString
              );
              
              const isToday = day.toDateString() === new Date().toDateString();
              
              return (
                <div
                  key={index}
                  className={`calendar-day ${isToday ? 'today' : ''}`}
                >
                  <div className="day-header">
                    <span className={`day-number ${isToday ? 'today' : ''}`}>
                      {day.getDate()}
                    </span>
                    {dayBookings.length > 0 && (
                      <span className="bookings-count">
                        {dayBookings.length} booking{dayBookings.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  
                  <div className="calendar-bookings">
                    {dayBookings.map((booking) => (
                      <div
                        key={booking.id}
                        className={`calendar-booking-item ${booking.color}`}
                      >
                        <p className="calendar-booking-title">{booking.title}</p>
                        <p className="calendar-booking-time">{booking.time}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Upcoming Bookings (next 3) */}
      <div className="upcoming-bookings-section">
        <div className="section-header">
          <h3 className="section-title">Upcoming Bookings</h3>
          <button className="view-all-button">
            View All
          </button>
        </div>
        
        <div className="booking-cards-container">
          {bookings.slice(0, 3).map((booking) => (
            <div key={booking.id} className="booking-card">
              <div className="booking-info">
                <div className={`booking-icon-container ${booking.color}`}>
                  <CalendarIcon className={`booking-icon ${booking.status}`} size={24} />
                </div>
                <div className="booking-details">
                  <h4>{booking.title}</h4>
                  <div className="booking-meta">
                    <span className="meta-item">
                      <User className="meta-icon" size={14} />
                      <span>{booking.client}</span>
                    </span>
                    <span className="meta-item">
                      <Clock className="meta-icon" size={14} />
                      <span>{booking.time}</span>
                    </span>
                    <span className="meta-item">
                      <MapPin className="meta-icon" size={14} />
                      <span>{booking.location}</span>
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="booking-actions">
                <span className={`booking-status ${booking.status}`}>
                  {booking.status === 'confirmed' || booking.status === 'scheduled' ? (
                    <CheckCircle className="status-icon" size={14} />
                  ) : (
                    <AlertCircle className="status-icon" size={14} />
                  )}
                  <span className="capitalize">{booking.status}</span>
                </span>
                <button className="view-details-button">
                  View Details
                </button>
              </div>
            </div>
          ))}
          {bookings.length === 0 && (
            <div className="no-bookings-message">No upcoming bookings</div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <div>
              <p className="stat-label">Bookings This Month</p>
              <p className="stat-value">{bookingsThisMonth}</p>
            </div>
            <CalendarIcon className="stat-icon blue" size={24} />
          </div>
          <p className="stat-trend positive">
            {confirmedThisMonth} confirmed
          </p>
        </div>
        
        <div className="stat-card">
          <div className="stat-card-header">
            <div>
              <p className="stat-label">Available Days</p>
              <p className="stat-value">
                {availability ? Object.values(availability.schedule || {}).filter(d => d.active).length : '0'}/7
              </p>
            </div>
            <CheckCircle className="stat-icon green" size={24} />
          </div>
          <p className="stat-trend neutral">
            {availability ? 'Weekly schedule set' : 'Not set'}
          </p>
        </div>
        
        <div className="stat-card">
          <div className="stat-card-header">
            <div>
              <p className="stat-label">Next Available Slot</p>
              <p className="stat-value">{nextSlotText}</p>
            </div>
            <Clock className="stat-icon purple" size={24} />
          </div>
          <p className="stat-trend neutral">
            {nextBooking ? 'Book now' : 'No upcoming bookings'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProviderCalendar;