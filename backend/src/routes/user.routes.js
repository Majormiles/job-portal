import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import {
  getMe,
  getAccountData,
  updateProfile,
  updatePassword,
  forgotPassword,
  resetPassword,
  deleteAccount,
  updateUserSettings
} from '../controllers/user.controller.js';
import {
  getOnboardingStatus,
  updateOnboardingSection,
  getOnboardingData
} from '../controllers/onboarding.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Create separate upload configurations for images and PDFs
const imageUpload = multer({
  storage: storage,
  limits: { fileSize: 5000000 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
    }
  }
});

const pdfUpload = multer({
  storage: storage,
  limits: { fileSize: 5000000 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    const filetypes = /pdf/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed!'));
    }
  }
}).fields([
  { name: 'resume', maxCount: 1 },
  { name: 'data', maxCount: 1 }
]);

// Public routes
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// Protected routes
router.use(protect);

router.get('/me', getMe);
router.get('/account-data', getAccountData);
router.put('/update-profile', updateProfile);
router.put('/update-password', updatePassword);
router.delete('/me', deleteAccount);
router.put('/settings', updateUserSettings);

// Onboarding routes
router.get('/onboarding-status', getOnboardingStatus);
router.get('/onboarding', getOnboardingData);

// Update onboarding sections
router.put('/onboarding/personal-info', imageUpload.single('profilePicture'), (req, res, next) => {
  req.params.section = 'personalInfo';
  updateOnboardingSection(req, res, next);
});

router.put('/onboarding/professional-info', pdfUpload, (req, res, next) => {
  req.params.section = 'professionalInfo';
  updateOnboardingSection(req, res, next);
});

router.put('/onboarding/skills', (req, res, next) => {
  req.params.section = 'skills';
  updateOnboardingSection(req, res, next);
});

router.put('/onboarding/preferences', (req, res, next) => {
  req.params.section = 'preferences';
  updateOnboardingSection(req, res, next);
});

router.post('/onboarding/complete', (req, res, next) => {
  req.params.section = 'complete';
  updateOnboardingSection(req, res, next);
});

export default router; 