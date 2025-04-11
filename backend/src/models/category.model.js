import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a category name'],
    trim: true,
    unique: true
  },
  description: {
    type: String,
    required: [true, 'Please add a category description']
  },
  icon: {
    type: String
  },
  image: {
    public_id: {
      type: String
    },
    url: {
      type: String
    }
  },
  color: {
    type: String,
    default: '#3b82f6' // Default blue color
  },
  featured: {
    type: Boolean,
    default: false
  },
  slug: {
    type: String,
    unique: true
  },
  metaTitle: {
    type: String,
    trim: true
  },
  metaDescription: {
    type: String
  },
  jobCount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
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

// Generate slug from name before saving
categorySchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/--+/g, '-') // Replace multiple hyphens with single
      .trim();
  }
  next();
});

// Text index for search functionality
categorySchema.index({ name: 'text', description: 'text' });

const Category = mongoose.model('Category', categorySchema);

export default Category; 