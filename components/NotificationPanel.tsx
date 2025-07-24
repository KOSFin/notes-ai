
import React, { useRef, useEffect } from 'react';
import { SystemNotification } from '../types';
import Icon from './Icon';
import { t } from '../localization';

interface NotificationsPanelProps {
    isOpen: boolean;
    onClose: () => void;
    anchorEl: HTMLElement | null;
    notifications: SystemNotification[];
    onClearAll: () => void;
    isMobile: boolean;
}

const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ isOpen, onClose, anchorEl, notifications, onClearAll, isMobile }) => {
    const panelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                panelRef.current &&
                !panelRef.current.contains(event.target as Node) &&
                anchorEl &&
                !anchorEl.contains(event.target as Node)
            ) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose, anchorEl]);

    if (!isOpen) return null;

    const panelStyle: React.CSSProperties = {};
    if (anchorEl && !isMobile) {
        const rect = anchorEl.getBoundingClientRect();
        panelStyle.position = 'absolute';
        panelStyle.top = `${rect.bottom + 8}px`;
        panelStyle.right = `${window.innerWidth - rect.right}px`;
        panelStyle.transformOrigin = 'top right';
    }

    const panelClasses = isMobile
        ? "fixed inset-x-0 bottom-0 z-50 bg-secondary rounded-t-2xl max-h-[60vh] flex flex-col animate-fade-in-up"
        : "fixed z-50 w-full max-w-sm bg-secondary rounded-lg shadow-2xl border border-border-color flex flex-col max-h-[70vh] animate-pop-in";

    return (
        <div
            ref={panelRef}
            className={panelClasses}
            style={panelStyle}
            onClick={e => e.stopPropagation()}
        >
            <div className="flex justify-between items-center p-4 border-b border-border-color flex-shrink-0">
                <h3 className="font-bold text-lg">{t('notifications.title')}</h3>
                <div className="flex items-center gap-2">
                    {notifications.length > 0 && (
                        <button onClick={onClearAll} className="text-sm text-accent hover:underline">{t('notifications.clearAll')}</button>
                    )}
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-border-color"><Icon name="close" className="h-5 w-5"/></button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 scrollbar-hide">
                {notifications.length > 0 ? (
                    notifications.map(notif => <NotificationItem key={notif.id} notification={notif} />)
                ) : (
                    <p className="text-center text-text-secondary p-8">{t('notifications.empty')}</p>
                )}
            </div>
        </div>
    );
};

const NotificationItem: React.FC<{ notification: SystemNotification }> = ({ notification }) => {
    const icons = {
        error: { name: 'close', color: 'text-red-500', bg: 'bg-red-500/10' },
        warning: { name: 'bell', color: 'text-amber-500', bg: 'bg-amber-500/10' },
        info: { name: 'chat', color: 'text-blue-500', bg: 'bg-blue-500/10' },
    };
    const icon = icons[notification.type];
    
    const timeAgo = (dateStr: string) => {
        const seconds = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + "y ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + "mo ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + "d ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + "h ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + "m ago";
        return "Just now";
    }

    return (
        <div className="flex items-start gap-3 p-3 hover:bg-primary rounded-lg">
            <div className="w-2 flex-shrink-0 h-full pt-2">
                {!notification.read && <div className="w-2 h-2 rounded-full bg-accent animate-pulse"></div>}
            </div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${icon.bg}`}>
                <Icon name={icon.name} className={`h-4 w-4 ${icon.color}`} />
            </div>
            <div className="flex-1">
                <p className="font-semibold text-text-primary">{notification.title}</p>
                <p className="text-sm text-text-secondary">{notification.message}</p>
                <p className="text-xs text-text-secondary/70 mt-1">{timeAgo(notification.timestamp)}</p>
            </div>
        </div>
    );
};

export default NotificationsPanel;
