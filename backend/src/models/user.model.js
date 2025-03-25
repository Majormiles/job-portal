const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide your name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false
  },
  profilePicture: {
    type: String,
    default: 'default-profile.png'
  },
  phone: String,
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  professionalInfo: {
    currentTitle: String,
    yearsOfExperience: Number,
    currentCompany: String,
    desiredTitle: String,
    desiredSalary: Number,
    employmentType: String,
    workAuthorization: String,
    resume: String,
    coverLetter: String
  },
  skills: {
    technical: [String],
    soft: [String],
    languages: [String],
    certifications: [String]
  },
  preferences: {
    jobPreferences: {
      remoteWork: Boolean,
      hybridWork: Boolean,
      onsiteWork: Boolean,
      flexibleHours: Boolean,
      fixedHours: Boolean
    },
    industryPreferences: [String],
    companySize: String,
    workCulture: [String],
    benefits: [String],
    availability: {
      startDate: Date,
      noticePeriod: Number,
      hoursPerWeek: Number
    }
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

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User; 