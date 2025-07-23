
import React, { useEffect, useRef, useState } from 'react';
import { ChatMessage, NoteUpdateContent, CommandGroupContent } from '../types';
import Icon from './Icon';

interface ChatInterfaceProps {
    messages: ChatMessage[];
    isLoading: boolean;
    onNoteClick: (noteId: string) => void;
}

const CommandGroup: React.FC<{ content: CommandGroupContent }> = ({ content }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const successfulCommands = content.results.filter(r => r.status === 'success').length;
    const totalCommands = content.results.length;

    const summary = `${successfulCommands}/${totalCommands} commands executed in ${content.executionTime}ms`;

    return (
        <div className="bg-secondary/50 rounded-lg p-3 space-y-2 max-w-md w-full self-center my-2 border border-border-color">
            <div 
                className="flex justify-between items-center cursor-pointer"
                onClick={() => setIsExpanded(prev => !prev)}
            >
                <div className="flex items-center gap-2">
                    <Icon name="check" className="h-5 w-5 text-green-500"/>
                    <span className="text-sm font-semibold text-text-primary">{summary}</span>
                </div>
                <Icon name="chevron" className={`h-5 w-5 text-text-secondary transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </div>
            {isExpanded && (
                <div className="pt-2 border-t border-border-color/50 space-y-1">
                    {content.results.map((result, index) => (
                        <div
                            key={index}
                            className="flex items-center gap-2 text-xs animate-fade-in"
                            style={{ animationDelay: `${index * 75}ms`}}
                        >
                            <Icon name={result.status === 'success' ? 'check' : 'close'} className={`h-3.5 w-3.5 flex-shrink-0 ${result.status === 'success' ? 'text-green-500' : 'text-red-500'}`} />
                            <span className="font-mono text-text-secondary">{result.command}:</span>
                            <span className="text-text-secondary truncate">{result.message}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};


const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, isLoading, onNoteClick }) => {
    const endOfMessagesRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    return (
        <div className="flex flex-col space-y-4 max-w-4xl mx-auto w-full">
            {messages.map((msg) => {
                if (msg.sender === 'system_note_update') {
                    const content = msg.content as NoteUpdateContent;
                    return (
                        <div key={msg.id} className="flex justify-center">
                            <div 
                                className="bg-secondary/60 border border-border-color/50 rounded-lg p-3 text-sm text-text-secondary italic w-full max-w-md hover:bg-border-color/50 cursor-pointer transition-colors"
                                onClick={() => onNoteClick(content.noteId)}
                                role="button"
                                tabIndex={0}
                                aria-label={`Open note ${content.noteTitle}`}
                            >
                                <div className="flex items-center">
                                    <Icon name="edit" className="h-4 w-4 mr-3 text-accent flex-shrink-0" />
                                    <p>{content.summary}</p>
                                </div>
                            </div>
                        </div>
                    )
                }

                if (msg.sender === 'system-command-group') {
                    return <CommandGroup key={msg.id} content={msg.content as CommandGroupContent} />
                }
                
                let style = '';
                let justify = '';
                switch (msg.sender) {
                    case 'user':
                        style = 'bg-accent self-end rounded-l-xl rounded-tr-xl';
                        justify = 'justify-end';
                        break;
                    case 'ai':
                        style = 'bg-secondary self-start rounded-r-xl rounded-tl-xl';
                        justify = 'justify-start';
                        break;
                    case 'system':
                        style = 'bg-transparent text-text-secondary text-sm text-center self-center italic';
                        justify = 'justify-center';
                        break;
                }

                return (
                    <div key={msg.id} className={`flex ${justify}`}>
                        <div className={`p-3 max-w-lg ${style}`}>
                            <p className="whitespace-pre-wrap">{typeof msg.content === 'string' ? msg.content : ''}</p>
                        </div>
                    </div>
                );
            })}
            {isLoading && (
                <div className="flex justify-start">
                    <div className="p-3 bg-secondary self-start rounded-r-xl rounded-tl-xl flex items-center space-x-2">
                         <div className="w-2 h-2 bg-accent rounded-full animate-pulse-fast"></div>
                         <div className="w-2 h-2 bg-accent rounded-full animate-pulse-fast" style={{animationDelay: '0.2s'}}></div>
                         <div className="w-2 h-2 bg-accent rounded-full animate-pulse-fast" style={{animationDelay: '0.4s'}}></div>
                    </div>
                </div>
            )}
            <div ref={endOfMessagesRef} />
        </div>
    );
};

export default ChatInterface;
