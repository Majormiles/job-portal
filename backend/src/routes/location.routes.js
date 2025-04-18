import express from 'express';
import {
  createLocation,
  getLocations,
  getLocation,
  updateLocation,
  deleteLocation,
  searchLocations,
  initializeLocations
} from '../controllers/location.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.get('/', getLocations);
router.get('/search', searchLocations);
router.get('/:id', getLocation);

// Protected admin routes
router.post('/', protect, authorize('admin'), createLocation);
router.put('/:id', protect, authorize('admin'), updateLocation);
router.delete('/:id', protect, authorize('admin'), deleteLocation);
router.post('/initialize', protect, authorize('admin'), initializeLocations);

export default router; 