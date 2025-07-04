import { useState, useCallback } from 'react';
import { ChatMessage } from '../types';

export const useChat = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            type: 'system',
            message: 'Office Chat System Online',
            timestamp: new Date().toLocaleTimeString()
        },
        {
            type: 'system',
            message: 'Select an agent above to chat directly, or chat without selecting for Supreme Agent routing',
            timestamp: new Date().toLocaleTimeString()
        }
    ]);

    const [isLoading, setIsLoading] = useState(false);

    const addMessage = useCallback((type: ChatMessage['type'], message: string, sender?: string) => {
        const newMessage: ChatMessage = {
            type,
            message,
            sender,
            timestamp: new Date().toLocaleTimeString()
        };

        setMessages(prev => [...prev, newMessage]);
    }, []);

    const sendMessage = useCallback(async (message: string, selectedAgent?: string | null) => {
        if (message.trim() === '') return;

        // Add user message
        addMessage('user', message);
        setIsLoading(true);

        try {
            // Smart API URL detection for different environments
            const getApiUrl = () => {
                // In Docker development mode, backend runs on same network
                if (window.location.hostname === 'localhost' && window.location.port === '3000') {
                    return 'http://localhost:8001/chat'; // Development mode
                }
                // In production Docker setup with nginx proxy
                else if (process.env.NODE_ENV === 'production') {
                    return '/api/chat'; // Production mode with nginx proxy
                }
                // Fallback for local development
                else {
                    return 'http://localhost:8001/chat';
                }
            };

            const apiUrl = getApiUrl();

            // Make API call to backend
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    agent: selectedAgent || undefined
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // Add agent response
            addMessage('agent', data.response, data.agent_used || 'Unknown');

        } catch (error) {
            console.error('Error sending message:', error);
            addMessage('system', `Error: Failed to send message. Please try again.`);
        } finally {
            setIsLoading(false);
        }
    }, [addMessage]);

    const addAgentMessage = useCallback((sender: string, message: string) => {
        addMessage('agent', message, sender);
    }, [addMessage]);

    const clearChat = useCallback(() => {
        setMessages([
            {
                type: 'system',
                message: 'Office Chat System Online',
                timestamp: new Date().toLocaleTimeString()
            }
        ]);
    }, []);

    return {
        messages,
        sendMessage,
        addAgentMessage,
        clearChat,
        isLoading
    };
}; 