import express from 'express';
import { 
  createCompany,
  getCompanies,
  getCompany,
  updateCompany,
  deleteCompany,
  addEmployee,
  removeEmployee
} from '../controllers/company.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.get('/', getCompanies);
router.get('/:id', getCompany);

// Protected routes
router.post('/', protect, authorize('employer'), createCompany);
router.put('/:id', protect, authorize('employer'), updateCompany);
router.delete('/:id', protect, authorize('employer'), deleteCompany);

// Employee management routes
router.post('/:id/employees', protect, authorize('employer'), addEmployee);
router.delete('/:id/employees/:userId', protect, authorize('employer'), removeEmployee);

export default router; 