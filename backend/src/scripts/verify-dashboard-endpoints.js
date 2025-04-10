import axios from 'axios';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/user.model.js';
import Application from '../models/application.model.js';
import DashboardStats from '../models/dashboardStats.model.js';

dotenv.config();

const verifyDashboardEndpoints = async () => {
  try {
    console.log('Starting dashboard endpoints verification...');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clean up any existing test data
    await User.deleteOne({ email: 'test@example.com' });
    console.log('Cleaned up existing test data');

    // Create a test user
    const testUser = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'user',
      profileCompletion: 75,
      profileImage: 'test-image.jpg'
    });
    console.log('Created test user:', testUser._id);

    // Create test job applications
    const testApplications = await Application.create([
      {
        job: new mongoose.Types.ObjectId(),
        applicant: testUser._id,
        status: 'pending',
        coverLetter: 'Test cover letter for Software Engineer position',
        resume: 'test-resume.pdf',
        notes: 'Test application for Software Engineer position'
      },
      {
        job: new mongoose.Types.ObjectId(),
        applicant: testUser._id,
        status: 'reviewing',
        coverLetter: 'Test cover letter for Product Manager position',
        resume: 'test-resume.pdf',
        notes: 'Test application for Product Manager position'
      }
    ]);
    console.log('Created test applications');

    // Create test dashboard stats
    const testStats = await DashboardStats.create({
      userId: testUser._id,
      appliedJobs: 5,
      favoriteJobs: 3,
      jobAlerts: 2
    });
    console.log('Created test stats');

    // Set up API client
    const api = axios.create({
      baseURL: process.env.API_URL || 'http://localhost:5000/api',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Login to get auth token
    console.log('\nLogging in test user...');
    const loginResponse = await api.post('/auth/login', {
      email: 'test@example.com',
      password: 'password123'
    });
    const token = loginResponse.data.token;
    console.log('Got auth token');

    // Update API client with auth token
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    // Test /dashboard/me endpoint
    console.log('\nTesting /dashboard/me endpoint...');
    const profileResponse = await api.get('/dashboard/me');
    console.log('Profile response:', profileResponse.data);

    // Test /dashboard/applications/recent endpoint
    console.log('\nTesting /dashboard/applications/recent endpoint...');
    const applicationsResponse = await api.get('/dashboard/applications/recent');
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
    await User.deleteOne({ _id: testUser._id });
    await Application.deleteMany({ userId: testUser._id });
    await DashboardStats.deleteOne({ userId: testUser._id });
    console.log('\nCleaned up test data');

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');

  } catch (error) {
    console.error('Verification failed:', error.message);
    if (error.response) {
      console.error('Error response:', error.response.data);
    }
    process.exit(1);
  }
};

verifyDashboardEndpoints(); 