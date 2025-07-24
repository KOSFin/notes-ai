import React from 'react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import Icon from './Icon';
import { t } from '../localization';

interface SystemNotificationsProps {
    aiStatus: 'initializing' | 'ready' | 'error';
}

const SystemNotifications: React.FC<SystemNotificationsProps> = ({ aiStatus }) => {
    const { isAvailable: isSpeechAvailable } = useSpeechRecognition(() => {}, 'en-US');

    const notifications: React.ReactNode[] = [];

    if (aiStatus === 'error') {
        notifications.push(
            <div key="ai-error" className="bg-red-500/20 text-red-500 text-sm p-3 text-center flex items-center justify-center gap-2 animate-fade-in">
                <Icon name="close" className="h-5 w-5 flex-shrink-0" />
                <span className="font-semibold">{t('system.banner.aiError.title')}</span>
                <span>{t('system.banner.aiError.message')}</span>
            </div>
        );
    }

    if (!isSpeechAvailable) {
        notifications.push(
            <div key="speech-error" className="bg-amber-500/20 text-amber-500 text-sm p-3 text-center flex items-center justify-center gap-2 animate-fade-in">
                <Icon name="mic" className="h-5 w-5 flex-shrink-0" />
                <span className="font-semibold">{t('system.banner.speechError.title')}</span>
                <span>{t('system.banner.speechError.message')}</span>
            </div>
        );
    }
    
    if (notifications.length === 0) {
        return null;
    }

    return (
        <div className="w-full relative z-50">
            {notifications}
        </div>
    );
};

export default SystemNotifications;
