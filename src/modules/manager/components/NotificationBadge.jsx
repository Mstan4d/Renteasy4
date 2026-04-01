// src/modules/manager/components/NotificationBadge.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../shared/context/AuthContext';
import { supabase } from '../../../shared/lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

const NotificationBadge = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    const fetchUnreadCount = async () => {
      try {
        // Count unread notifications from manager_notifications
        const { count, error } = await supabase
          .from('manager_notifications')
          .select('*', { count: 'exact', head: true })
          .eq('manager_id', user.id)
          .eq('accepted', false)
          .gt('expires_at', new Date().toISOString());

        if (!error) setUnreadCount(count || 0);
      } catch (error) {
        console.error('Error fetching unread count:', error);
      }
    };

    fetchUnreadCount();

    // Subscribe to new notifications
    const channel = supabase
      .channel('manager-notification-count')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'manager_notifications',
          filter: `manager_id=eq.${user.id}`,
        },
        () => {
          setUnreadCount(prev => prev + 1);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'manager_notifications',
          filter: `manager_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.new.accepted === true) {
            setUnreadCount(prev => Math.max(0, prev - 1));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const handleClick = () => {
    navigate('/dashboard/manager/notifications');
  };

  if (unreadCount === 0) return null;

  return (
    <button
      onClick={handleClick}
      className="notification-badge"
      style={{
        position: 'relative',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '8px',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <span style={{ fontSize: '1.2rem' }}>🔔</span>
      <span style={{
        position: 'absolute',
        top: '0',
        right: '0',
        background: '#ef4444',
        color: 'white',
        fontSize: '10px',
        fontWeight: 'bold',
        padding: '2px 5px',
        borderRadius: '10px',
        minWidth: '16px',
        textAlign: 'center'
      }}>
        {unreadCount > 99 ? '99+' : unreadCount}
      </span>
    </button>
  );
};

export default NotificationBadge;