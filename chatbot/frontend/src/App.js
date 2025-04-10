import React from 'react';
import ChatWindow from './components/ChatWindow';
import './App.css';

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>AI Chatbot</h1>
        <p>Ask me anything</p>
      </header>
      <main>
        <ChatWindow />
      </main>
      <footer className="app-footer">
        <p>© {new Date().getFullYear()} Your Company</p>
      </footer>
    </div>
  );
}

export default App;