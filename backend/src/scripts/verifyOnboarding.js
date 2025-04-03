const mongoose = require('mongoose');
const Onboarding = require('../models/onboarding.model');
const User = require('../models/user.model');
require('dotenv').config();

const verifyOnboarding = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all onboarding documents
    const onboardingDocs = await Onboarding.find({});
    console.log(`Found ${onboardingDocs.length} onboarding documents`);

    // Check each document
    for (const doc of onboardingDocs) {
      console.log('\n=== Onboarding Document ===');
      console.log('User ID:', doc.user);
      console.log('Is Complete:', doc.isComplete);
      console.log('Completed At:', doc.completedAt);
      
      // Check each section
      console.log('\nSection Status:');
      console.log('Personal Info:', {
        completed: doc.personalInfo?.completed,
        data: doc.personalInfo?.data
      });
      console.log('Professional Info:', {
        completed: doc.professionalInfo?.completed,
        data: doc.professionalInfo?.data
      });
      console.log('Skills:', {
        completed: doc.skills?.completed,
        data: doc.skills?.data
      });
      console.log('Preferences:', {
        completed: doc.preferences?.completed,
        data: doc.preferences?.data
      });

      // Check corresponding user document
      const user = await User.findById(doc.user);
      console.log('\nUser Document:');
      console.log('User ID:', user?._id);
      console.log('Onboarding Status:', user?.onboardingStatus);
      
      // Verify consistency
      const isConsistent = doc.isComplete === user?.onboardingStatus?.isComplete;
      console.log('\nConsistency Check:', isConsistent ? 'OK' : 'MISMATCH');
      
      if (!isConsistent) {
        console.log('Fixing inconsistency...');
        if (doc.isComplete) {
          // Update user status
          await User.findByIdAndUpdate(doc.user, {
            'onboardingStatus.isComplete': true,
            'onboardingStatus.completedAt': doc.completedAt
          });
          console.log('Updated user status to complete');
        } else {
          // Update onboarding status
          await Onboarding.findByIdAndUpdate(doc._id, {
            isComplete: true,
            completedAt: user?.onboardingStatus?.completedAt
          });
          console.log('Updated onboarding status to complete');
        }
      }
    }

    console.log('\nVerification complete');
    process.exit(0);
  } catch (error) {
    console.error('Error during verification:', error);
    process.exit(1);
  }
};

verifyOnboarding(); 