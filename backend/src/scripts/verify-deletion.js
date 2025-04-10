import mongoose from 'mongoose';
import User from '../models/user.model.js';
import DeletedAccount from '../models/deletedAccount.model.js';
import Onboarding from '../models/onboarding.model.js';
import Application from '../models/application.model.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the directory path of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env
dotenv.config({ path: join(__dirname, '../../.env') });

// Helper function to calculate profile completion
const calculateProfileCompletion = (user, onboarding) => {
  let completedFields = 0;
  let totalFields = 0;

  // Check user fields
  if (user.name) completedFields++;
  totalFields++;
  if (user.email) completedFields++;
  totalFields++;
  if (user.phone) completedFields++;
  totalFields++;

  // Check onboarding fields if they exist
  if (onboarding) {
    if (onboarding.professionalInfo?.title) completedFields++;
    totalFields++;
    if (onboarding.professionalInfo?.bio) completedFields++;
    totalFields++;
    if (onboarding.professionalInfo?.skills?.length > 0) completedFields++;
    totalFields++;
    if (onboarding.professionalInfo?.experience?.length > 0) completedFields++;
    totalFields++;
    if (onboarding.professionalInfo?.education?.length > 0) completedFields++;
    totalFields++;
  }

  return Math.round((completedFields / totalFields) * 100);
};

const verifyDeletion = async () => {
  try {
    console.log('=== STARTING DELETION VERIFICATION ===\n');

    // 1. Connect to MongoDB
    console.log('1. Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // 2. Create a test user
    console.log('\n2. Creating test user...');
    const testUser = await User.create({
      name: 'Test User',
      email: 'test-deletion@example.com',
      password: 'Test123!',
      role: 'user'
    });
    console.log('✅ Created test user:', testUser._id);

    // 3. Delete the test user with proper deletion process
    console.log('\n3. Deleting test user...');
    const deletionReason = 'Technical issues';
    const customReason = 'Testing account deletion';

    // Get onboarding data if it exists
    const onboarding = await Onboarding.findOne({ user: testUser._id });

    // Calculate account metrics
    const jobApplications = await Application.countDocuments({ applicant: testUser._id });
    const savedJobs = testUser.savedJobs ? testUser.savedJobs.length : 0;
    const profileCompletion = calculateProfileCompletion(testUser, onboarding);
    const daysActive = Math.ceil((Date.now() - testUser.createdAt) / (1000 * 60 * 60 * 24));

    // Store deleted account data
    const deletedAccount = await DeletedAccount.create({
      originalId: testUser._id,
      email: testUser.email,
      name: testUser.name,
      deletionReason,
      customReason,
      accountData: {
        user: testUser.toObject(),
        onboarding: onboarding ? onboarding.toObject() : null
      },
      accountMetrics: {
        jobApplicationsCount: jobApplications,
        savedJobsCount: savedJobs,
        profileCompletionPercentage: profileCompletion,
        daysActive
      }
    });
    console.log('✅ Created DeletedAccount record');

    // Delete the user account
    await User.findByIdAndDelete(testUser._id);

    // If onboarding data exists, delete it
    if (onboarding) {
      await Onboarding.findByIdAndDelete(onboarding._id);
    }

    // Delete all applications by this user
    await Application.deleteMany({ applicant: testUser._id });
    console.log('✅ Deleted user and related data');

    // 4. Check DeletedAccount collection
    console.log('\n4. Checking DeletedAccount collection...');
    const foundDeletedAccount = await DeletedAccount.findOne({ email: 'test-deletion@example.com' });
    
    if (foundDeletedAccount) {
      console.log('✅ Found deleted account in DeletedAccount collection:');
      console.log({
        id: foundDeletedAccount._id,
        originalId: foundDeletedAccount.originalId,
        email: foundDeletedAccount.email,
        name: foundDeletedAccount.name,
        deletionReason: foundDeletedAccount.deletionReason,
        customReason: foundDeletedAccount.customReason,
        deletedAt: foundDeletedAccount.deletedAt,
        accountMetrics: foundDeletedAccount.accountMetrics
      });
    } else {
      console.log('❌ Deleted account not found in DeletedAccount collection');
    }

    // 5. Verify the data persists
    console.log('\n5. Verifying data persistence...');
    const allDeletedAccounts = await DeletedAccount.find();
    console.log(`Total deleted accounts in collection: ${allDeletedAccounts.length}`);
    
    if (allDeletedAccounts.length > 0) {
      console.log('\nAll deleted accounts:');
      allDeletedAccounts.forEach(account => {
        console.log({
          id: account._id,
          email: account.email,
          name: account.name,
          deletionReason: account.deletionReason,
          deletedAt: account.deletedAt
        });
      });
    }

    console.log('\n=== DELETION VERIFICATION COMPLETED ===');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Verification failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

// Run the verification
verifyDeletion(); 