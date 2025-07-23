



import React, { useEffect, useRef } from 'react';
import { NavItem, NavItemId } from '../types';
import Icon from './Icon';
import { t } from '../localization';

interface MoreMenuProps {
    isOpen: boolean;
    onClose: () => void;
    items: NavItem[];
    onItemClick: (id: NavItemId) => void;
    isMobile: boolean;
    style?: React.CSSProperties;
}

const MoreMenu: React.FC<MoreMenuProps> = ({ isOpen, onClose, items, onItemClick, isMobile, style }) => {
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                // Avoid closing if click is on any 'more' button
                const moreButtons = document.querySelectorAll('[aria-label="More menu button"]');
                let clickedOnMoreButton = false;
                moreButtons.forEach(button => {
                    if (button.contains(event.target as Node)) {
                        clickedOnMoreButton = true;
                    }
                });
                if (clickedOnMoreButton) {
                    return;
                }
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    if (!isOpen) {
        return null;
    }

    if (isMobile) {
        return (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-end" onClick={onClose}>
                <div 
                    ref={menuRef}
                    onClick={e => e.stopPropagation()}
                    className="bg-secondary w-full rounded-t-2xl p-4 animate-fade-in-up"
                >
                    <div className="grid grid-cols-4 gap-4">
                        {items.map(item => (
                            <button
                                key={item.id}
                                onClick={() => onItemClick(item.id)}
                                className="flex flex-col items-center justify-center text-text-secondary hover:text-accent py-2"
                            >
                                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-2">
                                     <Icon name={item.icon} className="h-6 w-6" />
                                </div>
                                <span className="text-xs font-medium text-center">{t(`nav.${item.id}`)}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div 
            ref={menuRef}
            className="fixed z-50 w-56 bg-secondary rounded-lg shadow-2xl border border-border-color animate-pop-in"
            style={style}
        >
            <div className="p-2">
                {items.map(item => (
                    <button
                        key={item.id}
                        onClick={() => onItemClick(item.id)}
                        className="flex items-center w-full px-3 py-2 text-left rounded-md hover:bg-accent hover:text-white transition-colors"
                    >
                        <Icon name={item.icon} className="h-5 w-5 mr-3" />
                        <span>{t(`nav.${item.id}`)}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default MoreMenu;