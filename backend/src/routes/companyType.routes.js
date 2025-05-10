import express from 'express';
import {
  createCompanyType,
  getCompanyTypes,
  getCompanyType,
  updateCompanyType,
  deleteCompanyType,
  initializeCompanyTypes,
  searchCompanyTypes
} from '../controllers/companyType.controller.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getCompanyTypes);
router.get('/search', searchCompanyTypes);
router.get('/:id', getCompanyType);

// Protected routes (admin only)
router.post('/', protect, authorize('admin'), createCompanyType);
router.put('/:id', protect, authorize('admin'), updateCompanyType);
router.delete('/:id', protect, authorize('admin'), deleteCompanyType);
router.post('/initialize', protect, authorize('admin'), initializeCompanyTypes);

export default router; 