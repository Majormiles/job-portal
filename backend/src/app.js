import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import authRouter from './routes/auth.routes.js';
import userRouter from './routes/user.routes.js';
import jobRouter from './routes/job.routes.js';
import dashboardRouter from './routes/dashboard.routes.js';
import categoryRouter from './routes/category.routes.js';
import applicationRouter from './routes/application.routes.js';
import adminRouter from './routes/admin.routes.js';
import statsRouter from './routes/stats.routes.js';
import companyRouter from './routes/company.routes.js';
import locationRouter from './routes/location.routes.js';
import roleRouter from './routes/role.routes.js';
import fileRouter from './routes/file.routes.js';
import indexRouter from './routes/index.js';
import errorHandler from './middleware/error.middleware.js';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Middleware
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));
app.use(cookieParser());

// Routes
app.use('/api', indexRouter);
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/jobs', jobRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/applications', applicationRouter);
app.use('/api/admin', adminRouter);
app.use('/api/stats', statsRouter);
app.use('/api/companies', companyRouter);
app.use('/api/locations', locationRouter);
app.use('/api/roles', roleRouter);
app.use('/api/files', fileRouter);

// Error handling
app.use(errorHandler);

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

export default app; 