// Simple script to start the chatbot server
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('Starting chatbot server on port 5050...');

// Set the PORT environment variable to 5050
process.env.PORT = '5050';

// Run the server
try {
  // Determine whether to use npm.cmd (Windows) or npm (Unix)
  const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  
  // Path to the backend directory
  const backendPath = join(__dirname, 'backend');
  
  // Run the server
  const serverProcess = spawn(npmCmd, ['start'], {
    cwd: backendPath,
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, PORT: '5050' }
  });
  
  // Handle server process events
  serverProcess.on('error', (err) => {
    console.error('Failed to start server:', err);
  });
  
  // Handle clean shutdown
  process.on('SIGINT', () => {
    console.log('Shutting down chatbot server...');
    serverProcess.kill();
    process.exit();
  });
  
  console.log('Chatbot server starting. Press Ctrl+C to stop.');
} catch (error) {
  console.error('Error starting chatbot server:', error);
} 