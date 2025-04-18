/**
 * PATCH FILE: Application Routes Fix
 * 
 * This file contains modifications to fix the MongoDB population error in the applications endpoint.
 * To apply this patch:
 * 1. Backup your original file: cp application.routes.js application.routes.js.bak
 * 2. Apply the changes shown in this patch file to application.routes.js
 */

/**
 * Key changes to implement in application.routes.js:
 * 
 * 1. Add a middleware to handle population options before the route handler
 */

// Add this middleware function before the applications route handler:
const handlePopulationOptions = (req, res, next) => {
  // Check for population control parameters in query string
  if (req.query.noPopulate === 'true' || req.query.skipPopulate === 'true') {
    req.skipPopulation = true;
  }
  
  // Set strictPopulate option for Mongoose
  if (req.query.strictPopulate === 'false') {
    req.strictPopulate = false;
  }
  
  next();
};

// Apply the middleware to the admin applications route
// router.get('/', protect, authorize('admin'), async (req, res) => {
// Should become:
// router.get('/', protect, authorize('admin'), handlePopulationOptions, async (req, res) => {

/**
 * 2. Modify the population logic in the route handler
 */

// Inside the route handler, update the populate calls with options:
// From:
// const applications = await Application.find(query)
//   .populate('user', 'name email')
//   .populate('job', 'title company')
//   .sort(sort)
//   .skip(skip)
//   .limit(parseInt(limit));

// To:
const applications = await Application.find(query);

// Only populate if not explicitly disabled
if (!req.skipPopulation) {
  // Use strictPopulate option if provided
  const populateOptions = { 
    strictPopulate: req.strictPopulate !== undefined ? req.strictPopulate : true 
  };
  
  await Application.populate(applications, [
    { path: 'user', select: 'name email', options: populateOptions },
    { path: 'job', select: 'title company', options: populateOptions }
  ]);
}

// Continue with sorting and pagination
applications.sort(sort);
const paginatedResults = applications.slice(skip, skip + parseInt(limit));

/**
 * Complete implementation example for the GET /applications route:
 */

/*
router.get('/', protect, authorize('admin'), handlePopulationOptions, async (req, res) => {
  try {
    console.log('Admin applications route hit');
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', status, jobId, search, startDate } = req.query;
    
    // Build query
    const query = {};
    
    // Add filters if provided
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (jobId && jobId !== 'all') {
      query.job = jobId;
    }
    
    if (startDate) {
      query.createdAt = { $gte: new Date(startDate) };
    }
    
    if (search) {
      // Search in user name, email or job title
      query.$or = [
        { 'user.name': { $regex: search, $options: 'i' } },
        { 'user.email': { $regex: search, $options: 'i' } },
        { 'job.title': { $regex: search, $options: 'i' } }
      ];
    }
    
    // Prepare sort options
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    // Calculate skip value for pagination
    const skip = (page - 1) * limit;
    
    console.log('Query:', query);
    console.log('Sort:', sort);
    console.log('Skip:', skip);
    console.log('Limit:', limit);
    console.log('Population options:', { 
      skipPopulation: req.skipPopulation, 
      strictPopulate: req.strictPopulate 
    });
    
    // Execute query with pagination and population controls
    let applications = await Application.find(query);
    
    // Apply population conditionally
    if (!req.skipPopulation) {
      const populateOptions = { 
        strictPopulate: req.strictPopulate !== undefined ? req.strictPopulate : true 
      };
      
      await Application.populate(applications, [
        { path: 'user', select: 'name email', options: populateOptions },
        { path: 'job', select: 'title company', options: populateOptions }
      ]);
    }
    
    // Get total count for pagination
    const totalCount = await Application.countDocuments(query);
    
    // Sort manually since we're not using Mongoose's sort
    if (sort[sortBy] === 1) {
      applications.sort((a, b) => {
        if (a[sortBy] < b[sortBy]) return -1;
        if (a[sortBy] > b[sortBy]) return 1;
        return 0;
      });
    } else {
      applications.sort((a, b) => {
        if (a[sortBy] > b[sortBy]) return -1;
        if (a[sortBy] < b[sortBy]) return 1;
        return 0;
      });
    }
    
    // Apply pagination manually
    const paginatedApplications = applications.slice(skip, skip + parseInt(limit));
    
    console.log('Sending applications response:', { count: paginatedApplications.length, totalCount });
    
    res.json({
      success: true,
      data: paginatedApplications,
      totalCount,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(totalCount / limit)
    });
  } catch (error) {
    console.error('Error in applications route:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching applications',
      error: error.message
    });
  }
});
*/ 