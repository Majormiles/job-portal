import Onboarding from '../models/onboarding.model.js';
import User from '../models/user.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/appError.js';
import debug from '../utils/debug.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import localFileStorage from '../utils/localFileStorage.js';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created uploads directory:', uploadsDir);
}

// Initialize local storage
localFileStorage.initLocalStorage();

// Helper function to upload file to local storage
const uploadToLocalStorage = async (file, userId) => {
  try {
    console.log('=== LOCAL STORAGE UPLOAD START ===');
    console.log('File details:', {
      path: file.path,
      fileSize: file.size,
      mimetype: file.mimetype,
      originalname: file.originalname,
      fieldname: file.fieldname
    });

    // Verify file exists
    if (!file.path) {
      throw new Error('File path is missing');
    }

    // Validate file
    localFileStorage.validateFile(file, 
      [localFileStorage.SUPPORTED_FILE_TYPES.pdf], 
      5 * 1024 * 1024
    );

    // Save file to local storage
    const fileInfo = await localFileStorage.saveFileToLocal(file, 'resumes', userId);
    console.log('File saved to local storage:', fileInfo);

    return fileInfo.url;
  } catch (error) {
    console.error('Error in uploadToLocalStorage:', error);
    throw error;
  }
};

// @desc    Get onboarding status
// @route   GET /api/users/onboarding-status
// @access  Private
export const getOnboardingStatus = asyncHandler(async (req, res, next) => {
  try {
    // Check if user exists in request
    if (!req.user) {
      console.error('No user found in request');
      return next(new AppError('User not authenticated', 401));
    }

    const userId = req.user._id;

    // Get onboarding status and user data concurrently
    const [onboarding, user] = await Promise.all([
      Onboarding.findOne({ user: userId }),
      User.findById(userId)
    ]);

    if (!onboarding) {
      return res.status(200).json({
        success: true,
        data: {
          personalInfo: { completed: false },
          professionalInfo: { completed: false, data: { resume: null } },
          skills: { completed: false },
          preferences: { completed: false },
          isComplete: false
        }
      });
    }

    // Return response with resume URL from user profile
    const response = {
      success: true,
      data: {
        ...onboarding.toObject(),
        professionalInfo: {
          ...onboarding.professionalInfo,
          data: {
            ...onboarding.professionalInfo.data,
            resume: user?.professionalInfo?.resume || null
          }
        }
      }
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error in getOnboardingStatus:', error);
    next(error);
  }
});

// @desc    Get onboarding data
// @route   GET /api/users/onboarding
// @access  Private
export const getOnboardingData = asyncHandler(async (req, res, next) => {
  try {
    const onboarding = await Onboarding.findOne({ user: req.user._id });
    
    if (!onboarding) {
      return next(new AppError('Onboarding data not found', 404));
    }

    res.status(200).json({
      success: true,
      data: onboarding
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update onboarding section
// @route   PUT /api/users/onboarding/:section
// @access  Private
export const updateOnboardingSection = asyncHandler(async (req, res, next) => {
  try {
    const { section } = req.params;
    const userId = req.user._id;

    console.log('=== UPDATE ONBOARDING SECTION ===');
    console.log('Section:', section);
    console.log('User ID:', userId);
    console.log('Files:', req.files);
    console.log('Body:', req.body);

    // Special handling for the 'complete' section - direct to completeOnboarding
    if (section === 'complete') {
      return completeOnboarding(req, res, next);
    }

    // Parse the data from the request body
    let data;
    try {
      data = typeof req.body.data === 'string' ? JSON.parse(req.body.data) : req.body.data;
    } catch (error) {
      console.error('Error parsing request body:', error);
      data = req.body.data;
    }

    // Check if onboarding document exists
    let onboarding = await Onboarding.findOne({ user: userId });
    if (!onboarding) {
      onboarding = await Onboarding.create({
        user: userId,
        personalInfo: { completed: false },
        professionalInfo: { completed: false, data: { resume: null } },
        skills: { completed: false },
        preferences: { completed: false }
      });
    }

    // Initialize professionalInfo if it doesn't exist
    if (!onboarding.professionalInfo) {
      onboarding.professionalInfo = { completed: false, data: { resume: null } };
    }
    if (!onboarding.professionalInfo.data) {
      onboarding.professionalInfo.data = { resume: null };
    }

    let resumeUrl = null;

    // Handle file upload if present
    if (req.files && req.files.resume) {
      console.log('Processing file upload:', req.files.resume[0]);
      resumeUrl = await uploadToLocalStorage(req.files.resume[0], userId);
      console.log('File uploaded to local storage:', resumeUrl);

      if (section === 'professionalInfo') {
        // Parse the data field if present
        let professionalData = {};
        if (data) {
          try {
            professionalData = typeof data === 'string' ? JSON.parse(data) : data;
          } catch (error) {
            console.error('Error parsing professional data:', error);
            professionalData = data;
          }
        }

        // Update user's professional info with resume URL and other data
        const updatedUser = await User.findByIdAndUpdate(
          userId,
          {
            $set: {
              'professionalInfo.resume': resumeUrl,
              'professionalInfo.currentTitle': professionalData.experience?.currentRole,
              'professionalInfo.yearsOfExperience': parseInt(professionalData.experience?.yearsOfExperience),
              'professionalInfo.currentCompany': professionalData.experience?.company,
              'professionalInfo.desiredTitle': professionalData.experience?.desiredRole
            }
          },
          { new: true }
        );
        console.log('Updated user with resume URL:', updatedUser);

        // Update onboarding document with resume URL and professional data
        onboarding.professionalInfo = {
          completed: true,
          data: {
            ...onboarding.professionalInfo.data,
            ...professionalData,
            resume: resumeUrl
          }
        };

        // Save the updated onboarding document
        await onboarding.save();
        console.log('Updated onboarding document:', onboarding);

        return res.status(200).json({
          success: true,
          data: {
            professionalInfo: onboarding.professionalInfo
          }
        });
      }
    }

    // Handle other section updates
    if (section === 'personalInfo') {
      onboarding.personalInfo = {
        completed: true,
        data: data
      };

      // If profile picture was uploaded, update it
      if (req.file) {
        // Save profile picture to local storage
        const fileInfo = await localFileStorage.saveFileToLocal(
          req.file, 
          'profiles', 
          userId
        );
        
        // Update user profile with profile picture URL
        await User.findByIdAndUpdate(
          userId,
          { 
            $set: { 
              'personalInfo.profilePicture': fileInfo.url,
              'personalInfo.firstName': data.firstName,
              'personalInfo.lastName': data.lastName,
              'personalInfo.email': data.email,
              'personalInfo.phone': data.phone,
              'personalInfo.location': data.location
            } 
          }
        );

        // Update onboarding data with profile picture URL
        onboarding.personalInfo.data.profilePicture = fileInfo.url;
      }
    } else if (section === 'skills') {
      onboarding.skills = {
        completed: true,
        data: data
      };
    } else if (section === 'preferences') {
      onboarding.preferences = {
        completed: true,
        data: data
      };
    }

    await onboarding.save();

    res.status(200).json({
      success: true,
      data: {
        [section]: onboarding[section]
      }
    });
  } catch (error) {
    console.error(`Error updating ${req.params.section}:`, error);
    next(error);
  }
});

// @desc    Complete onboarding
// @route   POST /api/users/onboarding/complete
// @access  Private
export const completeOnboarding = asyncHandler(async (req, res, next) => {
  try {
    const userId = req.user._id;
    
    // Update onboarding document
    const onboarding = await Onboarding.findOneAndUpdate(
      { user: userId },
      { isComplete: true },
      { new: true, runValidators: true }
    );
    
    if (!onboarding) {
      return next(new AppError('Onboarding document not found', 404));
    }
    
    // Update user document to mark onboarding as complete
    await User.findByIdAndUpdate(
      userId,
      { onboardingComplete: true }
    );
    
    res.status(200).json({
      success: true,
      data: {
        isComplete: true
      }
    });
  } catch (error) {
    next(error);
  }
}); 