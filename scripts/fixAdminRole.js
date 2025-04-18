import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://major:Almighty0247466205@cluster0.bedjf.mongodb.net/';

async function fixAdminRole() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully!');

    // The email of the user to update
    const userEmail = 'major@gmail.com'; // Change this to your admin email
    
    // Update the user role directly in the database
    const result = await mongoose.connection.db.collection('users').updateOne(
      { email: userEmail },
      { $set: { role: 'admin' } }
    );

    if (result.matchedCount === 0) {
      console.log(`User with email ${userEmail} not found.`);
    } else if (result.modifiedCount === 0) {
      console.log(`User with email ${userEmail} already has admin role.`);
    } else {
      console.log(`Successfully updated role to 'admin' for user with email ${userEmail}!`);
    }

    // Get the updated user to verify
    const user = await mongoose.connection.db.collection('users').findOne({ email: userEmail });
    console.log('Updated user:', {
      email: user.email,
      name: user.name,
      role: user.role
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Close the MongoDB connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

fixAdminRole(); 