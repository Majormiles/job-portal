import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a job title'],
    trim: true
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  description: {
    type: String,
    required: [true, 'Please add a job description']
  },
  image: {
    public_id: {
      type: String
    },
    url: {
      type: String
    }
  },
  requirements: [{
    type: String,
    required: [true, 'Please add job requirements']
  }],
  responsibilities: [{
    type: String,
    required: [true, 'Please add job responsibilities']
  }],
  location: {
    type: String,
    required: [true, 'Please add a job location']
  },
  type: {
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'internship'],
    required: [true, 'Please add a job type']
  },
  salary: {
    min: {
      type: Number,
      required: [true, 'Please add a minimum salary']
    },
    max: {
      type: Number,
      required: [true, 'Please add a maximum salary']
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  experience: {
    type: String,
    enum: ['entry', 'mid', 'senior', 'lead', 'manager'],
    required: [true, 'Please add required experience level']
  },
  skills: [{
    type: String,
    required: [true, 'Please add required skills']
  }],
  benefits: [{
    type: String,
    required: [true, 'Please add job benefits']
  }],
  category: {
    type: String,
    required: [true, 'Please add a job category']
  },
  status: {
    type: String,
    enum: ['active', 'closed', 'draft'],
    default: 'active'
  },
  applications: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application'
  }],
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

// Add text index for search functionality
jobSchema.index({ title: 'text', description: 'text', requirements: 'text', skills: 'text' });

const Job = mongoose.model('Job', jobSchema);

export default Job; 