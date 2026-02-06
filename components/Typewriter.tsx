import React, { useState, useEffect, useRef } from 'react';

interface Props {
  text: string;
  speed?: number;
  onComplete?: () => void;
}

export const Typewriter: React.FC<Props> = ({ text, speed = 3, onComplete }) => {
  const [displayedText, setDisplayedText] = useState('');
  const onCompleteRef = useRef(onComplete);
  const textRef = useRef(text);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    // Reset state when text changes
    setDisplayedText('');
    textRef.current = text;
    
    let i = 0;
    // Faster default speed, and using a tighter loop
    const interval = setInterval(() => {
      if (i < textRef.current.length) {
        // Increment i then slice. 
        // We render chunks of characters for very long text to be faster
        const chunk = Math.max(1, Math.floor(textRef.current.length / 300)); 
        i = Math.min(textRef.current.length, i + chunk);
        
        setDisplayedText(textRef.current.slice(0, i));
        
        if (i >= textRef.current.length) {
          clearInterval(interval);
          if (onCompleteRef.current) onCompleteRef.current();
        }
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  return <span className="inline-block whitespace-pre-wrap">{displayedText}</span>;
};