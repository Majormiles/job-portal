import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Location name is required'],
    trim: true,
    unique: true
  },
  region: {
    type: String,
    required: [true, 'Region is required'],
    trim: true
  },
  country: {
    type: String,
    required: [true, 'Country is required'],
    default: 'Ghana',
    trim: true
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
locationSchema.index({ name: 1, region: 1 });

// Add virtual for full location name (for display purposes)
locationSchema.virtual('fullName').get(function() {
  return `${this.name}, ${this.region}, ${this.country}`;
});

// Return virtual properties when converting to JSON
locationSchema.set('toJSON', { virtuals: true });
locationSchema.set('toObject', { virtuals: true });

const Location = mongoose.model('Location', locationSchema);

export default Location; 