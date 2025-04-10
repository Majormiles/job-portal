const mongoose = require('mongoose');
const Onboarding = require('../models/onboarding.model');
const User = require('../models/user.model');
const path = require('path');

// Configure absolute path to .env file
const envPath = path.resolve(__dirname, '../../.env');
require('dotenv').config({ path: envPath });

const convertToBoolean = (value) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    if (value.toLowerCase() === 'true') return true;
    if (value === '22332') return true; // Special case for existing data
    return false;
  }
  return false;
};

const getDefaultExperience = () => ({
  currentRole: 'Not specified',
  yearsOfExperience: 0,
  company: 'Not specified',
  desiredRole: 'Not specified',
  industry: 'Not specified'
});

const getDefaultWorkPreferences = () => ({
  workArrangement: 'Not specified',
  workSchedule: 'Not specified',
  workCulture: 'Not specified'
});

const getDefaultJobPreferences = () => ({
  desiredRole: 'Not specified',
  desiredSalary: 'Not specified',
  desiredLocation: 'Not specified',
  jobType: 'Not specified'
});

const getDefaultEducation = () => ({
  degree: 'Not specified',
  institution: 'Not specified',
  graduationYear: 0,
  field: 'Not specified'
});

const fixOnboardingData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('\n=== Starting Onboarding Data Fix ===\n');

    // Get all onboarding documents
    const onboardingDocs = await Onboarding.find().populate('user');
    console.log(`Found ${onboardingDocs.length} onboarding documents to process\n`);

    let fixedCount = 0;
    let errorCount = 0;

    // Process each onboarding document
    for (const doc of onboardingDocs) {
      try {
        console.log(`\nProcessing onboarding document for user: ${doc.user?.name} (${doc.user?._id})`);
        
        // Skip documents with no associated user
        if (!doc.user) {
          console.log('- Skipping: No associated user');
          await Onboarding.findByIdAndDelete(doc._id);
          console.log('- Deleted orphaned onboarding document');
          continue;
        }

        // Create update object with proper data structure
        const updateObj = {
          $set: {
            user: doc.user._id,
            personalInfo: {
              completed: convertToBoolean(doc.personalInfo?.completed),
              data: {
                phone: doc.personalInfo?.data?.phone || '',
                address: {
                  street: doc.personalInfo?.data?.address?.street || '',
                  city: doc.personalInfo?.data?.address?.city || '',
                  state: doc.personalInfo?.data?.address?.state || '',
                  zipCode: doc.personalInfo?.data?.address?.zipCode || '',
                  country: doc.personalInfo?.data?.address?.country || ''
                },
                profilePicture: doc.personalInfo?.data?.profilePicture || null
              }
            },
            professionalInfo: {
              completed: convertToBoolean(doc.professionalInfo?.completed),
              data: {
                experience: {
                  ...getDefaultExperience(),
                  ...(doc.professionalInfo?.data?.experience || {}),
                  currentRole: doc.professionalInfo?.data?.experience?.currentRole || 
                             doc.professionalInfo?.data?.currentRole || 
                             'Not specified',
                  yearsOfExperience: doc.professionalInfo?.data?.experience?.yearsOfExperience || 
                                   doc.professionalInfo?.data?.yearsOfExperience || 
                                   0,
                  company: doc.professionalInfo?.data?.experience?.company || 
                         doc.professionalInfo?.data?.currentCompany || 
                         'Not specified'
                },
                education: {
                  ...getDefaultEducation(),
                  ...(doc.professionalInfo?.data?.education || {})
                },
                resume: doc.professionalInfo?.data?.resume || null
              }
            },
            skills: {
              completed: convertToBoolean(doc.skills?.completed),
              data: {
                technical: Array.isArray(doc.skills?.data?.technical) ? doc.skills.data.technical : [],
                soft: Array.isArray(doc.skills?.data?.soft) ? doc.skills.data.soft : [],
                languages: Array.isArray(doc.skills?.data?.languages) ? doc.skills.data.languages : [],
                certifications: Array.isArray(doc.skills?.data?.certifications) ? doc.skills.data.certifications : []
              }
            },
            preferences: {
              completed: convertToBoolean(doc.preferences?.completed),
              data: {
                workPreferences: {
                  ...getDefaultWorkPreferences(),
                  ...(doc.preferences?.data?.workPreferences || {})
                },
                jobPreferences: {
                  ...getDefaultJobPreferences(),
                  ...(doc.preferences?.data?.jobPreferences || {})
                },
                industryPreferences: Array.isArray(doc.preferences?.data?.industryPreferences) ? 
                  doc.preferences.data.industryPreferences : ['Not specified'],
                workCulture: Array.isArray(doc.preferences?.data?.workCulture) ? 
                  doc.preferences.data.workCulture : [],
                benefits: Array.isArray(doc.preferences?.data?.benefits) ? 
                  doc.preferences.data.benefits : [],
                availability: doc.preferences?.data?.availability || {}
              }
            }
          }
        };

        // Set completion status based on data presence
        updateObj.$set.personalInfo.completed = !!(
          updateObj.$set.personalInfo.data.phone &&
          updateObj.$set.personalInfo.data.address.street &&
          updateObj.$set.personalInfo.data.address.city &&
          updateObj.$set.personalInfo.data.address.state &&
          updateObj.$set.personalInfo.data.address.zipCode
        );

        updateObj.$set.professionalInfo.completed = !!(
          updateObj.$set.professionalInfo.data.experience.currentRole !== 'Not specified' &&
          updateObj.$set.professionalInfo.data.experience.yearsOfExperience > 0 &&
          updateObj.$set.professionalInfo.data.experience.company !== 'Not specified'
        );

        updateObj.$set.skills.completed = !!(
          updateObj.$set.skills.data.technical.length ||
          updateObj.$set.skills.data.soft.length ||
          updateObj.$set.skills.data.languages.length ||
          updateObj.$set.skills.data.certifications.length
        );

        updateObj.$set.preferences.completed = !!(
          updateObj.$set.preferences.data.workPreferences.workArrangement !== 'Not specified' &&
          updateObj.$set.preferences.data.industryPreferences.length &&
          updateObj.$set.preferences.data.industryPreferences[0] !== 'Not specified'
        );

        updateObj.$set.isComplete = 
          updateObj.$set.personalInfo.completed &&
          updateObj.$set.professionalInfo.completed &&
          updateObj.$set.skills.completed &&
          updateObj.$set.preferences.completed;

        // Log current completion status
        console.log('- personalInfo completion status:', updateObj.$set.personalInfo.completed);
        console.log('- professionalInfo completion status:', updateObj.$set.professionalInfo.completed);
        console.log('- skills completion status:', updateObj.$set.skills.completed);
        console.log('- preferences completion status:', updateObj.$set.preferences.completed);
        console.log('- overall completion status:', updateObj.$set.isComplete);

        // Update the document
        const updatedDoc = await Onboarding.findByIdAndUpdate(
          doc._id,
          updateObj,
          {
            new: true,
            runValidators: true
          }
        );

        // Update user's onboarding status
        await User.findByIdAndUpdate(
          doc.user._id,
          {
            $set: {
              onboardingStatus: {
                isComplete: updatedDoc.isComplete,
                completedAt: updatedDoc.isComplete ? new Date() : null
              }
            }
          }
        );

        fixedCount++;
      } catch (err) {
        console.warn(`Error processing document ${doc._id}:`, err);
        errorCount++;
      }
    }

    console.log('\n=== Fix Summary ===');
    console.log(`Total documents processed: ${onboardingDocs.length}`);
    console.log(`Documents fixed: ${fixedCount}`);
    console.log(`Errors encountered: ${errorCount}`);
    console.log('\nFix process complete\n');

  } catch (err) {
    console.error('Error during fix process:', err);
  } finally {
    mongoose.disconnect();
  }
};

// Run the fix script
fixOnboardingData().then(() => {
  console.log('\nFix process complete');
}).catch(error => {
  console.error('Fix process failed:', error);
}); 