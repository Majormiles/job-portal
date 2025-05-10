import CompanyType from '../models/companyType.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/appError.js';

// @desc    Create a new company type
// @route   POST /api/company-types
// @access  Private/Admin
export const createCompanyType = asyncHandler(async (req, res, next) => {
  const { name, description, icon, order } = req.body;

  // Generate _id from name if not provided
  const _id = req.body._id || CompanyType.nameToId(name);

  // Check if company type already exists
  const existingCompanyType = await CompanyType.findOne({ 
    $or: [{ _id }, { name }]
  });
  
  if (existingCompanyType) {
    return next(new AppError('Company type already exists', 400));
  }

  const companyType = await CompanyType.create({
    _id,
    name,
    description,
    icon,
    order
  });

  res.status(201).json({
    success: true,
    data: companyType
  });
});

// @desc    Get all company types
// @route   GET /api/company-types
// @access  Public
export const getCompanyTypes = asyncHandler(async (req, res, next) => {
  // Add pagination, filtering and sorting
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 30;
  const skip = (page - 1) * limit;

  const query = {};
  
  // Filter by active status if provided
  if (req.query.isActive) {
    query.isActive = req.query.isActive === 'true';
  }

  // Count total documents for pagination
  const total = await CompanyType.countDocuments(query);
  
  // Get company types
  const companyTypes = await CompanyType.find(query)
    .sort({ order: 1, name: 1 })
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    success: true,
    count: companyTypes.length,
    pagination: {
      total,
      page,
      pages: Math.ceil(total / limit),
      limit
    },
    data: companyTypes
  });
});

// @desc    Get single company type
// @route   GET /api/company-types/:id
// @access  Public
export const getCompanyType = asyncHandler(async (req, res, next) => {
  const companyType = await CompanyType.findById(req.params.id);

  if (!companyType) {
    return next(new AppError('Company type not found', 404));
  }

  res.status(200).json({
    success: true,
    data: companyType
  });
});

// @desc    Update company type
// @route   PUT /api/company-types/:id
// @access  Private/Admin
export const updateCompanyType = asyncHandler(async (req, res, next) => {
  const { name, description, icon, isActive, order } = req.body;

  // If updating name, check if new name already exists
  if (name) {
    const existingCompanyType = await CompanyType.findOne({
      name,
      _id: { $ne: req.params.id }
    });
    
    if (existingCompanyType) {
      return next(new AppError('Company type with this name already exists', 400));
    }
  }

  const companyType = await CompanyType.findByIdAndUpdate(
    req.params.id,
    { name, description, icon, isActive, order },
    { new: true, runValidators: true }
  );

  if (!companyType) {
    return next(new AppError('Company type not found', 404));
  }

  res.status(200).json({
    success: true,
    data: companyType
  });
});

// @desc    Delete company type
// @route   DELETE /api/company-types/:id
// @access  Private/Admin
export const deleteCompanyType = asyncHandler(async (req, res, next) => {
  const companyType = await CompanyType.findById(req.params.id);

  if (!companyType) {
    return next(new AppError('Company type not found', 404));
  }

  await companyType.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Initialize default company types
// @route   POST /api/company-types/initialize
// @access  Private/Admin
export const initializeCompanyTypes = asyncHandler(async (req, res, next) => {
  const defaultCompanyTypes = [
    { _id: 'corporation', name: 'Corporation', order: 1 },
    { _id: 'limited-liability', name: 'Limited Liability Company (LLC)', order: 2 },
    { _id: 'partnership', name: 'Partnership', order: 3 },
    { _id: 'sole-proprietorship', name: 'Sole Proprietorship', order: 4 },
    { _id: 'non-profit', name: 'Non-Profit Organization', order: 5 },
    { _id: 'startup', name: 'Startup', order: 6 },
    { _id: 'government', name: 'Government Agency', order: 7 },
    { _id: 'educational', name: 'Educational Institution', order: 8 },
    { _id: 'other', name: 'Other', order: 9 }
  ];

  // Create a batch operation for inserting company types
  const operations = [];

  for (const companyType of defaultCompanyTypes) {
    operations.push({
      updateOne: {
        filter: { _id: companyType._id },
        update: { 
          $set: { 
            _id: companyType._id,
            name: companyType.name, 
            order: companyType.order,
            isActive: true 
          } 
        },
        upsert: true
      }
    });
  }

  // Execute bulk operation
  await CompanyType.bulkWrite(operations);

  // Get all company types after initialization
  const companyTypes = await CompanyType.find().sort({ order: 1, name: 1 });

  res.status(200).json({
    success: true,
    count: companyTypes.length,
    data: companyTypes
  });
});

// @desc    Search company types
// @route   GET /api/company-types/search
// @access  Public
export const searchCompanyTypes = asyncHandler(async (req, res, next) => {
  const { query } = req.query;
  
  if (!query) {
    return next(new AppError('Please provide a search query', 400));
  }
  
  // Create a regex for case-insensitive search
  const searchRegex = new RegExp(query, 'i');
  
  const companyTypes = await CompanyType.find({
    $or: [
      { name: searchRegex },
      { description: searchRegex }
    ],
    isActive: true
  }).limit(10);

  res.status(200).json({
    success: true,
    count: companyTypes.length,
    data: companyTypes
  });
}); 