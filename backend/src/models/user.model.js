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
    required: function() {
      // Only require password for admin users or if using OAuth (googleId not present)
      return this.roleName === 'admin' && !this.googleId;
    },
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
  phone: {
    type: String,
    trim: true
  },
  location: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location'
  },
  customLocation: {
    type: String,
    trim: true
  },
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
    required: [true, 'Role is required']
  },
  roleName: {
    type: String,
    enum: ['admin', 'jobSeeker', 'employer', 'trainer', 'trainee'],
    required: [true, 'Role name is required']
  },
  // Job seeker specific fields
  jobSeekerProfile: {
    skills: [String],
    experience: [
      {
        title: String,
        company: String,
        location: String,
        from: Date,
        to: Date,
        current: Boolean,
        description: String
      }
    ],
    education: [
      {
        school: String,
        degree: String,
        fieldOfStudy: String,
        from: Date,
        to: Date,
        current: Boolean,
        description: String
      }
    ],
    resume: String,
    jobPreferences: {
      jobType: [String],
      salary: {
        min: Number,
        max: Number,
        currency: {
          type: String,
          default: 'GHS'
        }
      },
      locations: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Location'
      }],
      remote: Boolean
    }
  },
  // Employer specific fields
  employerProfile: {
    companyName: String,
    industry: String,
    companySize: String,
    companyDescription: String,
    companyLogo: String,
    website: String,
    socialMedia: {
      facebook: String,
      twitter: String,
      linkedin: String,
      instagram: String
    },
    locations: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location'
    }],
    contactEmail: String,
    contactPhone: String
  },
  // Trainer specific fields
  trainerProfile: {
    organization: String,
    specialization: [String],
    bio: String,
    experience: Number, // Years of experience
    certificates: [String],
    trainingAreas: [String],
    availableDays: [String],
    availableHours: {
      start: String,
      end: String
    }
  },
  // Trainee specific fields
  traineeProfile: {
    educationLevel: String,
    interests: [String],
    previousTrainings: [
      {
        title: String,
        provider: String,
        completionDate: Date,
        certificate: String
      }
    ],
    goals: [String],
    availableDays: [String],
    availableHours: {
      start: String,
      end: String
    }
  },
  socialLinks: [{
    id: Number,
    name: String,
    icon: String,
    url: String
  }],
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
  onboardingComplete: {
    type: Boolean,
    default: false,
  },
  onboardingCompletedAt: {
    type: Date,
    default: null,
  },
  lastLogin: {
    type: Date,
    default: null
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
  },
  // Add the payment fields
  payment: {
    isPaid: {
      type: Boolean,
      default: false
    },
    reference: {
      type: String
    },
    amount: {
      type: Number,
      validate: {
        validator: function(value) {
          // Only validate if isPaid is true
          if (this.payment && this.payment.isPaid) {
            return value !== undefined && value !== null && value > 0;
          }
          return true;
        },
        message: 'Payment amount must be greater than 0 when payment is marked as paid'
      }
    },
    currency: {
      type: String,
      default: 'GHS'
    },
    date: {
      type: Date
    },
    gateway: {
      type: String,
      default: 'paystack'
    },
    metadata: {
      type: Object
    }
  },
  paymentHistory: [{
    reference: String,
    amount: Number,
    status: String,
    date: Date,
    gateway: {
      type: String,
      default: 'paystack'
    },
    metadata: Object
  }]
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash the password if it exists and was modified
  if (!this.isModified('password') || !this.password) return next();
  
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

// Ensure payment data has valid amount
userSchema.pre('save', function (next) {
  // Define payment amounts by role
  const PAYMENT_AMOUNTS = {
    jobSeeker: 50,
    employer: 100,
    trainer: 100,
    trainee: 50
  };

  // Only fix payment if it's marked as paid
  if (this.payment && this.payment.isPaid === true) {
    // Fix missing or invalid payment amount using role-based pricing
    if (!this.payment.amount || this.payment.amount <= 0) {
      console.log(`Fixing zero/invalid payment amount for user ${this.email}`);
      
      // Get amount based on role
      if (this.roleName && PAYMENT_AMOUNTS[this.roleName]) {
        this.payment.amount = PAYMENT_AMOUNTS[this.roleName];
      } else {
        // Use default fallback amount
        this.payment.amount = 50;
      }
    }
  }
  
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate JWT token
userSchema.methods.generateAuthToken = function() {
  return jwt.sign(
    { id: this._id, role: this.roleName },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

// Create indexes for faster queries
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ roleName: 1 });
userSchema.index({ isActive: 1 });

const User = mongoose.model('User', userSchema);

export default User; 