import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';

interface ChatProps {
    messages: ChatMessage[];
    onSendMessage: (message: string, selectedAgent?: string | null) => void;
    selectedAgent?: string | null;
    isLoading?: boolean;
}

export const Chat: React.FC<ChatProps> = ({
    messages,
    onSendMessage,
    selectedAgent,
    isLoading
}) => {
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = () => {
        if (inputValue.trim() && !isLoading) {
            onSendMessage(inputValue, selectedAgent);
            setInputValue('');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !isLoading) {
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
            <div className="chat-agent-status">
                {selectedAgent ? (
                    <span className="agent-selected">
                        🎯 Selected Agent: <strong>{selectedAgent}</strong>
                    </span>
                ) : (
                    <span className="agent-none">
                        🤖 Supreme Agent Mode (no specific agent selected)
                    </span>
                )}
            </div>
            <div className="chat-container">
                <div className="chat-messages">
                    {messages.map((message, index) => (
                        <div key={index} className={`chat-message ${message.type}`}>
                            {message.timestamp} {getMessagePrefix(message)}: {message.message}
                        </div>
                    ))}
                    {isLoading && (
                        <div className="chat-message system">
                            <span className="loading-indicator">
                                {new Date().toLocaleTimeString()} [SYSTEM]: Agent is thinking...
                            </span>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
                <div className="chat-input-container">
                    <input
                        ref={inputRef}
                        type="text"
                        className="chat-input"
                        placeholder={
                            selectedAgent
                                ? `Ask ${selectedAgent} a question...`
                                : "Ask a question (Supreme Agent will route)..."
                        }
                        maxLength={200}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={isLoading}
                    />
                    <button
                        className="chat-send-btn"
                        onClick={handleSendMessage}
                        disabled={!inputValue.trim() || isLoading}
                    >
                        {isLoading ? 'Sending...' : 'Send'}
                    </button>
                </div>
            </div>
        </div>
    );
}; 