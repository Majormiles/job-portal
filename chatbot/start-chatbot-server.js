// Simple script to start the chatbot server
const { spawn } = require('child_process');
const path = require('path');
const os = require('os');
const fs = require('fs');

// Determine the command based on the OS
const isWindows = os.platform() === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';

console.log('Starting chatbot server on port 5050...');

// Ensure the .env file has the correct port
const envFilePath = path.join(__dirname, 'backend', '.env');
try {
  // Check if .env file exists
  if (fs.existsSync(envFilePath)) {
    let envContent = fs.readFileSync(envFilePath, 'utf8');
    
    // Update PORT if needed
    if (envContent.includes('PORT=')) {
      envContent = envContent.replace(/PORT=(\d+)/g, 'PORT=5050');
    } else {
      envContent += '\nPORT=5050';
    }
    
    // Update REACT_APP_BACKEND_URL if needed
    if (envContent.includes('REACT_APP_BACKEND_URL=')) {
      envContent = envContent.replace(
        /REACT_APP_BACKEND_URL=http:\/\/localhost:(\d+)/g, 
        'REACT_APP_BACKEND_URL=http://localhost:5050'
      );
    } else {
      envContent += '\nREACT_APP_BACKEND_URL=http://localhost:5050';
    }
    
    fs.writeFileSync(envFilePath, envContent);
    console.log('.env file updated to use port 5050.');
  } else {
    console.log('.env file not found, will rely on default port in the server code.');
  }
} catch (error) {
  console.error('Error updating port in .env file:', error);
}

// Set environment variable for this process
process.env.PORT = '5050';

// Change directory to the backend folder and start the server
const serverProcess = spawn(npmCmd, ['start'], {
  cwd: path.join(__dirname, 'backend'),
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, PORT: '5050' } // Explicitly set PORT env variable
});

serverProcess.on('error', (err) => {
  console.error('Failed to start chatbot server:', err);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down chatbot server...');
  serverProcess.kill();
  process.exit();
});

console.log('Chatbot server process started on port 5050. Press Ctrl+C to stop.'); 