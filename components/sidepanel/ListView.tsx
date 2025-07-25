

import React, { useState, useEffect, useMemo } from 'react';
import { Note, Reminder, Event, FolderCustomization, AppSettings } from '../../types';
import Icon from '../Icon';
import { DailyAgendaView } from './DailyAgendaView';
import { RemindersView } from './ReminderComponents';
import { EventsView } from './EventComponents';
import NotesView from './NotesView';
import { TabButton } from './common';
import { getLocale, t } from '../../localization';

interface ListViewProps {
    onClose: () => void;
    onBack: () => void; // For contextual back navigation
    notes: Note[];
    reminders: Reminder[];
    setReminders: React.Dispatch<React.SetStateAction<Reminder[]>>;
    events: Event[];
    setEvents: React.Dispatch<React.SetStateAction<Event[]>>;
    onNewNote: () => void;
    folderCustomization: Record<string, FolderCustomization>;
    setFolderCustomization: React.Dispatch<React.SetStateAction<Record<string, FolderCustomization>>>;
    setActiveNoteId: (id: string | null) => void;
    activeFolder: string | null;
    setActiveFolder: (folder: string | null) => void;
    setActiveItemId: (id: string | null) => void;
    dateFilter: Date | null;
    setDateFilter: (date: Date | null) => void;
    onRenameFolder: (oldName: string, newName: string) => void;
    onDeleteNote: (noteId: string) => void;
    onNewItemRequest: (type: 'event' | 'reminder', date: Date) => void;
    onEditItem: (item: Event | Reminder) => void;
    onOpenNote: (noteId: string) => void;
    settings: AppSettings;
}

const FolderContentView = ({
    folderName, notes, onBack, onOpenNote, onDeleteNote, onNewNote
}: {
    folderName: string,
    notes: Note[],
    onBack: () => void,
    onOpenNote: (noteId: string) => void,
    onDeleteNote: (noteId: string) => void,
    onNewNote: () => void,
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const locale = getLocale('en'); // Use global language setting

    const filteredNotes = useMemo(() => {
        if (!searchTerm) return notes;
        return notes.filter(note =>
            note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            note.content.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [notes, searchTerm]);

    const createSnippet = (html: string) => {
        if (!html) return '';
        const div = document.createElement('div');
        div.innerHTML = html;
        const text = (div.textContent || '').replace(/\s+/g, ' ').trim();
        return text.length > 120 ? text.substring(0, 120) + '...' : text;
    };

    return (
        <div className="flex flex-col h-full animate-slide-in-right">
            <div className="flex items-center p-4 border-b border-border-color flex-shrink-0">
                 <button onClick={onBack} className="p-2 rounded-full hover:bg-border-color mr-2">
                    <Icon name="back" className="h-6 w-6 text-text-secondary" />
                </button>
                <h2 className="text-xl font-bold truncate">{folderName}</h2>
            </div>
            <div className="p-4 border-b border-border-color flex-shrink-0 space-y-4">
                 <input
                    type="text"
                    placeholder={t('common.search', {context: t('common.note.plural')})}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-primary border border-border-color rounded-md py-2 px-4 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                />
                <div className="flex justify-end">
                    <button onClick={onNewNote} className="flex items-center px-4 py-2 text-sm rounded-md bg-accent text-white hover:bg-accent-hover">
                        <Icon name="edit" className="h-4 w-4 mr-2" /> {t('dashboard.newNote')}
                    </button>
                </div>
            </div>
             <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
                {filteredNotes.length > 0 ? filteredNotes.map(note => (
                    <div
                        key={note.id}
                        onClick={() => onOpenNote(note.id)}
                        className="bg-primary p-3 rounded-lg border border-transparent hover:border-accent cursor-pointer group transition-colors relative"
                    >
                        <h4 className="font-semibold text-text-primary pr-8">{note.title || t('common.untitled')}</h4>
                        <p className="text-sm text-text-secondary mt-1 line-clamp-3">{createSnippet(note.content)}</p>
                        <p className="text-xs text-text-secondary/70 mt-2">{t('dashboard.updated', {date: new Date(note.updatedAt).toLocaleDateString(locale)})}</p>
                         <button
                            onClick={(e) => { e.stopPropagation(); onDeleteNote(note.id); }}
                            className="absolute top-2 right-2 p-2 text-text-secondary hover:text-red-500 rounded-full hover:bg-border-color opacity-0 group-hover:opacity-100 transition-opacity"
                            title={t('common.delete')}
                        >
                            <Icon name="delete" className="h-4 w-4" />
                        </button>
                    </div>
                )) : (
                    <p className="text-center text-text-secondary py-8">{t('dashboard.empty')}</p>
                )}
            </div>
        </div>
    );
};

const ListView: React.FC<ListViewProps> = (props) => {
    const { 
        onClose, onBack, notes, reminders, setReminders, events, setEvents, onNewNote, folderCustomization, setFolderCustomization, 
        setActiveItemId, dateFilter, setDateFilter, onRenameFolder, onDeleteNote, onOpenNote,
        onNewItemRequest, settings, activeFolder, setActiveFolder
    } = props;
    const [activeTab, setActiveTab] = useState<'notes' | 'reminders' | 'events'>('notes');
    const [searchTerm, setSearchTerm] = useState('');
    
    useEffect(() => {
        if (dateFilter && (activeTab !== 'reminders' && activeTab !== 'events')) {
             const hasReminders = reminders.some(r => new Date(r.datetime).toDateString() === dateFilter.toDateString());
             if (hasReminders) {
                 setActiveTab('reminders');
             } else {
                 setActiveTab('events');
             }
        }
    }, [dateFilter, activeTab, reminders, events]);

    const notesByFolder = useMemo(() => {
        return notes.reduce((acc, note) => {
            const folder = note.folder || 'Uncategorized';
            if (!acc[folder]) acc[folder] = [];
            acc[folder].push(note);
            return acc;
        }, {} as Record<string, Note[]>);
    }, [notes]);
    
    const dateFilteredReminders = useMemo(() => {
        if(!dateFilter) return [];
        const filterDateStr = dateFilter.toDateString();
        return reminders.filter(r => new Date(r.datetime).toDateString() === filterDateStr);
    }, [reminders, dateFilter]);

     const dateFilteredEvents = useMemo(() => {
        if(!dateFilter) return events;
        const filterDate = dateFilter.getTime();
        return events.filter(e => {
            const start = new Date(e.start);
            start.setHours(0,0,0,0);
            const end = new Date(e.end);
            end.setHours(23,59,59,999);
            return filterDate >= start.getTime() && filterDate <= end.getTime();
        });
    }, [events, dateFilter]);

    if (activeFolder) {
        return <FolderContentView 
            folderName={activeFolder}
            notes={notes.filter(n => n.folder === activeFolder)}
            onBack={() => setActiveFolder(null)}
            onOpenNote={onOpenNote}
            onDeleteNote={onDeleteNote}
            onNewNote={onNewNote}
        />
    }

    const tabNames = {
        notes: t('dashboard.notes'),
        reminders: t('dashboard.reminders'),
        events: t('dashboard.events')
    }

    return (
         <div className="flex flex-col h-full">
            <div className="relative flex justify-center items-center p-4 border-b border-border-color flex-shrink-0">
                <button onClick={onClose} className="absolute left-4 p-2 rounded-full hover:bg-border-color">
                    <Icon name="close" className="h-6 w-6 text-text-secondary" />
                </button>
                <h2 className="text-xl font-bold">{t('dashboard.title')}</h2>
            </div>

            {dateFilter ? (
                <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                    <DailyAgendaView
                        date={dateFilter}
                        dailyEvents={dateFilteredEvents}
                        dailyReminders={dateFilteredReminders}
                        onClearFilter={() => setDateFilter(null)}
                        onBack={onBack}
                        onItemClick={(item) => setActiveItemId(item.id)}
                        setReminders={setReminders}
                        allNotes={notes}
                        onNewItemRequest={onNewItemRequest}
                        language={settings.language.appLanguage}
                    />
                </div>
            ) : (
                <>
                    <div className="p-4 border-b border-border-color flex flex-col gap-4 flex-shrink-0">
                        <div className="flex flex-wrap sm:flex-nowrap gap-1 bg-primary p-1 rounded-lg">
                            <TabButton name={tabNames.notes} icon="notes" isActive={activeTab === 'notes'} onClick={() => setActiveTab('notes')} />
                            <TabButton name={tabNames.reminders} icon="bell" isActive={activeTab === 'reminders'} onClick={() => setActiveTab('reminders')} />
                            <TabButton name={tabNames.events} icon="calendar" isActive={activeTab === 'events'} onClick={() => setActiveTab('events')} />
                        </div>
                         <input
                            type="text"
                            placeholder={t('common.search', {context: tabNames[activeTab]})}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-primary border border-border-color rounded-md py-2 px-4 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                        />
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                        {activeTab === 'notes' ? (
                            <>
                                 <div className="flex justify-end">
                                    <button onClick={onNewNote} className="flex items-center px-4 py-2 text-sm rounded-md bg-accent text-white hover:bg-accent-hover">
                                        <Icon name="edit" className="h-4 w-4 mr-2" /> {t('dashboard.newNote')}
                                    </button>
                                 </div>
                                 <NotesView 
                                    notesByFolder={notesByFolder} 
                                    onOpenNote={onOpenNote}
                                    onDeleteNote={onDeleteNote}
                                    searchTerm={searchTerm}
                                    folderCustomization={folderCustomization}
                                    setFolderCustomization={setFolderCustomization}
                                    onRenameFolder={onRenameFolder}
                                    language={settings.language.appLanguage}
                                    setActiveFolder={setActiveFolder}
                                 />
                            </>
                        ) : activeTab === 'reminders' ? (
                            <RemindersView reminders={reminders.filter(r => r.title.toLowerCase().includes(searchTerm.toLowerCase()))} setReminders={setReminders} allNotes={notes} onItemClick={(item) => setActiveItemId(item.id)} onNewItemRequest={onNewItemRequest} language={settings.language.appLanguage} />
                        ) : (
                            <EventsView events={events.filter(e => e.title.toLowerCase().includes(searchTerm.toLowerCase()))} setEvents={setEvents} allNotes={notes} onItemClick={(item) => setActiveItemId(item.id)} onNewItemRequest={onNewItemRequest} language={settings.language.appLanguage} />
                        )}
                    </div>
                </>
            )}
        </div>
    )
}
export default ListView;