import express from 'express';
import { getCompanyTypes as getCategoryCompanyTypes, getTrainingInterests as getCategoryTrainingInterests, getIndustries } from '../controllers/category.controller.js';
import { getCompanyTypes } from '../controllers/companyType.controller.js';
import { getInterests } from '../controllers/interest.controller.js';
import { getJobTypes } from '../controllers/jobType.controller.js';

const router = express.Router();

// Direct routes - Point to the new controllers
router.get('/company-types', getCompanyTypes);
router.get('/training/interests', getInterests);
router.get('/job-types', getJobTypes);

// Keep old routes for industries - still using category controller
router.get('/industries', getIndustries);
router.get('/employer/industries', getIndustries); // Alias for employers

// Create alias routes for backward compatibility
router.get('/categories/industries', getIndustries);
router.get('/categories/interests', getInterests);

export default router; 