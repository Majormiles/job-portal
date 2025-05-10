import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Get directory name
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

// Update the actual User model file
async function updatePaymentModel() {
  try {
    console.log('Adding payment validation to User model...');
    
    // Path to the user model file
    const userModelPath = path.join(__dirname, 'src', 'models', 'user.model.js');
    
    // Read the file content
    let userModelContent = fs.readFileSync(userModelPath, 'utf8');
    
    // Check if validation already exists
    if (userModelContent.includes('validator: function(value)')) {
      console.log('Payment validation already exists in the model.');
      return;
    }
    
    // Find the payment.amount field to update
    const amountFieldPattern = /amount: {\s*type: Number\s*}/;
    
    // Replace with validation
    const validatedAmountField = `amount: {
      type: Number,
      validate: {
        validator: function(value) {
          // Only validate if isPaid is true
          if (this.payment && this.payment.isPaid) {
            return value !== undefined && value !== null && value > 0;
          }
          return true;
        },
        message: 'Payment amount must be greater than 0 when payment is marked as paid'
      }
    }`;
    
    // Replace the field
    const updatedContent = userModelContent.replace(amountFieldPattern, validatedAmountField);
    
    // Add the middleware for automatic fixing
    const middlewareCode = `
// Ensure payment data has valid amount
userSchema.pre('save', function (next) {
  // Define payment amounts by role
  const PAYMENT_AMOUNTS = {
    jobSeeker: 50,
    employer: 100,
    trainer: 100,
    trainee: 50
  };

  // Only fix payment if it's marked as paid
  if (this.payment && this.payment.isPaid === true) {
    // Fix missing or invalid payment amount using role-based pricing
    if (!this.payment.amount || this.payment.amount <= 0) {
      console.log(\`Fixing zero/invalid payment amount for user \${this.email}\`);
      
      // Get amount based on role
      if (this.roleName && PAYMENT_AMOUNTS[this.roleName]) {
        this.payment.amount = PAYMENT_AMOUNTS[this.roleName];
      } else {
        // Use default fallback amount
        this.payment.amount = 50;
      }
    }
  }
  
  next();
});`;
    
    // Find position to insert middleware (after the existing pre-save middleware)
    const insertPosition = userModelContent.indexOf('// Compare password method');
    
    // Combine the content
    let finalContent;
    if (insertPosition !== -1) {
      finalContent = 
        updatedContent.substring(0, insertPosition) + 
        middlewareCode + '\n\n' + 
        updatedContent.substring(insertPosition);
    } else {
      // Fallback if position not found
      finalContent = updatedContent + '\n' + middlewareCode;
    }
    
    // Check if middleware already exists
    if (userModelContent.includes('Ensure payment data has valid amount')) {
      console.log('Payment middleware already exists in the model.');
      finalContent = updatedContent;
    }
    
    // Write the updated content
    fs.writeFileSync(userModelPath, finalContent, 'utf8');
    
    console.log('User model successfully updated with payment validation!');
    console.log('Changes made:');
    console.log('1. Added validation to ensure payment amount is greater than 0 when isPaid is true');
    console.log('2. Added middleware to automatically fix zero/invalid payment amounts');
    
    // Verify the changes can be loaded
    try {
      // Connect to MongoDB to test the updated model
      console.log('\nTesting connection to MongoDB with updated model...');
      const MONGODB_URI = process.env.MONGODB_URI;
      
      if (!MONGODB_URI) {
        throw new Error('MONGODB_URI not found in environment variables');
      }
      
      await mongoose.connect(MONGODB_URI);
      console.log('Successfully connected to MongoDB');
      
      // Import the model dynamically to ensure we get the updated version
      const userModelModule = await import('./src/models/user.model.js');
      const User = userModelModule.default;
      
      // Count users in the database
      const userCount = await User.countDocuments();
      console.log(`Database contains ${userCount} users`);
      
      // Test the model with a specific user
      const specificEmail = process.argv[2] || 'majormilesvigour@gmail.com';
      const user = await User.findOne({ email: specificEmail });
      
      if (user) {
        console.log(`\nFound user: ${user.name} (${user.email})`);
        
        if (user.payment && user.payment.isPaid) {
          console.log(`Payment status: Paid, Amount: ${user.payment.amount} ${user.payment.currency}`);
        } else {
          console.log('User has not made a payment yet or payment is not marked as paid');
        }
      } else {
        console.log(`User with email ${specificEmail} not found`);
      }
      
      // Disconnect from MongoDB
      await mongoose.disconnect();
      console.log('Disconnected from MongoDB');
      
    } catch (error) {
      console.error('Error testing the model:', error);
    }
    
  } catch (error) {
    console.error('Error updating User model:', error);
  }
}

// Run the script
updatePaymentModel(); 