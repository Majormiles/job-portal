import mongoose from 'mongoose';
import DeletedAccount from '../models/deletedAccount.model.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the directory path of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env
dotenv.config({ path: join(__dirname, '../../.env') });

const testDeletedAccountModel = async () => {
  try {
    console.log('=== TESTING DELETED ACCOUNT MODEL ===\n');

    // 1. Connect to MongoDB
    console.log('1. Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // 2. Create a test deleted account
    console.log('\n2. Creating test deleted account...');
    const testDeletedAccount = await DeletedAccount.create({
      originalId: new mongoose.Types.ObjectId(),
      email: 'test-model@example.com',
      name: 'Test Model User',
      deletionReason: 'Technical issues',
      customReason: 'Testing model directly',
      accountData: {
        user: {
          name: 'Test Model User',
          email: 'test-model@example.com'
        }
      },
      accountMetrics: {
        jobApplicationsCount: 0,
        savedJobsCount: 0,
        profileCompletionPercentage: 50,
        daysActive: 1
      }
    });
    console.log('✅ Created test deleted account:', testDeletedAccount._id);

    // 3. Find the test deleted account
    console.log('\n3. Finding test deleted account...');
    const foundDeletedAccount = await DeletedAccount.findById(testDeletedAccount._id);
    if (foundDeletedAccount) {
      console.log('✅ Found test deleted account:', {
        id: foundDeletedAccount._id,
        email: foundDeletedAccount.email,
        name: foundDeletedAccount.name,
        deletionReason: foundDeletedAccount.deletionReason
      });
    } else {
      console.log('❌ Test deleted account not found');
    }

    // 4. Check all deleted accounts
    console.log('\n4. Checking all deleted accounts...');
    const allDeletedAccounts = await DeletedAccount.find();
    console.log(`Total deleted accounts: ${allDeletedAccounts.length}`);
    
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

    // 5. Clean up
    console.log('\n5. Cleaning up...');
    await DeletedAccount.deleteOne({ email: 'test-model@example.com' });
    console.log('✅ Cleaned up test data');

    console.log('\n=== TEST COMPLETED ===');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

// Run the test
testDeletedAccountModel(); 