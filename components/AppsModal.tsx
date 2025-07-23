

import React, { useState, useEffect } from 'react';
import { SavedApp, ScriptCode } from '../types';
import Icon from './Icon';

interface AppEditorProps {
    appToEdit: SavedApp | null;
    onSave: (appData: SavedApp) => void;
    onCancel: () => void;
}

const CodeEditorField: React.FC<{ label: string; value: string; onChange: (value: string) => void; language: string }> = ({ label, value, onChange, language }) => (
    <div className="flex flex-col h-full">
        <label className="block text-sm font-medium text-text-secondary mb-1">{label} ({language})</label>
        <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-full flex-1 bg-primary border border-border-color rounded-md p-3 font-mono text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent resize-none"
            spellCheck="false"
        />
    </div>
);


const AppEditor: React.FC<AppEditorProps> = ({ appToEdit, onSave, onCancel }) => {
    const [title, setTitle] = useState('');
    const [html, setHtml] = useState('');
    const [css, setCss] = useState('');
    const [javascript, setJavascript] = useState('');

    useEffect(() => {
        setTitle(appToEdit?.title || '');
        setHtml(appToEdit?.html || '');
        setCss(appToEdit?.css || '');
        setJavascript(appToEdit?.javascript || '');
    }, [appToEdit]);

    const handleSave = () => {
        const appData: SavedApp = {
            id: appToEdit?.id || `app_user_${Date.now()}`,
            title: title || 'Untitled App',
            html,
            css,
            javascript,
        };
        onSave(appData);
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">App Title</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="My Awesome App"
                        className="w-full bg-primary border border-border-color rounded-md py-2 px-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[calc(100%-100px)]">
                    <CodeEditorField label="HTML" value={html} onChange={setHtml} language="html" />
                    <CodeEditorField label="CSS" value={css} onChange={setCss} language="css" />
                </div>
                 <div className="h-[calc(100%-100px)] pt-4">
                     <CodeEditorField label="JavaScript" value={javascript} onChange={setJavascript} language="js" />
                </div>
            </div>
            <div className="p-4 border-t border-border-color flex justify-end space-x-2 flex-shrink-0">
                <button onClick={onCancel} className="px-4 py-2 rounded-md border border-border-color text-text-primary hover:bg-border-color">Cancel</button>
                <button onClick={handleSave} className="px-4 py-2 rounded-md bg-accent text-white hover:bg-accent-hover">Save App</button>
            </div>
        </div>
    );
};

interface AppsModalProps {
    isOpen: boolean;
    onClose: () => void;
    apps: SavedApp[];
    setApps: React.Dispatch<React.SetStateAction<SavedApp[]>>;
    onLaunchApp: (appId: string) => void;
    onDeleteApp: (app: SavedApp) => void;
    isMobile: boolean;
}

const AppsModal: React.FC<AppsModalProps> = ({ isOpen, onClose, apps, setApps, onLaunchApp, onDeleteApp, isMobile }) => {
    const [editingApp, setEditingApp] = useState<SavedApp | 'new' | null>(null);
    
    if (!isOpen) return null;

    const requestDeleteApp = (e: React.MouseEvent, app: SavedApp) => {
        e.stopPropagation();
        onDeleteApp(app);
    };

    const handleLaunch = (e: React.MouseEvent, appId: string) => {
        e.stopPropagation();
        onLaunchApp(appId);
        onClose();
    };

    const handleSave = (appData: SavedApp) => {
        if (editingApp === 'new' || !appData.id) {
            setApps(prev => [...prev, { ...appData, id: `app_user_${Date.now()}` }]);
        } else {
            setApps(prev => prev.map(app => (app.id === appData.id ? appData : app)));
        }
        setEditingApp(null);
    };

    const handleModalClose = () => {
        setEditingApp(null);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 md:p-4 animate-fade-in" onClick={handleModalClose}>
            <div className="bg-secondary shadow-2xl w-full h-full md:rounded-lg md:max-w-4xl md:h-[90vh] flex flex-col animate-pop-in" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b border-border-color flex-shrink-0">
                    <div className="flex items-center gap-4">
                         {editingApp && (
                             <button onClick={() => setEditingApp(null)} className="p-2 rounded-full hover:bg-border-color">
                                <Icon name="back" className="h-5 w-5 text-text-secondary" />
                            </button>
                         )}
                        <h2 className="text-xl font-bold">
                            {editingApp ? (editingApp === 'new' ? 'Create New App' : 'Edit App') : 'My Apps'}
                        </h2>
                    </div>
                    <button onClick={handleModalClose} className="p-2 rounded-full hover:bg-border-color">
                        <Icon name="close" className="h-6 w-6 text-text-secondary" />
                    </button>
                </div>

                {editingApp ? (
                    <AppEditor appToEdit={editingApp === 'new' ? null : editingApp} onSave={handleSave} onCancel={() => setEditingApp(null)} />
                ) : (
                    <>
                        <div className="p-4 border-b border-border-color">
                            <button onClick={() => setEditingApp('new')} className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-accent text-white hover:bg-accent-hover">
                                <Icon name="edit" className="h-5 w-5"/>
                                <span>Create New App</span>
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {apps.length > 0 ? apps.map(app => (
                                <div key={app.id} className="bg-primary p-3 rounded-lg border border-border-color flex justify-between items-center group">
                                    <span className="font-semibold text-text-primary">{app.title}</span>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={(e) => handleLaunch(e, app.id)}
                                            className="px-3 py-1 text-sm rounded-md bg-accent text-white hover:bg-accent-hover"
                                        >
                                            Launch
                                        </button>
                                        <button onClick={() => setEditingApp(app)} className="p-2 rounded-full text-text-secondary hover:bg-border-color group-hover:text-accent">
                                            <Icon name="edit" className="h-4 w-4" />
                                        </button>
                                        <button onClick={(e) => requestDeleteApp(e, app)} className="p-2 rounded-full text-text-secondary hover:bg-border-color group-hover:text-red-500">
                                            <Icon name="delete" className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-center text-text-secondary py-8">No applications created yet. Ask me to make one, or create your own!</p>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default AppsModal;