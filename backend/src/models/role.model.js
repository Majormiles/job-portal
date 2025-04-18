import mongoose from 'mongoose';

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Role name is required'],
    unique: true,
    trim: true
  },
  displayName: {
    type: String,
    required: [true, 'Display name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  permissions: {
    canPostJobs: {
      type: Boolean,
      default: false
    },
    canApplyToJobs: {
      type: Boolean,
      default: false
    },
    canManageUsers: {
      type: Boolean,
      default: false
    },
    canManageRoles: {
      type: Boolean,
      default: false
    },
    canManageTrainings: {
      type: Boolean,
      default: false
    },
    canAttendTrainings: {
      type: Boolean,
      default: false
    },
    canProvideTrainings: {
      type: Boolean,
      default: false
    },
    canAccessAdminPanel: {
      type: Boolean,
      default: false
    }
  },
  registrationFields: {
    type: [String],
    required: true,
    default: ['name', 'email', 'password']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isDefault: {
    type: Boolean,
    default: false
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

// Create index for faster searches
roleSchema.index({ name: 1 }, { unique: true });

// Ensure only one default role exists
roleSchema.pre('save', async function(next) {
  if (this.isDefault) {
    await mongoose.model('Role').updateMany(
      { _id: { $ne: this._id } },
      { $set: { isDefault: false } }
    );
  }
  next();
});

const Role = mongoose.model('Role', roleSchema);

// Create default roles if they don't exist
export const initializeRoles = async () => {
  const roles = [
    {
      name: 'admin',
      displayName: 'Administrator',
      description: 'Full system access',
      permissions: {
        canPostJobs: true,
        canApplyToJobs: true,
        canManageUsers: true,
        canManageRoles: true,
        canManageTrainings: true,
        canAttendTrainings: true,
        canProvideTrainings: true,
        canAccessAdminPanel: true
      },
      registrationFields: ['name', 'email', 'password'],
      isActive: true,
      isDefault: false
    },
    {
      name: 'jobSeeker',
      displayName: 'Job Seeker',
      description: 'User looking for employment opportunities',
      permissions: {
        canPostJobs: false,
        canApplyToJobs: true,
        canManageUsers: false,
        canManageRoles: false,
        canManageTrainings: false,
        canAttendTrainings: true,
        canProvideTrainings: false,
        canAccessAdminPanel: false
      },
      registrationFields: ['name', 'email', 'password', 'phone', 'location'],
      isActive: true,
      isDefault: true
    },
    {
      name: 'employer',
      displayName: 'Employer',
      description: 'Organization looking to hire talent',
      permissions: {
        canPostJobs: true,
        canApplyToJobs: false,
        canManageUsers: false,
        canManageRoles: false,
        canManageTrainings: false,
        canAttendTrainings: false,
        canProvideTrainings: false,
        canAccessAdminPanel: false
      },
      registrationFields: ['name', 'email', 'password', 'companyName', 'companySize', 'industry', 'phone', 'location'],
      isActive: true,
      isDefault: false
    },
    {
      name: 'trainer',
      displayName: 'Training Provider',
      description: 'Organization or individual providing training services',
      permissions: {
        canPostJobs: false,
        canApplyToJobs: false,
        canManageUsers: false,
        canManageRoles: false,
        canManageTrainings: true,
        canAttendTrainings: false,
        canProvideTrainings: true,
        canAccessAdminPanel: false
      },
      registrationFields: ['name', 'email', 'password', 'organization', 'specialization', 'phone', 'location'],
      isActive: true,
      isDefault: false
    },
    {
      name: 'trainee',
      displayName: 'Trainee',
      description: 'User seeking skill development and training',
      permissions: {
        canPostJobs: false,
        canApplyToJobs: true,
        canManageUsers: false,
        canManageRoles: false,
        canManageTrainings: false,
        canAttendTrainings: true,
        canProvideTrainings: false,
        canAccessAdminPanel: false
      },
      registrationFields: ['name', 'email', 'password', 'phone', 'location', 'educationLevel'],
      isActive: true,
      isDefault: false
    }
  ];

  for (const role of roles) {
    try {
      await Role.findOneAndUpdate(
        { name: role.name },
        { $set: role },
        { upsert: true, new: true }
      );
    } catch (error) {
      console.error(`Error creating/updating role ${role.name}:`, error);
    }
  }
};

export default Role; 