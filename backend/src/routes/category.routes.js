import express from 'express';
import {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory,
  getCategoryJobs,
  getCategoryStats
} from '../controllers/category.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.get('/', getCategories);

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

export default router; 