import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';

// WebSocket connection constants
const WS_RECONNECT_INTERVAL = 2000; // Start with 2 seconds
const WS_MAX_RECONNECT_INTERVAL = 30000; // Max 30 seconds
const WS_RECONNECT_DECAY = 1.5; // Exponential factor
const WS_PING_INTERVAL = 30000; // 30 seconds
const WS_CONNECTION_TIMEOUT = 10000; // 10 seconds

// Create context
const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Refs for managing reconnection
  const reconnectTimeoutRef = useRef(null);
  const reconnectIntervalRef = useRef(WS_RECONNECT_INTERVAL);
  const pingIntervalRef = useRef(null);
  const connectionTimeoutRef = useRef(null);
  const isReconnectingRef = useRef(false);
  const isUnmountingRef = useRef(false);
  
  // Get the appropriate WebSocket URL based on environment
  const getWebSocketUrl = useCallback(() => {
    // Determine protocol (wss for https, ws for http)
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    
    // Use environment variable if available, otherwise construct URL
    if (process.env.REACT_APP_WS_URL) {
      return process.env.REACT_APP_WS_URL;
    }
    
    // Determine host and port
    const host = process.env.REACT_APP_WS_HOST || window.location.hostname;
    const port = process.env.REACT_APP_WS_PORT || '5000';
    
    return `${protocol}//${host}:${port}`;
  }, []);
  
  // Function to close socket and clean up
  const cleanupSocket = useCallback(() => {
    if (socket) {
      // Remove event listeners to prevent memory leaks
      socket.onopen = null;
      socket.onclose = null;
      socket.onerror = null;
      socket.onmessage = null;
      
      // Close the socket if it's not already closed
      if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
        socket.close();
      }
    }
    
    // Clear all timeouts and intervals
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
    
    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current);
      connectionTimeoutRef.current = null;
    }
  }, [socket]);
  
  // Connect or reconnect to the WebSocket server
  const connectWebSocket = useCallback(() => {
    // Only attempt connection if authenticated
    if (!isAuthenticated || !user || isUnmountingRef.current) {
      return;
    }
    
    // Clean up existing socket if any
    cleanupSocket();
    
    // Prevent reconnection if we're already reconnecting
    if (isReconnectingRef.current) {
      return;
    }
    
    // Reset connection states
    isReconnectingRef.current = true;
    
    try {
      const wsUrl = getWebSocketUrl();
      console.log(`Connecting to WebSocket at ${wsUrl}`);
      
      // Create new WebSocket connection
      const newSocket = new WebSocket(wsUrl);
      
      // Set up connection timeout
      connectionTimeoutRef.current = setTimeout(() => {
        console.warn('WebSocket connection timed out');
        
        if (newSocket && (newSocket.readyState === WebSocket.CONNECTING)) {
          // Force close the socket if it's still connecting
          newSocket.close();
          
          // Trigger reconnection
          scheduleReconnect();
        }
      }, WS_CONNECTION_TIMEOUT);
      
      // WebSocket event handlers
      newSocket.onopen = () => {
        console.log('WebSocket connection established');
        
        // Clear connection timeout
        if (connectionTimeoutRef.current) {
          clearTimeout(connectionTimeoutRef.current);
          connectionTimeoutRef.current = null;
        }
        
        // Update state
        setIsConnected(true);
        isReconnectingRef.current = false;
        
        // Reset reconnect interval on successful connection
        reconnectIntervalRef.current = WS_RECONNECT_INTERVAL;
        
        // Authenticate with the server
        const authToken = localStorage.getItem('token');
        
        try {
          newSocket.send(JSON.stringify({
            type: 'auth',
            userId: user._id,
            token: authToken
          }));
        } catch (error) {
          console.error('Failed to send authentication message:', error);
        }
        
        // Setup ping interval to keep connection alive
        pingIntervalRef.current = setInterval(() => {
          if (newSocket.readyState === WebSocket.OPEN) {
            try {
              newSocket.send(JSON.stringify({ type: 'ping' }));
            } catch (error) {
              console.error('Failed to send ping:', error);
              
              // If ping fails, attempt reconnection
              cleanupSocket();
              scheduleReconnect();
            }
          }
        }, WS_PING_INTERVAL);
      };
      
      newSocket.onclose = (event) => {
        console.log(`WebSocket connection closed. Code: ${event.code}, Reason: ${event.reason || 'No reason provided'}, Clean: ${event.wasClean}`);
        
        // Clear connection timeout if it exists
        if (connectionTimeoutRef.current) {
          clearTimeout(connectionTimeoutRef.current);
          connectionTimeoutRef.current = null;
        }
        
        // Update state
        setIsConnected(false);
        
        // Don't attempt to reconnect if unmounting or wasClean is true (intentional close)
        if (!isUnmountingRef.current && !event.wasClean) {
          scheduleReconnect();
        }
      };
      
      newSocket.onerror = (error) => {
        console.error('WebSocket error:', error);
        // Error handling is delegated to onclose which will be called after an error
      };
      
      newSocket.onmessage = (event) => {
        if (isUnmountingRef.current) return;
        
        try {
          const data = JSON.parse(event.data);
          handleIncomingMessage(data);
        } catch (error) {
          console.error('Error processing WebSocket message:', error);
        }
      };
      
      // Update the socket state
      setSocket(newSocket);
      
    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      scheduleReconnect();
    }
  }, [isAuthenticated, user, cleanupSocket, getWebSocketUrl]);
  
  // Schedule a reconnection attempt with exponential backoff
  const scheduleReconnect = useCallback(() => {
    if (isUnmountingRef.current) return;
    
    // Clear any existing reconnect timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    console.log(`Scheduling reconnection in ${reconnectIntervalRef.current / 1000} seconds`);
    
    // Set up the reconnect timeout
    reconnectTimeoutRef.current = setTimeout(() => {
      // Increase the reconnect interval for next attempt (exponential backoff)
      reconnectIntervalRef.current = Math.min(
        reconnectIntervalRef.current * WS_RECONNECT_DECAY,
        WS_MAX_RECONNECT_INTERVAL
      );
      
      // Attempt to reconnect
      connectWebSocket();
    }, reconnectIntervalRef.current);
  }, [connectWebSocket]);
  
  // Initialize WebSocket when authentication state changes
  useEffect(() => {
    isUnmountingRef.current = false;
    
    if (isAuthenticated && user) {
      connectWebSocket();
    } else {
      // Clean up if user logs out
      cleanupSocket();
      setIsConnected(false);
      setSocket(null);
    }
    
    // Cleanup on unmount
    return () => {
      isUnmountingRef.current = true;
      cleanupSocket();
    };
  }, [isAuthenticated, user, connectWebSocket, cleanupSocket]);
  
  // Handle incoming WebSocket messages
  const handleIncomingMessage = useCallback((data) => {
    if (!data || !data.type) return;
    
    switch (data.type) {
      case 'notification':
        // Handle notification
        handleNotification(data);
        break;
      case 'job_update':
        // Handle job updates
        handleJobUpdate(data);
        break;
      case 'application_update':
        // Handle application status updates
        handleApplicationUpdate(data);
        break;
      case 'message':
        // Handle direct messages
        handleDirectMessage(data);
        break;
      case 'auth_success':
        // Authentication success message
        console.log('WebSocket authentication successful');
        break;
      case 'auth_error':
        // Authentication error
        console.error('WebSocket authentication failed:', data.message);
        break;
      case 'pong':
        // Server response to ping
        console.debug('Received pong from server');
        break;
      default:
        console.log('Unknown WebSocket message type:', data.type);
    }
  }, []);
  
  // Handle different notification types
  const handleNotification = useCallback((data) => {
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
  }, []);
  
  const handleJobUpdate = useCallback((data) => {
    toast.info(`Job "${data.title}" has been updated`);
  }, []);
  
  const handleApplicationUpdate = useCallback((data) => {
    toast.info(`Your application status has changed to: ${data.status}`);
  }, []);
  
  const handleDirectMessage = useCallback((data) => {
    toast.info(`New message: ${data.message}`);
  }, []);
  
  // Safely send a message through the WebSocket
  const sendMessage = useCallback((message) => {
    if (!socket || !isConnected || socket.readyState !== WebSocket.OPEN) {
      console.warn('Cannot send message: WebSocket not connected');
      return false;
    }
    
    try {
      const messageString = typeof message === 'string' ? message : JSON.stringify(message);
      socket.send(messageString);
      return true;
    } catch (error) {
      console.error('Error sending WebSocket message:', error);
      return false;
    }
  }, [socket, isConnected]);
  
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
    sendMessage({
      type: 'mark_read',
      notificationId
    });
  }, [sendMessage]);
  
  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
    
    setUnreadCount(0);
    
    // Inform server about read status if connected
    sendMessage({
      type: 'mark_all_read'
    });
  }, [sendMessage]);
  
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
    sendMessage({
      type: 'delete_notification',
      notificationId
    });
  }, [sendMessage]);
  
  // Delete all notifications
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
    
    // Inform server about deletion if connected
    sendMessage({
      type: 'clear_all_notifications'
    });
  }, [sendMessage]);
  
  // Send a custom event over WebSocket
  const sendEvent = useCallback((eventType, data) => {
    return sendMessage({
      type: eventType,
      ...data
    });
  }, [sendMessage]);
  
  // Manually reconnect if needed
  const reconnect = useCallback(() => {
    console.log('Manual reconnection requested');
    
    // Reset reconnect interval for manual reconnection
    reconnectIntervalRef.current = WS_RECONNECT_INTERVAL;
    
    // Clean up existing connection
    cleanupSocket();
    
    // Update state
    setSocket(null);
    setIsConnected(false);
    
    // Trigger reconnection
    setTimeout(connectWebSocket, 100);
  }, [cleanupSocket, connectWebSocket]);
  
  // Context value
  const value = {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    sendEvent,
    reconnect
  };
  
  return (
    <NotificationContext.Provider value={value}>
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