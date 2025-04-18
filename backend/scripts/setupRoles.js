import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory name for ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Define the Role schema since we're outside the src directory
const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  displayName: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  permissions: {
    type: [String],
    default: []
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create the Role model
const Role = mongoose.model('Role', roleSchema);

// Connect to MongoDB
const connectDB = async () => {
  try {
    // Allow command-line argument to override the MongoDB URI
    // Usage: node scripts/setupRoles.js "mongodb+srv://username:password@cluster.mongodb.net/dbname"
    const cmdLineURI = process.argv[2];
    
    // Get the MongoDB URI from command line, environment variables, or use a default
    const mongoURI = cmdLineURI || 
                    process.env.MONGODB_URI ||
                    process.env.DATABASE_URL || 
                    'mongodb://localhost:27017/job-portal';
    
    console.log('Connecting to MongoDB...');
    console.log('MongoDB URI:', mongoURI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')); // Hide credentials in logs
    
    const conn = await mongoose.connect(mongoURI, {});
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    console.error('Please check your MongoDB connection string and ensure your database is running.');
    console.error('You can also specify the MongoDB URI directly:');
    console.error('  node scripts/setupRoles.js "mongodb+srv://username:password@cluster.mongodb.net/dbname"');
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
  },
  // Add compatibility with common role names
  {
    name: 'user',
    displayName: 'User',
    description: 'Basic user role',
    permissions: ['view_jobs'],
    isDefault: false,
    isActive: true
  },
  {
    name: 'candidate',
    displayName: 'Candidate',
    description: 'Alias for Job Seeker',
    permissions: ['view_jobs', 'apply_jobs'],
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
    console.error('Stack trace:', error.stack);
  }
};

// Run the setup
setupRoles(); 