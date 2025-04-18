import Location from '../models/location.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/appError.js';

// @desc    Create a new location
// @route   POST /api/locations
// @access  Private/Admin
export const createLocation = asyncHandler(async (req, res, next) => {
  const { name, region, country } = req.body;

  // Check if location already exists
  const existingLocation = await Location.findOne({ name, region });
  if (existingLocation) {
    return next(new AppError('Location already exists', 400));
  }

  const location = await Location.create({
    name,
    region,
    country: country || 'Ghana'
  });

  res.status(201).json({
    success: true,
    data: location
  });
});

// @desc    Get all locations
// @route   GET /api/locations
// @access  Public
export const getLocations = asyncHandler(async (req, res, next) => {
  // Add pagination, filtering and sorting
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 30;
  const skip = (page - 1) * limit;

  const query = {};
  
  // Filter by region if provided
  if (req.query.region) {
    query.region = req.query.region;
  }
  
  // Filter by country if provided
  if (req.query.country) {
    query.country = req.query.country;
  }
  
  // Filter by active status if provided
  if (req.query.isActive) {
    query.isActive = req.query.isActive === 'true';
  }

  // Count total documents for pagination
  const total = await Location.countDocuments(query);
  
  // Get locations
  const locations = await Location.find(query)
    .sort({ name: 1 })
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    success: true,
    count: locations.length,
    pagination: {
      total,
      page,
      pages: Math.ceil(total / limit),
      limit
    },
    data: locations
  });
});

// @desc    Get single location
// @route   GET /api/locations/:id
// @access  Public
export const getLocation = asyncHandler(async (req, res, next) => {
  const location = await Location.findById(req.params.id);

  if (!location) {
    return next(new AppError('Location not found', 404));
  }

  res.status(200).json({
    success: true,
    data: location
  });
});

// @desc    Update location
// @route   PUT /api/locations/:id
// @access  Private/Admin
export const updateLocation = asyncHandler(async (req, res, next) => {
  const { name, region, country, isActive } = req.body;

  // If updating name and region, check if new combination already exists
  if (name && region) {
    const existingLocation = await Location.findOne({
      name,
      region,
      _id: { $ne: req.params.id }
    });
    
    if (existingLocation) {
      return next(new AppError('Location with this name and region already exists', 400));
    }
  }

  const location = await Location.findByIdAndUpdate(
    req.params.id,
    { name, region, country, isActive },
    { new: true, runValidators: true }
  );

  if (!location) {
    return next(new AppError('Location not found', 404));
  }

  res.status(200).json({
    success: true,
    data: location
  });
});

// @desc    Delete location
// @route   DELETE /api/locations/:id
// @access  Private/Admin
export const deleteLocation = asyncHandler(async (req, res, next) => {
  const location = await Location.findById(req.params.id);

  if (!location) {
    return next(new AppError('Location not found', 404));
  }

  await location.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Search locations
// @route   GET /api/locations/search
// @access  Public
export const searchLocations = asyncHandler(async (req, res, next) => {
  const { query } = req.query;
  
  if (!query) {
    return next(new AppError('Please provide a search query', 400));
  }
  
  // Create a regex for case-insensitive search
  const searchRegex = new RegExp(query, 'i');
  
  const locations = await Location.find({
    $or: [
      { name: searchRegex },
      { region: searchRegex },
      { country: searchRegex }
    ],
    isActive: true
  }).limit(10);

  res.status(200).json({
    success: true,
    count: locations.length,
    data: locations
  });
});

// @desc    Initialize default locations
// @route   POST /api/locations/initialize
// @access  Private/Admin
export const initializeLocations = asyncHandler(async (req, res, next) => {
  const ghanaRegions = [
    'Greater Accra',
    'Ashanti',
    'Western',
    'Eastern',
    'Central',
    'Volta',
    'Northern',
    'Upper East',
    'Upper West',
    'Bono East',
    'Bono',
    'Ahafo',
    'Western North',
    'Oti',
    'Savannah',
    'North East'
  ];

  // Default cities for Greater Accra
  const accraLocations = [
    'Accra', 'Tema', 'Madina', 'Adenta', 'Teshie', 'Nungua', 'La', 'Osu', 
    'East Legon', 'Airport Residential', 'Cantonments', 'Achimota', 'Dansoman', 
    'Lapaz', 'Abeka', 'Tesano', 'Kokomlemle', 'Dzorwulu', 'Roman Ridge', 'Spintex'
  ];

  // Default cities for Ashanti
  const ashantiLocations = [
    'Kumasi', 'Obuasi', 'Bekwai', 'Konongo', 'Mampong', 'Ejisu', 'Offinso',
    'Ejura', 'Asokore Mampong', 'Abuakwa'
  ];

  // Create a batch operation for inserting locations
  const operations = [];

  // Add locations for Greater Accra
  for (const city of accraLocations) {
    operations.push({
      updateOne: {
        filter: { name: city, region: 'Greater Accra' },
        update: { 
          $set: { 
            name: city, 
            region: 'Greater Accra', 
            country: 'Ghana',
            isActive: true 
          } 
        },
        upsert: true
      }
    });
  }

  // Add locations for Ashanti
  for (const city of ashantiLocations) {
    operations.push({
      updateOne: {
        filter: { name: city, region: 'Ashanti' },
        update: { 
          $set: { 
            name: city, 
            region: 'Ashanti', 
            country: 'Ghana',
            isActive: true 
          } 
        },
        upsert: true
      }
    });
  }

  // Also create an entry for each region as a location
  for (const region of ghanaRegions) {
    operations.push({
      updateOne: {
        filter: { name: region, region },
        update: { 
          $set: { 
            name: region, 
            region, 
            country: 'Ghana',
            isActive: true 
          } 
        },
        upsert: true
      }
    });
  }

  // Execute the batch operation
  const result = await Location.bulkWrite(operations);

  res.status(200).json({
    success: true,
    message: 'Default locations initialized successfully',
    data: {
      matched: result.matchedCount,
      modified: result.modifiedCount,
      upserted: result.upsertedCount
    }
  });
}); 