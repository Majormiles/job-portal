import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

// Initialize dotenv
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/job-portal';

async function cleanupApplicationsData() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully!');

    // Import models after connection
    const Application = mongoose.model('Application', new mongoose.Schema({}, { strict: false }));
    const Job = mongoose.model('Job', new mongoose.Schema({}, { strict: false }));
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));

    // 1. Get all applications
    console.log('\nChecking existing applications...');
    const allApplications = await Application.find({});
    console.log(`Found ${allApplications.length} total applications`);

    // 2. Find applications with missing jobs or applicants
    let problematicApps = [];
    let validApps = [];

    for (const app of allApplications) {
      const jobExists = await Job.findById(app.job);
      const applicantExists = await User.findById(app.applicant);

      if (!jobExists || !applicantExists) {
        problematicApps.push({
          id: app._id,
          jobExists: !!jobExists,
          applicantExists: !!applicantExists,
          jobId: app.job,
          applicantId: app.applicant
        });
      } else {
        validApps.push(app);
      }
    }

    console.log(`\nFound ${problematicApps.length} problematic applications with missing references`);
    console.log(`Valid applications: ${validApps.length}`);

    if (problematicApps.length > 0) {
      console.log('\nProblematic applications details:');
      problematicApps.forEach(app => {
        console.log(`- Application ID: ${app.id}`);
        console.log(`  Job ID: ${app.jobId} (exists: ${app.jobExists})`);
        console.log(`  Applicant ID: ${app.applicantId} (exists: ${app.applicantExists})`);
      });

      // 3. Delete problematic applications
      console.log('\nDeleting problematic applications...');
      for (const app of problematicApps) {
        await Application.findByIdAndDelete(app.id);
        console.log(`Deleted application: ${app.id}`);
      }
    }

    // 4. Verify existing valid jobs for test data
    console.log('\nVerifying active jobs for test data...');
    const activeJobs = await Job.find({ status: 'active' }).limit(5);
    
    if (activeJobs.length === 0) {
      console.log('No active jobs found. Please create some jobs first.');
      return;
    }
    
    console.log(`Found ${activeJobs.length} active jobs for testing`);
    activeJobs.forEach((job, index) => {
      console.log(`${index + 1}. ${job.title} (ID: ${job._id})`);
    });

    // 5. Verify admin user
    console.log('\nVerifying admin user...');
    const adminUser = await User.findOne({ role: 'admin' });
    
    if (!adminUser) {
      console.log('No admin user found. Please create an admin user first.');
      return;
    }
    
    console.log(`Found admin user: ${adminUser.name} (${adminUser.email})`);

    // 6. Create test applications if needed
    if (validApps.length < 5) {
      console.log('\nCreating test applications...');
      
      // Find some regular users
      const regularUsers = await User.find({ role: { $ne: 'admin' } }).limit(3);
      
      if (regularUsers.length === 0) {
        console.log('No regular users found. Please create some regular users first.');
        return;
      }
      
      console.log(`Found ${regularUsers.length} regular users for test applications`);
      
      // Create test applications
      for (const user of regularUsers) {
        for (const job of activeJobs.slice(0, 2)) { // Create 2 apps per user
          try {
            // Check if this application already exists
            const existingApp = await Application.findOne({
              job: job._id,
              applicant: user._id
            });
            
            if (existingApp) {
              console.log(`Application already exists for user ${user.name} and job ${job.title}`);
              continue;
            }
            
            const newApp = new Application({
              job: job._id,
              applicant: user._id,
              status: ['pending', 'reviewing', 'shortlisted'][Math.floor(Math.random() * 3)],
              coverLetter: "This is a test cover letter created for verification purposes.",
              resume: "https://example.com/fake-resume.pdf",
              notes: "Test application created by verification script",
              createdAt: new Date()
            });
            
            await newApp.save();
            
            // Update job's applications array if it exists
            job.applications = job.applications || [];
            if (!job.applications.includes(newApp._id)) {
              job.applications.push(newApp._id);
              await job.save();
            }
            
            console.log(`Created application for user ${user.name} and job ${job.title}`);
          } catch (error) {
            console.error(`Error creating application: ${error.message}`);
          }
        }
      }
    }

    // 7. Final verification
    console.log('\nPerforming final verification...');
    const finalApps = await Application.find({});
    console.log(`Total applications after cleanup: ${finalApps.length}`);
    
    // Verify applications can be fetched with population
    console.log('\nVerifying application population...');
    const testApp = await Application.findOne({})
      .populate('job')
      .populate('applicant');
    
    if (testApp) {
      console.log('Test application can be populated successfully:');
      console.log(`- Application ID: ${testApp._id}`);
      console.log(`- Job Title: ${testApp.job?.title || 'Unable to populate job'}`);
      console.log(`- Applicant Name: ${testApp.applicant?.name || 'Unable to populate applicant'}`);
      
      // Test deletion
      console.log('\nTesting application deletion...');
      try {
        const jobId = testApp.job._id;
        await Application.findByIdAndDelete(testApp._id);
        console.log(`Successfully deleted test application: ${testApp._id}`);
        
        // Update the job
        const job = await Job.findById(jobId);
        if (job) {
          job.applications = job.applications.filter(
            app => app.toString() !== testApp._id.toString()
          );
          await job.save();
          console.log(`Updated job applications array for job: ${jobId}`);
        }
      } catch (error) {
        console.error(`Error testing deletion: ${error.message}`);
      }
    } else {
      console.log('No applications found for testing population.');
    }

    console.log('\nDatabase cleanup and verification completed!');
    console.log('Job seeker functionality should now work correctly.');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Close the MongoDB connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

cleanupApplicationsData(); 