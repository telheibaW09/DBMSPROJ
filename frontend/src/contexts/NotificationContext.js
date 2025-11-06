import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Add a new notification
  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now(),
      timestamp: new Date(),
      read: false,
      ...notification
    };
    
    setNotifications(prev => [newNotification, ...prev].slice(0, 20)); // Keep last 20
    setUnreadCount(prev => prev + 1);
    
    // Show toast notification
    toast.info(notification.message, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  // Mark notification as read
  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  // Mark all as read
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
    setUnreadCount(0);
  };

  // Clear all notifications
  const clearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  // Simulate real-time notifications (for demo purposes)
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly add notifications for demo
      if (Math.random() < 0.1) { // 10% chance every 5 seconds
        const demoNotifications = [
          {
            type: 'member',
            title: 'New Member Check-in',
            message: 'A member just checked in to the gym',
            icon: 'Users',
            color: '#3b82f6'
          },
          {
            type: 'payment',
            title: 'Payment Received',
            message: 'New payment has been processed',
            icon: 'DollarSign',
            color: '#10b981'
          },
          {
            type: 'announcement',
            title: 'New Announcement',
            message: 'Check out the latest gym announcement',
            icon: 'Megaphone',
            color: '#8b5cf6'
          }
        ];
        
        const randomNotification = demoNotifications[Math.floor(Math.random() * demoNotifications.length)];
        addNotification(randomNotification);
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const value = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearAll
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

