
import React, { useEffect, useRef } from 'react';
import { Reminder } from '../types';
import Icon from './Icon';

// THIS COMPONENT IS NO LONGER IN USE.
// Triggered reminders are now shown directly in the chat log.

interface ReminderModalProps {
    reminder: Reminder;
    onClose: () => void;
}

const notificationSound = 'data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU' +
    'JvoU9v9/7/QBEBCRsLCAwADw0NCw0NDg4ODg4ODhAODQ4NCwwLDBEMCwkJBwYHCgoLChsSEw4PAA8ODQ4';

const ReminderModal: React.FC<ReminderModalProps> = ({ reminder, onClose }) => {
    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        audioRef.current?.play().catch(e => console.error("Audio playback failed:", e));
    }, []);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[10000] p-4" onClick={onClose}>
            <audio ref={audioRef} src={notificationSound} preload="auto"></audio>
            <div className="bg-secondary rounded-lg shadow-2xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
                <div className="p-6 text-center">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-accent mb-4">
                        <Icon name="bell" className="h-8 w-8 text-white"/>
                    </div>
                    <h3 className="text-2xl font-bold text-text-primary">Reminder!</h3>
                    <p className="mt-2 text-lg text-text-secondary break-words">"{reminder.title}"</p>
                     <p className="text-sm text-gray-400 mt-2">
                        {new Date(reminder.datetime).toLocaleString()}
                    </p>
                </div>
                <div className="bg-primary px-4 py-3 rounded-b-lg">
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-accent text-base font-medium text-white hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary focus:ring-accent"
                    >
                        Dismiss
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReminderModal;
