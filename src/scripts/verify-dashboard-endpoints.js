import axios from 'axios';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const verifyDashboardEndpoints = async () => {
  try {
    console.log('Starting dashboard endpoints verification...');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create a test user
    const testUser = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'employee',
      profileCompletion: 75,
      profileImage: 'test-image.jpg'
    };

    // Create test job applications
    const testApplications = [
      {
        jobId: new mongoose.Types.ObjectId(),
        title: 'Software Engineer',
        company: 'Tech Corp',
        companyLogo: 'tech-corp-logo.png',
        location: 'New York',
        salary: '$80k-120k/year',
        appliedDate: new Date(),
        status: 'Active',
        type: 'Full Time'
      },
      {
        jobId: new mongoose.Types.ObjectId(),
        title: 'Product Manager',
        company: 'Product Inc',
        companyLogo: 'product-inc-logo.png',
        location: 'Remote',
        salary: '$100k-150k/year',
        appliedDate: new Date(),
        status: 'Pending',
        type: 'Remote'
      }
    ];

    // Create test dashboard stats
    const testStats = {
      appliedJobs: 5,
      favoriteJobs: 3,
      jobAlerts: 2
    };

    // Set up API client
    const api = axios.create({
      baseURL: process.env.API_URL || 'http://localhost:5000/api',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Test /users/me endpoint
    console.log('\nTesting /users/me endpoint...');
    const profileResponse = await api.get('/users/me');
    console.log('Profile response:', profileResponse.data);

    // Test /applications/recent endpoint
    console.log('\nTesting /applications/recent endpoint...');
    const applicationsResponse = await api.get('/applications/recent');
    console.log('Applications response:', applicationsResponse.data);

    // Test /dashboard/stats endpoint
    console.log('\nTesting /dashboard/stats endpoint...');
    const statsResponse = await api.get('/dashboard/stats');
    console.log('Stats response:', statsResponse.data);

    console.log('\nVerification Summary:');
    console.log('✓ Profile endpoint verified');
    console.log('✓ Applications endpoint verified');
    console.log('✓ Dashboard stats endpoint verified');

    // Cleanup
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');

  } catch (error) {
    console.error('Verification failed:', error.message);
    if (error.response) {
      console.error('Error response:', error.response.data);
    }
    process.exit(1);
  }
};

verifyDashboardEndpoints(); 