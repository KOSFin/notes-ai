


import React from 'react';
import { AppSettings } from '../../types';
import { t } from '../../localization';

const ToggleSwitch = ({ checked, onChange }: { checked: boolean, onChange: (checked: boolean) => void }) => (
    <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${checked ? 'bg-accent' : 'bg-primary'}`}
    >
        <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
);

const InterfaceSettings = ({ settings, setSettings }: { settings: AppSettings, setSettings: React.Dispatch<React.SetStateAction<AppSettings>> }) => {
    
    const handleCombineToggle = (show: boolean) => {
        setSettings(prev => ({
            ...prev,
            combineLogoAndUIHide: show,
        }));
    };

    return (
        <div className="space-y-8">
            <h3 className="text-2xl font-bold">{t('settings.interface.title')}</h3>
            
            <section>
                <h4 className="text-lg font-semibold mb-3">{t('settings.interface.header')}</h4>
                <div className="p-4 bg-primary rounded-lg space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-text-primary">{t('settings.interface.combineLogo')}</p>
                            <p className="text-sm text-text-secondary">{t('settings.interface.combineLogo.desc')}</p>
                        </div>
                        <ToggleSwitch 
                            checked={settings.combineLogoAndUIHide}
                            onChange={handleCombineToggle}
                        />
                    </div>
                </div>
            </section>
        </div>
    );
};

export default InterfaceSettings;