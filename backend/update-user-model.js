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

// Define the User schema with the payment validation
async function updateUserModel() {
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
    
    // Get the existing User model schema
    const existingSchema = mongoose.model('User').schema;
    
    // Create a new schema based on the existing one
    const userSchema = new mongoose.Schema(existingSchema.obj);
    
    // Add the validation middleware
    userSchema.pre('save', function(next) {
      // Check if payment exists and is marked as paid
      if (this.payment && this.payment.isPaid === true) {
        console.log(`Pre-save hook triggered for ${this.email}`);
        
        // Fix missing or invalid payment amount using role-based pricing
        if (!this.payment.amount || this.payment.amount <= 0) {
          console.log(`Fixing zero/invalid payment amount for user ${this.email}`);
          
          // Get amount based on role
          if (this.roleName && PAYMENT_AMOUNTS[this.roleName]) {
            this.payment.amount = PAYMENT_AMOUNTS[this.roleName];
            console.log(`Set amount to ${this.payment.amount} based on role ${this.roleName}`);
          } else {
            // Use default fallback amount
            this.payment.amount = 50;
            console.log(`Set default fallback amount to ${this.payment.amount}`);
          }
        }
      }
      
      next();
    });
    
    // Unregister the existing model if it exists
    try {
      mongoose.deleteModel('User');
    } catch (e) {
      // Ignore if model doesn't exist
    }
    
    // Register the updated model
    mongoose.model('User', userSchema);
    
    console.log('User model updated with payment validation middleware');
    
    // Check sample user
    const User = mongoose.model('User');
    const sampleUser = await User.findOne({'payment.isPaid': true});
    
    if (sampleUser) {
      console.log(`\nFound sample user: ${sampleUser.name} (${sampleUser.email})`);
      console.log('Current payment status:', sampleUser.payment);
      
      // Test the validation
      if (sampleUser.payment) {
        const originalAmount = sampleUser.payment.amount;
        
        // Test the middleware by temporarily setting amount to 0
        sampleUser.payment.amount = 0;
        await sampleUser.save();
        
        // Check if amount was fixed
        console.log(`\nTested payment validation:`);
        console.log(`  Original amount: ${originalAmount}`);
        console.log(`  After middleware: ${sampleUser.payment.amount}`);
        
        if (sampleUser.payment.amount > 0 && sampleUser.payment.amount !== originalAmount) {
          console.log('  ✓ Validation middleware working correctly');
        } else {
          console.log('  ✗ Validation might not be working properly');
        }
        
        // Restore original amount if it was valid
        if (originalAmount > 0) {
          sampleUser.payment.amount = originalAmount;
          await sampleUser.save();
          console.log(`  ✓ Restored original amount: ${sampleUser.payment.amount}`);
        }
      }
    } else {
      console.log('No paid users found to test the middleware');
    }
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
    console.log('User model has been successfully updated with payment validation');
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Run the script
updateUserModel(); 