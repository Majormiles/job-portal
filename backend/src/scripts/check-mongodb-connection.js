import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the directory path of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env
dotenv.config({ path: join(__dirname, '../../.env') });

const checkMongoDBConnection = async () => {
  try {
    console.log('=== CHECKING MONGODB CONNECTION ===\n');

    // 1. Connect to MongoDB
    console.log('1. Connecting to MongoDB...');
    console.log('MongoDB URI:', process.env.MONGODB_URI);
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // 2. Get database info
    console.log('\n2. Database Information:');
    const db = mongoose.connection.db;
    const dbStats = await db.stats();
    console.log('Database name:', db.databaseName);
    console.log('Database size:', (dbStats.dataSize / 1024 / 1024).toFixed(2), 'MB');
    console.log('Collections:', dbStats.collections);
    console.log('Indexes:', dbStats.indexes);

    // 3. List all collections
    console.log('\n3. Collections in database:');
    const collections = await db.listCollections().toArray();
    collections.forEach(collection => {
      console.log(`- ${collection.name}`);
    });

    // 4. Check DeletedAccounts collection
    console.log('\n4. Checking DeletedAccounts collection:');
    const deletedAccountsCount = await db.collection('deletedaccounts').countDocuments();
    console.log('DeletedAccounts count:', deletedAccountsCount);
    
    if (deletedAccountsCount > 0) {
      const deletedAccounts = await db.collection('deletedaccounts').find().toArray();
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

    // 5. Check indexes on DeletedAccounts collection
    console.log('\n5. Indexes on DeletedAccounts collection:');
    const indexes = await db.collection('deletedaccounts').indexes();
    console.log(JSON.stringify(indexes, null, 2));

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
checkMongoDBConnection(); 