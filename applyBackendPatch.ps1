# PowerShell script to apply the backend patch for application routes

Write-Host "Applying backend patch for application.routes.js..."

# Make backup of the original file
$originalFile = "backend/src/routes/application.routes.js"
$backupFile = "backend/src/routes/application.routes.js.bak"

# Check if file exists
if (-not (Test-Path $originalFile)) {
    Write-Error "Original file not found: $originalFile"
    exit 1
}

# Create backup
Copy-Item -Path $originalFile -Destination $backupFile -Force
Write-Host "Backup created: $backupFile"

# Read the content of the original file
$content = Get-Content -Path $originalFile -Raw

# Add the middleware function at the beginning of the file
$middlewareCode = @"
import express from 'express';
import {
  getJobApplications,
  getMyApplications,
  updateApplicationStatus,
  getApplication,
  deleteApplication
} from '../controllers/application.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import Application from '../models/application.model.js';

// Middleware to handle population options
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

const router = express.Router();
"@

# Replace the original import and router initialization
$content = $content -replace "(?ms)import express from 'express';.*?const router = express.Router();", $middlewareCode

# Update the admin applications route
$oldRoutePattern = "(?ms)router\.get\('/', protect, authorize\('admin'\), async \(req, res\) => \{.*?\}\);"
$newRouteCode = @"
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
    
    // Execute query with controlled population
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
    
    // Sort manually since we're processing the results ourselves
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
"@

# Replace the old route with the new one
$content = $content -replace $oldRoutePattern, $newRouteCode

# Write the updated content back to the file
$content | Set-Content -Path $originalFile

Write-Host "Backend patch applied successfully!"
Write-Host "Please restart your backend server for the changes to take effect." 