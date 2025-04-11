import asyncHandler from 'express-async-handler';
import Category from '../models/category.model.js';
import Job from '../models/job.model.js';
import cloudinary from '../utils/cloudinary.js';
import dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config();

// Add this after the imports to check Cloudinary configuration
console.log('Cloudinary Configuration Status:', {
  cloudName: process.env.CLOUDINARY_CLOUD_NAME ? 'Set' : 'Not Set',
  apiKey: process.env.CLOUDINARY_API_KEY ? 'Set' : 'Not Set', 
  apiSecret: process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Not Set'
});

/**
 * @desc    Create a new category
 * @route   POST /api/categories
 * @access  Private (Admin only)
 */
export const createCategory = asyncHandler(async (req, res) => {
  // Add current user as creator
  req.body.createdBy = req.user.id;
  
  let imageUploadResult;
  
  // Handle image upload if provided
  if (req.body.image) {
    try {
      // Upload image to Cloudinary
      imageUploadResult = await cloudinary.uploader.upload(req.body.image, {
        folder: 'job-portal/categories',
        width: 300,
        crop: 'scale'
      });
      
      // Add image data to request body
      req.body.image = {
        public_id: imageUploadResult.public_id,
        url: imageUploadResult.secure_url
      };
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      res.status(500);
      throw new Error('Image upload failed. Please try again.');
    }
  }
  
  // Create category
  const category = await Category.create(req.body);
  
  res.status(201).json({
    success: true,
    data: category
  });
});

/**
 * @desc    Get all categories
 * @route   GET /api/categories
 * @access  Public
 */
export const getCategories = asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 10, 
    search = '',
    featured,
    status,
    sort = 'name'
  } = req.query;
  
  // Build query
  const query = {};
  
  // Add search functionality
  if (search) {
    query.$text = { $search: search };
  }
  
  // Filter by featured status if provided
  if (featured !== undefined) {
    query.featured = featured === 'true';
  }
  
  // Filter by status if provided
  if (status) {
    query.status = status;
  }
  
  // Sort options
  let sortOption = {};
  if (sort === 'name') {
    sortOption = { name: 1 };
  } else if (sort === 'newest') {
    sortOption = { createdAt: -1 };
  } else if (sort === 'jobCount') {
    sortOption = { jobCount: -1 };
  }
  
  // Execute query with pagination
  const categories = await Category.find(query)
    .sort(sortOption)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .exec();
  
  // Get total count
  const total = await Category.countDocuments(query);
  
  // Update job counts if needed (this could be resource intensive for many categories)
  // In production, consider updating job counts with a scheduled task instead
  if (categories.length > 0) {
    const updatedCategories = await Promise.all(
      categories.map(async (category) => {
        // Get current job count for this category
        const count = await Job.countDocuments({ 
          category: category.name,
          status: 'active'
        });
        
        // Only update if the count has changed
        if (count !== category.jobCount) {
          await Category.findByIdAndUpdate(
            category._id,
            { jobCount: count },
            { new: true }
          );
          category.jobCount = count;
        }
        
        return category;
      })
    );
  }
  
  res.status(200).json({
    success: true,
    data: categories,
    meta: {
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      totalPages: Math.ceil(total / limit)
    }
  });
});

/**
 * @desc    Get single category
 * @route   GET /api/categories/:id
 * @access  Public
 */
export const getCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }
  
  res.status(200).json({
    success: true,
    data: category
  });
});

/**
 * @desc    Update category
 * @route   PUT /api/categories/:id
 * @access  Private (Admin only)
 */
export const updateCategory = asyncHandler(async (req, res) => {
  let category = await Category.findById(req.params.id);
  
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }
  
  console.log('Update Category - Cloudinary Config:', {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME ? 'Set' : 'Not Set',
    apiKey: process.env.CLOUDINARY_API_KEY ? 'Set' : 'Not Set',
    apiSecret: process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Not Set'
  });
  
  // Handle image update if provided
  if (req.body.image && typeof req.body.image === 'string' && req.body.image.startsWith('data:image')) {
    try {
      console.log('Uploading new image to Cloudinary...');
      
      // Delete old image if exists
      if (category.image && category.image.public_id) {
        console.log('Deleting old image:', category.image.public_id);
        try {
          await cloudinary.uploader.destroy(category.image.public_id);
        } catch (destroyError) {
          console.error('Error deleting old image:', destroyError);
          // Continue with upload even if delete fails
        }
      }
      
      // Check if the base64 data is too large or malformed
      try {
        const base64Data = req.body.image.split(',')[1];
        const base64Size = Buffer.from(base64Data, 'base64').length;
        console.log('Image size in bytes:', base64Size);
        
        if (base64Size > 10 * 1024 * 1024) {  // 10MB limit
          throw new Error('Image size too large. Maximum size is 10MB.');
        }
      } catch (parseError) {
        console.error('Error parsing base64 image:', parseError);
        throw new Error('Invalid image format. Please try again with a different image.');
      }
      
      // Try uploading with explicit options
      const uploadOptions = {
        folder: 'job-portal/categories',
        width: 300,
        crop: 'scale',
        resource_type: 'image',
        timeout: 60000,  // Longer timeout (60 seconds)
      };
      
      console.log('Uploading with options:', JSON.stringify(uploadOptions));
      
      // Upload new image
      const imageUploadResult = await cloudinary.uploader.upload(
        req.body.image, 
        uploadOptions
      );
      
      console.log('Image uploaded successfully:', imageUploadResult.public_id);
      
      // Update image data in request body
      req.body.image = {
        public_id: imageUploadResult.public_id,
        url: imageUploadResult.secure_url
      };
    } catch (error) {
      console.error('Cloudinary upload error details:', error);
      
      // Provide more specific error message based on the error
      let errorMessage = 'Image upload failed: ';
      
      if (error.http_code === 400) {
        errorMessage += 'Invalid image format or corrupt file.';
      } else if (error.http_code === 401) {
        errorMessage += 'Authentication error with image service.';
      } else if (error.http_code === 403) {
        errorMessage += 'Unauthorized access to image service.';
      } else if (error.http_code === 404) {
        errorMessage += 'Image service endpoint not found.';
      } else if (error.http_code === 413) {
        errorMessage += 'Image file is too large.';
      } else if (error.http_code >= 500) {
        errorMessage += 'Image service is currently unavailable.';
      } else {
        errorMessage += error.message || 'Please try again with a different image.';
      }
      
      res.status(500);
      throw new Error(errorMessage);
    }
  } else if (req.body.image === null || req.body.image === '') {
    // Remove image if explicitly set to null or empty string
    if (category.image && category.image.public_id) {
      await cloudinary.uploader.destroy(category.image.public_id);
    }
    req.body.image = null;
  } else if (req.body.image && typeof req.body.image === 'object' && req.body.image.url) {
    // If image is already an object with url, keep using existing image
    console.log('Using existing image object:', req.body.image);
  } else {
    // Don't change the image if not provided in the request
    console.log('No image change - removing from request');
    delete req.body.image;
  }
  
  category = await Category.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  
  res.status(200).json({
    success: true,
    data: category
  });
});

/**
 * @desc    Delete category
 * @route   DELETE /api/categories/:id
 * @access  Private (Admin only)
 */
export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }
  
  // Check if there are jobs using this category
  const jobsCount = await Job.countDocuments({ category: category.name });
  
  if (jobsCount > 0) {
    res.status(400);
    throw new Error(`Cannot delete category. There are ${jobsCount} jobs associated with this category.`);
  }
  
  // Delete image from Cloudinary if exists
  if (category.image && category.image.public_id) {
    await cloudinary.uploader.destroy(category.image.public_id);
  }
  
  await category.remove();
  
  res.status(200).json({
    success: true,
    message: 'Category deleted successfully'
  });
});

/**
 * @desc    Get jobs by category
 * @route   GET /api/categories/:id/jobs
 * @access  Public
 */
export const getCategoryJobs = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }
  
  const { page = 1, limit = 10 } = req.query;
  
  const jobs = await Job.find({ 
    category: category.name,
    status: 'active'
  })
    .populate('company', 'name profilePicture')
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });
  
  const total = await Job.countDocuments({ 
    category: category.name,
    status: 'active'
  });
  
  res.status(200).json({
    success: true,
    data: jobs,
    meta: {
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      totalPages: Math.ceil(total / limit)
    }
  });
});

/**
 * @desc    Get categories statistics (counts by status, featured, etc.)
 * @route   GET /api/categories/stats
 * @access  Private (Admin only)
 */
export const getCategoryStats = asyncHandler(async (req, res) => {
  const stats = {
    total: await Category.countDocuments({}),
    active: await Category.countDocuments({ status: 'active' }),
    inactive: await Category.countDocuments({ status: 'inactive' }),
    featured: await Category.countDocuments({ featured: true })
  };
  
  res.status(200).json({
    success: true,
    data: stats
  });
}); 