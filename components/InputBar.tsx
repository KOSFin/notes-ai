


import React, { useCallback } from 'react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import Icon from './Icon';
import { t } from '../localization';

interface InputBarProps {
    onSendMessage: (message: string) => void;
    isLoading: boolean;
    onFocus?: () => void;
    onBlur?: () => void;
    voiceInputLanguage: string;
    inputDraft: string;
    setInputDraft: (draft: string) => void;
}

const InputBar: React.FC<InputBarProps> = ({ 
    onSendMessage, 
    isLoading, 
    onFocus, 
    onBlur, 
    voiceInputLanguage,
    inputDraft,
    setInputDraft
}) => {
    
    const handleTranscript = useCallback((transcript: string) => {
        setInputDraft(transcript);
    }, [setInputDraft]);

    const { isListening, isAvailable, toggleListening } = useSpeechRecognition(handleTranscript, voiceInputLanguage);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputDraft.trim() && !isLoading) {
            onSendMessage(inputDraft);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex items-center space-x-2 max-w-4xl mx-auto">
            {isAvailable && (
                <button
                    type="button"
                    onClick={toggleListening}
                    disabled={isLoading}
                    className={`p-2.5 rounded-full transition-colors duration-200 ${
                        isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-secondary text-text-secondary hover:bg-accent hover:text-white'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                    <Icon name="mic" className="h-5 w-5" />
                </button>
            )}
            <div className="flex-1 relative">
                <input
                    type="text"
                    value={inputDraft}
                    onChange={(e) => setInputDraft(e.target.value)}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    placeholder={isListening ? t('common.listening') : t('common.askNexus')}
                    disabled={isLoading || isListening}
                    className="w-full bg-secondary border border-border-color rounded-full py-2.5 px-5 text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-200"
                />
            </div>
            <button
                type="submit"
                disabled={isLoading || !inputDraft.trim()}
                className="p-2.5 rounded-full bg-accent text-white hover:bg-accent-hover disabled:bg-secondary disabled:text-text-secondary disabled:cursor-not-allowed transition-colors duration-200"
            >
                <Icon name="send" className="h-5 w-5"/>
            </button>
        </form>
    );
};

export default InputBar;