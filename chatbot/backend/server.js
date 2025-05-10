const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Initialize Express app
const app = express();
app.use(cors());
app.use(express.json());

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
}

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

// Updated Job portal domain knowledge
const jobPortalInfo = {
  name: "Job Portal",
  description: "A platform connecting job seekers, employers, trainers, and trainees",
  userRoles: [
    {
      name: "Job Seeker",
      description: "Upload your resume and get connected with potential employers",
      fee: "50 Ghana cedis (one-time payment)",
      features: [
        "Resume upload",
        "Email-only login",
        "One-time payment of 50 Ghana cedis"
      ]
    },
    {
      name: "Employer",
      description: "Connect with admin to provide jobs and reach potential employees",
      fee: "100 Ghana cedis (one-time payment)",
      features: [
        "Apply for job avenue",
        "Connect with admin to provide jobs",
        "Email-only login",
        "One-time payment of 100 Ghana cedis"
      ]
    },
    {
      name: "Trainer",
      description: "Offer training to trainees seeking to improve their skills",
      fee: "100 Ghana cedis (one-time payment)",
      features: [
        "Resume upload",
        "Offer training to trainees",
        "Email-only login",
        "One-time payment of 100 Ghana cedis"
      ]
    },
    {
      name: "Trainee",
      description: "Receive training to enhance your skills and improve job prospects",
      fee: "50 Ghana cedis (one-time payment)",
      features: [
        "Apply for job avenue",
        "Receive training from qualified trainers",
        "Email-only login",
        "One-time payment of 50 Ghana cedis"
      ]
    }
  ],
  jobAvenue: {
    description: "Job Avenue is our exclusive platform where employers can post job opportunities and connect with qualified candidates, while trainees can access specialized training programs and job opportunities.",
    forEmployers: "As an employer, applying for Job Avenue allows you to connect with our admin to provide job details which will be matched with suitable candidates. This service is included in your one-time payment of 100 Ghana cedis.",
    forTrainees: "As a trainee, Job Avenue gives you access to specialized training programs and job opportunities that match your skills and career goals. This service is included in your one-time payment of 50 Ghana cedis."
  },
  paymentInfo: {
    methods: ["Mobile Money", "Bank Transfer", "Credit Card"],
    process: "After registration, you'll be directed to our secure payment page where you can complete your one-time payment based on your selected role. Once payment is verified, you'll gain full access to your role-specific features.",
    refundPolicy: "We offer a 7-day refund policy if you decide the service doesn't meet your needs. Contact our support team to process your refund."
  },
  faqs: [
    // User role selection
    {
      question: "How do I choose the right role for me?",
      answer: "If you're looking for employment, select 'Job Seeker'. If you're offering jobs, select 'Employer'. If you want to provide training, select 'Trainer'. If you want to receive training, select 'Trainee'. For more detailed guidance, use our role selection wizard in the registration process."
    },
    {
      question: "Can I change my role later?",
      answer: "Once registered, changing your role requires contacting our admin team. Since each role has a different payment structure, a role change may require additional payment if upgrading from a lower-tier role."
    },
    // Payment-related questions
    {
      question: "How much does it cost to register?",
      answer: "The registration fee varies based on your role: Job Seekers and Trainees pay a one-time fee of 50 Ghana cedis, while Employers and Trainers pay 100 Ghana cedis. This is a one-time payment that gives you lifetime access to your role-specific features."
    },
    {
      question: "What payment methods are accepted?",
      answer: "We accept Mobile Money, Bank Transfer, and Credit Card. Detailed payment instructions will be provided during the registration process."
    },
    {
      question: "Is the payment a subscription or one-time?",
      answer: "All payments are one-time only. Once you pay the fee for your selected role, you'll have lifetime access to those role-specific features with no recurring fees."
    },
    {
      question: "What if I need a refund?",
      answer: "We offer a 7-day refund policy. If you decide our service doesn't meet your needs within 7 days of payment, contact our support team to process your refund."
    },
    // Email verification questions
    {
      question: "Why do I need to verify my email?",
      answer: "Email verification is mandatory to ensure the security of your account and to maintain the integrity of our platform. It also helps us communicate important updates about your account and potential opportunities."
    },
    {
      question: "I didn't receive my verification email. What should I do?",
      answer: "Please check your spam/junk folder first. If you still don't see it, click the 'Resend Verification Email' button on the verification page. If issues persist, contact our support team for assistance."
    },
    {
      question: "How long does email verification take?",
      answer: "Email verification is usually instant. Once you click the verification link in your email, your account should be verified immediately, allowing you to proceed with the payment and access your dashboard."
    },
    // Resume upload questions
    {
      question: "How do I upload my resume?",
      answer: "Job Seekers and Trainers can upload their resume from their dashboard. Click on the 'Resume' section, then 'Upload Resume'. We accept PDF, DOCX, and DOC formats up to 5MB in size."
    },
    {
      question: "What file formats are accepted for resume upload?",
      answer: "We accept resumes in PDF, DOCX, and DOC formats. The maximum file size is 5MB."
    },
    // Job Avenue questions
    {
      question: "What is Job Avenue?",
      answer: "Job Avenue is our exclusive platform where employers can post job opportunities and connect with qualified candidates, while trainees can access specialized training programs and job opportunities that match their skills and career goals."
    },
    {
      question: "How do I apply for Job Avenue as an employer?",
      answer: "As an employer, after completing registration and payment, navigate to the 'Job Avenue' section in your dashboard and click 'Apply'. You'll be connected with our admin team to provide details about your job offerings."
    },
    {
      question: "How do I apply for Job Avenue as a trainee?",
      answer: "As a trainee, after completing registration and payment, visit the 'Job Avenue' section in your dashboard and click 'Apply'. You'll be able to browse available training programs and job opportunities."
    },
    // Legacy questions (redirected to new functionality)
    {
      question: "How do I search for jobs?",
      answer: "Our platform has evolved to a role-based system. If you're looking for employment, please register as a Job Seeker (50 Ghana cedis one-time fee). After registration and payment, you'll upload your resume and our system will connect you with suitable opportunities."
    },
    {
      question: "How do I post a job?",
      answer: "Our platform has evolved to a role-based system. To post jobs, please register as an Employer (100 Ghana cedis one-time fee). After registration and payment, you'll connect with our admin team through Job Avenue to provide your job openings."
    },
    {
      question: "How do I filter job results?",
      answer: "Our platform has evolved from a job browsing system to a role-based matching system. After registering as a Job Seeker and uploading your resume, our system will automatically match you with relevant opportunities based on your qualifications."
    },
    {
      question: "Can I save jobs for later?",
      answer: "Our platform has evolved to a more direct connection system. After registering as a Job Seeker and uploading your resume, you'll receive notifications about matching opportunities directly via email."
    },
    // Role-specific questions
    {
      question: "What do I need to do as a Job Seeker?",
      answer: "As a Job Seeker, after registration, email verification, and one-time payment of 50 Ghana cedis, you'll need to upload your resume. Our system will then match you with suitable job opportunities based on your qualifications."
    },
    {
      question: "What do I need to do as an Employer?",
      answer: "As an Employer, after registration, email verification, and one-time payment of 100 Ghana cedis, you'll apply for Job Avenue to connect with our admin team. You'll provide details about your job openings, and we'll help match you with qualified candidates."
    },
    {
      question: "What do I need to do as a Trainer?",
      answer: "As a Trainer, after registration, email verification, and one-time payment of 100 Ghana cedis, you'll upload your resume and qualifications. You can then offer training programs to trainees through our platform."
    },
    {
      question: "What do I need to do as a Trainee?",
      answer: "As a Trainee, after registration, email verification, and one-time payment of 50 Ghana cedis, you'll apply for Job Avenue to access specialized training programs and job opportunities that match your career goals."
    },
    // System transition explanation
    {
      question: "Why has the system changed?",
      answer: "We've evolved from a job browsing platform to a more structured role-based system to provide better value and more targeted connections between job seekers, employers, trainers, and trainees. This new system allows for more personalized matching and specialized services for each user type."
    }
  ],
  // Additional information for more robust responses
  resumeTips: [
    "Keep your resume concise and relevant",
    "Highlight your accomplishments, not just job duties",
    "Use action verbs to describe your experience",
    "Tailor your resume to your industry",
    "Include measurable achievements when possible",
    "Ensure your contact information is up-to-date",
    "Proofread for spelling and grammar errors"
  ],
  employerTips: [
    "Provide clear and detailed job descriptions",
    "List specific qualifications required for the role",
    "Be transparent about job expectations and work culture",
    "Respond promptly to candidate inquiries",
    "Prepare structured interview questions",
    "Consider both skills and cultural fit when evaluating candidates",
    "Provide feedback to candidates after interviews"
  ],
  trainerTips: [
    "Clearly define your areas of expertise",
    "Structure your training programs with clear objectives",
    "Include both theoretical knowledge and practical exercises",
    "Provide regular feedback to trainees",
    "Adapt your training methods to different learning styles",
    "Stay updated with the latest industry developments",
    "Collect feedback to improve your training programs"
  ],
  traineeTips: [
    "Identify your learning goals before starting training",
    "Be proactive in asking questions during training sessions",
    "Apply what you learn through practical exercises",
    "Seek feedback on your progress regularly",
    "Network with other trainees and professionals",
    "Keep a record of skills acquired during training",
    "Update your resume with new skills after completing training"
  ]
};

// Store conversation history for each user with persistence
const userConversations = new Map();
const CONVERSATION_FILE = path.join(__dirname, 'conversations.json');

// Load existing conversations if available
try {
  if (fs.existsSync(CONVERSATION_FILE)) {
    const data = fs.readFileSync(CONVERSATION_FILE, 'utf8');
    const savedConversations = JSON.parse(data);
    
    // Convert the plain object back to a Map
    Object.entries(savedConversations).forEach(([key, value]) => {
      userConversations.set(key, value);
    });
    
    console.log(`Loaded ${Object.keys(savedConversations).length} existing conversations`);
  }
} catch (error) {
  console.error('Error loading conversation history:', error);
}

// Save conversations periodically
const saveConversations = () => {
  try {
    // Convert the Map to a plain object for JSON serialization
    const conversationsObj = {};
    userConversations.forEach((value, key) => {
      conversationsObj[key] = value;
    });
    
    fs.writeFileSync(CONVERSATION_FILE, JSON.stringify(conversationsObj, null, 2));
    console.log('Conversation history saved');
  } catch (error) {
    console.error('Error saving conversation history:', error);
  }
};

// Save conversations every 5 minutes and on server shutdown
const saveInterval = setInterval(saveConversations, 5 * 60 * 1000);
process.on('SIGINT', () => {
  clearInterval(saveInterval);
  saveConversations();
  process.exit();
});

// Rule-based response generation functions
// This replaces the OpenAI integration with a custom implementation

// Process query for response
const processQuery = (query, sessionData = {}) => {
  // Normalize query by converting to lowercase and removing punctuation
  const normalizedQuery = query.toLowerCase().replace(/[^\w\s]/g, '');
  
  // Look for exact FAQ matches first
  const faqMatch = findFaqMatch(normalizedQuery);
  if (faqMatch) return faqMatch;
  
  // Check for keyword-based responses
  const keywordResponse = getKeywordResponse(normalizedQuery, sessionData);
  if (keywordResponse) return keywordResponse;
  
  // Return generic response if no matches
  return getGenericResponse(sessionData);
};

// Find matching FAQ
const findFaqMatch = (normalizedQuery) => {
  // First check for exact or close matches to questions
  for (const faq of jobPortalInfo.faqs) {
    const normalizedQuestion = faq.question.toLowerCase().replace(/[^\w\s]/g, '');
    
    // Check if query is very similar to the question
    if (normalizedQuery.includes(normalizedQuestion) || 
        normalizedQuestion.includes(normalizedQuery) ||
        calculateSimilarity(normalizedQuery, normalizedQuestion) > 0.6) {
      return faq.answer;
    }
    
    // Check for key phrases in the question
    const questionParts = normalizedQuestion.split(' ');
    if (questionParts.length > 2) {
      const keyParts = questionParts.filter(part => part.length > 3);
      if (keyParts.some(part => normalizedQuery.includes(part)) && 
          calculateSimilarity(normalizedQuery, normalizedQuestion) > 0.3) {
        return faq.answer;
      }
    }
  }
  
  return null;
};

// Calculate similarity between two strings (simple implementation)
const calculateSimilarity = (str1, str2) => {
  const words1 = str1.split(' ');
  const words2 = str2.split(' ');
  
  // Count matching words
  const matchingWords = words1.filter(word => words2.includes(word)).length;
  
  // Calculate similarity score
  return matchingWords / Math.max(words1.length, words2.length);
};

// Get response based on keywords
const getKeywordResponse = (normalizedQuery, sessionData = {}) => {
  // Create sets of keywords for different categories
  const roleSelectionKeywords = ['role', 'choose', 'select', 'which', 'best', 'right', 'fit', 'match', 'suited'];
  const jobSeekerKeywords = ['job seeker', 'jobseeker', 'find job', 'looking for job', 'need job', 'seek employment'];
  const employerKeywords = ['employer', 'hiring', 'recruit', 'post job', 'job post', 'seeking employee', 'offer job'];
  const trainerKeywords = ['trainer', 'training', 'teach', 'instructor', 'offer training', 'provide training'];
  const traineeKeywords = ['trainee', 'learn', 'training program', 'receive training', 'need training', 'skill development'];
  const resumeKeywords = ['resume', 'cv', 'portfolio', 'skills', 'experience', 'qualification', 'upload'];
  const jobAvenueKeywords = ['job avenue', 'jobavenue', 'avenue', 'connect admin', 'provide jobs', 'job platform'];
  const paymentKeywords = ['payment', 'pay', 'cost', 'fee', 'money', 'price', 'cedis', 'ghana', 'charge'];
  const emailKeywords = ['email', 'verification', 'verify', 'login', 'sign in', 'authentication', 'confirm'];
  const systemChangeKeywords = ['change', 'changed', 'different', 'new system', 'update', 'transition', 'no longer'];
  const greetingKeywords = ['hello', 'hi', 'hey', 'greetings', 'whats up', 'how are you'];
  const helpKeywords = ['help', 'assist', 'support', 'guide', 'info', 'information'];
  const websiteKeywords = ['website', 'site', 'platform', 'portal', 'about', 'information', 'what is', 'tell me about'];
  const contactKeywords = ['contact', 'admin', 'administrator', 'support', 'help desk', 'email', 'phone', 'reach', 'talk to', 'message', 'chat with'];
  
  // Check for role selection guidance
  if (roleSelectionKeywords.some(keyword => normalizedQuery.includes(keyword))) {
    if (normalizedQuery.includes('role')) {
      return `We have four distinct user roles:

1. **Job Seeker (50 Ghana cedis)**: If you're looking for employment opportunities, this role lets you upload your resume and connect with potential employers.

2. **Employer (100 Ghana cedis)**: If you're hiring, this role lets you apply for Job Avenue and connect with admin to provide job openings.

3. **Trainer (100 Ghana cedis)**: If you want to offer training programs, this role lets you upload your resume and connect with trainees.

4. **Trainee (50 Ghana cedis)**: If you want to receive training to enhance your skills, this role gives you access to training programs and job opportunities.

All roles require a one-time payment and email-only login. Which role are you interested in?`;
    }
    
    return `To choose the right role, consider your primary goal:

• Looking for a job? → Job Seeker (50 Ghana cedis)
• Hiring employees? → Employer (100 Ghana cedis)
• Want to provide training? → Trainer (100 Ghana cedis)
• Want to receive training? → Trainee (50 Ghana cedis)

All options require a one-time payment and email-only login. Which best describes your situation?`;
  }
  
  // Check for Job Seeker information
  if (jobSeekerKeywords.some(keyword => normalizedQuery.includes(keyword))) {
    return `As a Job Seeker, you'll:

• Pay a one-time fee of 50 Ghana cedis
• Login with email (verification required)
• Upload your resume
• Get matched with potential employers

After registration and payment, you'll access your dashboard where you can upload your resume and our system will connect you with suitable job opportunities.`;
  }
  
  // Check for Employer information
  if (employerKeywords.some(keyword => normalizedQuery.includes(keyword))) {
    return `As an Employer, you'll:

• Pay a one-time fee of 100 Ghana cedis
• Login with email (verification required)
• Apply for Job Avenue
• Connect with admin to provide job details

After registration and payment, you'll access your dashboard where you can apply for Job Avenue and our admin team will help you post your job openings and find suitable candidates.`;
  }
  
  // Check for Trainer information
  if (trainerKeywords.some(keyword => normalizedQuery.includes(keyword))) {
    return `As a Trainer, you'll:

• Pay a one-time fee of 100 Ghana cedis
• Login with email (verification required)
• Upload your resume and qualifications
• Offer training to trainees

After registration and payment, you'll access your dashboard where you can upload your resume and create training programs that will be matched with interested trainees.`;
  }
  
  // Check for Trainee information
  if (traineeKeywords.some(keyword => normalizedQuery.includes(keyword))) {
    return `As a Trainee, you'll:

• Pay a one-time fee of 50 Ghana cedis
• Login with email (verification required)
• Apply for Job Avenue
• Access training programs and job opportunities

After registration and payment, you'll access your dashboard where you can apply for Job Avenue to browse available training programs and job opportunities that match your career goals.`;
  }
  
  // Check for resume upload information
  if (resumeKeywords.some(keyword => normalizedQuery.includes(keyword))) {
    if (normalizedQuery.includes('upload') || normalizedQuery.includes('how')) {
      return `To upload your resume (for Job Seekers and Trainers):

1. Log in to your account
2. Navigate to your dashboard
3. Click on the "Resume" section
4. Select "Upload Resume"
5. Choose your file (PDF, DOCX, or DOC formats, max 5MB)
6. Click "Upload"

Your resume will be stored in our system and used to match you with relevant opportunities or trainees.`;
    }
    
    if (normalizedQuery.includes('tip') || normalizedQuery.includes('advice')) {
      const randomTip = jobPortalInfo.resumeTips[Math.floor(Math.random() * jobPortalInfo.resumeTips.length)];
      return `Resume tip: ${randomTip}. Would you like more resume tips?`;
    }
    
    return `Job Seekers and Trainers need to upload their resume to our platform. You can upload PDF, DOCX, or DOC formats (max 5MB). A well-crafted resume helps our system match you with the best opportunities or trainees.`;
  }
  
  // Check for Job Avenue information
  if (jobAvenueKeywords.some(keyword => normalizedQuery.includes(keyword))) {
    if (normalizedQuery.includes('employer')) {
      return jobPortalInfo.jobAvenue.forEmployers;
    }
    
    if (normalizedQuery.includes('trainee')) {
      return jobPortalInfo.jobAvenue.forTrainees;
    }
    
    return jobPortalInfo.jobAvenue.description;
  }
  
  // Check for payment information
  if (paymentKeywords.some(keyword => normalizedQuery.includes(keyword))) {
    if (normalizedQuery.includes('method') || normalizedQuery.includes('how')) {
      return `We accept the following payment methods:
• Mobile Money
• Bank Transfer
• Credit Card
• 

Detailed payment instructions will be provided during the registration process after email verification.`;
    }
    
    if (normalizedQuery.includes('refund')) {
      return jobPortalInfo.paymentInfo.refundPolicy;
    }
    
    if (normalizedQuery.includes('cost') || normalizedQuery.includes('fee') || normalizedQuery.includes('much')) {
      return `Our one-time payment structure is based on role:

• Job Seekers: 50 Ghana cedis
• Employers: 100 Ghana cedis
• Trainers: 100 Ghana cedis
• Trainees: 50 Ghana cedis

This is a one-time payment that gives you lifetime access to your role-specific features with no recurring fees.`;
    }
    
    return jobPortalInfo.paymentInfo.process;
  }
  
  // Check for email verification information
  if (emailKeywords.some(keyword => normalizedQuery.includes(keyword))) {
    if (normalizedQuery.includes('didnt receive') || normalizedQuery.includes('not receive') || normalizedQuery.includes('resend')) {
      return `If you didn't receive your verification email:

1. Check your spam/junk folder
2. Verify you entered the correct email address
3. Click the "Resend Verification Email" button on the verification page
4. If issues persist, contact our support team at support@major.com`;
    }
    
    if (normalizedQuery.includes('why') || normalizedQuery.includes('reason')) {
      return `Email verification is mandatory to:
• Ensure the security of your account
• Maintain the integrity of our platform
• Enable us to communicate important updates about your account
• Send notifications about matching opportunities or connections`;
    }
    
    return `Email verification is a quick process:
1. After registration, check your inbox for the verification email
2. Click the verification link in the email
3. Once verified, you'll proceed to the payment page
4. After payment, you'll access your role-specific dashboard

If you don't receive the verification email, check your spam folder or click "Resend Verification Email" on the verification page.`;
  }
  
  // Check for system transition information
  if (systemChangeKeywords.some(keyword => normalizedQuery.includes(keyword))) {
    return `We've evolved from a job browsing platform to a more structured role-based system with four distinct user types:

• Job Seekers (upload resumes, pay 50 Ghana cedis)
• Employers (apply for job avenue, connect with admin to provide jobs, pay 100 Ghana cedis)
• Trainers (upload resumes, offer training to trainees, pay 100 Ghana cedis)
• Trainees (apply for job avenue, receive training, pay 50 Ghana cedis)

This new system allows for more personalized matching and specialized services for each user type, with a simple one-time payment structure and email-only login.`;
  }
  
  // Check for contact/admin questions
  if (contactKeywords.some(keyword => normalizedQuery.includes(keyword))) {
    if (normalizedQuery.includes('admin') || 
        normalizedQuery.includes('administrator') || 
        normalizedQuery.includes('support')) {
      return "You can contact our admin team in several ways:\n\n" +
             "• Email: admin@major.com\n" +
             "• Phone:  (+233) 247 466 205 (Mon-Fri, 9AM-5PM EST)\n" +
             "• Support ticket: Click the 'Support' link in the footer of any page\n" +
             "• Live chat: Available during business hours through the chat icon in the bottom right corner";
    }
    
    if (normalizedQuery.includes('technical') || normalizedQuery.includes('issue') || normalizedQuery.includes('problem')) {
      return "For technical issues, please contact our technical support team:\n\n" +
             "• Email: support@major.com\n" +
             "• Phone: (+233) 247 466 205\n" +
             "• Support ticket: Click 'Help' → 'Report a Problem' in the main menu";
    }
    
    // General contact response
    return "For any assistance, you can contact our support team through:\n\n" +
           "• Email: support@major.com\n" +
           "• Phone:  (+233) 247 466 205\n" +
           "• Live chat: Available through the chat icon in the bottom right corner\n" +
           "• In-app: Click the 'Help' button in the main menu";
  }
  
  // Check for website information
  if (websiteKeywords.some(keyword => normalizedQuery.includes(keyword))) {
    return `This is ${jobPortalInfo.name}, ${jobPortalInfo.description}. 

Our platform offers four distinct user roles:
• Job Seekers (pay 50 Ghana cedis): Upload resumes and connect with employers
• Employers (pay 100 Ghana cedis): Apply for job avenue and provide job opportunities
• Trainers (pay 100 Ghana cedis): Upload resumes and offer training to trainees
• Trainees (pay 50 Ghana cedis): Apply for job avenue and receive training

All roles require a one-time payment and email-only login with mandatory verification.`;
  }

  // Check for greeting
  if (greetingKeywords.some(keyword => normalizedQuery.includes(keyword))) {
    const name = sessionData.username ? ` ${sessionData.username}` : '';
    return `Hello${name}! Welcome to our Job Portal. I can help you understand our different user roles, payment structure, and features. What would you like to know about?`;
  }
  
  // Check for help request
  if (helpKeywords.some(keyword => normalizedQuery.includes(keyword))) {
    return "I can help you with selecting the right user role, understanding the payment process, resolving email verification issues, and learning about the platform's features. What specific information are you looking for?";
  }
  
  return null;
};

// Get generic response when no specific match is found
const getGenericResponse = (sessionData = {}) => {
  const genericResponses = [
    "Welcome to our Job Portal! We offer four user roles: Job Seekers, Employers, Trainers, and Trainees. Each role requires a one-time payment and email verification. How can I help you today?",
    "Our platform connects job seekers, employers, trainers, and trainees through a simple one-time payment system. Would you like to know more about our user roles and features?",
    "Whether you're looking for a job, offering employment, providing training, or seeking to improve your skills, our platform has the right role for you. Which area are you interested in?",
    "Our Job Portal has evolved to a role-based system with one-time payments. Would you like to learn about the different user roles and their specific features?",
    "Need help with selecting a user role, understanding the payment process, or navigating our platform? I'm here to assist you with any questions."
  ];
  
  return genericResponses[Math.floor(Math.random() * genericResponses.length)];
};

// Get AI-generated response without using OpenAI
const getAIResponse = async (conversationHistory, sessionData = {}) => {
  try {
    // Get the most recent user message
    const lastUserMessage = conversationHistory
      .filter(msg => msg.role === 'user')
      .pop();
    
    if (!lastUserMessage || !lastUserMessage.content) {
      return getGenericResponse(sessionData);
    }
    
    // Process the query to get a response
    return processQuery(lastUserMessage.content, sessionData);
  } catch (error) {
    console.error('Error generating response:', error);
    return getFallbackResponse(conversationHistory);
  }
};

// Generate a fallback response based on keywords in the user's last message
const getFallbackResponse = (conversationHistory) => {
  const lastUserMessage = conversationHistory.filter(msg => msg.role === 'user').pop()?.content.toLowerCase() || '';
  
  // Check for common keywords
  if (lastUserMessage.includes('job') || lastUserMessage.includes('work') || lastUserMessage.includes('career') || lastUserMessage.includes('employment')) {
    return "If you're looking for employment opportunities, consider registering as a Job Seeker (50 Ghana cedis one-time fee). After registration and payment, you'll upload your resume and our system will match you with suitable opportunities.";
  }
  
  if (lastUserMessage.includes('resume') || lastUserMessage.includes('cv')) {
    return "Job Seekers and Trainers can upload their resume through the dashboard after registration, email verification, and one-time payment. We accept PDF, DOCX, and DOC formats up to 5MB.";
  }
  
  if (lastUserMessage.includes('train') || lastUserMessage.includes('learn') || lastUserMessage.includes('skill')) {
    return "If you want to provide training, register as a Trainer (100 Ghana cedis). If you want to receive training, register as a Trainee (50 Ghana cedis). Both require a one-time payment and email verification.";
  }
  
  if (lastUserMessage.includes('payment') || lastUserMessage.includes('pay') || lastUserMessage.includes('cost') || lastUserMessage.includes('fee')) {
    return "Our platform has a one-time payment structure: Job Seekers and Trainees pay 50 Ghana cedis, while Employers and Trainers pay 100 Ghana cedis. This gives you lifetime access to your role-specific features.";
  }
  
  if (lastUserMessage.includes('email') || lastUserMessage.includes('verification') || lastUserMessage.includes('login')) {
    return "Email verification is mandatory for all users. After registration, check your inbox for the verification email, click the link, and proceed to the payment page. If you don't receive the email, check your spam folder or request a new one.";
  }
  
  if (lastUserMessage.includes('avenue') || lastUserMessage.includes('connect admin')) {
    return "Job Avenue is our exclusive platform where employers can post job opportunities and trainees can access specialized training programs. It's included in your one-time payment: 100 Ghana cedis for Employers and 50 Ghana cedis for Trainees.";
  }
  
  // Default fallback response
  return "I'm here to help you understand our job portal's new functionality with four user roles: Job Seekers, Employers, Trainers, and Trainees. Each role has specific features and a one-time payment requirement. What specific information would you like to know?";
};

// Socket.IO connection
io.on('connection', (socket) => {
  // Extract session data from handshake query
  const sessionData = {
    sessionId: socket.handshake.query.sessionId || socket.id,
    username: socket.handshake.query.username || null,
    isLoggedIn: socket.handshake.query.isLoggedIn === 'true',
    userRole: socket.handshake.query.userRole || 'guest'
  };
  
  console.log('A user connected:', socket.id, sessionData);
  
  // Initialize conversation history for the user if it doesn't exist
  if (!userConversations.has(socket.id)) {
    userConversations.set(socket.id, []);
  }

  // Handle incoming messages
  socket.on('send_message', async (data) => {
    // Prevent duplicate processing of the same message
    const conversationHistory = userConversations.get(socket.id);
    
    // Check if this is a duplicate message that was just processed
    const lastMessage = conversationHistory.length > 0 ? 
      conversationHistory[conversationHistory.length - 2] : null;
      
    if (lastMessage && 
        lastMessage.role === 'user' && 
        lastMessage.content === data.message &&
        Date.now() - (lastMessage.timestamp || 0) < 3000) {
      console.log('Duplicate message detected, ignoring:', data.message);
      return;
    }
    
    console.log('Message received from user:', socket.id);
    
    // Update conversation history with user message
    const userMessage = { 
      role: 'user', 
      content: data.message,
      timestamp: Date.now()
    };
    conversationHistory.push(userMessage);
    
    // Emit typing indicator
    io.to(socket.id).emit('bot_typing', true);
    
    // Add a small delay to simulate thinking/typing (300-1500ms)
    const thinkingTime = 300 + Math.random() * 1200;
    
    setTimeout(async () => {
      try {
        // Generate response using rule-based approach with enhanced context
        const botResponse = await getAIResponse(conversationHistory, {
          ...sessionData,
          context: data.context || {},
          userRole: data.context?.user?.role || sessionData.userRole
        });
        
        // Add bot response to conversation history
        conversationHistory.push({ 
          role: 'assistant', 
          content: botResponse,
          timestamp: Date.now()
        });
        
        // Limit conversation history to last 20 messages
        if (conversationHistory.length > 20) {
          userConversations.set(socket.id, conversationHistory.slice(-20));
        }
        
        // Save last activity timestamp
        conversationHistory.lastActivity = Date.now();
        
        // Stop typing indicator
        io.to(socket.id).emit('bot_typing', false);
        
        // Send response back to the client
        io.to(socket.id).emit('receive_message', {
          sender: 'bot',
          message: botResponse,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.error('Error in message handling:', error);
        
        // Stop typing indicator
        io.to(socket.id).emit('bot_typing', false);
        
        // Generate fallback response
        const fallbackResponse = getFallbackResponse(conversationHistory);
        
        // Add fallback response to conversation history
        conversationHistory.push({ 
          role: 'assistant', 
          content: fallbackResponse,
          timestamp: Date.now()
        });
        
        io.to(socket.id).emit('receive_message', {
          sender: 'bot',
          message: fallbackResponse,
          timestamp: new Date().toISOString(),
        });
      }
    }, thinkingTime);
  });
  
  // Handle clear conversation
  socket.on('clear_conversation', (data) => {
    userConversations.set(socket.id, []);
    
    // Send a role-based welcome message after clearing
    const roleSpecificMessage = sessionData.userRole === 'guest' 
      ? "Our conversation has been cleared. I can help you understand our platform's four user roles: Job Seekers, Employers, Trainers, and Trainees. What would you like to know?"
      : `Our conversation has been cleared. How can I assist you with your ${sessionData.userRole.replace('_', ' ')} needs today?`;
    
    io.to(socket.id).emit('conversation_cleared');
    
    // After a short delay, send the role-specific welcome message
    setTimeout(() => {
      io.to(socket.id).emit('receive_message', {
        sender: 'bot',
        message: roleSpecificMessage,
        timestamp: new Date().toISOString(),
      });
    }, 500);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    // Keep the conversation history for potential reconnection
    // Will be cleaned up eventually by a maintenance script
  });
});

// Cleanup old conversations daily (older than 7 days)
setInterval(() => {
  const now = Date.now();
  const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);
  
  userConversations.forEach((conversation, key) => {
    // If there are no messages or the last message is older than 7 days, remove it
    if (conversation.length === 0 || 
        (conversation.lastActivity && conversation.lastActivity < sevenDaysAgo)) {
      userConversations.delete(key);
    }
  });
  
  console.log(`Cleaned up old conversations. Current count: ${userConversations.size}`);
}, 24 * 60 * 60 * 1000);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Start the server
const PORT = process.env.PORT || 5050;
server.listen(PORT, () => {
  console.log(`Chatbot server is running on port ${PORT}`);
});