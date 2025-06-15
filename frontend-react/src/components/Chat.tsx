import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';

interface ChatProps {
    messages: ChatMessage[];
    onSendMessage: (message: string) => void;
}

export const Chat: React.FC<ChatProps> = ({ messages, onSendMessage }) => {
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = () => {
        if (inputValue.trim()) {
            onSendMessage(inputValue);
            setInputValue('');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };

    const getMessagePrefix = (message: ChatMessage): string => {
        switch (message.type) {
            case 'system':
                return '[SYSTEM]';
            case 'user':
                return '[USER]';
            case 'agent':
                return `[${message.sender}]`;
            default:
                return '';
        }
    };

    return (
        <div className="info">
            <h3>💬 Office Chat</h3>
            <div className="chat-container">
                <div className="chat-messages">
                    {messages.map((message, index) => (
                        <div key={index} className={`chat-message ${message.type}`}>
                            {message.timestamp} {getMessagePrefix(message)}: {message.message}
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
                <div className="chat-input-container">
                    <input
                        ref={inputRef}
                        type="text"
                        className="chat-input"
                        placeholder="Type your message..."
                        maxLength={200}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                    />
                    <button
                        className="chat-send-btn"
                        onClick={handleSendMessage}
                        disabled={!inputValue.trim()}
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
}; 