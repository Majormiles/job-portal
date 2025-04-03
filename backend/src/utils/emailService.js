import nodemailer from 'nodemailer';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

// Create transporter
const createTransporter = async () => {
  try {
    console.log('=== EMAIL SERVICE CONFIGURATION ===');
    console.log('Checking environment variables...');
    console.log('GOOGLE_EMAIL:', process.env.GOOGLE_EMAIL);
    console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID);
    console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? '✓ Set' : 'Not set');
    console.log('GOOGLE_REFRESH_TOKEN length:', process.env.GOOGLE_REFRESH_TOKEN ? process.env.GOOGLE_REFRESH_TOKEN.length : 'Not set');
    console.log('=== END EMAIL SERVICE CONFIGURATION ===');

    // Validate required environment variables
    const requiredVars = ['GOOGLE_EMAIL', 'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_REFRESH_TOKEN'];
    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      console.error('Missing environment variables:', missingVars);
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }

    // Create OAuth2 client
    const oauth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      'https://developers.google.com/oauthplayground'  // Standard OAuth2 playground URL
    );

    // Set credentials and get access token
    console.log('Setting OAuth2 credentials with refresh token...');
    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN
    });
    console.log('OAuth2 credentials set successfully');

    // Get access token
    console.log('Getting access token...');
    let token;
    try {
      const { credentials } = await oauth2Client.refreshAccessToken();
      token = credentials.access_token;
      console.log('Successfully obtained access token');
    } catch (tokenError) {
      console.error('Error getting access token:', tokenError);
      console.error('Token error details:', {
        message: tokenError.message,
        code: tokenError.code,
        stack: tokenError.stack
      });
      
      if (tokenError.message.includes('invalid_grant')) {
        console.error('Invalid refresh token. Please generate a new refresh token.');
        throw new Error('Invalid refresh token. Please generate a new refresh token.');
      }
      throw new Error('Failed to get access token. Please check your OAuth2 credentials.');
    }

    // Create transporter with OAuth2
    console.log('Creating nodemailer transporter...');
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.GOOGLE_EMAIL,
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
        accessToken: token
      }
    });

    // Verify transporter configuration
    console.log('Verifying transporter configuration...');
    try {
      await transporter.verify();
      console.log('Transporter verified successfully');
    } catch (verifyError) {
      console.error('Transporter verification failed:', verifyError);
      console.error('Verification error details:', {
        message: verifyError.message,
        code: verifyError.code,
        stack: verifyError.stack
      });
      throw new Error(`Transporter verification failed: ${verifyError.message}`);
    }
    
    return transporter;
  } catch (error) {
    console.error('Error creating transporter:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      command: error.command
    });
    throw new Error(`Failed to create email transporter: ${error.message}`);
  }
};

// Send email
export const sendEmail = async ({ to, subject, html }) => {
  try {
    console.log('=== SENDING EMAIL ===');
    console.log('To:', to);
    console.log('Subject:', subject);
    console.log('From:', process.env.GOOGLE_EMAIL);

    if (!to || !subject || !html) {
      console.error('Missing email parameters:', { to, subject, hasHtml: !!html });
      throw new Error('Missing required email parameters');
    }

    const transporter = await createTransporter();
    
    const mailOptions = {
      from: `"Job Portal" <${process.env.GOOGLE_EMAIL}>`,
      to,
      subject,
      html
    };

    console.log('Sending email with options:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject
    });

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error in sendEmail:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      command: error.command
    });
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

// Get verification email template
export const getVerificationEmailTemplate = (verificationUrl) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Email Verification</h2>
      <p>Thank you for registering! Please click the button below to verify your email address:</p>
      <a href="${verificationUrl}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 20px 0;">
        Verify Email
      </a>
      <p>If the button doesn't work, you can also click this link:</p>
      <p><a href="${verificationUrl}">${verificationUrl}</a></p>
      <p>This link will expire in 24 hours.</p>
      <p>If you didn't create an account, you can safely ignore this email.</p>
    </div>
  `;
}; 