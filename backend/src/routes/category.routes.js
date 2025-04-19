import express from 'express';
import {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory,
  getCategoryJobs,
  getCategoryStats,
  getIndustries,
  getCompanyTypes,
  getTrainingInterests
} from '../controllers/category.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import Category from '../models/category.model.js';

const router = express.Router();

// Public routes
router.get('/', getCategories);

// New public routes for industries, company types, and training interests
router.get('/industries', getIndustries);
router.get('/interests', getTrainingInterests);

// Admin-only routes - must come before the routes with path parameters
router.use('/admin', protect);
router.use('/admin', authorize('admin'));
router.get('/admin/stats', getCategoryStats);

// Routes with path parameters
router.get('/:id', getCategory);
router.get('/:id/jobs', getCategoryJobs);

// Admin-only CRUD operations
router.use(protect);
router.use(authorize('admin'));
router.post('/', createCategory);
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);

// Update job count for a category (Admin only)
router.patch('/:id/job-count', protect, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { jobCount } = req.body;
    
    // Validate that jobCount is a number
    if (typeof jobCount !== 'number' || jobCount < 0) {
      return res.status(400).json({
        success: false,
        message: 'Job count must be a non-negative number'
      });
    }
    
    // Find and update the category
    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { jobCount },
      { new: true, runValidators: true }
    );
    
    if (!updatedCategory) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: updatedCategory
    });
  } catch (error) {
    console.error('Error updating category job count:', error);
    return res.status(500).json({
      success: false,
      message: 'Error updating category job count',
      error: error.message
    });
  }
});

export default router; 