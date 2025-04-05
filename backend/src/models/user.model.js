import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

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
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  verificationTokenExpires: Date,
  googleId: {
    type: String,
    sparse: true
  },
  profilePicture: {
    type: String,
    default: 'default-profile.png'
  },
  socialLinks: [{
    id: Number,
    name: String,
    icon: String,
    url: String
  }],
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
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  onboardingComplete: {
    type: Boolean,
    default: false,
  },
  onboardingCompletedAt: {
    type: Date,
    default: null,
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
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Update timestamps on save
userSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate JWT token
userSchema.methods.generateAuthToken = function() {
  return jwt.sign(
    { id: this._id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

const User = mongoose.model('User', userSchema);

export default User; 