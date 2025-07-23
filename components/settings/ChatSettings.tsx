


import React from 'react';
import { AppSettings } from '../../types';
import Icon from '../Icon';
import { t } from '../../localization';

const ChatSettings = ({ settings, setSettings }: { settings: AppSettings, setSettings: React.Dispatch<React.SetStateAction<AppSettings>> }) => {
    
    const handleBehaviorChange = (behavior: 'overlay' | 'header_button') => {
        setSettings(prev => ({
            ...prev,
            chat: {
                ...prev.chat,
                behavior,
            }
        }));
    };

    return (
        <div className="space-y-8">
            <h3 className="text-2xl font-bold">{t('settings.chat.title')}</h3>
            
            <section>
                <h4 className="text-lg font-semibold mb-3">{t('settings.chat.interaction')}</h4>
                <div className="p-4 bg-primary rounded-lg space-y-4">
                    <p className="text-sm text-text-secondary">{t('settings.chat.interaction.desc')}</p>
                    <div className="space-y-3">
                        <BehaviorOption
                            title={t('settings.chat.interaction.overlay')}
                            description={t('settings.chat.interaction.overlay.desc')}
                            icon="send"
                            isActive={settings.chat.behavior === 'overlay'}
                            onClick={() => handleBehaviorChange('overlay')}
                        />
                        <BehaviorOption
                            title={t('settings.chat.interaction.header')}
                            description={t('settings.chat.interaction.header.desc')}
                            icon="chat"
                            isActive={settings.chat.behavior === 'header_button'}
                            onClick={() => handleBehaviorChange('header_button')}
                        />
                    </div>
                </div>
            </section>
        </div>
    );
};

const BehaviorOption = ({ title, description, icon, isActive, onClick }: { title: string, description: string, icon: string, isActive: boolean, onClick: () => void }) => (
    <div 
        onClick={onClick}
        className={`p-4 rounded-lg border-2 cursor-pointer transition-all flex items-center gap-4 ${isActive ? 'border-accent bg-accent/10' : 'border-border-color hover:border-text-secondary/50'}`}
    >
        <Icon name={icon} className="h-8 w-8 text-accent flex-shrink-0" />
        <div className="flex-1">
            <h5 className="font-semibold text-text-primary">{title}</h5>
            <p className="text-sm text-text-secondary">{description}</p>
        </div>
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isActive ? 'bg-accent border-accent' : 'border-border-color'}`}>
            {isActive && <Icon name="check" className="h-3 w-3 text-white" />}
        </div>
    </div>
);

export default ChatSettings;