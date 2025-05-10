import mongoose from 'mongoose';

const jobTypeSchema = new mongoose.Schema({
  id: {
    type: String,
    required: [true, 'Job type ID is required'],
    trim: true,
    unique: true
  },
  name: {
    type: String,
    required: [true, 'Job type name is required'],
    trim: true,
    unique: true
  },
  description: {
    type: String,
    trim: true
  },
  icon: {
    type: String,
    default: 'briefcase'
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create index for fast searches
jobTypeSchema.index({ name: 1 });
jobTypeSchema.index({ id: 1 });

// Add helper method to convert name to ID format
jobTypeSchema.statics.nameToId = function(name) {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/--+/g, '-') // Replace multiple hyphens with single
    .trim();
};

// Pre-save hook to generate ID from name if not provided
jobTypeSchema.pre('save', function(next) {
  if (!this.id) {
    this.id = mongoose.model('JobType').nameToId(this.name);
  }
  next();
});

// Return virtual properties when converting to JSON
jobTypeSchema.set('toJSON', { virtuals: true });
jobTypeSchema.set('toObject', { virtuals: true });

const JobType = mongoose.model('JobType', jobTypeSchema);

export default JobType; 