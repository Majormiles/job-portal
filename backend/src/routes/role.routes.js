import express from 'express';
import {
  getRoles,
  getRole,
  createRole,
  updateRole,
  deleteRole,
  initializeRoles
} from '../controllers/role.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.get('/', getRoles);

// Protected admin routes
router.get('/:id', protect, authorize('admin'), getRole);
router.post('/', protect, authorize('admin'), createRole);
router.put('/:id', protect, authorize('admin'), updateRole);
router.delete('/:id', protect, authorize('admin'), deleteRole);
router.post('/initialize', protect, authorize('admin'), initializeRoles);

export default router; 