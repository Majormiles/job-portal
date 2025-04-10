import mongoose from 'mongoose';

const dashboardStatsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  appliedJobs: {
    type: Number,
    default: 0
  },
  favoriteJobs: {
    type: Number,
    default: 0
  },
  jobAlerts: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const DashboardStats = mongoose.model('DashboardStats', dashboardStatsSchema);

export default DashboardStats; 