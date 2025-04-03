const fs = require('fs');
const path = require('path');

// Function to read and parse a file
const readFile = (filePath) => {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return null;
  }
};

// Function to write file
const writeFile = (filePath, content) => {
  try {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  } catch (error) {
    console.error(`Error writing file ${filePath}:`, error);
    return false;
  }
};

const verifyAndFixOnboardingParams = () => {
  console.log('Starting onboarding parameter verification...');

  // 1. Check PersonalInfo.js
  const personalInfoPath = path.join(__dirname, '../../../frontend/src/pages/onboarding/PersonalInfo.js');
  console.log('\nChecking PersonalInfo.js...');
  const personalInfoContent = readFile(personalInfoPath);

  if (personalInfoContent) {
    // Look for updateOnboardingStatus call
    const updateStatusRegex = /updateOnboardingStatus\((.*?)\)/g;
    const matches = [...personalInfoContent.matchAll(updateStatusRegex)];

    console.log('Found updateOnboardingStatus calls:', matches.length);
    matches.forEach((match, index) => {
      console.log(`Call ${index + 1}:`, match[0]);
    });
  }

  // 2. Check AuthContext.js
  const authContextPath = path.join(__dirname, '../../../frontend/src/contexts/AuthContext.js');
  console.log('\nChecking AuthContext.js...');
  const authContextContent = readFile(authContextPath);

  if (authContextContent) {
    // Look for updateOnboardingStatus function definition
    const functionDefRegex = /const updateOnboardingStatus = async \((.*?)\) =>/;
    const match = authContextContent.match(functionDefRegex);

    if (match) {
      console.log('Found function definition with parameters:', match[1]);
    }
  }

  // 3. Fix PersonalInfo.js
  console.log('\nFixing PersonalInfo.js...');
  if (personalInfoContent) {
    // Fix the updateOnboardingStatus call
    let fixedContent = personalInfoContent.replace(
      /const updatedStatus = await updateOnboardingStatus\((.*?)\);/g,
      (match, params) => {
        // Split parameters and reverse their order if needed
        const paramsList = params.split(',').map(p => p.trim());
        if (paramsList.length === 2 && paramsList[0] !== "'personalInfo'" && paramsList[0] !== '"personalInfo"') {
          console.log('Fixing parameter order...');
          return `const updatedStatus = await updateOnboardingStatus('personalInfo', ${paramsList[0]});`;
        }
        return match;
      }
    );

    // Write the fixed content back
    if (writeFile(personalInfoPath, fixedContent)) {
      console.log('Successfully fixed PersonalInfo.js');
    }
  }

  // 4. Verify the fix
  console.log('\nVerifying the fix...');
  const verifyContent = readFile(personalInfoPath);
  if (verifyContent) {
    const verifyRegex = /updateOnboardingStatus\('personalInfo',.*?\)/;
    const verifyMatch = verifyContent.match(verifyRegex);
    if (verifyMatch) {
      console.log('Verification successful. Found correct parameter order:', verifyMatch[0]);
    }
  }
};

// Run the verification and fix
verifyAndFixOnboardingParams(); 