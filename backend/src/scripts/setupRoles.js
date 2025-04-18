import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory name for ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Import Role model
import Role from '../models/role.model.js';

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {});
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

// Define the required roles with their properties
const requiredRoles = [
  {
    name: 'jobSeeker',
    displayName: 'Job Seeker',
    description: 'User looking for job opportunities',
    permissions: ['view_jobs', 'apply_jobs'],
    isDefault: true,
    isActive: true
  },
  {
    name: 'employer',
    displayName: 'Employer',
    description: 'Employer posting job opportunities',
    permissions: ['post_jobs', 'manage_jobs', 'view_applicants'],
    isDefault: false,
    isActive: true
  },
  {
    name: 'trainer',
    displayName: 'Trainer',
    description: 'Provider of training courses',
    permissions: ['post_courses', 'manage_courses'],
    isDefault: false,
    isActive: true
  },
  {
    name: 'trainee',
    displayName: 'Trainee',
    description: 'User enrolled in training courses',
    permissions: ['view_courses', 'enroll_courses'],
    isDefault: false,
    isActive: true
  },
  {
    name: 'admin',
    displayName: 'Administrator',
    description: 'System administrator with full access',
    permissions: ['admin_access', 'manage_users', 'manage_roles', 'manage_site'],
    isDefault: false,
    isActive: true
  }
];

// Main function to check and set up roles
const setupRoles = async () => {
  try {
    // Connect to the database
    const conn = await connectDB();
    
    console.log('Checking existing roles...');
    
    // Get existing roles
    const existingRoles = await Role.find({});
    console.log(`Found ${existingRoles.length} existing roles:`);
    existingRoles.forEach(role => {
      console.log(`- ${role.name} (${role.isActive ? 'active' : 'inactive'}${role.isDefault ? ', default' : ''})`);
    });
    
    // Check each required role and create if missing
    for (const roleData of requiredRoles) {
      const roleExists = existingRoles.some(r => r.name === roleData.name);
      
      if (!roleExists) {
        console.log(`Creating missing role: ${roleData.name}`);
        await Role.create(roleData);
        console.log(`✅ Created role: ${roleData.name}`);
      } else {
        const existingRole = existingRoles.find(r => r.name === roleData.name);
        
        // If the role exists but is inactive, make it active
        if (!existingRole.isActive) {
          console.log(`Activating inactive role: ${roleData.name}`);
          existingRole.isActive = true;
          await existingRole.save();
          console.log(`✅ Activated role: ${roleData.name}`);
        }
        
        console.log(`✓ Role already exists: ${roleData.name}`);
      }
    }
    
    // Ensure at least one default role exists
    const defaultRoleExists = await Role.findOne({ isDefault: true, isActive: true });
    if (!defaultRoleExists) {
      console.log('No default role found. Setting jobSeeker as default role...');
      const jobSeekerRole = await Role.findOne({ name: 'jobSeeker' });
      if (jobSeekerRole) {
        jobSeekerRole.isDefault = true;
        await jobSeekerRole.save();
        console.log('✅ Set jobSeeker as default role');
      } else {
        console.log('⚠️ jobSeeker role not found. Please check your database.');
      }
    }
    
    // Display final role configuration
    const updatedRoles = await Role.find({});
    console.log('\nCurrent role configuration:');
    updatedRoles.forEach(role => {
      console.log(`- ${role.name} (${role.isActive ? 'active' : 'inactive'}${role.isDefault ? ', default' : ''})`);
    });
    
    console.log('\n✅ Role setup complete!');
    
    // Close the connection
    await mongoose.connection.close();
    console.log('Database connection closed');
    
  } catch (error) {
    console.error('Error setting up roles:', error);
  }
};

// Run the setup
setupRoles(); 