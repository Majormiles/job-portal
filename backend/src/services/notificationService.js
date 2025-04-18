import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import { WebSocketServer } from 'ws';

// Store active WebSocket connections
const activeConnections = new Map();

// Verify JWT token
const verifyToken = async (token) => {
  try {
    if (!token) return null;
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) return null;
    
    return user;
  } catch (error) {
    console.error('JWT verification error:', error.message);
    return null;
  }
};

// Initialize WebSocket server
export const initializeWebSocketServer = (server) => {
  const wss = new WebSocketServer({ server });
  
  console.log('WebSocket server initialized');
  
  // Handle new connections
  wss.on('connection', async (ws, req) => {
    console.log('New WebSocket connection established');
    let userId = null;
    
    // Handle messages from client
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message);
        
        // Handle authentication
        if (data.type === 'auth') {
          const user = await verifyToken(data.token);
          
          if (user) {
            // Store user ID
            userId = user._id.toString();
            
            // Add to active connections
            if (!activeConnections.has(userId)) {
              activeConnections.set(userId, new Set());
            }
            
            activeConnections.get(userId).add(ws);
            
            console.log(`User ${userId} authenticated via WebSocket`);
            
            // Send confirmation to client
            ws.send(JSON.stringify({
              type: 'auth_success',
              userId: userId,
              message: 'Authentication successful'
            }));
            
            // Send any pending notifications
            sendPendingNotifications(userId);
          } else {
            // Authentication failed
            ws.send(JSON.stringify({
              type: 'auth_failure',
              message: 'Authentication failed'
            }));
          }
        }
        
        // Handle mark as read
        else if (data.type === 'mark_read' && userId) {
          await markNotificationAsRead(userId, data.notificationId);
        }
        
        // Handle mark all as read
        else if (data.type === 'mark_all_read' && userId) {
          await markAllNotificationsAsRead(userId);
        }
        
        // Handle delete notification
        else if (data.type === 'delete_notification' && userId) {
          await deleteNotification(userId, data.notificationId);
        }
        
        // Handle clear all notifications
        else if (data.type === 'clear_all_notifications' && userId) {
          await clearAllNotifications(userId);
        }
        
        // Handle custom events
        else if (data.type && userId) {
          // Process custom events based on type
          console.log(`Received custom event of type ${data.type} from user ${userId}`);
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    });
    
    // Handle disconnection
    ws.on('close', () => {
      if (userId && activeConnections.has(userId)) {
        // Remove connection from set
        activeConnections.get(userId).delete(ws);
        
        // Clean up if no more connections for this user
        if (activeConnections.get(userId).size === 0) {
          activeConnections.delete(userId);
        }
        
        console.log(`User ${userId} disconnected from WebSocket`);
      }
    });
  });
  
  // Ping clients regularly to keep connections alive
  setInterval(() => {
    wss.clients.forEach((client) => {
      if (client.readyState === 1) { // WebSocket.OPEN value is 1
        client.send(JSON.stringify({ type: 'ping' }));
      }
    });
  }, 30000); // Ping every 30 seconds
  
  return wss;
};

// Send notification to specific user
export const sendNotification = async (userId, notification) => {
  try {
    // Save notification to database (implement this based on your DB schema)
    // const savedNotification = await saveNotificationToDatabase(userId, notification);
    
    // For now, we'll use a mock notification ID
    const notificationWithId = {
      ...notification,
      id: `notification-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`,
      timestamp: new Date().toISOString()
    };
    
    // Send to all active connections for this user
    if (activeConnections.has(userId)) {
      const connections = activeConnections.get(userId);
      
      connections.forEach((connection) => {
        if (connection.readyState === 1) { // OPEN
          connection.send(JSON.stringify(notificationWithId));
        }
      });
      
      console.log(`Notification sent to user ${userId}: ${notification.message}`);
      return true;
    }
    
    // User not connected, store for later delivery
    console.log(`User ${userId} not connected, notification stored for later delivery`);
    return false;
  } catch (error) {
    console.error('Error sending notification:', error);
    return false;
  }
};

// Send notification to multiple users
export const sendBulkNotifications = async (userIds, notification) => {
  const results = [];
  
  for (const userId of userIds) {
    const result = await sendNotification(userId, notification);
    results.push({ userId, success: result });
  }
  
  return results;
};

// Send notification to all users
export const broadcastNotification = async (notification, excludeUserIds = []) => {
  const results = [];
  
  for (const [userId, connections] of activeConnections.entries()) {
    if (!excludeUserIds.includes(userId)) {
      const result = await sendNotification(userId, notification);
      results.push({ userId, success: result });
    }
  }
  
  return results;
};

// Send job-related notification
export const sendJobNotification = async (jobId, jobTitle, message, userIds) => {
  const notification = {
    type: 'notification',
    notificationType: 'info',
    message: message,
    data: {
      type: 'job',
      jobId: jobId,
      title: jobTitle
    }
  };
  
  if (userIds && userIds.length > 0) {
    return await sendBulkNotifications(userIds, notification);
  } else {
    return await broadcastNotification(notification);
  }
};

// Send application status update notification
export const sendApplicationStatusNotification = async (applicationId, status, userId) => {
  const notification = {
    type: 'notification',
    notificationType: 'info',
    message: `Your application status has been updated to: ${status}`,
    data: {
      type: 'application',
      applicationId: applicationId,
      status: status
    }
  };
  
  return await sendNotification(userId, notification);
};

// Helper functions for notification management (these would interact with your database)
const sendPendingNotifications = async (userId) => {
  // Implement to fetch and send pending notifications from database
  console.log(`Sending pending notifications for user ${userId}`);
};

const markNotificationAsRead = async (userId, notificationId) => {
  // Implement to mark notification as read in database
  console.log(`Marking notification ${notificationId} as read for user ${userId}`);
};

const markAllNotificationsAsRead = async (userId) => {
  // Implement to mark all notifications as read in database
  console.log(`Marking all notifications as read for user ${userId}`);
};

const deleteNotification = async (userId, notificationId) => {
  // Implement to delete notification from database
  console.log(`Deleting notification ${notificationId} for user ${userId}`);
};

const clearAllNotifications = async (userId) => {
  // Implement to clear all notifications from database
  console.log(`Clearing all notifications for user ${userId}`);
};

export default {
  initializeWebSocketServer,
  sendNotification,
  sendBulkNotifications,
  broadcastNotification,
  sendJobNotification,
  sendApplicationStatusNotification
}; 