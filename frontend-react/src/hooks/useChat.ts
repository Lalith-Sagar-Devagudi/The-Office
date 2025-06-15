import { useState, useCallback } from 'react';
import { ChatMessage } from '../types';
import { CHAT_RESPONSES } from '../constants';

export const useChat = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            type: 'system',
            message: 'Office Chat System Online',
            timestamp: new Date().toLocaleTimeString()
        },
        {
            type: 'system',
            message: 'Select an agent above to interact with them',
            timestamp: new Date().toLocaleTimeString()
        }
    ]);

    const addMessage = useCallback((type: ChatMessage['type'], message: string, sender?: string) => {
        const newMessage: ChatMessage = {
            type,
            message,
            sender,
            timestamp: new Date().toLocaleTimeString()
        };

        setMessages(prev => [...prev, newMessage]);
    }, []);

    const sendMessage = useCallback((message: string) => {
        if (message.trim() === '') return;

        // Add user message
        addMessage('user', message);

        // Generate agent response after a random delay
        setTimeout(() => {
            const agents = ['CEO', 'DEVELOPER', 'HR', 'MANAGER'];
            const randomAgent = agents[Math.floor(Math.random() * agents.length)];
            const randomResponse = CHAT_RESPONSES[Math.floor(Math.random() * CHAT_RESPONSES.length)];

            addMessage('agent', randomResponse, randomAgent);
        }, 500 + Math.random() * 1000);
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
        clearChat
    };
}; 