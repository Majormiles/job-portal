import React from 'react';
import ReactMarkdown from 'react-markdown';
import { formatDistanceToNow } from 'date-fns';
import './css/Message.css';

const Message = ({ sender, message, timestamp, isNew }) => {
  const isUser = sender === 'user';
  
  // Format timestamp
  const formattedTime = timestamp ? 
    formatDistanceToNow(new Date(timestamp), { addSuffix: true }) : 
    '';
  
  return (
    <div className={`message-wrapper ${isUser ? 'user' : 'bot'} ${isNew ? 'animate-in' : ''}`}>
      <div className={`message ${isUser ? 'user-message' : 'bot-message'}`}>
        <div className="message-content">
          {isUser ? (
            <p>{message}</p>
          ) : (
            <ReactMarkdown className="markdown-content">
              {message}
            </ReactMarkdown>
          )}
        </div>
        <div className="message-timestamp">
          {formattedTime}
        </div>
      </div>
    </div>
  );
};

export default Message;