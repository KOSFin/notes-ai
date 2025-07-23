

import React, { useState, useEffect, useRef } from 'react';
import Icon from './Icon';
import { t } from '../localization';

interface DeleteDataConfirmationModalProps {
    onConfirm: () => void;
    onCancel: () => void;
    isOpen: boolean;
    counts: { notes: number; events: number; reminders: number; };
}

const CONFIRM_PHRASE = "delete my data";

const DeleteDataConfirmationModal: React.FC<DeleteDataConfirmationModalProps> = ({
    onConfirm,
    onCancel,
    isOpen,
    counts
}) => {
    const [inputValue, setInputValue] = useState('');
    const confirmButtonRef = useRef<HTMLButtonElement>(null);
    const isConfirmed = inputValue === CONFIRM_PHRASE;

    useEffect(() => {
        if (!isOpen) {
            setInputValue(''); // Reset on close
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[60] p-4 animate-fade-in" onClick={onCancel}>
            <div className="bg-secondary rounded-lg shadow-2xl w-full max-w-md animate-pop-in" onClick={e => e.stopPropagation()}>
                <div className="p-6">
                    <div className="flex items-start">
                        <div className="mr-4 flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-500/20">
                           <Icon name="delete" className="h-6 w-6 text-red-500"/>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg leading-6 font-medium text-text-primary">{t('deleteDataModal.title')}</h3>
                            <div className="mt-2 space-y-2 text-sm text-text-secondary">
                                <p>{t('deleteDataModal.message')}</p>
                                <p className="font-medium text-text-primary">{t('deleteDataModal.dataSummary', counts)}</p>
                                <p>{t('deleteDataModal.confirmPhrase', { phrase: `\`${CONFIRM_PHRASE}\`` })}</p>
                            </div>
                        </div>
                    </div>
                     <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder={CONFIRM_PHRASE}
                        className="w-full mt-4 bg-primary border border-border-color rounded-md py-2 px-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                </div>
                <div className="bg-primary px-4 py-3 rounded-b-lg sm:px-6 sm:flex sm:flex-row-reverse space-y-2 sm:space-y-0 sm:space-x-reverse sm:space-x-2">
                    <button
                        ref={confirmButtonRef}
                        type="button"
                        onClick={onConfirm}
                        disabled={!isConfirmed}
                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary focus:ring-red-500 sm:w-auto sm:text-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {t('deleteDataModal.confirm')}
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="w-full inline-flex justify-center rounded-md border border-border-color shadow-sm px-4 py-2 bg-secondary text-base font-medium text-text-primary hover:bg-border-color focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary focus:ring-accent sm:mt-0 sm:w-auto sm:text-sm"
                    >
                        {t('common.cancel')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteDataConfirmationModal;