import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false, // Not required for broadcast notifications
    },
    recipientType: {
      type: String,
      enum: ['user', 'admin', 'all'],
      default: 'user'
    },
    type: {
      type: String,
      required: true,
      default: 'info', // info, success, warning, error
    },
    message: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    data: {
      type: Object,
      default: {},
    },
    isExpired: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from creation
    },
  },
  {
    timestamps: true,
  }
);

// Index for queries
notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });
notificationSchema.index({ recipientType: 1, isExpired: 1 });

// Method to mark notification as read
notificationSchema.methods.markAsRead = function() {
  this.read = true;
  return this.save();
};

// Method to mark notification as expired
notificationSchema.methods.expire = function() {
  this.isExpired = true;
  return this.save();
};

// Statics for common queries
notificationSchema.statics.getUnreadCountForUser = async function(userId) {
  return this.countDocuments({
    recipient: userId,
    read: false,
    isExpired: false
  });
};

notificationSchema.statics.getUnreadCountForAdmin = async function() {
  return this.countDocuments({
    recipientType: 'admin',
    read: false,
    isExpired: false
  });
};

notificationSchema.statics.markAllAsReadForUser = async function(userId) {
  return this.updateMany(
    { recipient: userId, read: false },
    { read: true }
  );
};

notificationSchema.statics.markAllAsReadForAdmin = async function() {
  return this.updateMany(
    { recipientType: 'admin', read: false },
    { read: true }
  );
};

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification; 