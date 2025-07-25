

import React, { useEffect, useRef, useState } from 'react';
import Icon from './Icon';

interface DeleteConfirmationModalProps {
    itemType: string;
    itemName: string;
    onConfirm: () => void;
    onCancel: () => void;
    isOpen: boolean;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
    itemType,
    itemName,
    onConfirm,
    onCancel,
    isOpen,
}) => {
    const confirmButtonRef = useRef<HTMLButtonElement>(null);
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsClosing(false); // Reset on open
            const handleKeyDown = (e: KeyboardEvent) => {
                if (e.key === 'Escape') {
                    handleCancel();
                }
            };

            document.addEventListener('keydown', handleKeyDown);
            setTimeout(() => confirmButtonRef.current?.focus(), 100);

            return () => {
                document.removeEventListener('keydown', handleKeyDown);
            };
        }
    }, [isOpen, onCancel]);

    const handleConfirm = () => {
        setIsClosing(true);
        setTimeout(() => onConfirm(), 200);
    };

    const handleCancel = () => {
        setIsClosing(true);
        setTimeout(() => onCancel(), 200);
    };

    if (!isOpen && !isClosing) return null;

    return (
        <div className={`fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[60] p-4 transition-opacity duration-200 ${isClosing ? 'opacity-0' : 'opacity-100'}`} onClick={handleCancel}>
            <div className={`bg-secondary rounded-lg shadow-2xl w-full max-w-md ${isClosing ? 'animate-pop-out' : 'animate-pop-in'}`} onClick={e => e.stopPropagation()}>
                <div className="p-6">
                    <div className="flex items-start">
                        <div className="mr-4 flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-500/20">
                           <Icon name="delete" className="h-6 w-6 text-red-500"/>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg leading-6 font-medium text-text-primary capitalize">Delete {itemType}</h3>
                            <div className="mt-2">
                                <p className="text-sm text-text-secondary">Are you sure you want to delete "{itemName}"? This action cannot be undone.</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-primary px-4 py-3 rounded-b-lg sm:px-6 sm:flex sm:flex-row-reverse space-y-2 sm:space-y-0 sm:space-x-reverse sm:space-x-2">
                    <button
                        ref={confirmButtonRef}
                        type="button"
                        onClick={handleConfirm}
                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary focus:ring-red-500 sm:w-auto sm:text-sm"
                    >
                        Delete
                    </button>
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="w-full inline-flex justify-center rounded-md border border-border-color shadow-sm px-4 py-2 bg-secondary text-base font-medium text-text-primary hover:bg-border-color focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary focus:ring-accent sm:mt-0 sm:w-auto sm:text-sm"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmationModal;