import React, { useEffect, useState } from 'react';

interface SpeechBubbleProps {
    message: string;
    x: number;
    y: number;
    visible: boolean;
    onClose: () => void;
}

export const SpeechBubble: React.FC<SpeechBubbleProps> = ({
    message,
    x,
    y,
    visible,
    onClose
}) => {
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (visible) {
            setShow(true);
            // Auto-hide after 2.5 seconds
            const timer = setTimeout(() => {
                setShow(false);
                setTimeout(onClose, 300); // Allow fade out animation
            }, 2500);

            return () => clearTimeout(timer);
        } else {
            setShow(false);
        }
    }, [visible, onClose]);

    if (!visible && !show) return null;

    return (
        <div
            className={`speech-bubble-react ${show ? 'visible' : 'hidden'}`}
            style={{
                position: 'absolute',
                left: `${x}px`,
                top: `${y - 45}px`, // 45px above the character
                transform: 'translateX(-50%)', // Center horizontally on character
                zIndex: 9999,
                pointerEvents: 'none',
            }}
        >
            {message}
            <div className="speech-bubble-arrow" />
        </div>
    );
}; 