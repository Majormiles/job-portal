require('dotenv').config();
const mongoose = require('mongoose');
const Onboarding = require('../models/onboarding.model');
const User = require('../models/user.model');

const fillDummyOnboardingData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all users
    const users = await User.find({});
    console.log(`Found ${users.length} users to process`);

    let processedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const user of users) {
      try {
        console.log(`\nProcessing user: ${user.name} (${user.email})`);

        // Create or update onboarding document
        let onboarding = await Onboarding.findOne({ user: user._id });
        if (!onboarding) {
          onboarding = new Onboarding({ user: user._id });
          console.log('Creating new onboarding document');
        } else {
          console.log('Updating existing onboarding document');
        }

        // Fill in dummy data for all sections
        onboarding.personalInfo = {
          completed: true,
          data: {
            phone: '0247466205',
            address: {
              street: '123 Main Street',
              city: 'Accra',
              state: 'Greater Accra',
              zipCode: '00233',
              country: 'Ghana'
            },
            dateOfBirth: '1990-01-01',
            profilePicture: null
          }
        };

        onboarding.professionalInfo = {
          completed: true,
          data: {
            experience: {
              currentRole: 'Software Developer',
              yearsOfExperience: '5',
              company: 'Tech Company Ltd',
              desiredRole: 'Senior Software Developer',
              industry: 'Technology'
            },
            education: {
              degree: 'Bachelor of Science',
              institution: 'University of Ghana',
              graduationYear: '2015',
              field: 'Computer Science'
            },
            resume: null
          }
        };

        onboarding.skills = {
          completed: true,
          data: {
            technical: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
            soft: ['Communication', 'Leadership', 'Problem Solving'],
            languages: ['English', 'French'],
            certifications: ['AWS Certified Developer']
          }
        };

        onboarding.preferences = {
          completed: true,
          data: {
            workPreferences: {
              workArrangement: 'hybrid',
              workSchedule: 'flexible',
              workCulture: 'innovative'
            },
            jobPreferences: {
              desiredRole: 'Senior Software Developer',
              desiredSalary: '5000',
              desiredLocation: 'Accra, Ghana',
              jobType: 'full-time'
            },
            industryPreferences: ['Technology', 'Finance', 'Healthcare'],
            workCulture: ['Innovative', 'Collaborative', 'Growth-oriented'],
            benefits: ['Health Insurance', 'Remote Work', 'Professional Development'],
            availability: {
              startDate: '2024-03-01',
              noticePeriod: '2 weeks'
            }
          }
        };

        onboarding.isComplete = true;
        onboarding.completedAt = new Date();

        // Save onboarding document
        await onboarding.save();
        console.log('Saved onboarding data');

        // Update user's onboarding status and data
        const updatedUser = await User.findByIdAndUpdate(user._id, {
          $set: {
            // Onboarding status
            onboardingComplete: true,
            onboardingCompletedAt: new Date(),
            
            // Personal info
            phone: onboarding.personalInfo.data.phone,
            address: onboarding.personalInfo.data.address,
            
            // Professional info
            professionalInfo: {
              currentTitle: onboarding.professionalInfo.data.experience.currentRole,
              yearsOfExperience: parseInt(onboarding.professionalInfo.data.experience.yearsOfExperience),
              currentCompany: onboarding.professionalInfo.data.experience.company,
              desiredTitle: onboarding.professionalInfo.data.experience.desiredRole
            },
            
            // Skills
            skills: {
              technical: onboarding.skills.data.technical,
              soft: onboarding.skills.data.soft,
              languages: onboarding.skills.data.languages,
              certifications: onboarding.skills.data.certifications
            },
            
            // Preferences
            preferences: {
              jobPreferences: {
                remoteWork: onboarding.preferences.data.workPreferences.workArrangement === 'remote',
                hybridWork: onboarding.preferences.data.workPreferences.workArrangement === 'hybrid',
                onsiteWork: onboarding.preferences.data.workPreferences.workArrangement === 'onsite',
                flexibleHours: onboarding.preferences.data.workPreferences.workSchedule === 'flexible'
              },
              industryPreferences: onboarding.preferences.data.industryPreferences,
              workCulture: onboarding.preferences.data.workCulture,
              benefits: onboarding.preferences.data.benefits,
              availability: {
                startDate: new Date(onboarding.preferences.data.availability.startDate),
                noticePeriod: parseInt(onboarding.preferences.data.availability.noticePeriod)
              }
            }
          }
        }, { new: true });

        console.log('Updated user data successfully');
        processedCount++;

      } catch (error) {
        console.error(`Error processing user ${user.email}:`, error);
        errorCount++;
      }
    }

    console.log('\nProcessing Summary:');
    console.log('------------------');
    console.log(`Total users found: ${users.length}`);
    console.log(`Successfully processed: ${processedCount}`);
    console.log(`Skipped: ${skippedCount}`);
    console.log(`Errors: ${errorCount}`);

  } catch (error) {
    console.error('Error in main process:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the script
fillDummyOnboardingData(); 