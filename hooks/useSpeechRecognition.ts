

import { useState, useEffect, useRef } from 'react';

interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start(): void;
    stop(): void;
    onresult: (event: any) => void;
    onerror: (event: any) => void;
    onend: () => void;
}

const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

export const useSpeechRecognition = (
    onTranscript: (transcript: string) => void,
    language: string = 'en-US'
) => {
    const [isListening, setIsListening] = useState(false);
    const [isAvailable, setIsAvailable] = useState(false);
    const recognitionRef = useRef<SpeechRecognition | null>(null);

    useEffect(() => {
        if (!SpeechRecognition) {
            console.warn("Speech Recognition API not supported in this browser.");
            setIsAvailable(false);
            return;
        }
        setIsAvailable(true);

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = language;

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            onTranscript(transcript);
            stopListening();
        };

        recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            stopListening();
        };
        
        recognition.onend = () => {
            setIsListening(false);
        };
        
        recognitionRef.current = recognition;

    }, [onTranscript, language]);

    const startListening = () => {
        if (recognitionRef.current && !isListening) {
            try {
                recognitionRef.current.start();
                setIsListening(true);
            } catch(e) {
                console.error("Could not start recognition", e);
            }
        }
    };

    const stopListening = () => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        }
    };
    
    const toggleListening = () => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    }

    return { isListening, isAvailable, toggleListening };
};