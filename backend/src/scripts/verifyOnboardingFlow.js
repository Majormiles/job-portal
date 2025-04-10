const mongoose = require('mongoose');
const Onboarding = require('../models/onboarding.model');
const User = require('../models/user.model');
const path = require('path');

// Configure absolute path to .env file
const envPath = path.resolve(__dirname, '../../.env');
require('dotenv').config({ path: envPath });

// Debug logging
console.log('Environment variables loaded from:', envPath);
console.log('MONGODB_URI:', process.env.MONGODB_URI);

const verifyOnboardingFlow = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('\n=== Starting Onboarding Flow Verification ===\n');

    // Get all onboarding documents
    const onboardingDocs = await Onboarding.find().populate('user');
    console.log(`Found ${onboardingDocs.length} onboarding documents\n`);

    const dataStructureIssues = [];
    const inconsistencies = [];

    // Process each onboarding document
    for (const doc of onboardingDocs) {
      console.log(`\nChecking onboarding document for user: ${doc.user?.name} (${doc.user?._id})\n`);
      console.log('Section Status:\n');

      // Check personalInfo section
      console.log('personalInfo:');
      console.log('- Completed:', doc.personalInfo?.completed);
      console.log('- Has Data:', !!doc.personalInfo?.data);
      console.log('- Data Structure:', JSON.stringify(doc.personalInfo?.data, null, 2));

      if (!doc.personalInfo?.data?.phone) {
        dataStructureIssues.push({
          userId: doc.user?._id,
          section: 'personalInfo',
          issues: ['Missing phone field']
        });
        inconsistencies.push({
          type: 'Missing Required Fields',
          userId: doc.user?._id,
          section: 'personalInfo',
          fields: ['phone']
        });
      }

      // Check professionalInfo section
      console.log('\nprofessionalInfo:');
      console.log('- Completed:', doc.professionalInfo?.completed);
      console.log('- Has Data:', !!doc.professionalInfo?.data);
      console.log('- Data Structure:', JSON.stringify(doc.professionalInfo?.data, null, 2));

      const experience = doc.professionalInfo?.data?.experience || {};
      if (!experience.currentRole || experience.currentRole === 'Not specified' ||
          !experience.yearsOfExperience || experience.yearsOfExperience === 0 ||
          !experience.company || experience.company === 'Not specified') {
        dataStructureIssues.push({
          userId: doc.user?._id,
          section: 'professionalInfo',
          issues: ['Incomplete experience data']
        });
        inconsistencies.push({
          type: 'Missing Required Fields',
          userId: doc.user?._id,
          section: 'professionalInfo',
          fields: [
            !experience.currentRole || experience.currentRole === 'Not specified' ? 'currentRole' : null,
            !experience.yearsOfExperience || experience.yearsOfExperience === 0 ? 'yearsOfExperience' : null,
            !experience.company || experience.company === 'Not specified' ? 'company' : null
          ].filter(Boolean)
        });
      }

      // Check skills section
      console.log('\nskills:');
      console.log('- Completed:', doc.skills?.completed);
      console.log('- Has Data:', !!doc.skills?.data);
      console.log('- Data Structure:', JSON.stringify(doc.skills?.data, null, 2));

      const skills = doc.skills?.data || {};
      if (!skills.technical?.length && !skills.soft?.length && 
          !skills.languages?.length && !skills.certifications?.length) {
        dataStructureIssues.push({
          userId: doc.user?._id,
          section: 'skills',
          issues: ['No skills added']
        });
        inconsistencies.push({
          type: 'Missing Required Fields',
          userId: doc.user?._id,
          section: 'skills',
          fields: ['at least one skill type']
        });
      }

      // Check preferences section
      console.log('\npreferences:');
      console.log('- Completed:', doc.preferences?.completed);
      console.log('- Has Data:', !!doc.preferences?.data);
      console.log('- Data Structure:', JSON.stringify(doc.preferences?.data, null, 2));

      const workPrefs = doc.preferences?.data?.workPreferences || {};
      const industryPrefs = doc.preferences?.data?.industryPreferences || [];
      if (!workPrefs.workArrangement || workPrefs.workArrangement === 'Not specified' ||
          !industryPrefs.length || industryPrefs[0] === 'Not specified') {
        dataStructureIssues.push({
          userId: doc.user?._id,
          section: 'preferences',
          issues: ['Incomplete preferences data']
        });
        inconsistencies.push({
          type: 'Missing Required Fields',
          userId: doc.user?._id,
          section: 'preferences',
          fields: [
            !workPrefs.workArrangement || workPrefs.workArrangement === 'Not specified' ? 'workArrangement' : null,
            !industryPrefs.length || industryPrefs[0] === 'Not specified' ? 'industryPreferences' : null
          ].filter(Boolean)
        });
      }

      // Check user onboarding status
      const user = await User.findById(doc.user?._id);
      if (user && user.onboardingStatus?.isComplete !== doc.isComplete) {
        inconsistencies.push({
          type: 'User Status Mismatch',
          userId: doc.user?._id,
          details: `User onboarding status (${user.onboardingStatus?.isComplete}) doesn't match onboarding document (${doc.isComplete})`
        });
      }
    }

    console.log('\n=== Verification Results ===\n');

    if (dataStructureIssues.length > 0) {
      console.log('\nData Structure Issues:');
      console.log(JSON.stringify(dataStructureIssues, null, 2));
    }

    if (inconsistencies.length > 0) {
      console.log('\nInconsistencies Found:');
      console.log(JSON.stringify(inconsistencies, null, 2));
    }

    console.log('\nVerification complete\n');

  } catch (err) {
    console.error('Error during verification:', err);
  } finally {
    mongoose.disconnect();
  }
};

// Run the verification script
verifyOnboardingFlow(); 