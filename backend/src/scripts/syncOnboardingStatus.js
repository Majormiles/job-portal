import mongoose from 'mongoose';
import Onboarding from '../models/onboarding.model.js';
import User from '../models/user.model.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the directory path of the current file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file in the backend directory
const envPath = join(__dirname, '../../.env');
console.log('Loading .env file from:', envPath);
dotenv.config({ path: envPath });

async function syncOnboardingStatus() {
  try {
    console.log('Connected to MongoDB');

    // Find all onboarding documents and populate user data
    const onboardingDocs = await Onboarding.find().populate('user');
    console.log(`Found ${onboardingDocs.length} onboarding documents to sync\n`);

    for (const doc of onboardingDocs) {
      if (!doc.user) {
        console.log(`\nSkipping onboarding document ${doc._id} - No associated user found`);
        continue;
      }

      console.log(`\nProcessing user: ${doc.user.name} (${doc.user._id})`);
      console.log('----------------------------------------');

      // Check if all sections are complete
      const allSectionsComplete = 
        doc.personalInfo.completed && 
        doc.professionalInfo.completed && 
        doc.skills.completed && 
        doc.preferences.completed;

      console.log('Syncing user status with onboarding document...');
      console.log(`Current user status: ${doc.user.onboardingComplete}`);
      
      // Update user status
      doc.user.onboardingComplete = doc.isComplete;
      doc.user.onboardingCompletedAt = doc.isComplete ? doc.completedAt : null;
      await doc.user.save();
      
      console.log(`New status: ${doc.user.onboardingComplete}`);
      console.log('Updated user status successfully\n');

      console.log('Final Status:');
      console.log('-------------');
      console.log(`All sections complete: ${allSectionsComplete}`);
      console.log(`Document marked complete: ${doc.isComplete}`);
      console.log(`User status synced: ${doc.user.onboardingComplete === doc.isComplete}\n`);
    }

    console.log('Sync complete\n');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB\n');
  }
}

// Connect to MongoDB and run sync
console.log('Connecting to MongoDB:', process.env.MONGODB_URI);
mongoose.connect(process.env.MONGODB_URI)
  .then(syncOnboardingStatus)
  .catch(error => {
    console.error('Connection error:', error);
    process.exit(1);
  }); 