import JobType from '../models/jobType.model.js';

/**
 * Get all job types
 * @route   GET /api/job-types
 * @access  Public
 */
export const getJobTypes = async (req, res) => {
  try {
    const jobTypes = await JobType.find({ isActive: true }).sort('name');
    
    res.json({
      success: true,
      count: jobTypes.length,
      data: jobTypes
    });
  } catch (error) {
    console.error('Error fetching job types:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching job types'
    });
  }
};

/**
 * Get job type by ID
 * @route   GET /api/job-types/:id
 * @access  Public
 */
export const getJobType = async (req, res) => {
  try {
    const jobType = await JobType.findById(req.params.id);
    
    if (!jobType) {
      return res.status(404).json({
        success: false,
        message: 'Job type not found'
      });
    }
    
    res.json({
      success: true,
      data: jobType
    });
  } catch (error) {
    console.error('Error fetching job type:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching job type'
    });
  }
};

/**
 * Create a new job type
 * @route   POST /api/job-types
 * @access  Admin only
 */
export const createJobType = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    // Check if job type already exists
    const existingJobType = await JobType.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    
    if (existingJobType) {
      return res.status(400).json({
        success: false,
        message: 'Job type already exists'
      });
    }
    
    // Create new job type
    const jobType = await JobType.create({
      name,
      description,
      createdBy: req.user.id
    });
    
    res.status(201).json({
      success: true,
      data: jobType,
      message: 'Job type created successfully'
    });
  } catch (error) {
    console.error('Error creating job type:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating job type'
    });
  }
};

/**
 * Update a job type
 * @route   PUT /api/job-types/:id
 * @access  Admin only
 */
export const updateJobType = async (req, res) => {
  try {
    const { name, description, isActive } = req.body;
    
    // Find job type to update
    let jobType = await JobType.findById(req.params.id);
    
    if (!jobType) {
      return res.status(404).json({
        success: false,
        message: 'Job type not found'
      });
    }
    
    // Check if new name already exists (if name is being changed)
    if (name && name !== jobType.name) {
      const existingJobType = await JobType.findOne({ 
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        _id: { $ne: req.params.id }
      });
      
      if (existingJobType) {
        return res.status(400).json({
          success: false,
          message: 'Job type with this name already exists'
        });
      }
    }
    
    // Update job type
    jobType = await JobType.findByIdAndUpdate(
      req.params.id,
      { 
        name: name || jobType.name,
        description: description || jobType.description,
        isActive: isActive !== undefined ? isActive : jobType.isActive,
        updatedBy: req.user.id,
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    );
    
    res.json({
      success: true,
      data: jobType,
      message: 'Job type updated successfully'
    });
  } catch (error) {
    console.error('Error updating job type:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating job type'
    });
  }
};

/**
 * Delete a job type
 * @route   DELETE /api/job-types/:id
 * @access  Admin only
 */
export const deleteJobType = async (req, res) => {
  try {
    const jobType = await JobType.findById(req.params.id);
    
    if (!jobType) {
      return res.status(404).json({
        success: false,
        message: 'Job type not found'
      });
    }
    
    await jobType.deleteOne();
    
    res.json({
      success: true,
      data: {},
      message: 'Job type deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting job type:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting job type'
    });
  }
};

/**
 * Search job types
 * @route   GET /api/job-types/search
 * @access  Public
 */
export const searchJobTypes = async (req, res) => {
  try {
    const { query } = req.query;
    
    const jobTypes = await JobType.find({
      name: { $regex: query, $options: 'i' },
      isActive: true
    }).sort('name');
    
    res.json({
      success: true,
      count: jobTypes.length,
      data: jobTypes
    });
  } catch (error) {
    console.error('Error searching job types:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while searching job types'
    });
  }
};

/**
 * Initialize default job types
 * @route   POST /api/job-types/initialize
 * @access  Admin only
 */
export const initializeJobTypes = async (req, res) => {
  try {
    const defaultJobTypes = [
      { name: 'Full-time', description: 'Standard full-time employment' },
      { name: 'Part-time', description: 'Part-time employment with reduced hours' },
      { name: 'Contract', description: 'Fixed-term contract work' },
      { name: 'Temporary', description: 'Short-term temporary position' },
      { name: 'Internship', description: 'Learning opportunity for students/graduates' },
      { name: 'Remote', description: 'Work from anywhere position' },
      { name: 'Hybrid', description: 'Combination of remote and in-office work' },
      { name: 'Seasonal', description: 'Work available during specific seasons' },
      { name: 'Freelance', description: 'Independent contractor position' },
      { name: 'Volunteer', description: 'Unpaid volunteer work' }
    ];
    
    for (const type of defaultJobTypes) {
      await JobType.findOneAndUpdate(
        { name: type.name },
        { 
          ...type,
          isActive: true,
          createdBy: req.user.id,
          updatedBy: req.user.id
        },
        { upsert: true, new: true }
      );
    }
    
    const jobTypes = await JobType.find().sort('name');
    
    res.status(201).json({
      success: true,
      count: jobTypes.length,
      data: jobTypes,
      message: 'Default job types initialized successfully'
    });
  } catch (error) {
    console.error('Error initializing job types:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while initializing job types'
    });
  }
}; 