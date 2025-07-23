

import React from 'react';
import { ChatMessage } from '../types';
import ChatInterface from './ChatInterface';
import Icon from './Icon';
import InputBar from './InputBar';
import { t } from '../localization';

interface PinnedChatPanelProps {
    messages: ChatMessage[];
    isLoading: boolean;
    onSendMessage: (message: string) => void;
    onNoteClick: (noteId: string) => void;
    onClose: () => void;
    onClearChat: () => void;
    voiceInputLanguage: string;
    inputDraft: string;
    setInputDraft: (draft: string) => void;
}

const PinnedChatPanel = ({ messages, isLoading, onSendMessage, onNoteClick, onClose, onClearChat, voiceInputLanguage, inputDraft, setInputDraft }: PinnedChatPanelProps) => {
    return (
        <div className="w-[400px] flex-shrink-0 bg-secondary border-r border-border-color h-full flex flex-col transition-all duration-300 ease-in-out">
            <div className="p-3 border-b border-border-color flex justify-between items-center flex-shrink-0">
                <h3 className="font-bold text-lg">{t('chat.title')}</h3>
                 <div className="flex items-center space-x-2">
                    <button onClick={onClearChat} className="p-2 rounded-full text-text-secondary hover:bg-border-color" title={t('chat.clear')}>
                        <Icon name="clear" className="h-5 w-5"/>
                    </button>
                     <button onClick={onClose} className="p-2 rounded-full text-text-secondary hover:bg-border-color" title={t('chat.pin')}>
                        <Icon name="close" className="h-5 w-5"/>
                    </button>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
                <ChatInterface messages={messages} isLoading={isLoading} onNoteClick={onNoteClick} />
            </div>
            <div className="p-2 border-t border-border-color flex-shrink-0">
                <InputBar 
                    onSendMessage={onSendMessage} 
                    isLoading={isLoading} 
                    voiceInputLanguage={voiceInputLanguage}
                    inputDraft={inputDraft}
                    setInputDraft={setInputDraft}
                />
            </div>
        </div>
    );
};

export default PinnedChatPanel;