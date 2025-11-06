import React, { useState, useEffect } from 'react';
import { Bell, X, Users, Calendar, DollarSign, Megaphone, Check } from 'lucide-react';
import { dashboardAPI, announcementsAPI } from '../services/api';
import { useNotifications } from '../contexts/NotificationContext';

const NotificationBell = () => {
  const { notifications: contextNotifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [apiNotifications, setApiNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const [activityResponse, announcementsResponse] = await Promise.all([
        dashboardAPI.getRecentActivity(),
        announcementsAPI.getRecent()
      ]);
      
      const activities = activityResponse.data;
      const announcements = announcementsResponse.data;
      
      // Create notification items from recent activities
      const notificationItems = [];
      
      // Add recent members
      if (activities.recent_members) {
        activities.recent_members.slice(0, 2).forEach(member => {
          notificationItems.push({
            id: `member-${member.name}`,
            type: 'member',
            title: 'New Member Joined',
            message: `${member.name} joined the gym`,
            time: new Date(member.join_date).toLocaleDateString(),
            icon: Users,
            color: '#3b82f6'
          });
        });
      }
      
      // Add recent payments
      if (activities.recent_payments) {
        activities.recent_payments.slice(0, 2).forEach(payment => {
          notificationItems.push({
            id: `payment-${payment.payment_id}`,
            type: 'payment',
            title: 'Payment Received',
            message: `${payment.member_name} paid $${payment.amount}`,
            time: new Date(payment.payment_date).toLocaleDateString(),
            icon: DollarSign,
            color: '#10b981'
          });
        });
      }
      
      // Add recent attendance
      if (activities.recent_attendance) {
        activities.recent_attendance.slice(0, 2).forEach(attendance => {
          notificationItems.push({
            id: `attendance-${attendance.attendance_id}`,
            type: 'attendance',
            title: 'Member Checked In',
            message: `${attendance.member_name} checked in`,
            time: new Date(attendance.check_in).toLocaleString(),
            icon: Calendar,
            color: '#f59e0b'
          });
        });
      }
      
      // Add recent announcements
      if (announcements) {
        announcements.slice(0, 2).forEach(announcement => {
          notificationItems.push({
            id: `announcement-${announcement.announcement_id}`,
            type: 'announcement',
            title: 'New Announcement',
            message: announcement.message.length > 50 
              ? announcement.message.substring(0, 50) + '...'
              : announcement.message,
            time: new Date(announcement.created_at).toLocaleDateString(),
            icon: Megaphone,
            color: '#8b5cf6'
          });
        });
      }
      
      // Sort by time (most recent first)
      notificationItems.sort((a, b) => new Date(b.time) - new Date(a.time));
      
      setApiNotifications(notificationItems.slice(0, 8)); // Show max 8 notifications
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Set some default notifications if API fails
      setApiNotifications([
        {
          id: 'default-1',
          type: 'system',
          title: 'Welcome to X-TREME FITNESS',
          message: 'Your gym management system is ready!',
          time: new Date().toLocaleDateString(),
          icon: Bell,
          color: '#ef4444'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timeString) => {
    const time = new Date(timeString);
    const now = new Date();
    const diffMs = now - time;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffHours < 1) {
      return 'Just now';
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return time.toLocaleDateString();
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'member': return Users;
      case 'payment': return DollarSign;
      case 'attendance': return Calendar;
      case 'announcement': return Megaphone;
      default: return Bell;
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <button 
        onClick={() => setShowDropdown(!showDropdown)}
        style={{
          position: 'relative',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '0.5rem',
          borderRadius: '0.375rem',
          color: '#6b7280',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '0.25rem',
            right: '0.25rem',
            width: '8px',
            height: '8px',
            backgroundColor: '#ef4444',
            borderRadius: '50%',
            animation: 'pulse 2s infinite'
          }}></span>
        )}
      </button>

      {showDropdown && (
        <>
          {/* Overlay to close dropdown */}
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 998
            }}
            onClick={() => setShowDropdown(false)}
          />
          
          {/* Dropdown */}
          <div style={{
            position: 'absolute',
            right: 0,
            top: '100%',
            marginTop: '0.5rem',
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '0.5rem',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            minWidth: '350px',
            maxWidth: '400px',
            maxHeight: '500px',
            overflow: 'hidden',
            zIndex: 1000
          }}>
            {/* Header */}
            <div style={{
              padding: '1rem',
              borderBottom: '1px solid #e5e7eb',
              backgroundColor: '#f9fafb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{
                margin: 0,
                fontSize: '1rem',
                fontWeight: '600',
                color: '#111827'
              }}>
                Notifications {unreadCount > 0 && `(${unreadCount})`}
              </h3>
              <button
                onClick={() => setShowDropdown(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#6b7280',
                  padding: '0.25rem'
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Notifications List */}
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {loading ? (
                <div style={{
                  padding: '2rem',
                  textAlign: 'center',
                  color: '#6b7280'
                }}>
                  <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
                  Loading notifications...
                </div>
              ) : (contextNotifications.length === 0 && apiNotifications.length === 0) ? (
                <div style={{
                  padding: '2rem',
                  textAlign: 'center',
                  color: '#6b7280'
                }}>
                  <Bell size={32} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                  <p style={{ margin: 0 }}>No notifications yet</p>
                </div>
              ) : (
                [...contextNotifications, ...apiNotifications].slice(0, 10).map((notification) => {
                  const Icon = notification.icon;
                  return (
                    <div
                      key={notification.id}
                      className="notification-item"
                      style={{
                        padding: '1rem',
                        borderBottom: '1px solid #f3f4f6',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.75rem',
                        transition: 'background-color 0.2s',
                        backgroundColor: notification.read ? 'transparent' : '#fef3c7'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = notification.read ? 'transparent' : '#fef3c7'}
                      onClick={() => !notification.read && markAsRead(notification.id)}
                    >
                      <div style={{
                        width: '32px',
                        height: '32px',
                        backgroundColor: notification.color + '20',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: notification.color,
                        flexShrink: 0
                      }}>
                        <Icon size={16} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4 style={{
                          margin: '0 0 0.25rem 0',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          color: '#111827'
                        }}>
                          {notification.title}
                        </h4>
                        <p style={{
                          margin: '0 0 0.25rem 0',
                          fontSize: '0.75rem',
                          color: '#6b7280',
                          lineHeight: '1.4'
                        }}>
                          {notification.message}
                        </p>
                        <p style={{
                          margin: 0,
                          fontSize: '0.75rem',
                          color: '#9ca3af'
                        }}>
                          {formatTime(notification.time)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {(contextNotifications.length > 0 || apiNotifications.length > 0) && (
              <div style={{
                padding: '0.75rem 1rem',
                borderTop: '1px solid #e5e7eb',
                backgroundColor: '#f9fafb',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <button
                  onClick={fetchNotifications}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#3b82f6',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                >
                  Refresh
                </button>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#10b981',
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}
                  >
                    <Check size={14} />
                    Mark all read
                  </button>
                )}
              </div>
            )}
          </div>
        </>
      )}

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default NotificationBell;
