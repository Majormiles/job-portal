import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables with explicit path
dotenv.config({ path: path.join(__dirname, '../.env') });

// Set MongoDB URI with fallback
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://major:Almighty0247466205@cluster0.bedjf.mongodb.net/';

// Email from command line arguments or use defaults
const email = process.argv[2] || 'major@gmail.com';

async function checkUser() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB at:', MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Dynamically import the User model
    const { default: User } = await import('../src/models/user.model.js');
    const { default: Role } = await import('../src/models/role.model.js');
    console.log('Models imported');

    // Find the user directly by email without populating role
    const user = await User.findOne({ email });

    if (!user) {
      console.error(`User with email ${email} not found`);
      return;
    }

    console.log('User details:');
    console.log('-'.repeat(50));
    console.log(`ID: ${user._id}`);
    console.log(`Name: ${user.name}`);
    console.log(`Email: ${user.email}`);
    console.log(`RoleName: ${user.roleName}`);
    console.log(`Role: ${user.role ? user.role._id : 'undefined'}`);
    console.log(`Role Name: ${user.role ? user.role.name : 'undefined'}`);
    console.log(`IsVerified: ${user.isVerified}`);
    console.log('-'.repeat(50));
    
    // Raw object for debugging
    console.log('Raw user object:');
    console.log(JSON.stringify(user.toObject(), null, 2));

  } catch (error) {
    console.error('Error checking user:', error);
  } finally {
    // Close MongoDB connection
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Execute the function
console.log(`Checking user with email: ${email}`);
checkUser(); 