const mongoose = require('mongoose');
const Onboarding = require('../models/onboarding.model');
const User = require('../models/user.model');
require('dotenv').config();

const isValidGhanaPhone = (phone) => {
  if (!phone) return false;
  const phoneStr = String(phone).replace(/\s+/g, ''); // Remove any spaces
  return /^0[2-9][0-9]{8}$/.test(phoneStr);
};

const validateAddress = (address) => {
  if (!address) return false;
  const requiredFields = ['street', 'city', 'state', 'zipCode'];
  return requiredFields.every(field => 
    address[field] && address[field].trim()
  );
};

const fixOnboardingDataStructure = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all onboarding documents
    const onboardingDocs = await Onboarding.find({});
    console.log(`Found ${onboardingDocs.length} onboarding documents to process`);

    let fixedCount = 0;
    let errorCount = 0;

    for (const doc of onboardingDocs) {
      try {
        console.log(`\nProcessing onboarding document for user: ${doc.user}`);
        
        // Start a session for transaction
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
          // Fix personal info structure
          if (doc.personalInfo) {
            const personalData = doc.personalInfo.data || {};
            
            // Ensure proper data structure
            doc.personalInfo = {
              completed: false,
              data: {
                phone: personalData.phone || '',
                address: {
                  street: personalData.address?.street || '',
                  city: personalData.address?.city || '',
                  state: personalData.address?.state || '',
                  zipCode: personalData.address?.zipCode || '',
                  country: personalData.address?.country || 'Ghana'
                },
                dateOfBirth: personalData.dateOfBirth || null,
                profilePicture: personalData.profilePicture || null
              }
            };

            // Validate and update completion status
            const validationIssues = [];
            if (!isValidGhanaPhone(personalData.phone)) {
              validationIssues.push('Invalid phone number');
            }
            if (!validateAddress(personalData.address)) {
              validationIssues.push('Invalid address');
            }
            doc.personalInfo.completed = validationIssues.length === 0;
            console.log(`Personal info validation: ${doc.personalInfo.completed ? 'Valid' : 'Invalid'}`);
          }

          // Fix professional info structure
          if (doc.professionalInfo) {
            const profData = doc.professionalInfo.data || {};
            
            // Ensure proper data structure
            doc.professionalInfo = {
              completed: false,
              data: {
                experience: {
                  currentRole: profData.experience?.currentRole || '',
                  yearsOfExperience: profData.experience?.yearsOfExperience || '',
                  company: profData.experience?.company || '',
                  desiredRole: profData.experience?.desiredRole || '',
                  industry: profData.experience?.industry || ''
                },
                education: {
                  degree: profData.education?.degree || '',
                  institution: profData.education?.institution || '',
                  graduationYear: profData.education?.graduationYear || '',
                  field: profData.education?.field || ''
                },
                resume: profData.resume || null
              }
            };

            // Validate and update completion status
            const validationIssues = [];
            if (!profData.experience?.currentRole || 
                !profData.experience?.yearsOfExperience || 
                !profData.experience?.company) {
              validationIssues.push('Missing required professional info');
            }
            doc.professionalInfo.completed = validationIssues.length === 0;
            console.log(`Professional info validation: ${doc.professionalInfo.completed ? 'Valid' : 'Invalid'}`);
          }

          // Fix skills structure
          if (doc.skills) {
            const skillsData = doc.skills.data || {};
            
            // Ensure proper data structure
            doc.skills = {
              completed: false,
              data: {
                technical: Array.isArray(skillsData.technical) ? skillsData.technical : [],
                soft: Array.isArray(skillsData.soft) ? skillsData.soft : [],
                languages: Array.isArray(skillsData.languages) ? skillsData.languages : [],
                certifications: Array.isArray(skillsData.certifications) ? skillsData.certifications : []
              }
            };

            // Validate and update completion status
            doc.skills.completed = !!(skillsData.technical?.length || 
                                    skillsData.soft?.length || 
                                    skillsData.languages?.length || 
                                    skillsData.certifications?.length);
            console.log(`Skills validation: ${doc.skills.completed ? 'Valid' : 'Invalid'}`);
          }

          // Fix preferences structure
          if (doc.preferences) {
            const prefsData = doc.preferences.data || {};
            
            // Ensure proper data structure
            doc.preferences = {
              completed: false,
              data: {
                workPreferences: {
                  workArrangement: prefsData.workPreferences?.workArrangement || '',
                  workSchedule: prefsData.workPreferences?.workSchedule || '',
                  workCulture: prefsData.workPreferences?.workCulture || ''
                },
                jobPreferences: {
                  desiredRole: prefsData.jobPreferences?.desiredRole || '',
                  desiredSalary: prefsData.jobPreferences?.desiredSalary || '',
                  desiredLocation: prefsData.jobPreferences?.desiredLocation || '',
                  jobType: prefsData.jobPreferences?.jobType || ''
                },
                industryPreferences: Array.isArray(prefsData.industryPreferences) ? 
                  prefsData.industryPreferences : [],
                workCulture: Array.isArray(prefsData.workCulture) ? 
                  prefsData.workCulture : [],
                benefits: Array.isArray(prefsData.benefits) ? 
                  prefsData.benefits : [],
                availability: prefsData.availability || {}
              }
            };

            // Validate and update completion status
            doc.preferences.completed = !!(prefsData.workPreferences?.workArrangement && 
                                         prefsData.industryPreferences?.length);
            console.log(`Preferences validation: ${doc.preferences.completed ? 'Valid' : 'Invalid'}`);
          }

          // Update overall completion status
          const allSectionsComplete = 
            doc.personalInfo?.completed && 
            doc.professionalInfo?.completed && 
            doc.skills?.completed && 
            doc.preferences?.completed;

          doc.isComplete = allSectionsComplete;
          if (allSectionsComplete && !doc.completedAt) {
            doc.completedAt = new Date();
          }

          console.log(`Overall completion status: ${doc.isComplete ? 'Complete' : 'Incomplete'}`);

          // Save the updated document
          await doc.save({ session });

          // Update user's onboarding status
          const userUpdate = {
            'onboardingStatus.isComplete': doc.isComplete,
            'onboardingStatus.completedAt': doc.isComplete ? doc.completedAt : null,
            'onboardingStatus.updatedAt': new Date(),
            'onboardingStatus.personalInfo': doc.personalInfo?.completed || false,
            'onboardingStatus.professionalInfo': doc.professionalInfo?.completed || false,
            'onboardingStatus.skills': doc.skills?.completed || false,
            'onboardingStatus.preferences': doc.preferences?.completed || false
          };

          await User.findByIdAndUpdate(doc.user, userUpdate, { session });
          console.log('Updated user status');

          await session.commitTransaction();
          fixedCount++;
          console.log('Document processed successfully');
        } catch (error) {
          await session.abortTransaction();
          throw error;
        } finally {
          session.endSession();
        }
      } catch (error) {
        console.error(`Error processing document ${doc._id}:`, error);
        errorCount++;
      }
    }

    console.log('\n=== Fix Summary ===');
    console.log(`Total documents processed: ${onboardingDocs.length}`);
    console.log(`Documents fixed: ${fixedCount}`);
    console.log(`Errors encountered: ${errorCount}`);

  } catch (error) {
    console.error('Error during fix process:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the fix script
fixOnboardingDataStructure().then(() => {
  console.log('\nFix process complete');
  process.exit(0);
}).catch(error => {
  console.error('Fix process failed:', error);
  process.exit(1);
}); 