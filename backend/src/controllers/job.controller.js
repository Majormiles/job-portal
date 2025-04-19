import Job from '../models/job.model.js';
import Application from '../models/application.model.js';
import cloudinary from '../utils/cloudinary.js';
import notificationService from '../services/notificationService.js';

// @desc    Create a new job
// @route   POST /api/jobs
// @access  Private (Employers only)
export const createJob = async (req, res) => {
  try {
    req.body.company = req.user.id;

    // Handle image upload if provided
    if (req.body.image) {
      try {
        // Upload image to Cloudinary
        const imageUploadResult = await cloudinary.uploader.upload(req.body.image, {
          folder: 'job-portal/jobs',
          width: 800,
          crop: 'scale',
          resource_type: 'image',
          timeout: 60000 // 60 seconds timeout
        });
        
        // Add image data to request body
        req.body.image = {
          public_id: imageUploadResult.public_id,
          url: imageUploadResult.secure_url
        };
      } catch (error) {
        console.error('Cloudinary upload error:', error);
        return res.status(500).json({
          success: false,
          message: 'Image upload failed. Please try again.'
        });
      }
    }

    const job = await Job.create(req.body);

    // Send notification to all users about the new job
    try {
      await notificationService.sendJobNotification(
        job._id.toString(),
        job.title,
        `New job posted: ${job.title}`,
        // Optional: specific user IDs to notify
      );
      console.log('Job creation notification sent successfully');
    } catch (error) {
      console.error('Failed to send job notification:', error);
      // Don't fail the API call if notification fails
    }

    res.status(201).json({
      success: true,
      data: job
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating job',
      error: error.message
    });
  }
};

// @desc    Get all jobs
// @route   GET /api/jobs
// @access  Public
export const getJobs = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, type, location, experience } = req.query;
    const query = { status: 'active' };

    // Add search functionality
    if (search) {
      query.$text = { $search: search };
    }

    // Add filters
    if (type) query.type = type;
    if (location) query.location = new RegExp(location, 'i');
    if (experience) query.experience = experience;

    const jobs = await Job.find(query)
      .populate('company', 'name profilePicture')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Job.countDocuments(query);

    res.json({
      success: true,
      data: jobs,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching jobs',
      error: error.message
    });
  }
};

// @desc    Get single job
// @route   GET /api/jobs/:id
// @access  Public
export const getJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('company', 'name profilePicture')
      .populate('applications', 'status createdAt');

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    res.json({
      success: true,
      data: job
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching job',
      error: error.message
    });
  }
};

// @desc    Update job
// @route   PUT /api/jobs/:id
// @access  Private (Employers only)
export const updateJob = async (req, res) => {
  try {
    let job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Make sure user is job owner
    if (job.company.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this job'
      });
    }
    
    // Handle image upload for updates
    if (req.body.image && req.body.image !== job.image?.url) {
      try {
        // If there's an existing image, delete it first
        if (job.image && job.image.public_id) {
          await cloudinary.uploader.destroy(job.image.public_id);
        }
        
        // Upload new image
        const imageUploadResult = await cloudinary.uploader.upload(req.body.image, {
          folder: 'job-portal/jobs',
          width: 800,
          crop: 'scale',
          resource_type: 'image',
          timeout: 60000 // 60 seconds timeout
        });
        
        // Update image data in request body
        req.body.image = {
          public_id: imageUploadResult.public_id,
          url: imageUploadResult.secure_url
        };
      } catch (error) {
        console.error('Cloudinary upload error:', error);
        return res.status(500).json({
          success: false,
          message: 'Image upload failed. Please try again.'
        });
      }
    } else if (req.body.image === '') {
      // If image field is empty, remove the image
      if (job.image && job.image.public_id) {
        try {
          await cloudinary.uploader.destroy(job.image.public_id);
        } catch (error) {
          console.error('Error deleting image from Cloudinary:', error);
        }
        req.body.image = null;
      }
    } else {
      // If no new image is provided, preserve the existing image
      delete req.body.image;
    }

    job = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    // Send notification about job update
    try {
      await notificationService.sendJobNotification(
        job._id.toString(),
        job.title,
        `Job updated: ${job.title}`,
        // Only notify users who have applied to this job
        job.applications ? job.applications.map(app => app.applicant.toString()) : []
      );
      console.log('Job update notification sent successfully');
    } catch (error) {
      console.error('Failed to send job update notification:', error);
      // Don't fail the API call if notification fails
    }

    res.json({
      success: true,
      data: job
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating job',
      error: error.message
    });
  }
};

// @desc    Delete job
// @route   DELETE /api/jobs/:id
// @access  Private (Employers only)
export const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Make sure user is job owner
    if (job.company.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this job'
      });
    }

    await job.remove();

    res.json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting job',
      error: error.message
    });
  }
};

// @desc    Apply for a job
// @route   POST /api/jobs/:id/apply
// @access  Private
export const applyForJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if already applied
    const existingApplication = await Application.findOne({
      job: req.params.id,
      applicant: req.user.id
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this job'
      });
    }

    // Create application
    const application = await Application.create({
      job: req.params.id,
      applicant: req.user.id,
      coverLetter: req.body.coverLetter,
      resume: req.body.resume
    });

    // Add application to job's applications array
    job.applications.push(application._id);
    await job.save();

    res.status(201).json({
      success: true,
      data: application
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error applying for job',
      error: error.message
    });
  }
};

// @desc    Get employer's jobs
// @route   GET /api/jobs/employer/jobs
// @access  Private (Employers only)
export const getEmployerJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ company: req.user.id })
      .populate('applications', 'status createdAt')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: jobs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching employer jobs',
      error: error.message
    });
  }
};

// @desc    Get job types
// @route   GET /api/jobs/types
// @access  Public
export const getJobTypes = async (req, res) => {
  try {
    // These values should match the enum values in your job model
    const jobTypes = [
      { id: 'full-time', name: 'Full-time' },
      { id: 'part-time', name: 'Part-time' },
      { id: 'contract', name: 'Contract' },
      { id: 'temporary', name: 'Temporary' },
      { id: 'internship', name: 'Internship' },
      { id: 'remote', name: 'Remote' },
      { id: 'hybrid', name: 'Hybrid' },
      { id: 'seasonal', name: 'Seasonal' },
      { id: 'freelance', name: 'Freelance' },
      { id: 'volunteer', name: 'Volunteer' }
    ];

    res.json({
      success: true,
      data: jobTypes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching job types',
      error: error.message
    });
  }
}; 