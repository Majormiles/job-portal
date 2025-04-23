import mongoose from 'mongoose';

// Change history schema to track who made changes and when
const changeHistorySchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  adminName: {
    type: String,
    required: true
  },
  adminEmail: {
    type: String,
    required: true
  },
  previousAmount: {
    type: Number,
    required: true
  },
  newAmount: {
    type: Number,
    required: true
  },
  role: {
    type: String,
    required: true,
    enum: ['jobSeeker', 'employer', 'trainer', 'trainee']
  },
  changedAt: {
    type: Date,
    default: Date.now
  }
});

// Payment settings schema
const paymentSettingsSchema = new mongoose.Schema(
  {
    jobSeeker: {
      type: Number,
      required: true,
      default: 50, // Default amount in Ghana Cedis
      min: 0
    },
    employer: {
      type: Number,
      required: true,
      default: 100, // Default amount in Ghana Cedis
      min: 0
    },
    trainer: {
      type: Number,
      required: true,
      default: 100, // Default amount in Ghana Cedis
      min: 0
    },
    trainee: {
      type: Number,
      required: true,
      default: 50, // Default amount in Ghana Cedis
      min: 0
    },
    currency: {
      type: String,
      required: true,
      default: 'GHS'
    },
    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    changeHistory: [changeHistorySchema]
  },
  {
    timestamps: true
  }
);

// Create a singleton pattern to ensure there's only one payment settings document
paymentSettingsSchema.statics.getSettings = async function() {
  const settings = await this.findOne();
  if (settings) {
    return settings;
  }
  
  // If no settings exist, create default settings
  return await this.create({
    jobSeeker: 50,
    employer: 100,
    trainer: 100,
    trainee: 50,
    currency: 'GHS'
  });
};

// Method to update a fee and log the change
paymentSettingsSchema.methods.updateFee = async function(role, amount, admin) {
  if (!['jobSeeker', 'employer', 'trainer', 'trainee'].includes(role)) {
    throw new Error('Invalid role specified');
  }
  
  // Only proceed if there's an actual change
  if (this[role] === amount) {
    return this;
  }
  
  // Store the previous amount for history
  const previousAmount = this[role];
  
  // Update the amount
  this[role] = amount;
  this.lastUpdatedBy = admin._id;
  
  // Add entry to change history
  this.changeHistory.push({
    adminId: admin._id,
    adminName: admin.name,
    adminEmail: admin.email,
    previousAmount,
    newAmount: amount,
    role,
    changedAt: new Date()
  });
  
  // Save the changes
  await this.save();
  return this;
};

const PaymentSettings = mongoose.model('PaymentSettings', paymentSettingsSchema);

export default PaymentSettings; 