

import React from 'react';
import { AppSettings } from '../../types';
import { languages, voiceLanguages, t } from '../../localization';

const LanguageSettings = ({ settings, setSettings, onRequestLanguageChange }: { settings: AppSettings, setSettings: React.Dispatch<React.SetStateAction<AppSettings>>, onRequestLanguageChange: (lang: 'en' | 'ru') => void }) => {

    const handleAppLangChange = (lang: 'en' | 'ru') => {
        onRequestLanguageChange(lang);
    };
    
    const handleVoiceLangChange = (lang: string) => {
        setSettings(prev => ({
            ...prev,
            language: { ...prev.language, voiceInputLanguage: lang },
        }));
    };

    return (
        <div className="space-y-8">
            <h3 className="text-2xl font-bold">{t('settings.language.title')}</h3>
            
            <section>
                <h4 className="text-lg font-semibold mb-3">{t('settings.language.appLanguage.title')}</h4>
                <div className="p-4 bg-primary rounded-lg">
                     <p className="text-sm text-text-secondary mb-3">{t('settings.language.appLanguage.description')}</p>
                     <select 
                        value={settings.language.appLanguage}
                        onChange={e => handleAppLangChange(e.target.value as 'en' | 'ru')}
                        className="w-full bg-secondary border border-border-color rounded-md py-2 px-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                    >
                        {Object.entries(languages).map(([code, {name, flag}]) => (
                            <option key={code} value={code}>
                                {flag} {name}
                            </option>
                        ))}
                    </select>
                </div>
            </section>
            
            <section>
                <h4 className="text-lg font-semibold mb-3">{t('settings.language.voiceInput.title')}</h4>
                <div className="p-4 bg-primary rounded-lg">
                    <p className="text-sm text-text-secondary mb-3">{t('settings.language.voiceInput.description')}</p>
                     <select 
                        value={settings.language.voiceInputLanguage}
                        onChange={e => handleVoiceLangChange(e.target.value)}
                        className="w-full bg-secondary border border-border-color rounded-md py-2 px-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                    >
                        {Object.entries(voiceLanguages).map(([code, name]) => (
                            <option key={code} value={code}>
                                {name}
                            </option>
                        ))}
                    </select>
                </div>
            </section>
        </div>
    );
};

export default LanguageSettings;