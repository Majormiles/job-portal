import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { FiSend, FiTrash2 } from 'react-icons/fi';
import Message from './Message';
import TypingIndicator from './TypingIndicator';
import './css/ChatWindow.css';

// Make sure to use the correct backend URL - this addresses potential connection issues
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5050';

// Predefined questions to help users get started
const PREDEFINED_QUESTIONS = [
  "How do I search for jobs?",
  "How can I create an account?",
  "How do I apply for a job?",
  "Can I get resume tips?",
  "How do I contact admin support?"
];

const ChatWindow = () => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);
  
  // Initialize socket connection
  useEffect(() => {
    // Add session identifier to make sure we track the proper user
    const sessionId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    
    // Get username if available
    const username = localStorage.getItem('username') || 'Guest User';
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    
    // Connect with user information in query params
    const newSocket = io(BACKEND_URL, {
      query: {
        sessionId,
        username,
        isLoggedIn
      }
    });
    
    setSocket(newSocket);
    
    newSocket.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
      
      // Add welcome message with predefined questions
      setMessages([{
        sender: 'bot',
        message: 'Hello! How can I assist you today?',
        timestamp: new Date().toISOString(),
        isNew: true,
        showOptions: true
      }]);
    });
    
    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });
    
    // Cleanup on unmount
    return () => {
      newSocket.disconnect();
    };
  }, []);
  
  // Set up message event listeners
  useEffect(() => {
    if (!socket) return;
    
    // Listen for incoming messages
    socket.on('receive_message', (data) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        { ...data, isNew: true }
      ]);
    });
    
    // Listen for typing indicator
    socket.on('bot_typing', (isTyping) => {
      setIsTyping(isTyping);
    });
    
    // Listen for conversation cleared event
    socket.on('conversation_cleared', () => {
      setMessages([{
        sender: 'bot',
        message: 'Our conversation has been cleared. How can I help you now?',
        timestamp: new Date().toISOString(),
        isNew: true,
        showOptions: true
      }]);
    });
    
    // Cleanup listeners
    return () => {
      socket.off('receive_message');
      socket.off('bot_typing');
      socket.off('conversation_cleared');
    };
  }, [socket]);
  
  // Auto-scroll to bottom of messages - fixed implementation
  useEffect(() => {
    // Use setTimeout to ensure DOM is updated before scrolling
    const scrollTimeout = setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    }, 100);
    
    // Remove isNew flag after animation
    const animationTimeout = setTimeout(() => {
      setMessages(messages.map(msg => ({ ...msg, isNew: false })));
    }, 500);
    
    return () => {
      clearTimeout(scrollTimeout);
      clearTimeout(animationTimeout);
    };
  }, [messages]);
  
  // Focus input field when component loads
  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  
  const sendMessage = (content = inputMessage) => {
    if (!socket || !content.trim() || !isConnected) return;
    
    const messageData = {
      sender: 'user',
      message: content.trim(),
      timestamp: new Date().toISOString()
    };
    
    // Emit message to the server
    socket.emit('send_message', messageData);
    
    // Add user message to the chat
    setMessages((prevMessages) => [
      ...prevMessages,
      { ...messageData, isNew: true }
    ]);
    
    // Only clear input if it's the user's typed message
    if (content === inputMessage) {
      setInputMessage('');
    }
    
    // Focus back on input after sending
    setTimeout(() => inputRef.current?.focus(), 100);
  };
  
  const handlePredefinedQuestion = (question) => {
    sendMessage(question);
  };
  
  const clearConversation = () => {
    if (!socket || !isConnected) return;
    socket.emit('clear_conversation');
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  
  // Render predefined question buttons
  const renderPredefinedQuestions = () => {
    return (
      <div className="predefined-questions">
        <p className="predefined-label">Try asking:</p>
        <div className="question-buttons">
          {PREDEFINED_QUESTIONS.map((question, index) => (
            <button 
              key={index}
              className="question-button"
              onClick={() => handlePredefinedQuestion(question)}
            >
              {question}
            </button>
          ))}
        </div>
      </div>
    );
  };
  
  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>Chat Assistant</h2>
        <button 
          className="clear-button" 
          onClick={clearConversation}
          title="Clear conversation"
        >
          <FiTrash2 />
        </button>
      </div>
      
      <div className="messages-container" ref={messagesContainerRef}>
        <div className="messages">
          {messages.map((msg, index) => (
            <Message 
              key={`msg-${index}-${msg.timestamp}`}
              sender={msg.sender} 
              message={msg.message} 
              timestamp={msg.timestamp}
              isNew={msg.isNew}
            />
          ))}
          {/* Show predefined questions after first bot message or when conversation is cleared */}
          {messages.length === 1 && messages[0].sender === 'bot' && renderPredefinedQuestions()}
          {isTyping && <TypingIndicator />}
          <div className="messages-end-anchor" ref={messagesEndRef} />
        </div>
      </div>
      
      <div className="input-container">
        <textarea
          ref={inputRef}
          className="message-input"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Type a message..."
          disabled={!isConnected}
          rows={1}
        />
        <button 
          className="send-button" 
          onClick={() => sendMessage()}
          disabled={!inputMessage.trim() || !isConnected}
          aria-label="Send message"
        >
          <FiSend />
        </button>
      </div>
      
      {!isConnected && (
        <div className="connection-status">
          Reconnecting to server...
        </div>
      )}
    </div>
  );
};

export default ChatWindow;