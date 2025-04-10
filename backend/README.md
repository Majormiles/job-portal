# Job Portal Backend

This is the backend API for the Job Portal application. It provides endpoints for user authentication, job management, company profiles, and job applications.

## Features

- User authentication and authorization
- Job posting and management
- Company profiles
- Job applications
- File uploads (resumes, profile pictures)
- Email notifications
- Input validation
- Error handling

## Tech Stack

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- Cloudinary for file storage
- Nodemailer for emails
- Joi for validation

## Prerequisites

- Node.js (>= 14.0.0)
- MongoDB
- Cloudinary account
- SMTP server access (for emails)

## Installation

1. Clone the repository:
\`\`\`bash
git clone <repository-url>
cd backend
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Create a .env file in the root directory and add your environment variables:
\`\`\`env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/job-portal
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=30d
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=your-email@gmail.com
SMTP_PASSWORD=your-app-specific-password
FROM_EMAIL=noreply@jobportal.com
FROM_NAME=Job Portal
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
\`\`\`

4. Create an 'uploads' directory in the root folder:
\`\`\`bash
mkdir uploads
\`\`\`

## Running the Application

Development mode:
\`\`\`bash
npm run dev
\`\`\`

Production mode:
\`\`\`bash
npm start
\`\`\`

Seed the database with sample data:
\`\`\`bash
npm run seed
\`\`\`

## API Documentation

### Authentication Routes

\`\`\`
POST /api/auth/register - Register a new user
POST /api/auth/login - Login user
GET /api/auth/me - Get current user
POST /api/auth/forgot-password - Request password reset
PUT /api/auth/reset-password/:token - Reset password
\`\`\`

### User Routes

\`\`\`
GET /api/users/me - Get user profile
PUT /api/users/me - Update user profile
PUT /api/users/me/password - Update password
DELETE /api/users/me - Delete account
\`\`\`

### Job Routes

\`\`\`
POST /api/jobs - Create a new job
GET /api/jobs - Get all jobs
GET /api/jobs/:id - Get single job
PUT /api/jobs/:id - Update job
DELETE /api/jobs/:id - Delete job
POST /api/jobs/:id/apply - Apply for a job
GET /api/jobs/employer/jobs - Get employer's jobs
\`\`\`

### Company Routes

\`\`\`
POST /api/companies - Create a new company
GET /api/companies - Get all companies
GET /api/companies/:id - Get single company
PUT /api/companies/:id - Update company
DELETE /api/companies/:id - Delete company
POST /api/companies/:id/employees - Add employee
DELETE /api/companies/:id/employees/:userId - Remove employee
\`\`\`

### Application Routes

\`\`\`
GET /api/applications/job/:jobId - Get all applications for a job
GET /api/applications/my-applications - Get user's applications
PUT /api/applications/:id/status - Update application status
GET /api/applications/:id - Get application details
DELETE /api/applications/:id - Delete application
\`\`\`

## Error Handling

The API uses a centralized error handling mechanism. All errors are formatted as:

\`\`\`json
{
  "success": false,
  "error": "Error message",
  "stack": "Error stack trace (only in development)"
}
\`\`\`

## Input Validation

All routes are protected with Joi validation schemas. Invalid requests will return a 400 status code with validation error messages.

## File Upload

- Supported file types: JPEG, PNG, PDF
- Maximum file size: 5MB
- Files are stored in Cloudinary
- Temporary files are stored in the 'uploads' directory

## Security

- Password hashing using bcrypt
- JWT authentication
- Role-based access control
- Request rate limiting
- Security headers
- CORS configuration

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the ISC License. 