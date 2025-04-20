import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

// Examine the payment model structure
async function examinePaymentModel() {
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
    
    // Get database connection
    const db = mongoose.connection;
    
    // PART 1: Examine Users collection payment structure
    console.log('\n===== USER PAYMENT STRUCTURE =====');
    const users = await db.collection('users').find({
      'payment.isPaid': true
    }).toArray();
    
    console.log(`Found ${users.length} users with payment records`);
    
    if (users.length > 0) {
      // Show detailed payment structure from a sample user
      const sampleUser = users[0];
      console.log(`\nSample user payment data (${sampleUser.name}):`);
      console.log(JSON.stringify(sampleUser.payment, null, 2));
      
      // Analyze and display payment field consistency across all users
      console.log('\nPayment field consistency across all users:');
      const paymentFields = new Map();
      
      users.forEach(user => {
        if (user.payment) {
          Object.keys(user.payment).forEach(field => {
            if (!paymentFields.has(field)) {
              paymentFields.set(field, { count: 0, types: new Set() });
            }
            
            const fieldInfo = paymentFields.get(field);
            fieldInfo.count++;
            fieldInfo.types.add(typeof user.payment[field]);
          });
        }
      });
      
      for (const [field, info] of paymentFields.entries()) {
        console.log(`- ${field}: present in ${info.count}/${users.length} records, types: [${Array.from(info.types).join(', ')}]`);
      }
    }
    
    // PART 2: Examine Payments collection
    console.log('\n===== PAYMENTS COLLECTION STRUCTURE =====');
    const paymentsCollection = db.collection('payments');
    const payments = await paymentsCollection.find({}).toArray();
    
    console.log(`Found ${payments.length} records in payments collection`);
    
    if (payments.length > 0) {
      // Show detailed payment structure from the payments collection
      const samplePayment = payments[0];
      console.log('\nSample payment record:');
      console.log(JSON.stringify(samplePayment, null, 2));
      
      // Check for payment references that match between collections
      console.log('\nChecking for matching payment references between collections:');
      let matchCount = 0;
      
      for (const user of users) {
        if (user.payment && user.payment.reference) {
          const matchingPayment = payments.find(p => p.reference === user.payment.reference);
          if (matchingPayment) {
            matchCount++;
            console.log(`- Match found: User ${user.email} with reference ${user.payment.reference}`);
          }
        }
      }
      
      console.log(`- Total matches: ${matchCount}/${users.length}`);
    }
    
    // PART 3: Check if payments should be recorded in both collections
    console.log('\n===== PAYMENT FLOW ANALYSIS =====');
    // Look at payment controller file structure
    const fs = require('fs');
    const paymentControllerPath = path.join(__dirname, 'src', 'controllers', 'payment.controller.js');
    
    console.log('Examining payment flow in controller:');
    if (fs.existsSync(paymentControllerPath)) {
      const controllerContent = fs.readFileSync(paymentControllerPath, 'utf8');
      
      // Check where payments are stored
      const userUpdatePattern = /user\.payment|payment\.isPaid|payment:\s*{/g;
      const paymentsCollectionPattern = /Payment\.create|Payment\.insertOne|new Payment/g;
      
      const userUpdates = (controllerContent.match(userUpdatePattern) || []).length;
      const paymentsInserts = (controllerContent.match(paymentsCollectionPattern) || []).length;
      
      console.log(`- User payment updates found: ${userUpdates}`);
      console.log(`- Payment collection inserts found: ${paymentsInserts}`);
      
      if (userUpdates > 0 && paymentsInserts === 0) {
        console.log('\nAnalysis: Payments are stored ONLY in the user document payment field.');
      } else if (userUpdates === 0 && paymentsInserts > 0) {
        console.log('\nAnalysis: Payments are stored ONLY in the separate payments collection.');
      } else if (userUpdates > 0 && paymentsInserts > 0) {
        console.log('\nAnalysis: Payments are stored in BOTH the user document and payments collection.');
      } else {
        console.log('\nAnalysis: Could not determine payment storage pattern from controller code.');
      }
    } else {
      console.log('- Payment controller file not found at expected path');
    }
    
    // PART 4: Recommendations
    console.log('\n===== RECOMMENDATIONS =====');
    if (payments.length === 0 && users.some(u => u.payment && u.payment.isPaid)) {
      console.log('1. The payments collection is empty but users have payment records.');
      console.log('   ⚠️ Consider maintaining payment records in both collections for better data organization.');
      console.log('2. You could update the payment flow to store records in both places:');
      console.log('   • User collection: For quick access to payment status');
      console.log('   • Payments collection: For detailed payment history and reporting');
    } else if (payments.length > 0 && !users.some(u => u.payment && u.payment.isPaid)) {
      console.log('1. Payments collection has records but users don\'t have payment information.');
      console.log('   ⚠️ Payment status should be reflected in user records for access control.');
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
examinePaymentModel(); 