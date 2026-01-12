// src/modules/providers/pages/ProviderCalendar.jsx
import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, MapPin, User, CheckCircle, AlertCircle } from 'lucide-react';
import './ProviderCalendar.css';

const ProviderCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('month'); // 'month', 'week', 'day'

  const bookings = [
    {
      id: 1,
      title: 'Deep Cleaning',
      client: 'John Doe',
      date: '2024-01-15',
      time: '10:00 AM - 2:00 PM',
      location: 'Lagos Island',
      status: 'confirmed',
      color: 'blue'
    },
    {
      id: 2,
      title: 'Painting Service',
      client: 'Jane Smith',
      date: '2024-01-16',
      time: '9:00 AM - 5:00 PM',
      location: 'Victoria Island',
      status: 'pending',
      color: 'yellow'
    },
    {
      id: 3,
      title: 'Plumbing Repair',
      client: 'Mike Johnson',
      date: '2024-01-17',
      time: '2:00 PM - 4:00 PM',
      location: 'Lekki Phase 1',
      status: 'confirmed',
      color: 'green'
    },
  ];

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

  const days = getDaysInMonth(currentDate);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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
              const dayBookings = bookings.filter(
                booking => booking.date === day.toISOString().split('T')[0]
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

      {/* Upcoming Bookings */}
      <div className="upcoming-bookings-section">
        <div className="section-header">
          <h3 className="section-title">Upcoming Bookings</h3>
          <button className="view-all-button">
            View All
          </button>
        </div>
        
        <div className="booking-cards-container">
          {bookings.map((booking) => (
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
                  {booking.status === 'confirmed' ? <CheckCircle className="status-icon" size={14} /> : <AlertCircle className="status-icon" size={14} />}
                  <span className="capitalize">{booking.status}</span>
                </span>
                <button className="view-details-button">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <div>
              <p className="stat-label">Bookings This Month</p>
              <p className="stat-value">18</p>
            </div>
            <CalendarIcon className="stat-icon blue" size={24} />
          </div>
          <p className="stat-trend positive">↑ 5 from last month</p>
        </div>
        
        <div className="stat-card">
          <div className="stat-card-header">
            <div>
              <p className="stat-label">Available Days</p>
              <p className="stat-value">24/31</p>
            </div>
            <CheckCircle className="stat-icon green" size={24} />
          </div>
          <p className="stat-trend neutral">Fully booked for 7 days</p>
        </div>
        
        <div className="stat-card">
          <div className="stat-card-header">
            <div>
              <p className="stat-label">Next Available Slot</p>
              <p className="stat-value">Jan 18</p>
            </div>
            <Clock className="stat-icon purple" size={24} />
          </div>
          <p className="stat-trend neutral">2:00 PM - 4:00 PM</p>
        </div>
      </div>
    </div>
  );
};

export default ProviderCalendar;