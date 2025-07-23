





import React, { useState, useMemo } from 'react';
import { Reminder, Note } from '../../types';
import Icon from '../Icon';
import confetti from 'canvas-confetti';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { ReminderGroup, ItemGroupedByDate, AttachedNotePreview } from './common';
import { getLocale, t } from '../../localization';

export const RemindersView = ({ reminders, setReminders, onItemClick, onNewItemRequest, language }: { reminders: Reminder[], setReminders: React.Dispatch<React.SetStateAction<Reminder[]>>, allNotes: Note[], onItemClick: (item: Reminder) => void, onNewItemRequest: (type: 'event' | 'reminder', date: Date) => void, language: 'en' | 'ru' }) => {
    const [showCompleted, setShowCompleted] = useLocalStorage('nexus-show-completed', true);
    const locale = getLocale(language);
    
    const [pendingCompleteIds, setPendingCompleteIds] = useState<Set<string>>(new Set());
    const [pendingCompletionTimeouts, setPendingCompletionTimeouts] = useState<Record<string, ReturnType<typeof setTimeout>>>({});


    const handleToggleComplete = (e: React.MouseEvent<HTMLButtonElement>, reminder: Reminder) => {
        e.stopPropagation();

        if (pendingCompleteIds.has(reminder.id)) {
            clearTimeout(pendingCompletionTimeouts[reminder.id]);

            setPendingCompleteIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(reminder.id);
                return newSet;
            });

            setPendingCompletionTimeouts(prev => {
                const newTimeouts = { ...prev };
                delete newTimeouts[reminder.id];
                return newTimeouts;
            });
            return;
        }

        if (reminder.isCompleted) {
            setReminders(prev => prev.map(r => r.id === reminder.id ? { ...r, isCompleted: false } : r));
            return;
        }
        
        if (!reminder.isCompleted && !pendingCompleteIds.has(reminder.id)) {
            setPendingCompleteIds(prev => new Set(prev).add(reminder.id));

            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
            const origin = {
                x: (rect.left + rect.width / 2) / window.innerWidth,
                y: (rect.top + rect.height / 2) / window.innerHeight
            };
            confetti({ particleCount: 50, spread: 60, origin, colors: [reminder.color, '#ffffff', '#a0a0a0'] });

            const timeoutId = setTimeout(() => {
                setReminders(prevReminders => prevReminders.map(r => r.id === reminder.id ? { ...r, isCompleted: true } : r));
                
                setPendingCompleteIds(prevSet => {
                    const newSet = new Set(prevSet);
                    newSet.delete(reminder.id);
                    return newSet;
                });
                
                setPendingCompletionTimeouts(prevTimeouts => {
                    const newTimeouts = { ...prevTimeouts };
                    delete newTimeouts[reminder.id];
                    return newTimeouts;
                });
            }, 3000);

            setPendingCompletionTimeouts(prev => ({ ...prev, [reminder.id]: timeoutId }));
        }
    };

    const renderReminder = (reminder: Reminder) => {
        const isPending = pendingCompleteIds.has(reminder.id);
        const isDone = reminder.isCompleted;

        return (
            <div key={reminder.id} className="bg-primary p-3 rounded-lg border-l-4 flex justify-between items-center cursor-pointer hover:bg-border-color/50 transition-all duration-200" style={{ borderLeftColor: reminder.color }} onClick={() => onItemClick(reminder)}>
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <button onClick={(e) => handleToggleComplete(e, reminder)} className="p-0 border-0 bg-transparent flex-shrink-0 group/checkbox">
                        <div className={`w-5 h-5 rounded border-2 ${(isDone || isPending) ? 'bg-accent border-accent' : 'border-border-color group-hover/checkbox:border-accent'} flex items-center justify-center transition-all duration-200`}>
                            {(isDone || isPending) && <Icon name="check" className="w-3 h-3 text-white" />}
                        </div>
                    </button>
                    <div className="flex-1 min-w-0">
                        <p className={`font-semibold text-text-primary truncate transition-colors duration-300 ${(isDone || isPending) ? 'line-through text-text-secondary' : ''}`}>{reminder.title}</p>
                        <p className="text-sm text-accent">{new Date(reminder.datetime).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}</p>
                        {reminder.description && <p className="text-sm text-text-secondary truncate mt-1">{reminder.description}</p>}
                    </div>
                </div>
            </div>
        );
    }
    
    const { overdue, today, upcoming, completed } = useMemo(() => {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        
        const todayEnd = new Date(todayStart);
        todayEnd.setDate(todayStart.getDate() + 1);
        
        const uncompleted = reminders.filter(r => !r.isCompleted);
        
        const overdue = uncompleted.filter(r => new Date(r.datetime) < todayStart).sort((a,b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());
        const today = uncompleted.filter(r => {
            const d = new Date(r.datetime);
            return d >= todayStart && d < todayEnd;
        }).sort((a,b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());
        const upcoming = uncompleted.filter(r => new Date(r.datetime) >= todayEnd).sort((a,b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());
        const completedReminders = reminders.filter(r => r.isCompleted).sort((a,b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime());

        return { overdue, today, upcoming, completed: completedReminders };
    }, [reminders]);


    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <button onClick={() => onNewItemRequest('reminder', new Date())} className="flex items-center px-4 py-2 text-sm rounded-md bg-accent text-white hover:bg-accent-hover">
                    <Icon name="bell" className="h-4 w-4 mr-2" /> {t('dashboard.newReminder')}
                </button>
            </div>

            {reminders.length === 0 && <p className="text-center text-text-secondary py-8">{t('dashboard.reminders.empty')}</p>}

            <ReminderGroup title={t('dashboard.overdue')} reminders={overdue} titleColor="text-red-500">
                <div className="space-y-2">{overdue.map(renderReminder)}</div>
            </ReminderGroup>
            
            <ReminderGroup title={t('dashboard.today')} reminders={today}>
                 <div className="space-y-2">{today.map(renderReminder)}</div>
            </ReminderGroup>

            <ReminderGroup title={t('dashboard.upcoming')} reminders={upcoming}>
                <ItemGroupedByDate items={upcoming} renderItem={renderReminder} itemType="reminder" locale={locale}/>
            </ReminderGroup>
            
            {completed.length > 0 && (
                 <div>
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-bold text-lg text-text-secondary">{t('dashboard.completed')}</h3>
                         <button onClick={() => setShowCompleted(p => !p)} className="p-2 rounded-full text-text-secondary hover:bg-border-color">
                            <Icon name="chevron" className={`w-5 h-5 transition-transform ${showCompleted ? 'rotate-180' : ''}`} />
                        </button>
                    </div>
                    {showCompleted && (
                        <ItemGroupedByDate items={completed} renderItem={renderReminder} itemType="reminder" locale={locale} />
                    )}
                </div>
            )}
        </div>
    )
}

export const ReminderDisplay = ({ reminder, onBack, onDelete, allNotes, onOpenNote, onEdit, setReminders, language }: { reminder: Reminder, onBack: () => void, onDelete: (type: string, id: string, name: string) => void, allNotes: Note[], onOpenNote: (noteId: string) => void, onEdit: (reminder: Reminder) => void, setReminders: React.Dispatch<React.SetStateAction<Reminder[]>>, language: 'en' | 'ru' }) => {
    const locale = getLocale(language);
    const handleDelete = () => {
        onDelete('reminder', reminder.id, reminder.title);
        onBack();
    }
    
    const toggleComplete = (e: React.MouseEvent) => {
        e.stopPropagation();
        setReminders(prev => 
            prev.map(r => 
                r.id === reminder.id ? { ...r, isCompleted: !reminder.isCompleted } : r
            )
        );
    }

    const attachedNote = useMemo(() => reminder.noteId ? allNotes.find(n => n.id === reminder.noteId) : null, [reminder.noteId, allNotes]);

    return (
        <div className="flex flex-col h-full">
            <div className="flex justify-between items-center p-4 border-b border-border-color flex-shrink-0">
                <button onClick={onBack} className="flex items-center gap-2 p-2 rounded-full hover:bg-border-color">
                    <Icon name="back" className="h-6 w-6 text-text-secondary" />
                    <span className="font-bold desktop-only">{t('dashboard.reminders')}</span>
                </button>
                 <div className="flex items-center space-x-2">
                    <button onClick={() => onEdit(reminder)} className="p-2 rounded-full hover:bg-border-color text-text-secondary hover:text-accent" title={t('common.edit')}>
                        <Icon name="edit" className="h-5 w-5" />
                    </button>
                    <button onClick={handleDelete} className="p-2 rounded-full hover:bg-border-color text-text-secondary hover:text-red-500" title={t('common.delete')}>
                        <Icon name="delete" className="h-5 w-5" />
                    </button>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                <div className="flex items-start space-x-4">
                    <button onClick={toggleComplete} className="p-0 border-0 bg-transparent flex-shrink-0 mt-1">
                        <div className={`w-6 h-6 rounded-md border-2 ${reminder.isCompleted ? 'bg-accent border-accent' : 'border-border-color'} flex items-center justify-center`}>
                            {reminder.isCompleted && <Icon name="check" className="w-4 h-4 text-white" />}
                        </div>
                    </button>
                    <h2 className={`text-2xl font-bold flex-1 ${reminder.isCompleted ? 'line-through text-text-secondary' : ''}`}>{reminder.title}</h2>
                </div>
                
                <div className="pl-10 space-y-4">
                    <div className="flex items-center text-text-secondary">
                        <Icon name="bell" className="h-5 w-5 mr-3 text-accent" />
                        <span>{new Date(reminder.datetime).toLocaleString(locale)}</span>
                    </div>

                    {reminder.description && (
                        <p className="text-text-primary whitespace-pre-wrap">{reminder.description}</p>
                    )}

                    {attachedNote && <AttachedNotePreview note={attachedNote} onOpenNote={onOpenNote} />}
                </div>
            </div>
        </div>
    )
}