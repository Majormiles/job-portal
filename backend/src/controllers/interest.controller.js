import Interest from '../models/interest.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/appError.js';

/**
 * Get all interests
 * @route   GET /api/interests
 * @access  Public
 */
export const getInterests = async (req, res) => {
  try {
    const interests = await Interest.find({ isActive: true }).sort('name');
    
    res.json({
      success: true,
      count: interests.length,
      data: interests
    });
  } catch (error) {
    console.error('Error fetching interests:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching interests'
    });
  }
};

/**
 * Get interest by ID
 * @route   GET /api/interests/:id
 * @access  Public
 */
export const getInterest = async (req, res) => {
  try {
    const interest = await Interest.findById(req.params.id);
    
    if (!interest) {
      return res.status(404).json({
        success: false,
        message: 'Interest not found'
      });
    }
    
    res.json({
      success: true,
      data: interest
    });
  } catch (error) {
    console.error('Error fetching interest:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching interest'
    });
  }
};

/**
 * Create a new interest
 * @route   POST /api/interests
 * @access  Admin only
 */
export const createInterest = async (req, res) => {
  try {
    const { name, description, category } = req.body;
    
    // Check if interest already exists
    const existingInterest = await Interest.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    
    if (existingInterest) {
      return res.status(400).json({
        success: false,
        message: 'Interest already exists'
      });
    }
    
    // Create new interest
    const interest = await Interest.create({
      name,
      description,
      category,
      createdBy: req.user.id
    });
    
    res.status(201).json({
      success: true,
      data: interest,
      message: 'Interest created successfully'
    });
  } catch (error) {
    console.error('Error creating interest:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating interest'
    });
  }
};

/**
 * Update an interest
 * @route   PUT /api/interests/:id
 * @access  Admin only
 */
export const updateInterest = async (req, res) => {
  try {
    const { name, description, category, isActive } = req.body;
    
    // Find interest to update
    let interest = await Interest.findById(req.params.id);
    
    if (!interest) {
      return res.status(404).json({
        success: false,
        message: 'Interest not found'
      });
    }
    
    // Check if new name already exists (if name is being changed)
    if (name && name !== interest.name) {
      const existingInterest = await Interest.findOne({ 
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        _id: { $ne: req.params.id }
      });
      
      if (existingInterest) {
        return res.status(400).json({
          success: false,
          message: 'Interest with this name already exists'
        });
      }
    }
    
    // Update interest
    interest = await Interest.findByIdAndUpdate(
      req.params.id,
      { 
        name: name || interest.name,
        description: description || interest.description,
        category: category || interest.category,
        isActive: isActive !== undefined ? isActive : interest.isActive,
        updatedBy: req.user.id,
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    );
    
    res.json({
      success: true,
      data: interest,
      message: 'Interest updated successfully'
    });
  } catch (error) {
    console.error('Error updating interest:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating interest'
    });
  }
};

/**
 * Delete an interest
 * @route   DELETE /api/interests/:id
 * @access  Admin only
 */
export const deleteInterest = async (req, res) => {
  try {
    const interest = await Interest.findById(req.params.id);
    
    if (!interest) {
      return res.status(404).json({
        success: false,
        message: 'Interest not found'
      });
    }
    
    await interest.deleteOne();
    
    res.json({
      success: true,
      data: {},
      message: 'Interest deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting interest:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting interest'
    });
  }
};

/**
 * Search interests
 * @route   GET /api/interests/search
 * @access  Public
 */
export const searchInterests = async (req, res) => {
  try {
    const { query } = req.query;
    
    const interests = await Interest.find({
      name: { $regex: query, $options: 'i' },
      isActive: true
    }).sort('name');
    
    res.json({
      success: true,
      count: interests.length,
      data: interests
    });
  } catch (error) {
    console.error('Error searching interests:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while searching interests'
    });
  }
};

/**
 * Initialize default interests
 * @route   POST /api/interests/initialize
 * @access  Admin only
 */
export const initializeInterests = async (req, res) => {
  try {
    const defaultInterests = [
      { name: 'Web Development', category: 'technical', description: 'Building websites and web applications' },
      { name: 'Mobile App Development', category: 'technical', description: 'Creating applications for mobile devices' },
      { name: 'Graphic Design', category: 'creative', description: 'Visual communication and problem-solving through typography, photography, and illustration' },
      { name: 'UI/UX Design', category: 'creative', description: 'Creating user interfaces and experiences for digital products' },
      { name: 'Digital Marketing', category: 'business', description: 'Marketing products or services using digital technologies' },
      { name: 'Data Analysis', category: 'technical', description: 'Inspecting, cleansing, transforming data to discover useful information' },
      { name: 'Business Administration', category: 'business', description: 'Managing business operations and making organizational decisions' },
      { name: 'Accounting & Finance', category: 'business', description: 'Managing financial records and transactions' },
      { name: 'Language & Communication', category: 'other', description: 'Developing language skills and communication techniques' },
      { name: 'Healthcare & Wellness', category: 'other', description: 'Promoting health and preventing disease' },
      { name: 'Culinary Arts', category: 'creative', description: 'Food preparation, cooking, and presentation' },
      { name: 'Fashion & Beauty', category: 'creative', description: 'Clothing design, fashion trends, and beauty techniques' },
      { name: 'Photography & Videography', category: 'creative', description: 'Capturing and editing still and moving images' },
      { name: 'Music Production', category: 'creative', description: 'Creating and recording musical compositions' },
      { name: 'Electrical Engineering', category: 'trade', description: 'Designing and building electrical systems and equipment' },
      { name: 'Mechanical Engineering', category: 'trade', description: 'Designing and manufacturing physical systems' },
      { name: 'Carpentry & Woodworking', category: 'trade', description: 'Working with wood to create structures or objects' },
      { name: 'Plumbing', category: 'trade', description: 'Installing and maintaining systems used for potable water, drainage, and sewage' },
      { name: 'Welding & Metalwork', category: 'trade', description: 'Joining, cutting, and shaping metal' },
      { name: 'Agriculture & Farming', category: 'trade', description: 'Cultivating plants and raising animals for food and other products' }
    ];
    
    for (const interest of defaultInterests) {
      await Interest.findOneAndUpdate(
        { name: interest.name },
        { 
          ...interest,
          isActive: true,
          createdBy: req.user.id,
          updatedBy: req.user.id
        },
        { upsert: true, new: true }
      );
    }
    
    const interests = await Interest.find().sort('name');
    
    res.status(201).json({
      success: true,
      count: interests.length,
      data: interests,
      message: 'Default interests initialized successfully'
    });
  } catch (error) {
    console.error('Error initializing interests:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while initializing interests'
    });
  }
}; 