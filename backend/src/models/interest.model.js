import mongoose from 'mongoose';

const interestSchema = new mongoose.Schema({
  id: {
    type: String,
    required: [true, 'Interest ID is required'],
    trim: true,
    unique: true
  },
  name: {
    type: String,
    required: [true, 'Interest name is required'],
    trim: true,
    unique: true
  },
  description: {
    type: String,
    trim: true
  },
  icon: {
    type: String,
    default: 'graduation-cap'
  },
  category: {
    type: String,
    enum: ['technical', 'creative', 'business', 'trade', 'other'],
    default: 'other'
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
interestSchema.index({ name: 1 });
interestSchema.index({ id: 1 });
interestSchema.index({ category: 1 });

// Add helper method to convert name to ID format
interestSchema.statics.nameToId = function(name) {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/--+/g, '-') // Replace multiple hyphens with single
    .trim();
};

// Pre-save hook to generate ID from name if not provided
interestSchema.pre('save', function(next) {
  if (!this.id) {
    this.id = mongoose.model('Interest').nameToId(this.name);
  }
  next();
});

// Return virtual properties when converting to JSON
interestSchema.set('toJSON', { virtuals: true });
interestSchema.set('toObject', { virtuals: true });

const Interest = mongoose.model('Interest', interestSchema);

export default Interest; 