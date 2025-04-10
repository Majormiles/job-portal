const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Company description is required']
  },
  website: {
    type: String,
    trim: true
  },
  logo: {
    type: String
  },
  industry: {
    type: String,
    required: [true, 'Industry is required']
  },
  size: {
    type: String,
    enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'],
    required: [true, 'Company size is required']
  },
  location: {
    address: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  founded: {
    type: Date
  },
  culture: {
    type: String
  },
  benefits: [{
    type: String
  }],
  socialMedia: {
    linkedin: String,
    twitter: String,
    facebook: String
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  employees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  jobs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Index for search functionality
companySchema.index({
  name: 'text',
  description: 'text',
  industry: 'text'
});

// Virtual for company rating (can be implemented later)
companySchema.virtual('rating').get(function() {
  // Implementation for calculating company rating
  return 0;
});

// Method to get company statistics
companySchema.methods.getStats = async function() {
  const stats = {
    totalJobs: this.jobs.length,
    activeJobs: await this.model('Job').countDocuments({
      _id: { $in: this.jobs },
      status: 'active'
    }),
    totalEmployees: this.employees.length
  };
  return stats;
};

const Company = mongoose.model('Company', companySchema);

module.exports = Company; 