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

// Direct script to check all payment records
async function directPaymentFix() {
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
    
    // Find all users with payment data
    const db = mongoose.connection;
    const usersCollection = db.collection('users');
    
    // Check specific email if provided
    const specificEmail = process.argv[2] || 'majormilesvigour@gmail.com';
    const user = await usersCollection.findOne({ email: specificEmail });
    
    if (user) {
      console.log('User details:');
      console.log(`- Name: ${user.name}`);
      console.log(`- Email: ${user.email}`);
      console.log(`- Role: ${user.roleName}`);
      console.log('\nPayment details:');
      
      if (user.payment) {
        console.log(`- Is Paid: ${user.payment.isPaid ? 'Yes' : 'No'}`);
        console.log(`- Amount: ${user.payment.amount || 'Not set'}`);
        console.log(`- Currency: ${user.payment.currency || 'Not set'}`);
        console.log(`- Reference: ${user.payment.reference || 'Not set'}`);
        console.log(`- Date: ${user.payment.date ? new Date(user.payment.date).toISOString() : 'Not set'}`);
        console.log(`- Gateway: ${user.payment.gateway || 'Not set'}`);
        
        // Fix payment amount if needed
        if (user.payment.isPaid && (!user.payment.amount || user.payment.amount <= 0)) {
          console.log('\nFIXING PAYMENT RECORD:');
          
          // Calculate correct amount based on role
          const roleAmount = user.roleName && PAYMENT_AMOUNTS[user.roleName] 
            ? PAYMENT_AMOUNTS[user.roleName] 
            : 50;
            
          console.log(`- Setting amount to ${roleAmount} based on role ${user.roleName || 'default'}`);
          
          // Update record directly
          const updateResult = await usersCollection.updateOne(
            { email: user.email },
            { 
              $set: { 
                'payment.amount': roleAmount,
                'payment.currency': user.payment.currency || 'GHS', 
                'payment.date': user.payment.date || new Date(),
                'payment.gateway': user.payment.gateway || 'paystack'
              } 
            }
          );
          
          console.log('- Database update result:', updateResult.modifiedCount > 0 ? 'SUCCESS' : 'No changes needed');
          
          // Verify the fix
          const updatedUser = await usersCollection.findOne({ email: user.email });
          console.log('\nUpdated payment details:');
          console.log(`- Amount: ${updatedUser.payment.amount}`);
          console.log(`- Is Paid: ${updatedUser.payment.isPaid ? 'Yes' : 'No'}`);
        } else if (user.payment.isPaid) {
          console.log('\nPayment record looks valid, no fixes needed.');
        } else {
          console.log('\nUser has not made a payment yet.');
        }
      } else {
        console.log('User has no payment record yet.');
      }
    } else {
      console.log(`User with email ${specificEmail} not found in database.`);
      
      // List all users with payments
      console.log('\nListing all users with payment records:');
      const usersWithPayments = await usersCollection.find({
        'payment.isPaid': true
      }).project({ name: 1, email: 1, roleName: 1, 'payment.amount': 1 }).toArray();
      
      usersWithPayments.forEach(user => {
        console.log(`- ${user.name} (${user.email}): ${user.payment.amount || 'No amount'} ${user.payment.currency || 'GHS'}`);
      });
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
directPaymentFix(); 