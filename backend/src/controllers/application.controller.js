import Application from '../models/application.model.js';
import Job from '../models/job.model.js';
import notificationService from '../services/notificationService.js';

// @desc    Get all applications for a job
// @route   GET /api/applications/job/:jobId
// @access  Private (Employers only)
export const getJobApplications = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if user is the job owner
    if (job.company.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view these applications'
      });
    }

    const applications = await Application.find({ job: req.params.jobId })
      .populate('applicant', 'name email profilePicture')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: applications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching applications',
      error: error.message
    });
  }
};

// @desc    Get user's applications
// @route   GET /api/applications/my-applications
// @access  Private
export const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ applicant: req.user.id })
      .populate('job', 'title company location type')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: applications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching your applications',
      error: error.message
    });
  }
};

// @desc    Update application status
// @route   PUT /api/applications/:id/status
// @access  Private (Employers only)
export const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const application = await Application.findById(req.params.id)
      .populate('job')
      .populate('applicant', 'name email');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check if user is authorized to update this application
    if (application.job.company.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this application'
      });
    }

    application.status = status;
    application.statusUpdateDate = Date.now();
    await application.save();

    // Send notification to the applicant about status change
    try {
      await notificationService.sendApplicationStatusNotification(
        application._id.toString(),
        status,
        application.applicant._id.toString()
      );
      console.log(`Application status notification sent to ${application.applicant.name}`);
    } catch (error) {
      console.error('Failed to send application status notification:', error);
      // Don't fail the API call if notification fails
    }

    res.json({
      success: true,
      data: application
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating application status',
      error: error.message
    });
  }
};

// @desc    Get application details
// @route   GET /api/applications/:id
// @access  Private
export const getApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('job', 'title company location type')
      .populate('applicant', 'name email profilePicture');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check if user is authorized to view this application
    if (
      application.applicant.toString() !== req.user.id &&
      application.job.company.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this application'
      });
    }

    res.json({
      success: true,
      data: application
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching application',
      error: error.message
    });
  }
};

// @desc    Delete application
// @route   DELETE /api/applications/:id
// @access  Private
export const deleteApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('job')
      .populate('applicant');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check if user is authorized to delete this application
    if (
      application.applicant._id.toString() !== req.user.id &&
      application.job.company.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this application'
      });
    }

    // Remove application from job's applications array
    const job = await Job.findById(application.job._id);
    job.applications = job.applications.filter(
      app => app.toString() !== application._id.toString()
    );
    await job.save();

    await application.deleteOne();

    res.json({
      success: true,
      message: 'Application deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting application',
      error: error.message
    });
  }
}; 