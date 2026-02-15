import React, { useState, useRef, useEffect } from 'react';
import './ChatWindow.css';

// Only one welcome message for the initial state
const INITIAL_MESSAGES = [
  { id: 1, text: "👋 Hello I am Venkatalakmi Chat bot how can i Help U  ", isUser: false }
];

const ChatWindow = () => {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isOpen, setIsOpen] = useState(true);
  const messagesEndRef = useRef(null);

  // Auto-scroll to the bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleInputChange = (e) => {
    setInputText(e.target.value);
  };

  const handleSendMessage = async () => {
    if (inputText.trim() === '') return;

    // Create a new user message and update the UI
    const newUserMessage = {
      id: messages.length + 1,
      text: inputText,
      isUser: true
    };
    setMessages(prev => [...prev, newUserMessage]);

    // Hold the message text before clearing the input field
    const messageToSend = inputText;
    setInputText(''); // Clear input field

    try {
      // Create a fallback response in case the API call fails
      let botReply = "I'm currently offline but will be back soon!";

      try {
        // Send POST request to your backend API
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Origin': window.location.origin
          },
          credentials: 'include',
          mode: 'cors',
          body: JSON.stringify({ message: messageToSend })
        });

        if (response.ok) {
          const data = await response.json();
          botReply = data.reply || "Sorry, I couldn't get a valid response.";
        } else {
          console.error("API error:", response.status, response.statusText);
        }
      } catch (apiError) {
        console.error("API fetch error:", apiError);
      }

      // Create a new bot message with the API response or fallback
      const newBotMessage = {
        id: messages.length + 2,
        text: botReply,
        isUser: false
      };
      setMessages(prev => [...prev, newBotMessage]);
    } catch (error) {
      console.error("Message handling error:", error);
      const errorBotMessage = {
        id: messages.length + 2,
        text: "An error occurred. Please try again later.",
        isUser: false
      };
      setMessages(prev => [...prev, errorBotMessage]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    // Additional logic can be added here
  };

  if (!isOpen) {
    return null; // Don't render if closed
  }

  return (
    <div className="chat-window">
      <div className="chat-header">
        <span>Venkatalskmi ChatBot</span>
        <button className="close-button" onClick={handleClose}>×</button>
      </div>
      <div className="chat-body">
        {messages.map(message => (
          message.isUser ? (
            <div key={message.id} className="message user-message">
              <p>{message.text}</p>
              <img src="/user.png" alt="User" />
            </div>
          ) : (
            <div key={message.id} className="message bot-message">
              <img src="/chatbot.png" alt="Lemon AI" />
              <p>{message.text}</p>
            </div>
          )
        ))}
        <div ref={messagesEndRef} /> {/* Empty div for scrolling to bottom */}
      </div>
      <div className="chat-footer">
        <input
          type="text"
          placeholder="Type your message..."
          value={inputText}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
};

export default ChatWindow;
