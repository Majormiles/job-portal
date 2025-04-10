const express = require('express');
const router = express.Router();
const {
  createCompany,
  getCompanies,
  getCompany,
  updateCompany,
  deleteCompany,
  addEmployee,
  removeEmployee
} = require('../controllers/company.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// Public routes
router.get('/', getCompanies);
router.get('/:id', getCompany);

// Protected routes (Employers only)
router.post('/', protect, authorize('employer'), createCompany);
router.put('/:id', protect, authorize('employer'), updateCompany);
router.delete('/:id', protect, authorize('employer'), deleteCompany);

// Employee management routes
router.post('/:id/employees', protect, authorize('employer'), addEmployee);
router.delete('/:id/employees/:userId', protect, authorize('employer'), removeEmployee);

module.exports = router; 