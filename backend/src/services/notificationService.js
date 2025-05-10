import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import Notification from '../models/notification.model.js';
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
    // Save notification to database 
    const notificationData = {
      recipient: userId,
      recipientType: 'user',
      type: notification.notificationType || 'info',
      message: notification.message,
      data: notification.data || {}
    };

    // Create and save notification
    const savedNotification = await Notification.create(notificationData);
    
    // Add notification ID to response
    const notificationWithId = {
      ...notification,
      id: savedNotification._id.toString(),
      timestamp: savedNotification.createdAt.toISOString()
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
    
    // User not connected, notification is stored in database for later delivery
    console.log(`User ${userId} not connected, notification stored in database for later delivery`);
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

// Helper functions for notification management
const sendPendingNotifications = async (userId) => {
  try {
    // Check if this is an admin user
    const isAdmin = userId.startsWith('admin-');
    
    // Find unread notifications for this user
    let pendingNotifications;
    
    if (isAdmin) {
      // Get admin notifications
      pendingNotifications = await Notification.find({
        recipientType: 'admin',
        read: false,
        isExpired: false
      }).sort({ createdAt: -1 }).limit(20);
    } else {
      // Get user-specific notifications
      pendingNotifications = await Notification.find({
        recipient: userId,
        read: false,
        isExpired: false
      }).sort({ createdAt: -1 }).limit(20);
    }
    
    console.log(`Sending ${pendingNotifications.length} pending notifications for ${isAdmin ? 'admin' : 'user'} ${userId}`);
    
    // Get connection for this user
    const connections = activeConnections.get(userId);
    if (!connections || connections.size === 0) return;
    
    // Send each notification
    for (const notification of pendingNotifications) {
      const notificationData = {
        type: 'notification',
        notificationType: notification.type,
        id: notification._id.toString(),
        message: notification.message,
        timestamp: notification.createdAt.toISOString(),
        data: notification.data || {}
      };
      
      connections.forEach((connection) => {
        if (connection.readyState === 1) { // OPEN
          connection.send(JSON.stringify(notificationData));
        }
      });
    }
  } catch (error) {
    console.error(`Error sending pending notifications for user ${userId}:`, error);
  }
};

const markNotificationAsRead = async (userId, notificationId) => {
  try {
    // Determine if this is an admin user
    const isAdmin = userId.startsWith('admin-');
    
    // Find and update the notification
    let notification;
    
    if (isAdmin) {
      notification = await Notification.findOne({
        _id: notificationId,
        recipientType: 'admin'
      });
    } else {
      notification = await Notification.findOne({
        _id: notificationId,
        recipient: userId
      });
    }
    
    if (notification) {
      notification.read = true;
      await notification.save();
      console.log(`Marked notification ${notificationId} as read for ${isAdmin ? 'admin' : 'user'} ${userId}`);
    }
  } catch (error) {
    console.error(`Error marking notification ${notificationId} as read:`, error);
  }
};

const markAllNotificationsAsRead = async (userId) => {
  try {
    // Determine if this is an admin user
    const isAdmin = userId.startsWith('admin-');
    
    // Update all unread notifications
    if (isAdmin) {
      await Notification.markAllAsReadForAdmin();
    } else {
      await Notification.markAllAsReadForUser(userId);
    }
    
    console.log(`Marked all notifications as read for ${isAdmin ? 'admin' : 'user'} ${userId}`);
  } catch (error) {
    console.error(`Error marking all notifications as read for user ${userId}:`, error);
  }
};

const deleteNotification = async (userId, notificationId) => {
  try {
    // Determine if this is an admin user
    const isAdmin = userId.startsWith('admin-');
    
    // Find and delete the notification
    if (isAdmin) {
      await Notification.deleteOne({
        _id: notificationId,
        recipientType: 'admin'
      });
    } else {
      await Notification.deleteOne({
        _id: notificationId,
        recipient: userId
      });
    }
    
    console.log(`Deleted notification ${notificationId} for ${isAdmin ? 'admin' : 'user'} ${userId}`);
  } catch (error) {
    console.error(`Error deleting notification ${notificationId}:`, error);
  }
};

const clearAllNotifications = async (userId) => {
  try {
    // Determine if this is an admin user
    const isAdmin = userId.startsWith('admin-');
    
    // Delete all notifications
    if (isAdmin) {
      await Notification.deleteMany({ recipientType: 'admin' });
    } else {
      await Notification.deleteMany({ recipient: userId });
    }
    
    console.log(`Cleared all notifications for ${isAdmin ? 'admin' : 'user'} ${userId}`);
  } catch (error) {
    console.error(`Error clearing all notifications for user ${userId}:`, error);
  }
};

// Send notification to all admin users
export const sendAdminNotification = async (notification) => {
  try {
    // Save admin notification to database
    const notificationData = {
      recipientType: 'admin',
      type: notification.notificationType || 'info',
      message: notification.message,
      data: notification.data || {}
    };

    // Create and save notification
    const savedNotification = await Notification.create(notificationData);
    
    // Add notification ID and timestamp to the notification object
    const notificationWithId = {
      ...notification,
      id: savedNotification._id.toString(),
      timestamp: savedNotification.createdAt.toISOString()
    };
    
    // Get all admin user IDs
    const adminUserIds = Array.from(activeConnections.keys()).filter(userId => 
      userId.startsWith('admin-')
    );
    
    // If no admins are connected, notification is already stored in DB
    if (adminUserIds.length === 0) {
      console.log('No admin users connected, notification stored in database for later delivery');
      return true;
    }
    
    // Send to all connected admin users
    let sentCount = 0;
    for (const adminId of adminUserIds) {
      const connections = activeConnections.get(adminId);
      if (connections) {
        connections.forEach((connection) => {
          if (connection.readyState === 1) { // OPEN
            connection.send(JSON.stringify(notificationWithId));
            sentCount++;
          }
        });
      }
    }
    
    console.log(`Admin notification sent to ${sentCount} active admin connections`);
    return true;
  } catch (error) {
    console.error('Error sending admin notification:', error);
    return false;
  }
};

// Send notification for new user registration
export const sendNewUserRegistrationNotification = async (userData) => {
  const notification = {
    type: 'notification',
    notificationType: 'success',
    message: `New user registered: ${userData.name || 'Unknown user'}`,
    data: {
      type: 'user_registration',
      userId: userData._id.toString(),
      userName: userData.name || 'Unknown user',
      userEmail: userData.email,
      userType: userData.role || 'user',
      timestamp: new Date().toISOString()
    }
  };
  
  return await sendAdminNotification(notification);
};

export default {
  initializeWebSocketServer,
  sendNotification,
  sendBulkNotifications,
  broadcastNotification,
  sendJobNotification,
  sendApplicationStatusNotification,
  sendAdminNotification,
  sendNewUserRegistrationNotification
}; 