const Job = require('../models/job.model');
const Application = require('../models/application.model');

// @desc    Create a new job
// @route   POST /api/jobs
// @access  Private (Employers only)
exports.createJob = async (req, res) => {
  try {
    req.body.company = req.user.id;

    const job = await Job.create(req.body);

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
exports.getJobs = async (req, res) => {
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
exports.getJob = async (req, res) => {
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
exports.updateJob = async (req, res) => {
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

    job = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

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
exports.deleteJob = async (req, res) => {
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
exports.applyForJob = async (req, res) => {
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

    // Add application to job
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
exports.getEmployerJobs = async (req, res) => {
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