import React, { useState } from 'react';
import './ChatBotIcon.css';
import ChatWindow from './ChatWindow';

const ChatBotIcon = () => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleChatWindow = () => {
        setIsOpen(!isOpen);
    };

    return (
        <>
            <div className="chat-bot-icon" onClick={toggleChatWindow}>
                <img src="/chatbot.png" alt="Chat Bot" />
            </div>
            {isOpen && <ChatWindow />}
        </>
    );
};

export default ChatBotIcon;
