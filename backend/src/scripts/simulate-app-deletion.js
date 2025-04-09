const mongoose = require('mongoose');
const User = require('../models/user.model');
const DeletedAccount = require('../models/deletedAccount.model');
const Onboarding = require('../models/onboarding.model');
const Application = require('../models/application.model');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');

// Load environment variables from .env
dotenv.config({ path: path.join(__dirname, '../../.env') });

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

const simulateAppDeletion = async () => {
  try {
    console.log('=== SIMULATING APPLICATION DELETION ===\n');

    // 1. Connect to MongoDB
    console.log('1. Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // 2. Create a test user
    console.log('\n2. Creating test user...');
    const hashedPassword = await bcrypt.hash('Test123!', 10);
    const testUser = await User.create({
      name: 'Test App Deletion User',
      email: 'test-app-deletion@example.com',
      password: hashedPassword,
      role: 'user'
    });
    console.log('✅ Created test user:', testUser._id);

    // 3. Create some test data for the user
    console.log('\n3. Creating test data...');
    
    // Create onboarding data
    const onboarding = await Onboarding.create({
      user: testUser._id,
      professionalInfo: {
        title: 'Software Developer',
        bio: 'Test bio',
        skills: ['JavaScript', 'React', 'Node.js'],
        experience: [
          {
            title: 'Junior Developer',
            company: 'Test Company',
            startDate: new Date('2020-01-01'),
            endDate: new Date('2021-01-01'),
            description: 'Test experience'
          }
        ],
        education: [
          {
            degree: 'Bachelor of Science',
            school: 'Test University',
            field: 'Computer Science',
            startDate: new Date('2015-09-01'),
            endDate: new Date('2019-05-01')
          }
        ]
      }
    });
    console.log('✅ Created onboarding data');

    // Create some applications
    await Application.create({
      applicant: testUser._id,
      job: new mongoose.Types.ObjectId(),
      status: 'applied',
      appliedAt: new Date()
    });
    console.log('✅ Created application data');

    // 4. Simulate the deletion process
    console.log('\n4. Simulating deletion process...');
    const deletionReason = 'Technical issues';
    const customReason = 'Testing application deletion';

    // Get onboarding data
    const userOnboarding = await Onboarding.findOne({ user: testUser._id });
    console.log('Found onboarding data:', !!userOnboarding);

    // Calculate account metrics
    const jobApplications = await Application.countDocuments({ applicant: testUser._id });
    const savedJobs = testUser.savedJobs ? testUser.savedJobs.length : 0;
    const profileCompletion = calculateProfileCompletion(testUser, userOnboarding);
    const daysActive = Math.ceil((Date.now() - testUser.createdAt) / (1000 * 60 * 60 * 24));
    
    console.log('Account metrics:', {
      jobApplications,
      savedJobs,
      profileCompletion,
      daysActive
    });

    // Store deleted account data
    console.log('Creating DeletedAccount record...');
    const deletedAccount = await DeletedAccount.create({
      originalId: testUser._id,
      email: testUser.email,
      name: testUser.name,
      deletionReason,
      customReason,
      accountData: {
        user: testUser.toObject(),
        onboarding: userOnboarding ? userOnboarding.toObject() : null
      },
      accountMetrics: {
        jobApplicationsCount: jobApplications,
        savedJobsCount: savedJobs,
        profileCompletionPercentage: profileCompletion,
        daysActive
      }
    });
    console.log('✅ Created DeletedAccount record:', deletedAccount._id);

    // Delete the user account
    console.log('Deleting user account...');
    await User.findByIdAndDelete(testUser._id);
    console.log('✅ Deleted user account');

    // Delete onboarding data
    if (userOnboarding) {
      console.log('Deleting onboarding data...');
      await Onboarding.findByIdAndDelete(userOnboarding._id);
      console.log('✅ Deleted onboarding data');
    }

    // Delete applications
    console.log('Deleting applications...');
    const deleteResult = await Application.deleteMany({ applicant: testUser._id });
    console.log('✅ Deleted applications:', deleteResult.deletedCount);

    // 5. Verify the deletion
    console.log('\n5. Verifying deletion...');
    
    // Check if user exists
    const userExists = await User.findById(testUser._id);
    console.log('User still exists:', !!userExists);
    
    // Check if onboarding exists
    const onboardingExists = await Onboarding.findOne({ user: testUser._id });
    console.log('Onboarding still exists:', !!onboardingExists);
    
    // Check if applications exist
    const applicationsExist = await Application.findOne({ applicant: testUser._id });
    console.log('Applications still exist:', !!applicationsExist);
    
    // Check if deleted account exists
    const deletedAccountExists = await DeletedAccount.findOne({ email: testUser.email });
    console.log('Deleted account exists:', !!deletedAccountExists);
    
    if (deletedAccountExists) {
      console.log('Deleted account details:', {
        id: deletedAccountExists._id,
        email: deletedAccountExists.email,
        name: deletedAccountExists.name,
        deletionReason: deletedAccountExists.deletionReason,
        deletedAt: deletedAccountExists.deletedAt
      });
    }

    // 6. Check all deleted accounts
    console.log('\n6. All deleted accounts:');
    const allDeletedAccounts = await DeletedAccount.find();
    console.log(`Total deleted accounts: ${allDeletedAccounts.length}`);
    
    if (allDeletedAccounts.length > 0) {
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

    console.log('\n=== SIMULATION COMPLETED ===');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Simulation failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

// Run the simulation
simulateAppDeletion(); 