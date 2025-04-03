import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
  street: { type: String, default: '' },
  city: { type: String, default: '' },
  state: { type: String, default: '' },
  zipCode: { type: String, default: '' },
  country: { type: String, default: 'Ghana' }
});

const experienceSchema = new mongoose.Schema({
  currentRole: { type: String, default: '' },
  yearsOfExperience: { type: String, default: '' },
  company: { type: String, default: '' },
  desiredRole: { type: String, default: '' },
  industry: { type: String, default: '' }
});

const educationSchema = new mongoose.Schema({
  degree: { type: String, default: '' },
  institution: { type: String, default: '' },
  graduationYear: { type: String, default: '' },
  field: { type: String, default: '' }
});

const workPreferencesSchema = new mongoose.Schema({
  workArrangement: { type: String, default: '' },
  workSchedule: { type: String, default: '' },
  workCulture: { type: String, default: '' }
});

const jobPreferencesSchema = new mongoose.Schema({
  jobTypes: [{ type: String }],
  industries: [{ type: String }],
  locations: [{ type: String }],
  salaryRange: {
    min: { type: Number, default: 0 },
    max: { type: Number, default: 0 }
  }
});

const onboardingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isComplete: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date,
    default: null
  },
  personalInfo: {
    completed: { type: Boolean, default: false },
    data: {
      phone: { type: String, default: '' },
      address: addressSchema,
      dateOfBirth: { type: Date, default: null },
      profilePicture: { type: String, default: null }
    }
  },
  professionalInfo: {
    completed: { type: Boolean, default: false },
    data: {
      experience: experienceSchema,
      education: educationSchema,
      resume: { type: String, default: null }
    }
  },
  skills: {
    completed: { type: Boolean, default: false },
    data: {
      technical: [{ type: String }],
      soft: [{ type: String }],
      languages: [{ type: String }],
      certifications: [{ type: String }]
    }
  },
  preferences: {
    completed: { type: Boolean, default: false },
    data: {
      workPreferences: workPreferencesSchema,
      jobPreferences: jobPreferencesSchema
    }
  }
}, {
  timestamps: true
});

// Pre-save hook to update completion status
onboardingSchema.pre('save', async function(next) {
  // Check if all sections are complete
  this.isComplete = 
    this.personalInfo?.completed &&
    this.professionalInfo?.completed &&
    this.skills?.completed &&
    this.preferences?.completed;

  // Update completedAt timestamp if isComplete changes to true
  if (this.isComplete && !this.completedAt) {
    this.completedAt = new Date();
  } else if (!this.isComplete) {
    this.completedAt = null;
  }

  // Sync with user model
  try {
    const User = mongoose.model('User');
    const user = await User.findById(this.user);
    if (user) {
      user.onboardingComplete = this.isComplete;
      user.onboardingCompletedAt = this.completedAt;
      await user.save();
    }
  } catch (error) {
    console.error('Error syncing onboarding status with user:', error);
  }

  next();
});

const Onboarding = mongoose.model('Onboarding', onboardingSchema);

export default Onboarding; 