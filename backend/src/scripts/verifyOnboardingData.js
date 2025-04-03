const mongoose = require('mongoose');
const Onboarding = require('../models/onboarding.model');
const User = require('../models/user.model');
require('dotenv').config();

async function verifyOnboardingData() {
  try {
    console.log('Connected to MongoDB\n');

    // Find all onboarding documents and populate user data
    const onboardingDocs = await Onboarding.find().populate('user');
    console.log(`Found ${onboardingDocs.length} onboarding documents\n`);

    for (const doc of onboardingDocs) {
      const user = doc.user;
      console.log(`\nVerifying onboarding data for user: ${user.name} (${user._id})`);
      console.log('----------------------------------------\n');

      // Personal Info verification
      console.log('Personal Info:');
      console.log('-------------');
      console.log(`Completed: ${doc.personalInfo.completed}`);
      console.log(`Phone: ${doc.personalInfo.data?.phone}`);
      console.log(`Address: ${JSON.stringify(doc.personalInfo.data?.address, null, 2)}`);
      console.log(`Profile Picture: ${doc.personalInfo.data?.profilePicture}`);
      console.log(`Phone number valid: ${doc.personalInfo.data?.phone?.startsWith('0')}`);
      console.log(`Address complete: ${doc.personalInfo.data?.address?.zipCode}\n`);

      // Professional Info verification
      console.log('Professional Info:');
      console.log('-----------------');
      console.log(`Completed: ${doc.professionalInfo.completed}`);
      console.log(`Experience: ${JSON.stringify(doc.professionalInfo.data?.experience, null, 2)}`);
      console.log(`Education: ${JSON.stringify(doc.professionalInfo.data?.education, null, 2)}`);
      console.log(`Resume: ${doc.professionalInfo.data?.resume}`);
      console.log(`Experience data complete: ${doc.professionalInfo.data?.experience?.company}\n`);

      // Skills verification
      console.log('Skills:');
      console.log('-------');
      console.log(`Completed: ${doc.skills.completed}`);
      console.log(`Technical: ${doc.skills.data?.technical?.length || 0} skills`);
      console.log(`Soft: ${doc.skills.data?.soft?.length || 0} skills`);
      console.log(`Languages: ${doc.skills.data?.languages?.length || 0} languages`);
      console.log(`Certifications: ${doc.skills.data?.certifications?.length || 0} certifications`);
      console.log(`Has at least one skill: ${Boolean(
        (doc.skills.data?.technical?.length || 0) + 
        (doc.skills.data?.soft?.length || 0) + 
        (doc.skills.data?.languages?.length || 0) + 
        (doc.skills.data?.certifications?.length || 0) > 0
      )}\n`);

      // Preferences verification
      console.log('Preferences:');
      console.log('------------');
      console.log(`Completed: ${doc.preferences.completed}`);
      console.log(`Work Preferences: ${JSON.stringify(doc.preferences.data?.workPreferences, null, 2)}`);
      console.log(`Job Preferences: ${JSON.stringify(doc.preferences.data?.jobPreferences, null, 2)}`);
      console.log(`Industry Preferences: ${doc.preferences.data?.industryPreferences?.length || 0} preferences`);
      console.log(`Preferences data complete: ${Boolean(
        doc.preferences.data?.workPreferences?.workArrangement !== 'Not specified' &&
        doc.preferences.data?.jobPreferences?.jobType !== 'Not specified'
      )}\n`);

      // Overall Status
      console.log('Overall Status:');
      console.log('--------------');
      console.log(`Is Complete: ${doc.isComplete}`);
      console.log(`Completed At: ${doc.completedAt}`);
      console.log(`Last Updated: ${doc.updatedAt}\n`);

      // User Status
      console.log('User Status:');
      console.log('------------');
      console.log(`User Onboarding Complete: ${user.onboardingComplete}`);
      console.log(`User Onboarding Completed At: ${user.onboardingCompletedAt}\n`);

      // Final Verification
      console.log('Final Verification:');
      console.log('-----------------');
      const allSectionsComplete = 
        doc.personalInfo.completed && 
        doc.professionalInfo.completed && 
        doc.skills.completed && 
        doc.preferences.completed;
      
      console.log(`All sections marked complete: ${allSectionsComplete}`);
      console.log(`Document marked complete: ${doc.isComplete}`);
      console.log(`User status matches document: ${user.onboardingComplete === doc.isComplete}\n`);

      // Report issues
      const issues = [];
      if (!allSectionsComplete) issues.push('Not all sections are marked as complete');
      if (!doc.isComplete) issues.push('Document is not marked as complete');
      if (user.onboardingComplete !== doc.isComplete) issues.push('User status does not match document status');

      if (issues.length > 0) {
        console.log('⚠️ ISSUES DETECTED:');
        issues.forEach(issue => console.log(`- ${issue}`));
        console.log('');
      }
    }

    console.log('Verification complete\n');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB\n');
  }
}

// Connect to MongoDB and run verification
mongoose.connect(process.env.MONGODB_URI)
  .then(verifyOnboardingData)
  .catch(error => {
    console.error('Connection error:', error);
    process.exit(1);
  }); 