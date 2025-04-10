import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the directory path of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../../.env') });

// Define DeletedAccount schema
const deletedAccountSchema = new mongoose.Schema({
  originalId: { type: mongoose.Schema.Types.ObjectId },
  email: String,
  name: String,
  deletionReason: String,
  customReason: String,
  deletedAt: { type: Date, default: Date.now },
  accountData: mongoose.Schema.Types.Mixed,
  accountMetrics: {
    jobApplicationsCount: Number,
    savedJobsCount: Number,
    profileCompletionPercentage: Number,
    daysActive: Number
  }
});

const DeletedAccount = mongoose.model('DeletedAccount', deletedAccountSchema);

async function main() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    const count = await DeletedAccount.countDocuments();
    console.log(`Total deleted accounts: ${count}\n`);

    const deletedAccounts = await DeletedAccount.find().sort({ deletedAt: -1 });

    if (deletedAccounts.length === 0) {
      console.log('No deleted accounts found.');
    } else {
      console.log('Deleted accounts:');
      deletedAccounts.forEach(account => {
        console.log('\n-------------------');
        console.log('ID:', account._id);
        console.log('Name:', account.name);
        console.log('Email:', account.email);
        console.log('Deletion Reason:', account.deletionReason);
        console.log('Custom Reason:', account.customReason);
        console.log('Deleted At:', account.deletedAt);
        if (account.accountMetrics) {
          console.log('Account Metrics:', {
            jobApplications: account.accountMetrics.jobApplicationsCount,
            savedJobs: account.accountMetrics.savedJobsCount,
            profileCompletion: account.accountMetrics.profileCompletionPercentage,
            daysActive: account.accountMetrics.daysActive
          });
        }
      });
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

main(); 