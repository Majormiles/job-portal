import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

// Payment amounts by role
const PAYMENT_AMOUNTS = {
  jobSeeker: 50,
  employer: 100,
  trainer: 100,
  trainee: 50
};

// Define the User schema for MongoDB
const userSchema = new mongoose.Schema({
  email: String,
  name: String,
  roleName: String,
  payment: {
    isPaid: Boolean,
    reference: String,
    amount: Number,
    currency: String,
    date: Date,
    gateway: String,
    metadata: Object
  }
});

// Fix payment records in database
async function fixPaymentRecords() {
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
    
    // Create User model
    const User = mongoose.model('User', userSchema);
    
    // Get specific user if email provided as argument
    const specificEmail = process.argv[2];
    if (specificEmail) {
      console.log(`Looking for specific user: ${specificEmail}`);
      const user = await User.findOne({ email: specificEmail });
      
      if (user) {
        console.log(`Found user: ${user.name} (${user.email}), Role: ${user.roleName}`);
        console.log('Current payment status:', user.payment);
        
        // Fix the user payment record if needed
        if (user.payment && user.payment.isPaid && (!user.payment.amount || user.payment.amount <= 0)) {
          await fixUserPayment(user);
        } else if (!user.payment || !user.payment.isPaid) {
          console.log('User has not made a payment yet');
        } else {
          console.log('Payment record looks valid:', user.payment);
        }
      } else {
        console.log(`User with email ${specificEmail} not found in database`);
      }
    } else {
      // Find all users with payment issues (isPaid but zero or missing amount)
      const usersToFix = await User.find({
        'payment.isPaid': true,
        $or: [
          { 'payment.amount': { $exists: false } },
          { 'payment.amount': null },
          { 'payment.amount': 0 },
          { 'payment.amount': { $lte: 0 } }
        ]
      });
      
      console.log(`Found ${usersToFix.length} users with payment issues`);
      
      // Fix each user's payment data
      let fixedCount = 0;
      for (const user of usersToFix) {
        await fixUserPayment(user);
        fixedCount++;
      }
      
      // Log summary
      console.log(`\nPayment fix summary: Fixed ${fixedCount} of ${usersToFix.length} records`);
      
      // Check if there are any payments left with issues
      const remainingIssues = await User.find({
        'payment.isPaid': true,
        $or: [
          { 'payment.amount': { $exists: false } },
          { 'payment.amount': null },
          { 'payment.amount': 0 },
          { 'payment.amount': { $lte: 0 } }
        ]
      });
      
      if (remainingIssues.length > 0) {
        console.log(`\nWarning: ${remainingIssues.length} users still have payment issues`);
      } else {
        console.log('\nSuccess: All payment records fixed successfully');
      }
    }
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Fix an individual user's payment record
async function fixUserPayment(user) {
  try {
    console.log(`\nFixing payment for ${user.name} (${user.email})`);
    
    // Determine correct amount based on role
    let amount = 50; // Default amount
    if (user.roleName && PAYMENT_AMOUNTS[user.roleName]) {
      amount = PAYMENT_AMOUNTS[user.roleName];
    }
    
    console.log(`  Current amount: ${user.payment?.amount || 'Not set'}`);
    console.log(`  Setting amount to: ${amount} (based on role: ${user.roleName || 'unknown'})`);
    
    // Update payment info
    user.payment.amount = amount;
    
    // Ensure other required fields are set
    if (!user.payment.date) user.payment.date = new Date();
    if (!user.payment.currency) user.payment.currency = 'GHS';
    if (!user.payment.gateway) user.payment.gateway = 'paystack';
    if (!user.payment.reference) {
      user.payment.reference = `FIXED-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    }
    
    // Save the updated user
    await user.save();
    console.log(`  ✓ Payment fixed successfully`);
    console.log(`  New payment record:`, user.payment);
    
    return true;
  } catch (error) {
    console.error(`  ✗ Error fixing payment for ${user.email}:`, error.message);
    return false;
  }
}

// Run the script
fixPaymentRecords(); 