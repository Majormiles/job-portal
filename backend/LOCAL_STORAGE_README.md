# Local File Storage System

This document explains the local file storage system implemented in the job portal application for storing resumes and other user files.

## Overview

The local file storage system replaces the previous Cloudinary-based cloud storage solution with a local file system approach. This allows you to store files directly on your server or development machine without relying on external services.

## Features

- **Local File Storage**: Files are saved in the `uploads` directory of the project
- **Organized Subdirectories**: Files are organized by type (resumes, profiles, etc.) and user ID
- **Secure File Naming**: Files are renamed with timestamps, random strings, and UUIDs to prevent conflicts
- **File Type Validation**: Only allowed file types can be uploaded (PDF, DOCX, etc.)
- **Size Limitation**: File size is limited (default: 5MB)
- **Access Control**: Files are accessible only to authorized users
- **Activity Logging**: All file operations are logged for audit purposes
- **Cleanup**: Temporary files are automatically removed

## Directory Structure

```
uploads/
├── resumes/             # Resume files
│   ├── user_id_1/       # User-specific directories
│   │   └── file1.pdf
│   └── user_id_2/
│       └── file2.pdf
├── profiles/            # Profile pictures
│   └── user_id_1/
│       └── image1.jpg
└── logs/                # Activity logs
    └── upload_log_2023-07-01.log
```

## API Endpoints

### Get File

- **URL**: `/api/files/:type/:filename`
- **Method**: `GET`
- **Authentication**: Required
- **Description**: Retrieves a file based on type and filename
- **Access Control**: Users can only access their own files

### Get File By User ID

- **URL**: `/api/files/:type/user/:userId/:filename`
- **Method**: `GET`
- **Authentication**: Required
- **Description**: Retrieves a file based on type, user ID, and filename
- **Access Control**: Users can only access their own files, admins can access any file

### Delete File

- **URL**: `/api/files/:type/:filename`
- **Method**: `DELETE`
- **Authentication**: Required
- **Description**: Deletes a file based on type and filename
- **Access Control**: Users can only delete their own files

## File Storage Utility Functions

The local file storage system provides the following utility functions:

- `initLocalStorage()`: Initializes the local storage directories
- `validateFile(file, allowedTypes, maxSize)`: Validates file type and size
- `saveFileToLocal(file, subDirectory, userId)`: Saves a file to local storage
- `deleteFileFromLocal(filePath)`: Deletes a file from local storage
- `getFileByPath(filePath)`: Retrieves a file by path
- `logFileUpload(fileInfo)`: Logs a file upload
- `logFileActivity(activity)`: Logs file activity
- `generateSecureFilename(originalFilename)`: Generates a secure filename

## Security Considerations

- Files are stored in a structured directory based on file type and user ID
- File names are generated securely to prevent path traversal attacks
- Files are only accessible to authenticated users
- Access control ensures users can only access their own files
- File type validation prevents malicious file uploads
- File size limits prevent denial of service attacks

## Configuration

The system is configured with the following defaults:

- Base upload directory: `uploads/`
- Resume directory: `uploads/resumes/`
- Logs directory: `uploads/logs/`
- Maximum file size: 5MB
- Supported file types:
  - PDF (application/pdf)
  - DOCX (application/vnd.openxmlformats-officedocument.wordprocessingml.document)
  - DOC (application/msword)
  - TXT (text/plain)

## Installation and Setup

1. Make sure you have the required dependencies:
   ```bash
   npm install uuid
   ```

2. The system automatically initializes the required directories on startup.

3. Ensure the `uploads` directory has the correct permissions:
   ```bash
   chmod -R 755 uploads
   ```

## Logging

All file operations are logged in daily log files in the `uploads/logs` directory. Each log entry includes:

- Timestamp
- Operation type (upload, access, delete)
- User ID
- File details (name, size, type)
- Path

## Migrating From Cloudinary

If you're migrating from Cloudinary, the system will automatically handle new uploads. Existing files in Cloudinary will remain accessible if you keep your Cloudinary configuration active.

To fully migrate existing files from Cloudinary to local storage, you would need to create a migration script (not included in this implementation). 