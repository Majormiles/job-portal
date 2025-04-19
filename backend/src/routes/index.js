import express from 'express';
import { getCompanyTypes, getTrainingInterests, getIndustries } from '../controllers/category.controller.js';

const router = express.Router();

// Direct routes
router.get('/company-types', getCompanyTypes);
router.get('/training/interests', getTrainingInterests);
router.get('/industries', getIndustries);
router.get('/employer/industries', getIndustries); // Alias for employers

// Create alias routes for backward compatibility
router.get('/categories/industries', getIndustries);
router.get('/categories/interests', getTrainingInterests);

export default router; 