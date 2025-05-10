import asyncHandler from '../utils/asyncHandler.js';
import Notification from '../models/notification.model.js';
import AppError from '../utils/appError.js';

/**
 * @desc    Get all admin notifications
 * @route   GET /api/admin/notifications
 * @access  Admin
 */
export const getAdminNotifications = asyncHandler(async (req, res, next) => {
  // Get page and limit from query params
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;
  
  // Get filter options
  const filterRead = req.query.read;
  
  // Build filter
  const filter = { recipientType: 'admin', isExpired: false };
  
  // Add read filter if provided
  if (filterRead === 'true') {
    filter.read = true;
  } else if (filterRead === 'false') {
    filter.read = false;
  }
  
  // Get total count for pagination
  const total = await Notification.countDocuments(filter);
  
  // Get notifications
  const notifications = await Notification.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
  
  // Get unread count
  const unreadCount = await Notification.countDocuments({
    recipientType: 'admin',
    read: false,
    isExpired: false
  });
  
  res.status(200).json({
    success: true,
    count: notifications.length,
    pagination: {
      total,
      page,
      pages: Math.ceil(total / limit),
      limit
    },
    unreadCount,
    data: notifications
  });
});

/**
 * @desc    Mark admin notification as read
 * @route   PUT /api/admin/notifications/:id/read
 * @access  Admin
 */
export const markNotificationAsRead = asyncHandler(async (req, res, next) => {
  const notification = await Notification.findOne({
    _id: req.params.id,
    recipientType: 'admin'
  });
  
  if (!notification) {
    return next(new AppError('Notification not found', 404));
  }
  
  notification.read = true;
  await notification.save();
  
  res.status(200).json({
    success: true,
    data: notification
  });
});

/**
 * @desc    Mark all admin notifications as read
 * @route   PUT /api/admin/notifications/read-all
 * @access  Admin
 */
export const markAllNotificationsAsRead = asyncHandler(async (req, res, next) => {
  await Notification.updateMany(
    { recipientType: 'admin', read: false },
    { read: true }
  );
  
  res.status(200).json({
    success: true,
    message: 'All notifications marked as read'
  });
});

/**
 * @desc    Delete admin notification
 * @route   DELETE /api/admin/notifications/:id
 * @access  Admin
 */
export const deleteNotification = asyncHandler(async (req, res, next) => {
  const notification = await Notification.findOneAndDelete({
    _id: req.params.id,
    recipientType: 'admin'
  });
  
  if (!notification) {
    return next(new AppError('Notification not found', 404));
  }
  
  res.status(200).json({
    success: true,
    data: {}
  });
});

/**
 * @desc    Delete all admin notifications
 * @route   DELETE /api/admin/notifications
 * @access  Admin
 */
export const deleteAllNotifications = asyncHandler(async (req, res, next) => {
  await Notification.deleteMany({ recipientType: 'admin' });
  
  res.status(200).json({
    success: true,
    data: {}
  });
});

/**
 * @desc    Get admin notification stats
 * @route   GET /api/admin/notifications/stats
 * @access  Admin
 */
export const getNotificationStats = asyncHandler(async (req, res, next) => {
  const totalCount = await Notification.countDocuments({
    recipientType: 'admin',
    isExpired: false
  });
  
  const unreadCount = await Notification.countDocuments({
    recipientType: 'admin',
    read: false,
    isExpired: false
  });
  
  const stats = {
    total: totalCount,
    unread: unreadCount,
    read: totalCount - unreadCount
  };
  
  res.status(200).json({
    success: true,
    data: stats
  });
}); 