


import React, { useState, useEffect } from 'react';
import { Note, FolderCustomization } from '../../types';
import Icon from '../Icon';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import FolderEditModal, { FolderIcon } from './FolderEditModal';
import { getLocale, t } from '../../localization';

const isEmoji = (str: string) => {
    const emojiRegex = /^\p{Emoji}/u;
    return emojiRegex.test(str);
};

const parseNoteTitle = (title: string) => {
    if (!title) return { icon: null, title: '' };
    const firstChar = [...title][0];
    if (firstChar && isEmoji(firstChar)) {
        return { icon: firstChar, title: title.substring(firstChar.length).trim() };
    }
    return { icon: null, title };
};

const createSnippet = (html: string) => {
    if (!html) return '';
    const div = document.createElement('div');
    div.innerHTML = html;
    const text = (div.textContent || '').replace(/\s+/g, ' ').trim();
    if (text.length > 120) {
        return text.substring(0, 120) + '...';
    }
    return text;
};

const NotesView = ({ notesByFolder, onOpenNote, onDeleteNote, searchTerm, folderCustomization, setFolderCustomization, onRenameFolder, language }: { notesByFolder: Record<string, Note[]>, onOpenNote: (noteId: string) => void, onDeleteNote: (noteId: string) => void, searchTerm: string, folderCustomization: Record<string, FolderCustomization>, setFolderCustomization: React.Dispatch<React.SetStateAction<Record<string, FolderCustomization>>>, onRenameFolder: (oldName: string, newName: string) => void, language: 'en' | 'ru' }) => {
    const [expandedFolders, setExpandedFolders] = useLocalStorage<Record<string, boolean>>('nexus-folders-expanded', {});
    const [editingFolder, setEditingFolder] = useState<string | null>(null);
    const locale = getLocale(language);

    const toggleFolder = (folderName: string) => {
        setExpandedFolders(prev => ({ ...prev, [folderName]: !prev[folderName] }));
    };
    
    useEffect(() => {
        if(searchTerm) {
            const newExpanded: { [key: string]: boolean } = {};
            Object.keys(notesByFolder).forEach(folder => {
                newExpanded[folder] = true;
            });
            setExpandedFolders(newExpanded);
        }
    }, [searchTerm, notesByFolder, setExpandedFolders]);

    const handleSaveFolder = (originalName: string, newData: { name: string; color: string; icon: string; }) => {
        if (originalName !== newData.name) {
            onRenameFolder(originalName, newData.name);
        }
        setFolderCustomization(prev => {
            const newCustomization = { ...prev };
            if (originalName !== newData.name && newCustomization[originalName]) {
                delete newCustomization[originalName];
            }
            newCustomization[newData.name] = { color: newData.color, icon: newData.icon };
            return newCustomization;
        });
        setEditingFolder(null);
    };


    const handleDelete = (e: React.MouseEvent, note: Note) => {
        e.stopPropagation();
        onDeleteNote(note.id);
    };

    return Object.entries(notesByFolder).length > 0 ? (
        <>
            {Object.entries(notesByFolder).map(([folder, notesInFolder]) => (
                <div key={folder}>
                    <div className="bg-primary p-3 rounded-lg cursor-pointer" onClick={() => toggleFolder(folder)}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 flex-grow min-w-0">
                                <FolderIcon customization={folderCustomization[folder]} className="h-9 w-9 rounded-lg flex-shrink-0" />
                                <div className="min-w-0">
                                    <h3 className="font-bold text-lg truncate">{folder}</h3>
                                    <p className="text-sm text-text-secondary">{t(notesInFolder.length === 1 ? 'dashboard.noteCount' : 'dashboard.noteCount.plural', {count: notesInFolder.length})}</p>
                                </div>
                            </div>
                            <div className="flex items-center flex-shrink-0">
                                <button
                                    onClick={(e) => { e.stopPropagation(); setEditingFolder(folder); }}
                                    className="p-2 rounded-full hover:bg-border-color text-text-secondary hover:text-accent"
                                    title={t('dashboard.editFolder')}
                                >
                                    <Icon name="edit" className="h-4 w-4" />
                                </button>
                                <div className="p-2 rounded-full text-text-secondary" aria-hidden="true">
                                    <Icon name="chevron" className={`h-5 w-5 transition-transform ${expandedFolders[folder] ? 'rotate-180' : ''}`} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {expandedFolders[folder] && (
                         <div className="mt-3 pl-4 ml-[calc(2.25rem/2)] border-l-2 border-border-color space-y-3">
                            {notesInFolder.map(note => {
                                const { icon, title: cleanTitle } = parseNoteTitle(note.title);
                                const snippet = createSnippet(note.content);
                                
                                const hasBackground = note.background && note.background.type !== 'none';
                                const noteStyle: React.CSSProperties = {};
                                if (hasBackground) {
                                    noteStyle.backgroundImage = `url(${note.background?.value})`;
                                    noteStyle.backgroundSize = 'cover';
                                    noteStyle.backgroundPosition = 'center';
                                }

                                return (
                                    <div
                                        key={note.id}
                                        onClick={(e) => { e.stopPropagation(); onOpenNote(note.id); }}
                                        className="bg-primary rounded-lg group relative cursor-pointer hover:border-accent border border-transparent transition-all overflow-hidden"
                                        style={noteStyle}
                                    >
                                        {hasBackground && <div className="absolute inset-0 bg-primary/80 backdrop-blur-sm" />}
                                        <div className="relative z-10 p-3">
                                            <div className="flex items-start gap-3">
                                                {icon && <span className="text-3xl -mt-1 flex-shrink-0 w-8 text-center">{icon}</span>}
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-semibold text-text-primary line-clamp-3">{cleanTitle || t('common.untitled')}</h4>
                                                    <p className="text-xs text-text-secondary mt-1">
                                                        {t('dashboard.updated', {date: new Date(note.updatedAt).toLocaleDateString(locale)})}
                                                    </p>
                                                </div>
                                            </div>
                                            {snippet && (
                                                <>
                                                    <div className="my-2 border-b border-border-color/30" />
                                                    <p className="text-sm text-text-secondary">{snippet}</p>
                                                </>
                                            )}
                                            
                                            <button
                                                onClick={(e) => handleDelete(e, note)}
                                                className="absolute top-2 right-2 p-2 text-text-secondary hover:text-red-500 rounded-full hover:bg-border-color opacity-0 group-hover:opacity-100 transition-all z-20"
                                                title={t('common.delete')}
                                            >
                                                <Icon name="delete" className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            ))}
            {editingFolder && (
                 <FolderEditModal
                    folderName={editingFolder}
                    customization={folderCustomization[editingFolder]}
                    onClose={() => setEditingFolder(null)}
                    onSave={handleSaveFolder}
                />
            )}
        </>
    ) : <p className="text-center text-text-secondary py-8">{t('dashboard.empty')}</p>;
}

export default NotesView;