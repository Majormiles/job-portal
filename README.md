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