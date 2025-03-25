const mongoose = require('mongoose');

const onboardingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  personalInfo: {
    completed: {
      type: Boolean,
      default: false
    },
    data: {
      phone: String,
      address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String
      },
      profilePicture: String
    }
  },
  professionalInfo: {
    completed: {
      type: Boolean,
      default: false
    },
    data: {
      currentTitle: String,
      yearsOfExperience: Number,
      currentCompany: String,
      desiredTitle: String,
      desiredSalary: Number,
      employmentType: String,
      workAuthorization: String,
      resume: String,
      coverLetter: String
    }
  },
  skills: {
    completed: {
      type: Boolean,
      default: false
    },
    data: {
      technical: [String],
      soft: [String],
      languages: [String],
      certifications: [String]
    }
  },
  preferences: {
    completed: {
      type: Boolean,
      default: false
    },
    data: {
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
    }
  },
  isComplete: {
    type: Boolean,
    default: false
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update isComplete status whenever any section is updated
onboardingSchema.pre('save', function(next) {
  this.isComplete = 
    this.personalInfo.completed && 
    this.professionalInfo.completed && 
    this.skills.completed && 
    this.preferences.completed;
  this.lastUpdated = new Date();
  next();
});

const Onboarding = mongoose.model('Onboarding', onboardingSchema);

module.exports = Onboarding; 