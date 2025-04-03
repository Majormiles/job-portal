const mongoose = require('mongoose');
const Onboarding = require('../models/onboarding.model');
const User = require('../models/user.model');
require('dotenv').config();

const fixOnboardingRedirect = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all users
    const users = await User.find({});
    console.log(`Found ${users.length} users to process`);

    let fixedCount = 0;
    let errorCount = 0;

    for (const user of users) {
      try {
        console.log(`\nProcessing user: ${user.name} (${user._id})`);
        
        // Find the user's onboarding document
        const onboarding = await Onboarding.findOne({ user: user._id });
        
        if (!onboarding) {
          console.log('- No onboarding document found, skipping');
          continue;
        }

        // Check if all sections are complete
        const requiredSections = ['personalInfo', 'professionalInfo', 'skills', 'preferences'];
        const allSectionsComplete = requiredSections.every(section => 
          onboarding[section]?.completed && onboarding[section]?.data
        );

        console.log('- Current status:');
        console.log(`  Onboarding document complete: ${onboarding.isComplete}`);
        console.log(`  All sections complete: ${allSectionsComplete}`);
        console.log(`  User onboarding status: ${user.onboardingStatus?.isComplete}`);

        // Start a session for transaction
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
          // Update onboarding document if needed
          if (allSectionsComplete && !onboarding.isComplete) {
            console.log('- Updating onboarding document status');
            onboarding.isComplete = true;
            onboarding.completedAt = new Date();
            await onboarding.save({ session });
          }

          // Update user's onboarding status
          const userUpdate = {
            'onboardingStatus.isComplete': onboarding.isComplete,
            'onboardingStatus.completedAt': onboarding.isComplete ? onboarding.completedAt : null,
            'onboardingStatus.updatedAt': new Date()
          };

          // Add individual section statuses
          requiredSections.forEach(section => {
            userUpdate[`onboardingStatus.${section}`] = onboarding[section]?.completed || false;
          });

          console.log('- Updating user status:', userUpdate);
          await User.findByIdAndUpdate(user._id, userUpdate, { session });

          await session.commitTransaction();
          fixedCount++;
          console.log('- Status updated successfully');
        } catch (error) {
          await session.abortTransaction();
          throw error;
        } finally {
          session.endSession();
        }
      } catch (error) {
        console.error(`Error processing user ${user._id}:`, error);
        errorCount++;
      }
    }

    console.log('\n=== Fix Summary ===');
    console.log(`Total users processed: ${users.length}`);
    console.log(`Users fixed: ${fixedCount}`);
    console.log(`Errors encountered: ${errorCount}`);

  } catch (error) {
    console.error('Error during fix process:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the fix script
fixOnboardingRedirect().then(() => {
  console.log('\nFix process complete');
  process.exit(0);
}).catch(error => {
  console.error('Fix process failed:', error);
  process.exit(1);
}); 