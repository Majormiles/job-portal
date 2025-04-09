import mongoose from 'mongoose';

const deletedAccountSchema = new mongoose.Schema({
  originalId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  deletionReason: {
    type: String,
    enum: [
      'Found a job',
      'Not finding relevant jobs',
      'Technical issues',
      'Privacy concerns',
      'Creating a new account',
      'Other'
    ],
    required: true
  },
  customReason: {
    type: String,
    default: null
  },
  accountData: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  accountMetrics: {
    jobApplicationsCount: {
      type: Number,
      default: 0
    },
    savedJobsCount: {
      type: Number,
      default: 0
    },
    profileCompletionPercentage: {
      type: Number,
      default: 0
    },
    daysActive: {
      type: Number,
      default: 0
    }
  },
  deletedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
deletedAccountSchema.index({ email: 1, deletedAt: -1 });
deletedAccountSchema.index({ deletionReason: 1 });
deletedAccountSchema.index({ 'accountMetrics.daysActive': 1 });

const DeletedAccount = mongoose.model('DeletedAccount', deletedAccountSchema);

export default DeletedAccount; 