# Job Portal Application

This is a full-stack job portal application with a React frontend and Node.js/Express backend.

## Project Structure

- `frontend/` - React frontend application
- `backend/` - Node.js/Express backend API

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- MongoDB (for the backend)

### Installation

1. Clone the repository
2. Install dependencies for both frontend and backend:

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

### Environment Setup

1. Create a `.env` file in the backend directory with the following variables:

```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

2. Create a `.env` file in the frontend directory with the following variables:

```
REACT_APP_API_URL=http://localhost:5000/api
```

### Running the Application

#### Option 1: Run both frontend and backend together

From the root directory:

```bash
npm run dev
```

This will start both the frontend and backend concurrently.

#### Option 2: Run frontend and backend separately

From the root directory:

```bash
# Start the backend
npm run start:backend

# In a new terminal, start the frontend
npm run start:frontend
```

Or you can navigate to each directory and run the start command:

```bash
# Start the backend
cd backend
npm start

# In a new terminal, start the frontend
cd frontend
npm start
```

## API Endpoints

The backend provides the following main API endpoints:

- `/api/auth/*` - Authentication endpoints (login, register, etc.)
- `/api/users/*` - User profile endpoints
- `/api/users/onboarding-status` - Get user onboarding status
- `/api/users/onboarding/personal-info` - Update personal information
- `/api/users/onboarding/professional-info` - Update professional information

## Troubleshooting

If you encounter the error "Missing script: start" when running `npm start` from a subdirectory, make sure you're running the command from the root directory of the project, not from a subdirectory.

For example, instead of:
```bash
cd frontend
npm start
```

Use:
```bash
npm run start:frontend
```

Or navigate back to the root directory:
```bash
cd ..
npm start
```

# job-portal
Comprehensive Job application


Backend API Endpoints
Authentication Routes (/api/auth):
Public:
POST /register - User registration
POST /login - User login
POST /google - Google OAuth login
GET /verify-email/:token - Email verification
GET /config - OAuth configuration
Protected:
GET /me - Get current user
POST /forgot-password - Password recovery
PUT /reset-password/:resettoken - Reset password
PUT /update-password - Update password
GET /logout - User logout
User Routes (/api/users):
Public:
POST /forgot-password - Password recovery
POST /reset-password/:token - Reset password
Protected:
GET /me - Get user profile
PUT /update-profile - Update profile
PUT /update-password - Update password
DELETE /me - Delete account
Onboarding Routes:
GET /onboarding-status - Check onboarding status
GET /onboarding - Get onboarding data
PUT /onboarding/personal-info - Update personal info
PUT /onboarding/professional-info - Update professional info
PUT /onboarding/skills - Update skills
PUT /onboarding/preferences - Update preferences
POST /onboarding/complete - Complete onboarding
Job Routes (/api/jobs):
Public:
GET / - Get all jobs
GET /:id - Get specific job
Protected:
POST /:id/apply - Apply for a job
Employer Routes:
POST / - Create job
PUT /:id - Update job
DELETE /:id - Delete job
GET /employer/jobs - Get employer's jobs
Application Routes (/api/applications):
Protected:
GET /my-applications - Get user's applications
GET /:id - Get specific application
DELETE /:id - Delete application
Employer Routes:
GET /job/:jobId - Get applications for a job
PUT /:id/status - Update application status
Company Routes (/api/companies):
Public:
GET / - Get all companies
GET /:id - Get specific company
Protected (Employer):
POST / - Create company
PUT /:id - Update company
DELETE /:id - Delete company
POST /:id/employees - Add employee
DELETE /:id/employees/:userId - Remove employee
Dashboard Routes (/api/dashboard):
Protected:
GET /me - Get user profile
GET /applications/recent - Get recent applications
GET /stats - Get dashboard statistics
Frontend Routes
Public Routes:
/ - Home page
/jobs - Jobs listing
/about - About page
/contact - Contact page
/login - Login page
/register - Registration page
/job-detail - Job details page
/pricing-plan - Pricing plans
/checkout - Checkout page
/verify-email - Email verification
/forgot-password - Password recovery
/reset-password - Password reset
Protected Routes:
/dashboard_employee - Employee dashboard
/applied-jobs - Applied jobs
/favorite-jobs - Favorite jobs
/job-alerts - Job alerts
/settings - User settings
Onboarding Routes:
/onboarding/personal-info
/onboarding/professional-info
/onboarding/skills
/onboarding/preferences
/onboarding/complete
Admin Routes:
/admin/login
/admin/dashboard
/admin/resume
/admin/calendar
/admin/categories
/admin/jobs
/admin/profile
/admin/invoice
/admin/timeline
/admin/job-seekers
/admin/manage-applications
/admin/job-applicants
The application implements a comprehensive job portal with features for both job seekers and employers, including:
User authentication (email/password and Google OAuth)
Job posting and application management
Company management
User onboarding process
Admin dashboard
Job alerts and favorites
Profile management
File uploads (resumes, profile pictures)
The frontend uses React Router for navigation and implements protected routes with authentication checks. The backend uses Express.js with middleware for authentication and authorization.
