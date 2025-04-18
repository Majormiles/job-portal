import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { sendEmail, getVerificationEmailTemplate } from './src/utils/emailService.js';

// Set up __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const testEmail = async () => {
  try {
    console.log('=== EMAIL SERVICE TEST ===');
    
    // Replace with a real email address for testing
    const testEmailAddress = 'majormilesvigour@gmail.com';
    
    // Log configuration details
    console.log('Environment:', process.env.NODE_ENV);
    console.log('Using email service with the following configuration:');
    
    if (process.env.GOOGLE_CLIENT_ID && 
        process.env.GOOGLE_CLIENT_SECRET && 
        process.env.GOOGLE_REFRESH_TOKEN && 
        process.env.GOOGLE_EMAIL) {
      console.log('- Method: Google OAuth');
      console.log(`- Sender Email: ${process.env.GOOGLE_EMAIL}`);
      console.log('- Google Client ID: Present');
      console.log('- Google Client Secret: Present');
      console.log('- Google Refresh Token: Present');
    } else {
      console.log('- Method: Ethereal Test Account (OAuth credentials not found)');
      console.log('- Note: Emails will not be delivered to real recipients in this mode');
      console.log('- A preview URL will be generated for testing purposes');
    }
    
    console.log(`Testing email service by sending to: ${testEmailAddress}`);
    
    // Create a test verification URL
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=test-token-12345`;
    
    // Get the email template
    const emailTemplate = getVerificationEmailTemplate(verificationUrl);
    
    console.log('Sending test email...');
    // Send the test email
    const result = await sendEmail({
      to: testEmailAddress,
      subject: 'Job Portal - Email Verification Test',
      html: emailTemplate
    });
    
    console.log('Email sent successfully!');
    console.log('Message ID:', result.messageId);
    
    // If using test account, show preview URL
    if (result.messageUrl || result.previewUrl) {
      console.log('Email preview URL:', result.messageUrl || result.previewUrl);
      console.log('You can view the test email at this URL ☝️');
    }
    
    console.log('=== EMAIL SERVICE TEST COMPLETED ===');
  } catch (error) {
    console.error('=== EMAIL SERVICE TEST FAILED ===');
    console.error('Error:', error.message);
    console.error('Error details:', error);
    
    // Provide troubleshooting guidance based on the error
    if (error.message.includes('OAuth2') || error.message.includes('invalid_grant')) {
      console.error('\nTROUBLESHOOTING SUGGESTIONS:');
      console.error('1. Your OAuth refresh token may have expired - generate a new one');
      console.error('2. Check that your Google account security settings allow this type of access');
      console.error('3. Verify your client ID and client secret are correct');
    } else if (error.message.includes('connect')) {
      console.error('\nTROUBLESHOOTING SUGGESTIONS:');
      console.error('1. Check your internet connection');
      console.error('2. Verify there are no firewall or network issues');
    }
    
    process.exit(1);
  }
};

// Run the test
testEmail(); 