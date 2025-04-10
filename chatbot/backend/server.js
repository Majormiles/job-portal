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

// Job portal domain knowledge
const jobPortalInfo = {
  name: "Job Portal",
  description: "A platform connecting job seekers with employers",
  features: [
    "Job listings from various industries",
    "User profiles with skills and experience",
    "Application tracking system",
    "Job alerts and recommendations",
    "Resume builder and management",
    "Company profiles and reviews"
  ],
  faqs: [
    {
      question: "How do I create an account?",
      answer: "Click the 'Register' button in the top right corner and fill out the required information."
    },
    {
      question: "How do I search for jobs?",
      answer: "Use the search bar on the homepage or navigate to the 'Jobs' page to browse all listings."
    },
    {
      question: "How do I apply for a job?",
      answer: "Click on a job listing to view details, then click the 'Apply Now' button."
    },
    {
      question: "Can I save jobs for later?",
      answer: "Yes, click the bookmark icon on any job listing to save it to your favorites."
    },
    {
      question: "How do I update my profile?",
      answer: "Go to your dashboard and click on the 'Profile' tab to edit your information."
    },
    {
      question: "What should I include in my resume?",
      answer: "Include your contact information, work experience, education, skills, and any relevant certifications or achievements."
    },
    {
      question: "How can I track my applications?",
      answer: "Check the 'Applications' section in your dashboard to see the status of jobs you've applied for."
    },
    {
      question: "How do I set job alerts?",
      answer: "Create job alerts by specifying your preferences in the 'Job Alerts' section of your dashboard."
    },
    {
      question: "What are the top job categories?",
      answer: "Popular categories include Technology, Healthcare, Finance, Education, Marketing, Engineering, and Customer Service."
    },
    {
      question: "How do I filter job results?",
      answer: "Use the filter options on the Jobs page to narrow results by location, salary, job type, experience level, and more."
    },
    {
      question: "Can I save jobs for later?",
      answer: "Yes, click the bookmark icon on any job listing to save it to your favorites."
    },
    {
      question: "What should I include in my application?",
      answer: "Include a tailored cover letter, up-to-date resume, and any requested portfolio items or work samples."
    },
    {
      question: "Will companies see my profile?",
      answer: "Companies can view your profile when you apply for their jobs, but not before you've submitted an application."
    }
  ],
  // Additional information for more robust responses
  jobSearchTips: [
    "Update your resume before applying to highlight relevant experience",
    "Customize your cover letter for each application",
    "Research companies before interviews",
    "Set up job alerts to get notified of new opportunities",
    "Network with professionals in your target industry",
    "Follow up after submitting applications",
    "Prepare answers for common interview questions"
  ],
  resumeTips: [
    "Keep your resume concise and relevant",
    "Highlight your accomplishments, not just job duties",
    "Use action verbs to describe your experience",
    "Tailor your resume to each job application",
    "Include measurable achievements when possible",
    "Ensure your contact information is up-to-date",
    "Proofread for spelling and grammar errors"
  ],
  interviewTips: [
    "Research the company thoroughly",
    "Practice answers to common questions",
    "Prepare questions to ask the interviewer",
    "Dress professionally and arrive early",
    "Bring copies of your resume",
    "Send a thank-you note after the interview",
    "Follow up if you haven't heard back within a week"
  ],
  commonJobCategories: [
    "Technology", "Healthcare", "Finance", "Education", 
    "Marketing", "Engineering", "Sales", "Customer Service", 
    "Administration", "Management", "Hospitality", "Retail"
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
  const jobKeywords = ['job', 'jobs', 'work', 'employment', 'career', 'position', 'opening', 'hiring', 'apply'];
  const resumeKeywords = ['resume', 'cv', 'portfolio', 'skills', 'experience', 'qualification'];
  const interviewKeywords = ['interview', 'hiring', 'recruit', 'meeting', 'recruiter', 'prepare', 'question'];
  const profileKeywords = ['profile', 'account', 'dashboard', 'setup', 'information', 'details', 'personal'];
  const searchKeywords = ['find', 'search', 'look', 'seek', 'browse', 'filter', 'category', 'discovery'];
  const salaryKeywords = ['salary', 'pay', 'compensation', 'wage', 'money', 'earnings', 'income'];
  const greetingKeywords = ['hello', 'hi', 'hey', 'greetings', 'whats up', 'how are you'];
  const helpKeywords = ['help', 'assist', 'support', 'guide', 'info', 'information'];
  const websiteKeywords = ['website', 'site', 'platform', 'portal', 'about', 'information', 'what is', 'tell me about'];
  const contactKeywords = ['contact', 'admin', 'administrator', 'support', 'help desk', 'email', 'phone', 'reach', 'talk to', 'message', 'chat with'];
  
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
Our platform offers ${jobPortalInfo.features.length} main features:
• ${jobPortalInfo.features.join('\n• ')}

We connect job seekers with employers across multiple industries including 
${jobPortalInfo.commonJobCategories.slice(0, 6).join(', ')}, and more.`;
  }

  // Check for greeting
  if (greetingKeywords.some(keyword => normalizedQuery.includes(keyword))) {
    const name = sessionData.username ? ` ${sessionData.username}` : '';
    return `Hello${name}! How can I help with your job search today?`;
  }
  
  // Check for help request
  if (helpKeywords.some(keyword => normalizedQuery.includes(keyword))) {
    return "I can help you with searching for jobs, creating a profile, building your resume, preparing for interviews, and understanding how our platform works. What would you like to know?";
  }
  
  // Check for job-related questions
  if (jobKeywords.some(keyword => normalizedQuery.includes(keyword))) {
    if (normalizedQuery.includes('search') || normalizedQuery.includes('find')) {
      return "To search for jobs, use the search bar on the homepage or navigate to the 'Jobs' page. You can filter results by location, job type, salary range, and other criteria.";
    }
    
    if (normalizedQuery.includes('apply') || normalizedQuery.includes('application')) {
      return "To apply for a job, click on the job listing to view details, then click the 'Apply Now' button. You'll need to have your profile and resume completed.";
    }
    
    if (normalizedQuery.includes('save') || normalizedQuery.includes('bookmark')) {
      return "You can save jobs for later by clicking the bookmark icon on any job listing. You can view your saved jobs in the 'Saved Jobs' section of your dashboard.";
    }
    
    // General job-related response
    return "Our platform lists jobs from various industries. You can search, filter, and apply to jobs that match your skills and experience. Would you like to know more about searching for jobs or the application process?";
  }
  
  // Check for resume-related questions
  if (resumeKeywords.some(keyword => normalizedQuery.includes(keyword))) {
    if (normalizedQuery.includes('build') || normalizedQuery.includes('create')) {
      return "You can build your resume using our resume builder tool. Go to your dashboard and select the 'Resume' section to get started. The tool will guide you through adding your experience, education, and skills.";
    }
    
    if (normalizedQuery.includes('tips') || normalizedQuery.includes('advice')) {
      const randomTip = jobPortalInfo.resumeTips[Math.floor(Math.random() * jobPortalInfo.resumeTips.length)];
      return `Resume tip: ${randomTip}. Would you like more resume tips?`;
    }
    
    // General resume-related response
    return "A strong resume highlights your relevant skills and accomplishments. Our platform offers a resume builder to help you create a professional resume that stands out to employers.";
  }
  
  // Check for interview-related questions
  if (interviewKeywords.some(keyword => normalizedQuery.includes(keyword))) {
    if (normalizedQuery.includes('tips') || normalizedQuery.includes('advice')) {
      const randomTip = jobPortalInfo.interviewTips[Math.floor(Math.random() * jobPortalInfo.interviewTips.length)];
      return `Interview tip: ${randomTip}. Would you like more interview preparation advice?`;
    }
    
    // General interview-related response
    return "Preparing for interviews is crucial. Research the company, practice common questions, and prepare examples that demonstrate your skills and experience. Would you like specific interview preparation tips?";
  }
  
  // Check for profile-related questions
  if (profileKeywords.some(keyword => normalizedQuery.includes(keyword))) {
    if (normalizedQuery.includes('create') || normalizedQuery.includes('set up')) {
      return "To create your profile, click on the 'Register' button and complete the sign-up process. After registering, you'll be guided through setting up your profile with your professional information.";
    }
    
    if (normalizedQuery.includes('update') || normalizedQuery.includes('edit')) {
      return "To update your profile, go to your dashboard and click on the 'Profile' tab. From there, you can edit your personal information, professional details, and preferences.";
    }
    
    // General profile-related response
    return "Your profile showcases your professional background to potential employers. Keep it complete and up-to-date to improve your chances of being noticed.";
  }
  
  // Check for search-related questions
  if (searchKeywords.some(keyword => normalizedQuery.includes(keyword))) {
    if (normalizedQuery.includes('filter')) {
      return "You can filter job search results using various criteria including location, job type, experience level, salary range, and industry. Use the filter panel on the Jobs page to narrow down your search.";
    }
    
    if (normalizedQuery.includes('category') || normalizedQuery.includes('industries')) {
      return `We offer jobs across many industries including ${jobPortalInfo.commonJobCategories.slice(0, 5).join(', ')}, and more. You can browse by category from the homepage or Jobs page.`;
    }
    
    // General search-related response
    return "Our search functionality helps you find relevant job opportunities. You can search by keywords, job titles, or company names, and use filters to narrow down results.";
  }
  
  // Check for salary-related questions
  if (salaryKeywords.some(keyword => normalizedQuery.includes(keyword))) {
    return "Salary information is available on most job listings. You can also filter job searches by salary range, and our platform offers salary insights for different positions and locations.";
  }
  
  return null;
};

// Get generic response when no specific match is found
const getGenericResponse = (sessionData = {}) => {
  const genericResponses = [
    "I'm here to help with your job search. You can ask about finding jobs, creating your profile, or preparing applications.",
    "Our platform offers tools to help you find and apply for jobs that match your skills and experience.",
    "You can search for jobs, save favorites, and track your applications all in one place.",
    "Need help with something specific about job searching or our platform? I'm happy to assist.",
    "Whether you're looking for your first job or making a career change, our platform has tools to help you succeed."
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
  if (lastUserMessage.includes('job') || lastUserMessage.includes('work') || lastUserMessage.includes('career')) {
    return "I can help you find jobs that match your skills and experience. Try using the search feature or browsing our job categories.";
  }
  
  if (lastUserMessage.includes('resume') || lastUserMessage.includes('cv')) {
    return "Our platform offers a resume builder tool that can help you create a professional resume. You can also upload an existing resume to your profile.";
  }
  
  if (lastUserMessage.includes('interview') || lastUserMessage.includes('hire')) {
    return "Preparing for interviews is important. Make sure to research the company, practice common questions, and present yourself professionally.";
  }
  
  if (lastUserMessage.includes('salary') || lastUserMessage.includes('pay')) {
    return "Salary information is available on most job listings. You can also use our salary comparison tool to see average wages for different positions.";
  }
  
  if (lastUserMessage.includes('profile') || lastUserMessage.includes('account')) {
    return "You can update your profile information from the dashboard. A complete profile improves your chances of being noticed by employers.";
  }
  
  // Default fallback response
  return "I'm here to help with your job search. You can ask about job listings, creating a profile, or application tips.";
};

// Socket.IO connection
io.on('connection', (socket) => {
  // Extract session data from handshake query
  const sessionData = {
    sessionId: socket.handshake.query.sessionId || socket.id,
    username: socket.handshake.query.username || null,
    isLoggedIn: socket.handshake.query.isLoggedIn === 'true'
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
        // Generate response using rule-based approach
        const botResponse = await getAIResponse(conversationHistory, {
          ...sessionData,
          context: data.context
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
    io.to(socket.id).emit('conversation_cleared');
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