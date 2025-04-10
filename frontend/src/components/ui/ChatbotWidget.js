import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import io from 'socket.io-client';
import { MessageSquare, X, Send, ArrowDown } from 'lucide-react';
import '../css/ChatbotWidget.css';

const BACKEND_URL = 'http://localhost:5050';

// Categorize common job search terms for better intent recognition
const JOB_CATEGORIES = [
  "Technology", "Healthcare", "Finance", "Education", "Marketing", 
  "Engineering", "Sales", "Customer Service", "Administration", "Management"
];

const SKILLS = [
  "JavaScript", "React", "Node.js", "Python", "Java", "SQL", "Project Management",
  "Communication", "Leadership", "Problem Solving", "Teamwork", "Microsoft Office"
];

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);
  const { user } = useAuth();
  const location = useLocation();
  
  // Add a ref for message keys to prevent regeneration on each render
  const messageKeysRef = useRef({});
  
  // For manual scroll control
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const isUserScrolling = useRef(false);
  const lastScrollTop = useRef(0);
  
  // Generate a stable session ID that persists across page reloads
  useEffect(() => {
    const storedSessionId = localStorage.getItem('chatbot_session_id');
    if (storedSessionId) {
      setSessionId(storedSessionId);
    } else {
      const newSessionId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('chatbot_session_id', newSessionId);
      setSessionId(newSessionId);
    }
  }, []);
  
  // Get detailed page context based on URL
  const getPageContext = () => {
    const path = location.pathname;
    
    // Detailed context for different pages
    if (path === '/') {
      return {
        page: 'home page',
        description: 'Homepage with featured job listings and job search functionality',
        features: ['Featured jobs', 'Quick search', 'Category browsing']
      };
    }
    
    if (path.includes('/jobs')) {
      return {
        page: 'jobs listing page',
        description: 'Browse all available job postings with filtering options',
        features: ['Search filters', 'Sort by date/relevance', 'Save jobs to favorites']
      };
    }
    
    if (path.includes('/job-detail')) {
      return {
        page: 'job details page',
        description: 'Detailed view of a specific job posting',
        features: ['Job description', 'Company information', 'Apply button', 'Similar jobs']
      };
    }
    
    if (path.includes('/dashboard')) {
      return {
        page: 'user dashboard',
        description: 'Personal dashboard for managing job applications and profile',
        features: ['Application status', 'Profile completion', 'Saved jobs', 'Job recommendations']
      };
    }
    
    if (path.includes('/register')) {
      return {
        page: 'registration page',
        description: 'Create a new account to access full features',
        features: ['Account creation', 'Profile setup']
      };
    }
    
    if (path.includes('/login')) {
      return {
        page: 'login page',
        description: 'Log in to your existing account',
        features: ['Account access', 'Password recovery']
      };
    }
    
    // Default for other pages
    return {
      page: path.replace('/', '').replace(/-/g, ' ') + ' page',
      description: 'Part of the job portal platform',
      features: []
    };
  };
  
  // Get user context - provide more info if user is logged in
  const getUserContext = () => {
    if (!user) {
      return {
        isLoggedIn: false,
        message: "You're currently browsing as a guest. Creating an account will allow you to apply for jobs and save your preferences."
      };
    }
    
    return {
      isLoggedIn: true,
      name: user.name,
      email: user.email,
      message: `You're logged in as ${user.name}. You can manage your applications, update your profile, or search for new opportunities.`
    };
  };

  // Initialize socket connection
  useEffect(() => {
    if (!isOpen || !sessionId) return;
    
    const newSocket = io(BACKEND_URL, {
      query: { 
        sessionId,
        username: user?.name || 'Guest',
        isLoggedIn: user ? 'true' : 'false'
      }
    });
    
    setSocket(newSocket);
    
    newSocket.on('connect', () => {
      console.log('Connected to chatbot server with session ID:', sessionId);
      setIsConnected(true);
      
      // Get page and user context
      const pageContext = getPageContext();
      const userContext = getUserContext();
      
      // Personalized welcome message
      const greeting = userContext.isLoggedIn 
        ? `Hello ${userContext.name}! How can I help you with your job search today?` 
        : 'Hello! How can I help you with your job search today?';
      
      const contextMessage = `I see you're on the ${pageContext.page}. ${pageContext.description}. Is there anything specific you'd like to know about ${pageContext.features.join(', ')}?`;
      
      setMessages([{
        sender: 'bot',
        message: greeting,
        timestamp: new Date().toISOString(),
        isNew: true
      }, {
        sender: 'bot',
        message: contextMessage,
        timestamp: new Date().toISOString(),
        isNew: true
      }]);
    });
    
    newSocket.on('disconnect', () => {
      console.log('Disconnected from chatbot server');
      setIsConnected(false);
    });
    
    // Cleanup on unmount or when closing the chat
    return () => {
      newSocket.disconnect();
    };
  }, [isOpen, user, sessionId]);
  
  // Set up message event listeners
  useEffect(() => {
    if (!socket) return;
    
    // Listen for incoming messages
    socket.on('receive_message', (data) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        { ...data, isNew: true }
      ]);
      setIsTyping(false);
    });
    
    // Listen for typing indicator
    socket.on('bot_typing', (isTyping) => {
      setIsTyping(isTyping);
    });
    
    // Listen for conversation cleared event
    socket.on('conversation_cleared', () => {
      const userContext = getUserContext();
      const greeting = userContext.isLoggedIn 
        ? `Hello ${userContext.name}! Our conversation has been cleared. How can I help you now?` 
        : 'Our conversation has been cleared. How can I help you now?';
        
      setMessages([{
        sender: 'bot',
        message: greeting,
        timestamp: new Date().toISOString(),
        isNew: true
      }]);
    });
    
    // Cleanup listeners
    return () => {
      socket.off('receive_message');
      socket.off('bot_typing');
      socket.off('conversation_cleared');
    };
  }, [socket]);
  
  // Controlled scroll - only auto-scroll when appropriate
  useEffect(() => {
    // If no container or user is manually scrolling, don't auto-scroll
    if (!messagesContainerRef.current || !shouldAutoScroll) return;
    
    // Only auto-scroll for new messages
    const hasNewMessages = messages.some(msg => msg.isNew);
    if (!hasNewMessages) return;
    
    // Scroll to bottom with a small delay to allow rendering
    const timer = setTimeout(() => {
      if (messagesContainerRef.current && shouldAutoScroll) {
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      }
    }, 100);
    
    // Remove isNew flag after animation completes
    const animationTimer = setTimeout(() => {
      setMessages(prevMessages => 
        prevMessages.map(msg => ({ ...msg, isNew: false }))
      );
    }, 500);
    
    return () => {
      clearTimeout(timer);
      clearTimeout(animationTimer);
    };
  }, [messages, shouldAutoScroll]);
  
  // Properly detect user scrolling
  useEffect(() => {
    const messagesContainer = messagesContainerRef.current;
    if (!messagesContainer) return;
    
    const handleScroll = () => {
      if (isUserScrolling.current) return;
      
      const { scrollTop, scrollHeight, clientHeight } = messagesContainer;
      const isAtBottom = Math.abs(scrollHeight - scrollTop - clientHeight) < 50;
      
      // Update scroll button visibility
      setShowScrollButton(!isAtBottom);
      
      // Only update auto-scroll state if needed
      if (isAtBottom !== shouldAutoScroll) {
        setShouldAutoScroll(isAtBottom);
      }
      
      // Store last scroll position to determine direction
      lastScrollTop.current = scrollTop;
    };
    
    // Use passive option for better performance
    messagesContainer.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      messagesContainer.removeEventListener('scroll', handleScroll);
    };
  }, [shouldAutoScroll]);
  
  // Always scroll to bottom when first opening chat
  useEffect(() => {
    if (!isOpen) return;
    
    const timer = setTimeout(() => {
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        setShouldAutoScroll(true);
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [isOpen]);
  
  // Focus input field when component loads
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [isOpen]);
  
  // Add page change detection to provide context on navigation
  useEffect(() => {
    if (isOpen && isConnected && socket && messages.length > 0) {
      const pageContext = getPageContext();
      const contextMessage = `I notice you've navigated to the ${pageContext.page}. ${pageContext.description}. Let me know if you have questions about ${pageContext.features.join(', ')}.`;
      
      setMessages((prevMessages) => [
        ...prevMessages,
        { 
          sender: 'bot', 
          message: contextMessage, 
          timestamp: new Date().toISOString(),
          isNew: true
        }
      ]);
    }
  }, [location.pathname, isOpen, isConnected, socket]);
  
  // Helper function to generate stable keys for messages and suggestions
  const getStableKey = (prefix, index) => {
    if (!messageKeysRef.current[`${prefix}-${index}`]) {
      messageKeysRef.current[`${prefix}-${index}`] = `${prefix}-${index}-${Math.random().toString(36).substr(2, 9)}`;
    }
    return messageKeysRef.current[`${prefix}-${index}`];
  };
  
  const toggleChat = () => {
    setIsOpen(!isOpen);
  };
  
  // Scroll to bottom manually
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      // Flag to prevent interference from scroll event handler
      isUserScrolling.current = true;
      
      // Scroll to bottom
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      
      // Re-enable auto scroll
      setShouldAutoScroll(true);
      setShowScrollButton(false);
      
      // Reset flag after animation completes
      setTimeout(() => {
        isUserScrolling.current = false;
      }, 300);
    }
  };
  
  const sendMessage = (content = inputMessage) => {
    if (!socket || !content || !content.trim() || !isConnected) return;
    
    // Get current context to send to the server
    const pageContext = getPageContext();
    const userContext = getUserContext();
    
    const messageData = {
      sender: 'user',
      message: content.trim(),
      timestamp: new Date().toISOString(),
      context: {
        page: pageContext.page,
        user: {
          isLoggedIn: userContext.isLoggedIn,
          name: userContext.name || 'Guest'
        },
        sessionId
      }
    };
    
    // Emit message to the server
    socket.emit('send_message', messageData);
    
    // Add user message to the chat
    setMessages((prevMessages) => [
      ...prevMessages,
      { ...messageData, isNew: true }
    ]);
    
    // Only clear input if using the input field message
    if (content === inputMessage) {
      setInputMessage('');
    }
    
    // Enable auto-scroll when user sends a message
    setShouldAutoScroll(true);
    scrollToBottom();
  };
  
  const handleSuggestionClick = (question) => {
    sendMessage(question);
  };
  
  const clearConversation = () => {
    if (!socket || !isConnected) return;
    socket.emit('clear_conversation', { sessionId });
    setShouldAutoScroll(true);
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  
  // Generate suggested questions based on current page
  const getSuggestedQuestions = () => {
    const pageContext = getPageContext();
    
    const commonQuestions = [
      "How do I create an account?",
      "What types of jobs are available?",
      "How do I update my profile?"
    ];
    
    // Add page-specific questions
    if (pageContext.page === 'home page') {
      return [
        "How do I search for jobs?",
        "What are the top job categories?",
        "How can I filter job results?"
      ];
    }
    
    if (pageContext.page === 'jobs listing page') {
      return [
        "How do I sort these jobs?",
        "Can I save jobs for later?",
        "What do the job tags mean?"
      ];
    }
    
    if (pageContext.page === 'job details page') {
      return [
        "How do I apply for this job?",
        "Will the company see my profile?",
        "What should I include in my application?"
      ];
    }
    
    if (pageContext.page === 'user dashboard') {
      return [
        "How can I track my applications?",
        "Can I update my resume?",
        "Where do I find recommended jobs?"
      ];
    }
    
    return commonQuestions;
  };
  
  // Suggested questions component
  const SuggestedQuestions = () => {
    const questions = getSuggestedQuestions();
    
    return (
      <div className="chatbot-suggested-questions">
        <p className="chatbot-suggested-title">You might want to ask:</p>
        <div className="chatbot-suggestions">
          {questions.map((question, index) => (
            <button 
              key={getStableKey('suggestion', index)}
              className="chatbot-suggestion-item"
              onClick={() => handleSuggestionClick(question)}
              type="button"
            >
              {question}
            </button>
          ))}
        </div>
      </div>
    );
  };
  
  return (
    <div className="chatbot-widget">
      {/* Chat container */}
      {isOpen && (
        <div className="chatbot-container">
          <div className="chatbot-header">
            <h3>Job Portal Assistant</h3>
            <div className="chatbot-header-actions">
              <button 
                className="chatbot-btn-clear" 
                onClick={clearConversation}
                title="Clear conversation"
                type="button"
              >
                Clear
              </button>
              <button 
                className="chatbot-btn-close" 
                onClick={toggleChat}
                title="Close chat"
                type="button"
              >
                <X size={18} />
              </button>
            </div>
          </div>
          
          <div 
            className="chatbot-messages" 
            ref={messagesContainerRef}
          >
            {messages.map((msg, index) => (
              <div 
                key={getStableKey('msg', index)}
                className={`chatbot-message ${msg.sender === 'bot' ? 'bot' : 'user'}`}
              >
                <div className="chatbot-message-content">
                  {msg.message}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="chatbot-message bot">
                <div className="chatbot-typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            <div className="chatbot-scroll-anchor" ref={messagesEndRef} />
          </div>
          
          {/* Show suggestions when there are few messages */}
          {messages.length < 5 && (
            <SuggestedQuestions />
          )}
          
          {/* Improved scroll to bottom button */}
          {showScrollButton && (
            <button 
              className="chatbot-scroll-bottom-button"
              onClick={scrollToBottom}
              title="Scroll to latest messages"
              type="button"
            >
              <ArrowDown size={16} /> New messages
            </button>
          )}
          
          <div className="chatbot-input-container">
            <textarea
              ref={inputRef}
              className="chatbot-input"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type a message..."
              disabled={!isConnected}
              rows={1}
            />
            <button 
              className="chatbot-send-button" 
              onClick={() => sendMessage()}
              disabled={!inputMessage.trim() || !isConnected}
              type="button"
            >
              <Send size={18} />
            </button>
          </div>
          
          {!isConnected && (
            <div className="chatbot-connection-status">
              Connecting...
            </div>
          )}
        </div>
      )}
      
      {/* Toggle button */}
      <div className="chatbot-toggle-wrapper">
        <button 
          className={`chatbot-toggle ${isOpen ? 'open' : ''}`} 
          onClick={toggleChat}
          title={isOpen ? "Close chat" : "Open chat"}
          type="button"
        >
          {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
        </button>
      </div>
    </div>
  );
};

export default ChatbotWidget; 