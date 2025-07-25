
import React from 'react';
import { Event, Reminder, Note } from '../../types';
import Icon from '../Icon';
import { getLocale, t } from '../../localization';

export const DailyAgendaView = ({ date, dailyEvents, dailyReminders, onClearFilter, onItemClick, setReminders, onNewItemRequest, language }: { date: Date, dailyEvents: Event[], dailyReminders: Reminder[], onClearFilter: () => void, onItemClick: (item: Event | Reminder) => void, setReminders: React.Dispatch<React.SetStateAction<Reminder[]>>, allNotes: Note[], onNewItemRequest: (type: 'event' | 'reminder', date: Date) => void, language: 'en' | 'ru' }) => {
    const locale = getLocale(language);
    const handleToggleComplete = (e: React.MouseEvent, reminderId: string) => {
        e.stopPropagation();
        setReminders(prev => prev.map(r => r.id === reminderId ? { ...r, isCompleted: !r.isCompleted } : r));
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4 p-1">
                <button onClick={onClearFilter} className="p-2 rounded-full hover:bg-border-color" title={t('common.close')}>
                    <Icon name="close" className="h-6 w-6 text-text-secondary" />
                </button>
                <div className="flex-1">
                     <p className="text-lg font-bold text-text-primary">{date.toLocaleDateString(locale, { weekday: 'long' })}</p>
                     <p className="text-sm text-text-secondary">{date.toLocaleDateString(locale, { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                </div>
            </div>
            
            <div className="flex justify-end gap-2">
                <button onClick={() => onNewItemRequest('reminder', date)} className="flex items-center px-3 py-1 text-sm rounded-md bg-secondary text-text-primary hover:bg-border-color">
                    <Icon name="bell" className="h-4 w-4 mr-2" /> {t('dashboard.newReminder')}
                </button>
                <button onClick={() => onNewItemRequest('event', date)} className="flex items-center px-3 py-1 text-sm rounded-md bg-secondary text-text-primary hover:bg-border-color">
                    <Icon name="calendar" className="h-4 w-4 mr-2" /> {t('dashboard.newEvent')}
                </button>
            </div>
            
            {dailyEvents.length > 0 && (
                <div className="space-y-2">
                    <h3 className="font-bold text-lg text-text-primary mt-4">{t('dashboard.events')}</h3>
                    {dailyEvents.sort((a,b) => new Date(a.start).getTime() - new Date(b.start).getTime()).map(item => (
                        <div key={item.id} className="bg-primary p-3 rounded-lg border-l-4 flex items-start gap-4 cursor-pointer hover:bg-border-color/50" style={{ borderLeftColor: item.color }} onClick={() => onItemClick(item)}>
                            <div className="text-right text-sm flex-shrink-0 w-16">
                                <p className="font-semibold text-text-primary">{new Date(item.start).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}</p>
                                <p className="text-text-secondary text-xs">to {new Date(item.end).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                            <div className="flex-1 min-w-0">
                                 <p className="font-semibold text-text-primary break-words">{item.title}</p>
                                 {item.description && <p className="text-sm text-text-secondary truncate">{item.description}</p>}
                            </div>
                            <Icon name="calendar" className="h-5 w-5 text-text-secondary flex-shrink-0 mt-1" />
                        </div>
                    ))}
                </div>
            )}
            
            {dailyReminders.length > 0 && (
                 <div className="space-y-2">
                    <h3 className="font-bold text-lg text-text-primary mt-4">{t('dashboard.reminders')}</h3>
                    {dailyReminders.sort((a,b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime()).map(item => (
                         <div key={item.id} className="bg-primary p-3 rounded-lg border-l-4 flex items-start gap-4 cursor-pointer hover:bg-border-color/50" style={{ borderLeftColor: item.color }} onClick={() => onItemClick(item)}>
                            <div className="flex-shrink-0 pt-1">
                                <button onClick={(e) => handleToggleComplete(e, item.id)} className="p-0 border-0 bg-transparent flex-shrink-0">
                                    <div className={`w-5 h-5 rounded border-2 ${item.isCompleted ? 'bg-accent border-accent' : 'border-border-color'} flex items-center justify-center`}>
                                        {item.isCompleted && <Icon name="check" className="w-3 h-3 text-white" />}
                                    </div>
                                </button>
                            </div>
                            <div className="text-right text-sm flex-shrink-0 w-16">
                                <p className="font-semibold text-text-primary">{new Date(item.datetime).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                            <div className="flex-1 min-w-0">
                                 <p className={`font-semibold text-text-primary break-words ${item.isCompleted ? 'line-through text-text-secondary' : ''}`}>{item.title}</p>
                                 {item.description && <p className="text-sm text-text-secondary truncate">{item.description}</p>}
                            </div>
                            <Icon name="bell" className="h-5 w-5 text-text-secondary flex-shrink-0 mt-1" />
                        </div>
                    ))}
                </div>
            )}

            {dailyEvents.length === 0 && dailyReminders.length === 0 && (
                 <p className="text-center text-text-secondary py-8">{t('dashboard.daily.noItems')}</p>
            )}
        </div>
    );
}
