# Job Portal Scripts

This directory contains utility scripts for the job portal application.

## Profile Image and Resume Persistence Fix

This script fixes issues with profile image and resume persistence in the PersonalSettings component. It ensures that:

1. Profile images are properly stored and retrieved
2. Resume deletions are properly persisted

### How to Run the Fix Script

#### Option 1: Run from the Command Line

1. Navigate to the scripts directory:
   ```
   cd frontend/src/scripts
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Run the fix script:
   ```
   npm run fix-profile-resume
   ```

#### Option 2: Run from the Application

The fix script is also integrated into the PersonalSettings component and will run automatically when:

1. The component is mounted
2. A profile image is uploaded
3. A resume is deleted
4. The profile is updated

### What the Script Does

1. **Profile Image Fix**:
   - Ensures profile image URLs are properly formatted as absolute URLs
   - Updates the database with the correct URL format

2. **Resume Fix**:
   - Ensures resume deletions are properly persisted in the database
   - Updates the database to set resume to null when deleted

### Troubleshooting

If you encounter any issues with the script:

1. Check the console logs for error messages
2. Ensure your API server is running and accessible
3. Verify that your environment variables are correctly set
4. Try running the script manually from the command line 