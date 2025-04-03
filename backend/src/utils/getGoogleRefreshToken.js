import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

const OAuth2 = google.auth.OAuth2;

// Create OAuth2 client
const oauth2Client = new OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'http://localhost:3000/oauth2callback' // This should match your authorized redirect URI
);

// Generate the URL for user consent
const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: [
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/gmail.compose'
  ]
});

console.log('Please visit this URL to authorize the application:');
console.log(authUrl);

// After user visits the URL and authorizes, they will be redirected to your callback URL
// with a code parameter. You'll need to create a route to handle this callback:

export const handleCallback = async (code) => {
  try {
    const { tokens } = await oauth2Client.getToken(code);
    console.log('Refresh Token:', tokens.refresh_token);
    console.log('Access Token:', tokens.access_token);
    console.log('Token Expiry:', tokens.expiry_date);
    
    // Save these tokens securely in your .env file
    console.log('\nAdd these to your .env file:');
    console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`);
    console.log(`GOOGLE_ACCESS_TOKEN=${tokens.access_token}`);
    
    return tokens;
  } catch (error) {
    console.error('Error getting tokens:', error);
    throw error;
  }
};

export const getAuthUrl = () => authUrl; 