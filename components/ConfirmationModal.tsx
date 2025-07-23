

import React from 'react';
import Icon from './Icon';

interface ConfirmationModalProps {
    question: string;
    actions: { label: string; value: string }[];
    onClose: () => void;
    onConfirm: (value: string) => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ question, actions, onClose, onConfirm }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-secondary rounded-lg shadow-2xl w-full max-w-md animate-pop-in" onClick={e => e.stopPropagation()}>
                <div className="p-6">
                    <div className="flex items-start">
                        <div className="mr-4 flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-accent">
                           <Icon name="question" className="h-6 w-6 text-white"/>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg leading-6 font-medium text-text-primary">Nexus needs more information</h3>
                            <div className="mt-2">
                                <p className="text-sm text-text-secondary">{question}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-primary px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse space-y-2 sm:space-y-0 sm:space-x-reverse sm:space-x-2">
                    {actions.map((action) => (
                        <button
                            key={action.value}
                            type="button"
                            onClick={() => onConfirm(action.value)}
                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-accent text-base font-medium text-white hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent sm:w-auto sm:text-sm"
                        >
                            {action.label}
                        </button>
                    ))}
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full inline-flex justify-center rounded-md border border-border-color shadow-sm px-4 py-2 bg-secondary text-base font-medium text-text-primary hover:bg-border-color focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent sm:mt-0 sm:w-auto sm:text-sm"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;