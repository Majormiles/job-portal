import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// MongoDB URI from env or fallback
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://major:Almighty0247466205@cluster0.bedjf.mongodb.net/';

console.log('Using MongoDB URI:', MONGODB_URI ? 'URI is defined' : 'URI is undefined');

async function updateAdminPassword() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully');
    
    // Generate hash manually
    const password = 'Almighty';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log('Generated hash:', hashedPassword);
    
    // Update admin user password directly in MongoDB (bypassing Mongoose hooks)
    const result = await mongoose.connection.db.collection('users').updateOne(
      { email: 'major@gmail.com', role: 'admin' },
      { 
        $set: { 
          password: hashedPassword,
          isVerified: true
        }
      }
    );
    
    console.log('Update result:', result);
    
    if (result.matchedCount === 0) {
      console.log('No admin user found with email major@gmail.com');
      
      // Create admin user if not found
      console.log('Creating new admin user...');
      const newUser = {
        name: 'Admin User',
        email: 'major@gmail.com',
        password: hashedPassword,
        role: 'admin',
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        skills: { technical: [], soft: [], languages: [], certifications: [] },
        preferences: { industryPreferences: [], workCulture: [], benefits: [] },
        profilePicture: "default-profile.png",
        onboardingComplete: false,
        onboardingCompletedAt: null,
        socialLinks: []
      };
      
      const createResult = await mongoose.connection.db.collection('users').insertOne(newUser);
      console.log('Create result:', createResult);
    } else {
      console.log('Admin user password updated successfully');
    }
    
    // Verify the password works by testing it
    const user = await mongoose.connection.db.collection('users').findOne(
      { email: 'major@gmail.com', role: 'admin' }
    );
    
    if (!user) {
      console.log('Could not find admin user after update');
    } else {
      console.log('Found admin user:', user._id.toString());
      
      // Test password manually
      const isMatch = await bcrypt.compare(password, user.password);
      console.log(`Password verification: ${isMatch ? 'SUCCESS ✓' : 'FAILED ✗'}`);
      
      if (isMatch) {
        console.log('\n*********************************************');
        console.log('  ADMIN USER READY FOR LOGIN');
        console.log('  Email: major@gmail.com');
        console.log('  Password: Almighty');
        console.log('*********************************************\n');
      } else {
        console.log('Password verification failed. Something went wrong with the hashing.');
      }
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

updateAdminPassword(); 