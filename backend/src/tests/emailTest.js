import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { sendEmail, getVerificationEmailTemplate } from '../utils/emailService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
const result = dotenv.config({ path: path.join(__dirname, '../../.env') });
if (result.error) {
  console.error('Error loading .env file:', result.error);
  process.exit(1);
}

const testEmail = async () => {
  try {
    console.log('=== Starting Email Test ===');
    console.log('Environment variables loaded from:', path.join(__dirname, '../../.env'));
    
    // Check OAuth2 environment variables
    console.log('Environment check:', {
      GOOGLE_EMAIL: process.env.GOOGLE_EMAIL ? '✓ Set' : 'Not set',
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? '✓ Set' : 'Not set',
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? '✓ Set' : 'Not set',
      GOOGLE_REFRESH_TOKEN: process.env.GOOGLE_REFRESH_TOKEN ? '✓ Set' : 'Not set'
    });

    const testEmail = 'majormilesvigour@gmail.com';
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=test-token`;
    const emailTemplate = getVerificationEmailTemplate(verificationUrl);

    console.log('Attempting to send test email to:', testEmail);
    const info = await sendEmail({
      to: testEmail,
      subject: 'Test Email - Job Portal Verification',
      html: emailTemplate
    });

    console.log('Test email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('=== Email Test Completed Successfully ===');
  } catch (error) {
    console.error('=== Email Test Failed ===');
    console.error('Error:', error.message);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      command: error.command
    });
    process.exit(1);
  }
};

// Run the test
testEmail(); 