const mongoose = require('mongoose');
const Onboarding = require('../models/onboarding.model');
const User = require('../models/user.model');
require('dotenv').config();

const isValidGhanaPhone = (phone) => {
  if (!phone) return false;
  const phoneStr = String(phone).replace(/\s+/g, ''); // Remove any spaces
  return /^0[2-9][0-9]{8}$/.test(phoneStr);
};

const validateAddress = (address) => {
  if (!address) return false;
  const requiredFields = ['street', 'city', 'state', 'zipCode'];
  return requiredFields.every(field => 
    address[field] && address[field].trim()
  );
};

const fixOnboardingValidation = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all onboarding documents
    const onboardingDocs = await Onboarding.find({});
    console.log(`Found ${onboardingDocs.length} onboarding documents to process`);

    let fixedCount = 0;
    let errorCount = 0;

    for (const doc of onboardingDocs) {
      try {
        console.log(`\nProcessing onboarding document for user: ${doc.user}`);
        
        // Start a session for transaction
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
          // Validate and fix personal info
          if (doc.personalInfo) {
            const personalData = doc.personalInfo.data || {};
            const validationIssues = [];

            // Validate phone number
            if (!personalData.phone || !isValidGhanaPhone(personalData.phone)) {
              validationIssues.push('Invalid phone number');
            }

            // Validate address
            if (!validateAddress(personalData.address)) {
              validationIssues.push('Invalid address');
            }

            // Update personal info completion status
            doc.personalInfo.completed = validationIssues.length === 0;
            console.log(`Personal info validation: ${doc.personalInfo.completed ? 'Valid' : 'Invalid'}`);
          }

          // Validate and fix professional info
          if (doc.professionalInfo) {
            const profData = doc.professionalInfo.data || {};
            const validationIssues = [];

            // Check required fields
            if (!profData.experience?.currentRole || 
                !profData.experience?.yearsOfExperience || 
                !profData.experience?.company) {
              validationIssues.push('Missing required professional info');
            }

            // Update professional info completion status
            doc.professionalInfo.completed = validationIssues.length === 0;
            console.log(`Professional info validation: ${doc.professionalInfo.completed ? 'Valid' : 'Invalid'}`);
          }

          // Validate and fix skills
          if (doc.skills) {
            const skillsData = doc.skills.data || {};
            doc.skills.completed = !!(skillsData.technical?.length || 
                                    skillsData.soft?.length || 
                                    skillsData.languages?.length || 
                                    skillsData.certifications?.length);
            console.log(`Skills validation: ${doc.skills.completed ? 'Valid' : 'Invalid'}`);
          }

          // Validate and fix preferences
          if (doc.preferences) {
            const prefsData = doc.preferences.data || {};
            doc.preferences.completed = !!(prefsData.workPreferences?.workArrangement && 
                                         prefsData.industryPreferences?.length);
            console.log(`Preferences validation: ${doc.preferences.completed ? 'Valid' : 'Invalid'}`);
          }

          // Update overall completion status
          const allSectionsComplete = 
            doc.personalInfo?.completed && 
            doc.professionalInfo?.completed && 
            doc.skills?.completed && 
            doc.preferences?.completed;

          doc.isComplete = allSectionsComplete;
          if (allSectionsComplete && !doc.completedAt) {
            doc.completedAt = new Date();
          }

          console.log(`Overall completion status: ${doc.isComplete ? 'Complete' : 'Incomplete'}`);

          // Save the updated document
          await doc.save({ session });

          // Update user's onboarding status
          const userUpdate = {
            'onboardingStatus.isComplete': doc.isComplete,
            'onboardingStatus.completedAt': doc.isComplete ? doc.completedAt : null,
            'onboardingStatus.updatedAt': new Date(),
            'onboardingStatus.personalInfo': doc.personalInfo?.completed || false,
            'onboardingStatus.professionalInfo': doc.professionalInfo?.completed || false,
            'onboardingStatus.skills': doc.skills?.completed || false,
            'onboardingStatus.preferences': doc.preferences?.completed || false
          };

          await User.findByIdAndUpdate(doc.user, userUpdate, { session });
          console.log('Updated user status');

          await session.commitTransaction();
          fixedCount++;
          console.log('Document processed successfully');
        } catch (error) {
          await session.abortTransaction();
          throw error;
        } finally {
          session.endSession();
        }
      } catch (error) {
        console.error(`Error processing document ${doc._id}:`, error);
        errorCount++;
      }
    }

    console.log('\n=== Fix Summary ===');
    console.log(`Total documents processed: ${onboardingDocs.length}`);
    console.log(`Documents fixed: ${fixedCount}`);
    console.log(`Errors encountered: ${errorCount}`);

  } catch (error) {
    console.error('Error during fix process:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the fix script
fixOnboardingValidation().then(() => {
  console.log('\nFix process complete');
  process.exit(0);
}).catch(error => {
  console.error('Fix process failed:', error);
  process.exit(1);
}); 