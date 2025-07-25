

import React, { useState } from 'react';
import { Note, FolderCustomization } from '../../types';
import Icon from '../Icon';
import FolderEditModal, { FolderIcon } from './FolderEditModal';
import { getLocale, t } from '../../localization';

const NotesView = ({ notesByFolder, searchTerm, folderCustomization, setFolderCustomization, onRenameFolder, setActiveFolder, language, onOpenNote, onDeleteNote }: { 
    notesByFolder: Record<string, Note[]>, 
    searchTerm: string, 
    folderCustomization: Record<string, FolderCustomization>, 
    setFolderCustomization: React.Dispatch<React.SetStateAction<Record<string, FolderCustomization>>>, 
    onRenameFolder: (oldName: string, newName: string) => void, 
    language: 'en' | 'ru',
    setActiveFolder: (folderName: string) => void,
    onOpenNote: (noteId: string) => void,
    onDeleteNote: (noteId: string) => void,
}) => {
    const [editingFolder, setEditingFolder] = useState<string | null>(null);

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
    
    const filteredFolders = Object.entries(notesByFolder).filter(([folderName, notes]) => {
        if (!searchTerm) return true;
        if (folderName.toLowerCase().includes(searchTerm.toLowerCase())) return true;
        return notes.some(note => note.title.toLowerCase().includes(searchTerm.toLowerCase()) || note.content.toLowerCase().includes(searchTerm.toLowerCase()));
    });

    return filteredFolders.length > 0 ? (
        <>
            <div className="space-y-3">
                {filteredFolders.map(([folder, notesInFolder]) => (
                    <div key={folder}>
                        <div className="bg-primary p-3 rounded-lg cursor-pointer transition-all hover:border-accent border border-transparent" onClick={() => setActiveFolder(folder)}>
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
                                        <Icon name="chevron" className="h-5 w-5 -rotate-90" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
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