const mongoose = require('mongoose');
const Onboarding = require('../models/onboarding.model');
const User = require('../models/user.model');
require('dotenv').config();

const verifyCompletePage = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all onboarding documents
    const onboardingDocs = await Onboarding.find();
    console.log(`Found ${onboardingDocs.length} onboarding documents`);

    // Check each document
    for (const doc of onboardingDocs) {
      console.log('\n=== Checking Onboarding Document ===');
      console.log('User ID:', doc.user);
      console.log('Is Complete:', doc.isComplete);
      console.log('Completed At:', doc.completedAt);

      // Check each section
      const sections = ['personalInfo', 'professionalInfo', 'skills', 'preferences'];
      for (const section of sections) {
        console.log(`\n--- ${section} Section ---`);
        console.log('Completed:', doc[section]?.completed);
        console.log('Data:', JSON.stringify(doc[section]?.data, null, 2));
      }

      // Verify data structure matches frontend expectations
      const formattedData = {
        personalInfo: {
          phone: doc.personalInfo?.data?.phone || 'Not provided',
          address: doc.personalInfo?.data?.address ? 
            `${doc.personalInfo.data.address.street}, ${doc.personalInfo.data.address.city}, ${doc.personalInfo.data.address.state} ${doc.personalInfo.data.address.zipCode}` : 
            'Not provided',
          dateOfBirth: doc.personalInfo?.data?.dateOfBirth || 'Not provided'
        },
        professionalInfo: {
          currentTitle: doc.professionalInfo?.data?.experience?.currentRole || 'Not provided',
          yearsOfExperience: doc.professionalInfo?.data?.experience?.yearsOfExperience || 'Not provided',
          currentCompany: doc.professionalInfo?.data?.experience?.company || 'Not provided',
          desiredTitle: doc.professionalInfo?.data?.experience?.desiredRole || 'Not provided',
          education: {
            degree: doc.professionalInfo?.data?.education?.degree || 'Not provided',
            field: doc.professionalInfo?.data?.education?.field || 'Not provided',
            institution: doc.professionalInfo?.data?.education?.institution || 'Not provided',
            graduationYear: doc.professionalInfo?.data?.education?.graduationYear || 'Not provided'
          }
        },
        skills: {
          technicalSkills: doc.skills?.data?.technical || [],
          softSkills: doc.skills?.data?.soft || [],
          languages: doc.skills?.data?.languages || [],
          certifications: doc.skills?.data?.certifications || []
        },
        preferences: {
          workArrangement: doc.preferences?.data?.workPreferences?.workArrangement || 'Not specified',
          hours: doc.preferences?.data?.workPreferences?.workSchedule || 'Not specified',
          industryPreferences: doc.preferences?.data?.industryPreferences || [],
          companySize: doc.preferences?.data?.workPreferences?.workCulture || 'Not specified',
          jobPreferences: {
            desiredRole: doc.preferences?.data?.jobPreferences?.desiredRole || 'Not specified',
            desiredSalary: doc.preferences?.data?.jobPreferences?.desiredSalary || 'Not specified',
            desiredLocation: doc.preferences?.data?.jobPreferences?.desiredLocation || 'Not specified',
            jobType: doc.preferences?.data?.jobPreferences?.jobType || 'Not specified'
          }
        }
      };

      console.log('\n--- Formatted Data for Frontend ---');
      console.log(JSON.stringify(formattedData, null, 2));

      // Check if all required sections are complete
      const allSectionsComplete = sections.every(section => 
        doc[section]?.completed && doc[section]?.data
      );

      console.log('\nAll sections complete:', allSectionsComplete);
      console.log('================================\n');
    }

    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

verifyCompletePage(); 