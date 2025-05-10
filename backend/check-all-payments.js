import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

// Check all payment records in the database
async function checkAllPayments() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    const MONGODB_URI = process.env.MONGODB_URI;
    
    if (!MONGODB_URI) {
      console.error('Error: MONGODB_URI not found in .env file');
      process.exit(1);
    }
    
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Access the database directly
    const db = mongoose.connection;
    
    // Find all users with payment records
    const paidUsers = await db.collection('users').find({
      'payment.isPaid': true
    }).project({
      name: 1, 
      email: 1, 
      roleName: 1, 
      'payment.amount': 1,
      'payment.currency': 1,
      'payment.date': 1,
      'payment.reference': 1
    }).toArray();
    
    console.log(`\nFound ${paidUsers.length} users with paid status:`);
    
    // Display user payment information
    paidUsers.forEach((user, index) => {
      console.log(`\n${index + 1}. ${user.name} (${user.email}):`);
      console.log(`   Role: ${user.roleName}`);
      console.log(`   Payment Amount: ${user.payment.amount || 'MISSING'} ${user.payment.currency || 'GHS'}`);
      console.log(`   Payment Date: ${user.payment.date ? new Date(user.payment.date).toISOString() : 'MISSING'}`);
      console.log(`   Reference: ${user.payment.reference || 'MISSING'}`);
      
      // Flag any issues
      const issues = [];
      if (!user.payment.amount || user.payment.amount <= 0) {
        issues.push('Invalid/missing payment amount');
      }
      if (!user.payment.date) {
        issues.push('Missing payment date');
      }
      if (!user.payment.reference) {
        issues.push('Missing payment reference');
      }
      
      if (issues.length > 0) {
        console.log(`   ISSUES DETECTED: ${issues.join(', ')}`);
      } else {
        console.log('   ✓ Payment record valid');
      }
    });
    
    // Count users with payment issues
    const usersWithIssues = await db.collection('users').countDocuments({
      'payment.isPaid': true,
      $or: [
        { 'payment.amount': { $exists: false } },
        { 'payment.amount': null },
        { 'payment.amount': 0 },
        { 'payment.amount': { $lte: 0 } }
      ]
    });
    
    if (usersWithIssues > 0) {
      console.log(`\nWARNING: Found ${usersWithIssues} users with payment issues!`);
    } else {
      console.log('\nSuccess: No users with payment issues found');
    }
    
    // Verify the update to fix model is in place
    const userModelUpdate = await db.collection('users').findOne({
      'payment.isPaid': true
    });
    
    console.log('\nVerifying database update capability:');
    if (userModelUpdate) {
      try {
        // Test update command (without actually making changes)
        const updateTest = await db.collection('users').updateOne(
          { _id: userModelUpdate._id },
          { $set: { 'payment.amount': userModelUpdate.payment.amount } }
        );
        
        console.log(`Update test result: ${updateTest.acknowledged ? 'SUCCESS' : 'FAILED'}`);
      } catch (error) {
        console.error('Error testing database update:', error.message);
      }
    }
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Run the script
checkAllPayments(); 