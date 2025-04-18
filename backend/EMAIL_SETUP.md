# Email Service Setup Guide

This guide will help you set up the email service for your Job Portal application.

## Gmail Setup for Production Use

For a robust production setup, follow these steps:

1. Open your `.env` file in the backend directory
2. Configure Gmail with an App Password (recommended):

```
GOOGLE_EMAIL=your_gmail@gmail.com
GOOGLE_APP_PASSWORD=your_app_password
```

### Setting up Gmail App Password:

1. Go to your [Google Account](https://myaccount.google.com/)
2. Click on "Security" in the left sidebar
3. Enable 2-Step Verification if not already enabled
4. Go to "App passwords" (under "Signing in to Google")
5. Select "Mail" and "Other" (enter "Job Portal" as name)
6. Click "Generate"
7. Copy the generated 16-character password
8. Paste it as GOOGLE_APP_PASSWORD in your .env file

This method is more reliable and secure than OAuth for most Gmail accounts.

## Using Google OAuth (Alternative Method)

If App Password doesn't work for your Google account type, use OAuth:

1. Configure the following in your `.env` file:

```
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_EMAIL=your_email@gmail.com
GOOGLE_REFRESH_TOKEN=your_google_refresh_token
```

### Setting up Google OAuth credentials:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth client ID"
5. Set application type to "Web application"
6. Add authorized redirect URIs (including `https://developers.google.com/oauthplayground`)
7. Get your Client ID and Client Secret

### Getting a Refresh Token:

1. Go to [Google OAuth Playground](https://developers.google.com/oauthplayground/)
2. Click the gear icon (Settings) in the upper right corner
3. Check "Use your own OAuth credentials"
4. Enter your OAuth Client ID and Client Secret
5. Close the settings
6. Select "Gmail API v1" > "https://mail.google.com/" from the list
7. Click "Authorize APIs"
8. Sign in with the Google account you want to use for sending emails
9. Click "Exchange authorization code for tokens"
10. Copy the "Refresh token" value

## Development Fallback

For development, the system will automatically fall back to a test email account if your Gmail configuration fails. This ensures you can continue developing without needing to set up email immediately.

## Testing Your Email Configuration

Run the following command to test your email configuration:

```
npm run test-email your@email.com
```

Replace `your@email.com` with the email where you want to receive the test message.

## Troubleshooting Gmail Issues

If you're experiencing issues with sending via Gmail:

1. Check that you've set up the App Password correctly
2. Ensure 2-Step Verification is enabled on your Google account
3. Make sure your Google account doesn't have additional security restrictions
4. Check for any Google security notifications in your Gmail inbox
5. If using OAuth, your refresh token may expire - generate a new one if needed
6. Ensure you're not exceeding Gmail's sending limits

## Alternative: Using Ethereal (For Development/Testing)

For development or testing, if you don't want to configure Google OAuth, the application will automatically create a test account at Ethereal.email when OAuth credentials are missing.

1. Leave the Google OAuth configuration empty in your `.env` file
2. When running the application, a test account will be created
3. Check the console logs for the preview URL to view sent emails

## Troubleshooting

If you're experiencing issues with email sending:

1. Check your Google OAuth credentials are correct
2. Ensure your Google account has less secure apps enabled or is properly configured
3. The refresh token may expire if unused for extended periods - generate a new one if needed
4. Check for any Google account security notifications that may be blocking the authentication
5. Run the test-email script to debug any errors 