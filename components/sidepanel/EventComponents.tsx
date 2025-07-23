


import React, { useState, useMemo } from 'react';
import { Event, Note } from '../../types';
import Icon from '../Icon';
import { ItemGroupedByDate, AttachedNotePreview } from './common';
import { getLocale, t } from '../../localization';

export const EventsView = ({ events, setEvents, allNotes, onItemClick, onNewItemRequest, language }: { events: Event[], setEvents: React.Dispatch<React.SetStateAction<Event[]>>, allNotes: Note[], onItemClick: (item: Event) => void, onNewItemRequest: (type: 'event' | 'reminder', date: Date) => void, language: 'en' | 'ru' }) => {
    const locale = getLocale(language);
    const renderEvent = (event: Event) => (
         <div key={event.id} className="bg-primary p-3 rounded-lg border-l-4 flex flex-col gap-1 cursor-pointer hover:bg-border-color/50" style={{ borderLeftColor: event.color }} onClick={() => onItemClick(event)}>
            <div className="min-w-0">
                <p className="font-semibold text-text-primary truncate">{event.title}</p>
                <p className="text-sm text-accent truncate">
                    {new Date(event.start).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })} - {new Date(event.end).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}
                </p>
                 {event.description && <p className="text-sm text-text-secondary truncate mt-1">{event.description}</p>}
            </div>
        </div>
    );

    return (
         <div className="space-y-4">
            <div className="flex justify-end">
                <button onClick={() => onNewItemRequest('event', new Date())} className="flex items-center px-4 py-2 text-sm rounded-md bg-accent text-white hover:bg-accent-hover">
                    <Icon name="calendar" className="h-4 w-4 mr-2" /> {t('dashboard.newEvent')}
                </button>
            </div>
            
            {events.length > 0 ? (
                <ItemGroupedByDate items={events} renderItem={renderEvent} itemType="event" locale={locale} />
            ) : <p className="text-center text-text-secondary py-8">{t('dashboard.events.empty')}</p>}
        </div>
    )
}

export const EventDisplay = ({ event, onBack, onDelete, allNotes, onOpenNote, onEdit, setHighlightedRange, language }: { event: Event, onBack: () => void, onDelete: (type: string, id: string, name: string) => void, allNotes: Note[], onOpenNote: (noteId: string) => void, onEdit: (event: Event) => void, setHighlightedRange: (range: {start: string, end: string} | null) => void, language: 'en' | 'ru' }) => {
    const locale = getLocale(language);
    const handleDelete = () => {
        onDelete('event', event.id, event.title);
        onBack();
    }
    const attachedNote = useMemo(() => event.noteId ? allNotes.find(n => n.id === event.noteId) : null, [event.noteId, allNotes]);


    return (
        <div className="flex flex-col h-full">
            <div className="flex justify-between items-center p-4 border-b border-border-color flex-shrink-0">
                <button onClick={onBack} className="flex items-center gap-2 p-2 rounded-full hover:bg-border-color">
                    <Icon name="back" className="h-6 w-6 text-text-secondary" />
                    <span className="font-bold desktop-only">{t('dashboard.events')}</span>
                </button>
                 <div className="flex items-center space-x-2">
                    <button onClick={() => onEdit(event)} className="p-2 rounded-full hover:bg-border-color text-text-secondary hover:text-accent" title={t('common.edit')}>
                        <Icon name="edit" className="h-5 w-5" />
                    </button>
                    <button onClick={handleDelete} className="p-2 rounded-full hover:bg-border-color text-text-secondary hover:text-red-500" title={t('common.delete')}>
                        <Icon name="delete" className="h-5 w-5" />
                    </button>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                 <div className="flex items-start space-x-4">
                    <div className="w-6 h-6 mt-1 rounded-md flex-shrink-0" style={{backgroundColor: event.color}}></div>
                    <h2 className="text-2xl font-bold flex-1">{event.title}</h2>
                </div>
                <div className="pl-10 space-y-4">
                    <div className="flex items-center text-text-secondary">
                        <Icon name="calendar" className="h-5 w-5 mr-3 text-accent" />
                        <span>{new Date(event.start).toLocaleString(locale, {dateStyle: 'medium', timeStyle: 'short'})} to {new Date(event.end).toLocaleString(locale, {dateStyle: 'medium', timeStyle: 'short'})}</span>
                    </div>

                    {event.description && (
                        <p className="text-text-primary whitespace-pre-wrap">{event.description}</p>
                    )}

                    {attachedNote && <AttachedNotePreview note={attachedNote} onOpenNote={onOpenNote} />}
                </div>
            </div>
        </div>
    )
}