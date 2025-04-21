import mongoose from 'mongoose';

const companyTypeSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: [true, 'Company type ID is required'],
    trim: true
  },
  name: {
    type: String,
    required: [true, 'Company type name is required'],
    trim: true,
    unique: true
  },
  description: {
    type: String,
    trim: true
  },
  icon: {
    type: String,
    default: 'building'
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
companyTypeSchema.index({ name: 1 });

// Add helper method to convert name to ID format
companyTypeSchema.statics.nameToId = function(name) {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/--+/g, '-') // Replace multiple hyphens with single
    .trim();
};

// Pre-save hook to generate ID from name if not provided
companyTypeSchema.pre('save', function(next) {
  if (!this._id) {
    this._id = mongoose.model('CompanyType').nameToId(this.name);
  }
  next();
});

// Return virtual properties when converting to JSON
companyTypeSchema.set('toJSON', { virtuals: true });
companyTypeSchema.set('toObject', { virtuals: true });

const CompanyType = mongoose.model('CompanyType', companyTypeSchema);

export default CompanyType; 