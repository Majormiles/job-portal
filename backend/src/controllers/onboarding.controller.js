import Onboarding from '../models/onboarding.model.js';
import User from '../models/user.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/appError.js';
import debug from '../utils/debug.js';
import path from 'path';
import { fileURLToPath } from 'url';
import cloudinary from '../config/cloudinary.js';
import fs from 'fs';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure Cloudinary
const cloudinaryConfig = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
};

console.log('=== CLOUDINARY CONFIGURATION ===');
console.log('Cloud name:', cloudinaryConfig.cloud_name);
console.log('API Key:', cloudinaryConfig.api_key);
console.log('API Secret:', cloudinaryConfig.api_secret ? 'Set' : 'Not set');

// Configure Cloudinary
cloudinary.config(cloudinaryConfig);

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created uploads directory:', uploadsDir);
}

// Verify uploads directory permissions
try {
  const stats = fs.statSync(uploadsDir);
  console.log('Uploads directory stats:', {
    path: uploadsDir,
    exists: true,
    isDirectory: stats.isDirectory(),
    permissions: stats.mode,
    writable: fs.accessSync(uploadsDir, fs.constants.W_OK) ? 'Yes' : 'No'
  });
} catch (error) {
  console.error('Error checking uploads directory:', error);
}

// Helper function to upload file to Cloudinary
const uploadToCloudinary = async (file, folder = 'job-portal') => {
  try {
    console.log('=== CLOUDINARY UPLOAD START ===');
    console.log('File details:', {
      path: file.path,
      folder: folder,
      fileSize: file.size,
      mimetype: file.mimetype,
      originalname: file.originalname,
      fieldname: file.fieldname
    });

    // Verify file exists
    if (!file.path) {
      throw new Error('File path is missing');
    }

    // Verify file is readable
    if (!fs.existsSync(file.path)) {
      throw new Error('File does not exist at path: ' + file.path);
    }

    // Read file stats
    const stats = fs.statSync(file.path);
    if (!stats.isFile()) {
      throw new Error('Path exists but is not a file');
    }
    if (stats.size === 0) {
      throw new Error('File exists but is empty');
    }

    console.log('File verified:', {
      size: stats.size,
      isFile: stats.isFile(),
      permissions: stats.mode
    });

    // Upload to Cloudinary
    console.log('Starting Cloudinary upload with config:', {
      cloud_name: cloudinary.config().cloud_name,
      api_key: cloudinary.config().api_key,
      folder: folder
    });

    const uploadOptions = {
      folder: folder,
      resource_type: 'raw',
      public_id: `resume-${Date.now()}`,
      format: 'pdf'
    };

    const result = await cloudinary.uploader.upload(file.path, uploadOptions);
    console.log('Cloudinary upload result:', result);

    // Clean up local file
    fs.unlinkSync(file.path);
    console.log('Local file cleaned up');

    return result.secure_url;
  } catch (error) {
    console.error('Error in uploadToCloudinary:', error);
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
      resumeUrl = await uploadToCloudinary(req.files.resume[0], 'resumes');
      console.log('File uploaded to Cloudinary:', resumeUrl);

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

        // Return response with resume URL
        const response = {
          success: true,
          data: {
            ...onboarding.toObject(),
            professionalInfo: {
              ...onboarding.professionalInfo,
              data: {
                ...onboarding.professionalInfo.data,
                resume: resumeUrl
              }
            }
          }
        };

        console.log('Response with resume URL:', JSON.stringify(response, null, 2));
        return res.status(200).json(response);
      }
    }

    // Update the section with new data if no file was uploaded
    if (!req.files || !req.files.resume) {
      onboarding[section] = {
        completed: true,
        data: {
          ...onboarding[section].data,
          ...data
        }
      };
    }

    // Check if all sections are complete
    const isComplete = onboarding.personalInfo.completed &&
      onboarding.professionalInfo.completed &&
      onboarding.skills.completed &&
      onboarding.preferences.completed;

    if (isComplete) {
      onboarding.isComplete = true;
      onboarding.completedAt = new Date();

      // Update user's onboarding status
      await User.findByIdAndUpdate(userId, {
        onboardingComplete: true,
        onboardingCompletedAt: onboarding.completedAt
      });
    }

    // Save the updated onboarding document
    await onboarding.save();

    // Get the updated user to include the resume URL
    const updatedUser = await User.findById(userId);

    // Return response with resume URL
    const response = {
      success: true,
      data: {
        ...onboarding.toObject(),
        professionalInfo: {
          ...onboarding.professionalInfo,
          data: {
            ...onboarding.professionalInfo.data,
            resume: resumeUrl || updatedUser?.professionalInfo?.resume || null
          }
        }
      }
    };

    console.log('Response with resume URL:', JSON.stringify(response, null, 2));
    res.status(200).json(response);
  } catch (error) {
    console.error('Error in updateOnboardingSection:', error);
    next(error);
  }
});

// @desc    Complete onboarding
// @route   POST /api/users/onboarding/complete
// @access  Private
export const completeOnboarding = async (req, res, next) => {
  try {
    const userId = req.user._id;
    debug.logRequest(req);

    // Find onboarding document
    const onboarding = await Onboarding.findOne({ user: userId });
    if (!onboarding) {
      debug.logError(new Error('Onboarding document not found'), { userId });
      return next(new AppError('Onboarding document not found', 404));
    }

    // Check if all required sections are complete
    const requiredSections = ['personalInfo', 'professionalInfo', 'skills', 'preferences'];
    const sectionStatus = {};
    
    requiredSections.forEach(section => {
      sectionStatus[section] = {
        completed: onboarding[section]?.completed,
        hasData: !!onboarding[section]?.data
      };
    });

    debug.logValidation('completion status', sectionStatus, null);

    const allSectionsComplete = requiredSections.every(section => 
      onboarding[section]?.completed && onboarding[section]?.data
    );

    if (!allSectionsComplete) {
      debug.logError(new Error('Incomplete sections'), sectionStatus);
      return next(new AppError('All sections must be completed before finishing onboarding', 400));
    }

    // Update both onboarding and user status in a transaction
    const session = await Onboarding.startSession();
    session.startTransaction();

    try {
      // Update onboarding status
      onboarding.isComplete = true;
      onboarding.completedAt = new Date();
      
      debug.logDBOperation('update', 'Onboarding', 
        { user: userId },
        { isComplete: true, completedAt: new Date() }
      );
      
      await onboarding.save({ session });

      // Update user's onboarding status with all sections
      const userUpdate = {
        'onboardingStatus.isComplete': true,
        'onboardingStatus.completedAt': new Date(),
        'onboardingStatus.updatedAt': new Date()
      };

      // Add individual section statuses
      requiredSections.forEach(section => {
        userUpdate[`onboardingStatus.${section}`] = true;
      });

      debug.logDBOperation('update', 'User',
        { _id: userId },
        userUpdate
      );

      await User.findByIdAndUpdate(
        userId,
        userUpdate,
        { session }
      );

      await session.commitTransaction();

      res.status(200).json({
        success: true,
        data: {
          isComplete: true,
          completedAt: onboarding.completedAt,
          sections: sectionStatus
        }
      });
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } catch (error) {
    debug.logError(error, { userId: req.user._id });
    next(new AppError('Error completing onboarding', 500));
  }
}; 