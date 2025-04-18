import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';

// WebSocket connection URL
const WS_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:5000';

// Create context
const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Connect to WebSocket server
  useEffect(() => {
    // Only connect if user is authenticated
    if (!isAuthenticated || !user) {
      if (socket) {
        socket.close();
        setSocket(null);
      }
      setIsConnected(false);
      return;
    }

    // Create WebSocket connection
    const newSocket = new WebSocket(WS_URL);

    // Setup event handlers
    newSocket.onopen = () => {
      console.log('WebSocket connection established');
      setIsConnected(true);
      
      // Send authentication message with user ID and token
      const authToken = localStorage.getItem('token');
      newSocket.send(JSON.stringify({
        type: 'auth',
        userId: user._id,
        token: authToken
      }));
    };

    newSocket.onclose = () => {
      console.log('WebSocket connection closed');
      setIsConnected(false);
    };

    newSocket.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };

    newSocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        handleIncomingMessage(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      if (newSocket) {
        newSocket.close();
      }
    };
  }, [isAuthenticated, user]);

  // Handle incoming WebSocket messages
  const handleIncomingMessage = useCallback((data) => {
    switch (data.type) {
      case 'notification':
        // Add new notification
        const newNotification = {
          id: data.id || `notification-${Date.now()}`,
          type: data.notificationType || 'info',
          message: data.message || 'New notification',
          timestamp: data.timestamp || new Date().toISOString(),
          read: false,
          data: data.data || {}
        };
        
        setNotifications(prev => [newNotification, ...prev]);
        setUnreadCount(prev => prev + 1);
        
        // Show toast notification
        toast[newNotification.type || 'info'](newNotification.message);
        break;
        
      case 'job_update':
        // Handle job updates
        toast.info(`Job "${data.title}" has been updated`);
        break;
        
      case 'application_update':
        // Handle application status updates
        toast.info(`Your application status has changed to: ${data.status}`);
        break;
        
      case 'message':
        // Handle direct messages
        toast.info(`New message: ${data.message}`);
        break;
        
      default:
        console.log('Unknown WebSocket message type:', data.type);
    }
  }, []);

  // Mark notification as read
  const markAsRead = useCallback((notificationId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
    
    // Update unread count
    setUnreadCount(prev => Math.max(0, prev - 1));
    
    // Inform server about read status if connected
    if (socket && isConnected) {
      socket.send(JSON.stringify({
        type: 'mark_read',
        notificationId
      }));
    }
  }, [socket, isConnected]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
    
    setUnreadCount(0);
    
    // Inform server about read status if connected
    if (socket && isConnected) {
      socket.send(JSON.stringify({
        type: 'mark_all_read'
      }));
    }
  }, [socket, isConnected]);

  // Delete notification
  const deleteNotification = useCallback((notificationId) => {
    setNotifications(prev => {
      const notif = prev.find(n => n.id === notificationId);
      // If it was unread, decrease the unread count
      if (notif && !notif.read) {
        setUnreadCount(count => Math.max(0, count - 1));
      }
      return prev.filter(n => n.id !== notificationId);
    });
    
    // Inform server about deletion if connected
    if (socket && isConnected) {
      socket.send(JSON.stringify({
        type: 'delete_notification',
        notificationId
      }));
    }
  }, [socket, isConnected]);

  // Delete all notifications
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
    
    // Inform server about deletion if connected
    if (socket && isConnected) {
      socket.send(JSON.stringify({
        type: 'clear_all_notifications'
      }));
    }
  }, [socket, isConnected]);

  // Send a custom event over WebSocket
  const sendEvent = useCallback((eventType, data) => {
    if (!socket || !isConnected) {
      console.error('Cannot send event: WebSocket not connected');
      return false;
    }
    
    socket.send(JSON.stringify({
      type: eventType,
      ...data
    }));
    
    return true;
  }, [socket, isConnected]);

  // Manually reconnect if needed
  const reconnect = useCallback(() => {
    if (socket) {
      socket.close();
    }
    
    // This will trigger the useEffect to create a new connection
    setSocket(null);
  }, [socket]);

  // Context value
  const contextValue = {
    isConnected,
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    sendEvent,
    reconnect
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

// Custom hook to use notification context
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationContext; 