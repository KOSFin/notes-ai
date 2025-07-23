import React, { useState, useEffect } from 'react';
import { AppSettings } from '../types';
import Icon from './Icon';
import PersonalizationSettings from './settings/PersonalizationSettings';
import CalendarSettings from './settings/CalendarSettings';
import InterfaceSettings from './settings/InterfaceSettings';
import ChatSettings from './settings/ChatSettings';
import NavigationSettings from './settings/NavigationSettings';
import LanguageSettings from './settings/LanguageSettings';
import AccountSettings from './settings/AccountSettings';
import useWindowDimensions from '../hooks/useWindowDimensions';
import { t } from '../localization';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    settings: AppSettings;
    setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
    onRestartOnboarding: () => void;
    onDeleteAllData: () => void;
    dataCounts: { notes: number; events: number; reminders: number; };
}

type SettingsSection = 'personalization' | 'calendar' | 'interface' | 'chat' | 'navigation' | 'language' | 'account';

const UnsavedChangesModal = ({ onConfirm, onCancel }: { onConfirm: () => void, onCancel: () => void }) => (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[100]" onClick={onCancel}>
         <div className="bg-secondary rounded-lg shadow-2xl w-full max-w-md animate-pop-in" onClick={e => e.stopPropagation()}>
            <div className="p-6">
                <div className="flex items-start">
                    <div className="mr-4 flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-amber-500/20">
                       <Icon name="question" className="h-6 w-6 text-amber-500"/>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg leading-6 font-medium text-text-primary">{t('discardModal.title')}</h3>
                        <div className="mt-2">
                            <p className="text-sm text-text-secondary">{t('discardModal.message')}</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="bg-primary px-4 py-3 rounded-b-lg sm:px-6 sm:flex sm:flex-row-reverse space-y-2 sm:space-y-0 sm:space-x-reverse sm:space-x-2">
                <button
                    type="button"
                    onClick={onConfirm}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary focus:ring-red-500 sm:w-auto sm:text-sm"
                >
                    {t('discardModal.confirm')}
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

const LanguageChangeModal = ({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void; }) => (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[100]" onClick={onCancel}>
        <div className="bg-secondary rounded-lg shadow-2xl w-full max-w-md animate-pop-in" onClick={e => e.stopPropagation()}>
            <div className="p-6">
                <div className="flex items-start">
                    <div className="mr-4 flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-accent/20">
                        <Icon name="globe" className="h-6 w-6 text-accent"/>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg leading-6 font-medium text-text-primary">{t('langChange.title')}</h3>
                        <div className="mt-2">
                            <p className="text-sm text-text-secondary">{t('langChange.message')}</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="bg-primary px-4 py-3 rounded-b-lg sm:px-6 sm:flex sm:flex-row-reverse space-y-2 sm:space-y-0 sm:space-x-reverse sm:space-x-2">
                <button
                    type="button"
                    onClick={onConfirm}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-accent text-base font-medium text-white hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary focus:ring-accent sm:w-auto sm:text-sm"
                >
                    {t('langChange.confirm')}
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


const SectionButton = ({ id, name, icon, onClick, isActive, isMobile }: { id: SettingsSection, name: string, icon: string, onClick: () => void, isActive: boolean, isMobile: boolean }) => (
    <button
        onClick={onClick}
        className={`flex items-center w-full p-3 text-left rounded-lg transition-colors ${!isMobile && isActive ? 'bg-accent text-white' : 'hover:bg-border-color/50'}`}
    >
        <Icon name={icon} className="h-5 w-5 mr-3" />
        <span className="font-semibold">{name}</span>
        {isMobile && <Icon name="chevron" className="h-5 w-5 ml-auto -rotate-90 text-text-secondary" />}
    </button>
);

const MainView = ({ activeSection, setActiveSection, isMobile }: { activeSection: SettingsSection | null, setActiveSection: (section: SettingsSection) => void, isMobile: boolean }) => (
    <nav className="p-4 space-y-2">
        <SectionButton id="personalization" name={t('settings.personalization.title')} icon="palette" onClick={() => setActiveSection('personalization')} isActive={activeSection === 'personalization'} isMobile={isMobile} />
        <SectionButton id="navigation" name={t('settings.navigation.title')} icon="menu" onClick={() => setActiveSection('navigation')} isActive={activeSection === 'navigation'} isMobile={isMobile} />
        <SectionButton id="language" name={t('settings.language.sectionTitle')} icon="globe" onClick={() => setActiveSection('language')} isActive={activeSection === 'language'} isMobile={isMobile} />
        <SectionButton id="calendar" name={t('settings.calendar.title')} icon="calendar" onClick={() => setActiveSection('calendar')} isActive={activeSection === 'calendar'} isMobile={isMobile} />
        <SectionButton id="interface" name={t('settings.interface.title')} icon="hide" onClick={() => setActiveSection('interface')} isActive={activeSection === 'interface'} isMobile={isMobile} />
        <SectionButton id="chat" name={t('settings.chat.title')} icon="chat" onClick={() => setActiveSection('chat')} isActive={activeSection === 'chat'} isMobile={isMobile} />
        <div className="pt-2 mt-2 border-t border-border-color/50">
            <SectionButton id="account" name={t('settings.account.title')} icon="user" onClick={() => setActiveSection('account')} isActive={activeSection === 'account'} isMobile={isMobile} />
        </div>
    </nav>
);

const DetailView = ({ content }: { content: React.ReactNode }) => (
    <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
        {content}
    </div>
);


const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, setSettings, onRestartOnboarding, onDeleteAllData, dataCounts }) => {
    const { width } = useWindowDimensions();
    const isMobile = width < 768;
    
    const [activeSection, setActiveSection] = useState<SettingsSection | null>(isMobile ? null : 'personalization');
    const [localSettings, setLocalSettings] = useState(settings);
    const [hasChanges, setHasChanges] = useState(false);
    const [showCloseConfirm, setShowCloseConfirm] = useState(false);
    const [languageChangeRequest, setLanguageChangeRequest] = useState<'en' | 'ru' | null>(null);

    useEffect(() => {
        if (isOpen) {
            setLocalSettings(settings);
            if (isMobile) {
                setActiveSection(null);
            } else if (activeSection === null) {
                setActiveSection('personalization');
            }
        }
    }, [isOpen, isMobile]);
    
    useEffect(() => {
        setHasChanges(JSON.stringify(settings) !== JSON.stringify(localSettings));
    }, [localSettings, settings]);

    useEffect(() => {
        if (isOpen && !isMobile && activeSection === null) {
            setActiveSection('personalization');
        }
    }, [isMobile, isOpen, activeSection]);


    if (!isOpen) return null;

    const handleSave = () => {
        setSettings(localSettings);
        onClose();
    };

    const handleCloseRequest = () => {
        if (hasChanges) {
            setShowCloseConfirm(true);
        } else {
            onClose();
        }
    };
    
    const handleConfirmClose = () => {
        setShowCloseConfirm(false);
        onClose();
    };

    const handleRequestLanguageChange = (lang: 'en' | 'ru') => {
        if (lang !== settings.language.appLanguage) {
            setLocalSettings(prev => ({ ...prev, language: {...prev.language, appLanguage: lang }}));
            setLanguageChangeRequest(lang);
        }
    };

    const handleConfirmLangChange = () => {
        if (languageChangeRequest) {
            setSettings(localSettings); // Save the new settings from local state
            // Short delay to ensure localStorage write before reload
            setTimeout(() => {
                window.location.reload();
            }, 100);
        }
    };

    const renderContent = () => {
        switch (activeSection) {
            case 'personalization':
                return <PersonalizationSettings settings={localSettings} setSettings={setLocalSettings} />;
            case 'navigation':
                return <NavigationSettings settings={localSettings} setSettings={setLocalSettings} isMobile={isMobile} />;
            case 'language':
                return <LanguageSettings settings={localSettings} setSettings={setLocalSettings} onRequestLanguageChange={handleRequestLanguageChange} />;
            case 'calendar':
                return <CalendarSettings settings={localSettings} setSettings={setLocalSettings} />;
            case 'interface':
                return <InterfaceSettings settings={localSettings} setSettings={setLocalSettings} />;
            case 'chat':
                return <ChatSettings settings={localSettings} setSettings={setLocalSettings} />;
            case 'account':
                return <AccountSettings onRestartOnboarding={onRestartOnboarding} onDeleteAllData={onDeleteAllData} dataCounts={dataCounts} />;
            default:
                return null;
        }
    };
    
    const getTitle = (section: SettingsSection | null) => {
        if (!section) return t('settings.title');
        switch(section) {
            case 'personalization': return t('settings.personalization.title');
            case 'navigation': return t('settings.navigation.title');
            case 'language': return t('settings.language.title');
            case 'calendar': return t('settings.calendar.title');
            case 'interface': return t('settings.interface.title');
            case 'chat': return t('settings.chat.title');
            case 'account': return t('settings.account.title');
            default: return t('settings.title');
        }
    };
    
    const detailContent = renderContent();
    const showBackButton = isMobile && activeSection !== null;
    const showFooterButtons = !isMobile || activeSection !== null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-0 md:p-4 animate-fade-in" onClick={handleCloseRequest}>
            <div className="bg-secondary shadow-2xl flex flex-col w-full h-full md:rounded-lg md:max-w-4xl md:h-[80vh] animate-pop-in" onClick={e => e.stopPropagation()}>
                <div className="relative flex justify-between items-center p-4 border-b border-border-color flex-shrink-0">
                    <div className="absolute left-4">
                        <button onClick={showBackButton ? () => setActiveSection(null) : handleCloseRequest} className="p-2 rounded-full hover:bg-border-color">
                           <Icon name={showBackButton ? 'back' : 'close'} className="h-6 w-6 text-text-secondary" />
                       </button>
                    </div>

                    <h2 className="text-xl font-bold text-center flex-1">
                        {isMobile ? getTitle(activeSection) : t('settings.title')}
                    </h2>
                    
                    <div className="absolute right-4 w-10 h-10" />
                </div>
                
                {isMobile ? (
                     activeSection === null ? 
                        <MainView activeSection={activeSection} setActiveSection={setActiveSection} isMobile={isMobile} /> 
                        : <DetailView content={detailContent} />
                ) : (
                    <div className="flex flex-1 overflow-hidden">
                        <aside className="w-1/3 min-w-[240px] bg-primary rounded-l-lg p-2 border-r border-border-color flex flex-col">
                           <MainView activeSection={activeSection} setActiveSection={setActiveSection} isMobile={isMobile} />
                            {hasChanges && (
                                <div className="mt-auto p-4 text-center text-xs text-amber-500 animate-fade-in">
                                    {t('common.unsavedChanges')}
                                </div>
                            )}
                        </aside>
                        <main className="flex-1 flex flex-col">
                             <DetailView content={detailContent} />
                        </main>
                    </div>
                )}
                
                {showFooterButtons && (
                    <div className="p-4 border-t border-border-color flex justify-end gap-2 bg-primary rounded-b-lg flex-shrink-0">
                        <button onClick={handleCloseRequest} className="px-4 py-2 rounded-md border border-border-color text-text-primary hover:bg-border-color">{t('common.cancel')}</button>
                        <button onClick={handleSave} className="px-4 py-2 rounded-md bg-accent text-white hover:bg-accent-hover">{t('settings.save')}</button>
                    </div>
                )}
                
                {isMobile && activeSection === null && hasChanges && (
                     <div className="p-4 border-t border-border-color flex justify-end gap-2 bg-primary rounded-b-lg flex-shrink-0 animate-fade-in-up">
                        <button onClick={handleSave} className="w-full px-4 py-2 rounded-md bg-accent text-white hover:bg-accent-hover">
                            {t('settings.save')}
                        </button>
                    </div>
                )}
            </div>

            {showCloseConfirm && (
                <UnsavedChangesModal
                    onConfirm={handleConfirmClose}
                    onCancel={() => setShowCloseConfirm(false)}
                />
            )}
            
            {languageChangeRequest && (
                <LanguageChangeModal
                    onConfirm={handleConfirmLangChange}
                    onCancel={() => {
                        setLanguageChangeRequest(null);
                        setLocalSettings(settings); // Revert changes if cancelled
                    }}
                />
            )}
        </div>
    );
};

export default SettingsModal;