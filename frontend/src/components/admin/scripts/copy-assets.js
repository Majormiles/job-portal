const fs = require('fs-extra');
const path = require('path');

// Source and destination directories
const sourceDir = path.join(__dirname, '../assets');
const destDir = path.join(__dirname, '../public/assets');

console.log('Source directory:', sourceDir);
console.log('Destination directory:', destDir);

// Ensure destination directory exists
fs.ensureDirSync(destDir);

// Copy all assets
try {
  fs.copySync(sourceDir, destDir, { overwrite: true });
  console.log('Assets copied successfully!');
  
  // List copied files
  const files = fs.readdirSync(destDir);
  console.log('Copied directories:', files);
  
  // Check specific files
  const cssFiles = fs.readdirSync(path.join(destDir, 'css'));
  console.log('CSS files:', cssFiles);
  
  const jsFiles = fs.readdirSync(path.join(destDir, 'js'));
  console.log('JS files:', jsFiles);
  
  const imgFiles = fs.readdirSync(path.join(destDir, 'img'));
  console.log('Image files:', imgFiles);
} catch (err) {
  console.error('Error copying assets:', err);
  process.exit(1);
} 