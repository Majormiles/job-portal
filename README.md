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
