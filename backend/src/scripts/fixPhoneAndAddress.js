const mongoose = require('mongoose');
const Onboarding = require('../models/onboarding.model');
const User = require('../models/user.model');
require('dotenv').config();

const fixPhoneAndAddress = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all onboarding documents
    const onboardingDocs = await Onboarding.find({});
    console.log(`Found ${onboardingDocs.length} onboarding documents to process`);

    let fixedCount = 0;
    let errorCount = 0;

    for (const onboarding of onboardingDocs) {
      try {
        console.log(`\nProcessing user: ${onboarding.user}`);

        // Check if personalInfo exists and has data
        if (onboarding.personalInfo && onboarding.personalInfo.data) {
          const personalData = onboarding.personalInfo.data;
          let needsUpdate = false;

          // Fix phone number format
          if (personalData.phone) {
            // Remove any spaces and ensure it starts with 0
            const formattedPhone = personalData.phone.toString().replace(/\s+/g, '');
            if (!formattedPhone.startsWith('0')) {
              personalData.phone = '0' + formattedPhone;
              needsUpdate = true;
            }
          }

          // Fix address structure
          if (personalData.address) {
            // Ensure address is an object with required fields
            if (typeof personalData.address === 'string') {
              personalData.address = {
                street: personalData.address,
                city: 'Not specified',
                state: 'Not specified',
                zipCode: '00000'
              };
              needsUpdate = true;
            } else {
              // Ensure all required fields exist
              const requiredFields = ['street', 'city', 'state', 'zipCode'];
              const missingFields = requiredFields.filter(field => !personalData.address[field]);
              
              if (missingFields.length > 0) {
                missingFields.forEach(field => {
                  personalData.address[field] = 'Not specified';
                });
                needsUpdate = true;
              }
            }
          }

          // Update the document if changes were made
          if (needsUpdate) {
            console.log('Updating personal info data:', personalData);
            onboarding.personalInfo.data = personalData;
            onboarding.personalInfo.completed = true;
            await onboarding.save();
            fixedCount++;
            console.log('Successfully updated personal info');
          } else {
            console.log('No updates needed for personal info');
          }
        } else {
          console.log('No personal info data found');
        }

        // Update user's onboarding status
        const user = await User.findById(onboarding.user);
        if (user) {
          user.onboardingStatus = {
            ...user.onboardingStatus,
            personalInfo: true,
            updatedAt: new Date()
          };
          await user.save();
          console.log('Updated user onboarding status');
        }

      } catch (error) {
        console.error('Error processing document:', error);
        errorCount++;
      }
    }

    console.log('\nFix completed:');
    console.log(`Total documents processed: ${onboardingDocs.length}`);
    console.log(`Successfully fixed: ${fixedCount}`);
    console.log(`Errors encountered: ${errorCount}`);

  } catch (error) {
    console.error('Script error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the fix
fixPhoneAndAddress(); 