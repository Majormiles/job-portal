import dotenv from 'dotenv';
import mongoose from 'mongoose';
import http from 'http';
import app from './app.js';
import path from 'path';
import { fileURLToPath } from 'url';
import notificationService from './services/notificationService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables with explicit path
const result = dotenv.config({ path: path.join(__dirname, '../.env') });
if (result.error) {
  console.error('Error loading .env file:', result.error);
  process.exit(1);
}

console.log('Environment variables loaded from:', path.join(__dirname, '../.env'));
console.log('Environment check:', {
  GOOGLE_EMAIL: process.env.GOOGLE_EMAIL ? '✓ Set' : 'Not set',
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? '✓ Set' : 'Not set',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? '✓ Set' : 'Not set',
  GOOGLE_REFRESH_TOKEN: process.env.GOOGLE_REFRESH_TOKEN ? '✓ Set' : 'Not set'
});

const port = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Connect to MongoDB
console.log('Attempting to connect to MongoDB at:', process.env.MONGODB_URI);
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Successfully connected to MongoDB');
    // Log connection info
    const conn = mongoose.connection;
    console.log(`MongoDB Connection Details: 
    - Host: ${conn.host}
    - Name: ${conn.name}
    - Port: ${conn.port}
    - Connected: ${conn.readyState === 1}`);
    
    // Initialize WebSocket server
    const wss = notificationService.initializeWebSocketServer(server);
    console.log('WebSocket server is running');
    
    // Start HTTP server
    server.listen(port, () => {
      console.log(`Server is running on port ${port}`);
      console.log(`API is available at http://localhost:${port}/api`);
      console.log(`WebSocket server is available at ws://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
}); 