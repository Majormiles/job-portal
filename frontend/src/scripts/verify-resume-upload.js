import axios from 'axios';
import fs from 'fs';
import path from 'path';
import FormData from 'form-data';

// Test configuration
const API_URL = 'http://localhost:5000/api';
const TEST_USER = {
  email: 'markhasonn@gmail.com',
  password: 'goodness'
};

async function createTestPdf() {
  const pdfContent = `%PDF-1.7
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> /MediaBox [0 0 612 792] /Contents 5 0 R >>
endobj
4 0 obj
<< /Type /Font /Subtype /Type1 /Name /F1 /BaseFont /Helvetica >>
endobj
5 0 obj
<< /Length 44 >>
stream
BT /F1 24 Tf 72 720 Td (Test Resume) Tj ET
endstream
endobj
xref
0 6
0000000000 65535 f
0000000010 00000 n
0000000060 00000 n
0000000115 00000 n
0000000230 00000 n
0000000310 00000 n
trailer
<< /Size 6 /Root 1 0 R >>
startxref
405
%%EOF`;

  const filePath = path.join(process.cwd(), 'test-resume.pdf');
  fs.writeFileSync(filePath, pdfContent);
  console.log('✓ Test PDF created');
  return filePath;
}

async function verifyResumeUpload() {
  try {
    console.log('\n=== RESUME UPLOAD VERIFICATION ===\n');

    // 1. Login
    console.log('1. Logging in...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'markhasonn@gmail.com',
      password: 'goodness'
    });
    console.log('✓ Login successful\n');

    // 2. Create test PDF file
    console.log('2. Creating test PDF file...');
    const pdfPath = path.join(process.cwd(), 'test-resume.pdf');
    fs.writeFileSync(pdfPath, 'Test PDF content');
    console.log('✓ Test PDF created\n');

    // 3. Test resume upload
    console.log('3. Testing resume upload...');
    const formData = new FormData();
    formData.append('resume', fs.createReadStream(pdfPath));

    // Create professional info data
    const professionalInfo = {
      experience: {
        currentRole: 'Software Developer',
        yearsOfExperience: '3',
        company: 'Tech Corp',
        desiredRole: 'Senior Developer',
        industry: 'Technology'
      },
      education: {
        degree: 'Bachelor of Science',
        institution: 'University',
        graduationYear: '2020',
        field: 'Computer Science'
      }
    };

    // Append professional info data
    formData.append('data', JSON.stringify(professionalInfo));

    // Upload resume
    console.log('Uploading resume...');
    const uploadResponse = await axios.put(
      `${API_URL}/users/onboarding/professional-info`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${loginResponse.data.token}`,
        },
      }
    );

    console.log('✓ Resume upload successful');
    console.log('Response:', JSON.stringify(uploadResponse.data, null, 2));

    // Check for resume URL in upload response
    const resumeUrl = uploadResponse.data?.data?.professionalInfo?.data?.resume;
    if (resumeUrl) {
      console.log('✓ Resume URL found in upload response:', resumeUrl);
    } else {
      console.log('✗ Resume URL not found in upload response');
    }

    // 4. Verify resume in onboarding status
    console.log('\n4. Verifying resume in onboarding status...');
    const onboardingResponse = await axios.get(`${API_URL}/users/onboarding-status`, {
      headers: { Authorization: `Bearer ${loginResponse.data.token}` }
    });
    console.log('Onboarding Status Response:', JSON.stringify(onboardingResponse.data, null, 2));

    const userResponse = await axios.get(`${API_URL}/users/me`, {
      headers: { Authorization: `Bearer ${loginResponse.data.token}` }
    });
    console.log('User Profile Response:', JSON.stringify(userResponse.data, null, 2));

    const onboardingResumeUrl = onboardingResponse.data?.data?.professionalInfo?.data?.resume;
    const userResumeUrl = userResponse.data?.data?.professionalInfo?.resume;

    if (onboardingResumeUrl || userResumeUrl) {
      console.log('✓ Resume found:', onboardingResumeUrl || userResumeUrl);
    } else {
      console.log('✗ Resume not found in either onboarding status or user profile');
    }

    // 5. Clean up
    console.log('\n5. Cleaning up...');
    fs.unlinkSync(pdfPath);
    console.log('✓ Test file removed');

  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    throw error;
  }
}

verifyResumeUpload();