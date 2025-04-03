import mongoose from 'mongoose';
import Onboarding from '../models/onboarding.model.js';
import User from '../models/user.model.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

const fixOnboardingNavigation = async () => {
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
          // Fix personal info section
          if (doc.personalInfo) {
            const personalData = doc.personalInfo.data || {};
            
            // Validate required fields
            const hasRequiredFields = 
              personalData.phone && 
              personalData.address?.street && 
              personalData.address?.city && 
              personalData.address?.state && 
              personalData.address?.zipCode;

            // Update the document using $set to ensure proper type casting
            await Onboarding.updateOne(
              { _id: doc._id },
              {
                $set: {
                  'personalInfo.completed': Boolean(hasRequiredFields),
                  'personalInfo.data': {
                    phone: personalData.phone || '',
                    address: {
                      street: personalData.address?.street || '',
                      city: personalData.address?.city || '',
                      state: personalData.address?.state || '',
                      zipCode: personalData.address?.zipCode || '',
                      country: personalData.address?.country || 'Ghana'
                    },
                    dateOfBirth: personalData.dateOfBirth || null,
                    profilePicture: personalData.profilePicture || null
                  }
                }
              },
              { session }
            );

            // Update user's onboarding status
            const user = await User.findById(doc.user);
            if (user) {
              await User.updateOne(
                { _id: doc.user },
                {
                  $set: {
                    'onboardingStatus.personalInfo': Boolean(hasRequiredFields),
                    'onboardingStatus.updatedAt': new Date()
                  }
                },
                { session }
              );
            }

            await session.commitTransaction();
            fixedCount++;
            console.log('Successfully fixed onboarding document');
          }
        } catch (error) {
          await session.abortTransaction();
          throw error;
        } finally {
          session.endSession();
        }
      } catch (error) {
        console.error('Error processing document:', error);
        errorCount++;
      }
    }

    console.log('\n=== FIX SUMMARY ===');
    console.log(`Total documents processed: ${onboardingDocs.length}`);
    console.log(`Successfully fixed: ${fixedCount}`);
    console.log(`Errors encountered: ${errorCount}`);

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Script error:', error);
    process.exit(1);
  }
};

// Run the script
fixOnboardingNavigation(); 