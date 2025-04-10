import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the directory path of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env
dotenv.config({ path: join(__dirname, '../../.env') });

const checkCollections = async () => {
  try {
    console.log('=== CHECKING MONGODB COLLECTIONS ===\n');

    // 1. Connect to MongoDB
    console.log('1. Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // 2. List all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\nCollections in database:');
    collections.forEach(collection => {
      console.log(`- ${collection.name}`);
    });

    // 3. Check DeletedAccounts collection specifically
    const deletedAccountsCount = await mongoose.connection.db.collection('deletedaccounts').countDocuments();
    console.log(`\nDeletedAccounts collection count: ${deletedAccountsCount}`);

    if (deletedAccountsCount > 0) {
      const deletedAccounts = await mongoose.connection.db.collection('deletedaccounts').find().toArray();
      console.log('\nDeleted Accounts:');
      deletedAccounts.forEach(account => {
        console.log({
          id: account._id,
          email: account.email,
          name: account.name,
          deletionReason: account.deletionReason,
          deletedAt: account.deletedAt
        });
      });
    }

    console.log('\n=== CHECK COMPLETED ===');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Check failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

// Run the check
checkCollections(); 