
import React, { useMemo, useRef } from 'react';
import { Note, Reminder, Event } from '../../types';
import Icon from '../Icon';
import { t } from '../../localization';

export const ColorPicker = ({ selectedColor, onSelectColor }: { selectedColor: string, onSelectColor: (color: string) => void }) => {
    const colors = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#3b82f6'];
    const colorInputRef = useRef<HTMLInputElement>(null);

    return (
        <div className="flex items-center gap-3">
            <span className="text-sm text-text-secondary">{t('dashboard.itemEditor.color')}:</span>
            {colors.map(color => (
                <button
                    key={color}
                    type="button"
                    onClick={() => onSelectColor(color)}
                    className={`w-6 h-6 rounded-full transition-transform transform hover:scale-110 ${selectedColor === color ? 'ring-2 ring-offset-2 ring-offset-primary ring-white' : ''}`}
                    style={{ backgroundColor: color }}
                    aria-label={`Select color ${color}`}
                />
            ))}
            <div className="relative w-6 h-6">
                <button
                    type="button"
                    onClick={() => colorInputRef.current?.click()}
                    className="w-6 h-6 rounded-full bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 flex items-center justify-center"
                    aria-label="Choose custom color"
                >
                    <Icon name="palette" className="h-4 w-4 text-white" />
                </button>
                <input
                    ref={colorInputRef}
                    type="color"
                    onChange={(e) => onSelectColor(e.target.value)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
            </div>
        </div>
    )
}

export const AttachedNotePreview = ({ note, onOpenNote }: { note: Note, onOpenNote: (noteId: string) => void}) => {
    const snippet = useMemo(() => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = note.content || '';
        return tempDiv.textContent?.substring(0, 100) + '...' || '';
    }, [note.content]);

    return (
        <div onClick={() => onOpenNote(note.id)} className="bg-primary p-3 rounded-lg border border-border-color cursor-pointer hover:border-accent transition-colors">
             <p className="text-sm text-text-secondary mb-2">{t('dashboard.note.attached')}</p>
             <h4 className="font-semibold text-accent mb-1 break-words">{note.title}</h4>
             <p className="text-sm text-text-secondary break-words">{snippet}</p>
        </div>
    )
}

export const TabButton = ({ name, icon, isActive, onClick }: { name: string, icon: string, isActive: boolean, onClick: () => void }) => (
    <button onClick={onClick} className={`flex-1 sm:flex-none flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 rounded-md text-sm font-semibold transition-colors ${isActive ? 'bg-accent text-white' : 'text-text-secondary hover:bg-border-color'}`}>
        <Icon name={icon} className="h-4 w-4" />
        <span className="truncate">{name}</span>
    </button>
);

export const ReminderGroup = ({ title, reminders, children, titleColor = 'text-accent' }: { title: string, reminders: Reminder[], children: React.ReactNode, titleColor?: string }) => {
    if (reminders.length === 0) return null;
    return (
        <div>
            <h3 className={`font-bold text-lg mb-2 ${titleColor}`}>{title}</h3>
            {children}
        </div>
    );
};

export const ItemGroupedByDate = <T extends Reminder | Event>({ items, renderItem, itemType, locale }: { items: T[], renderItem: (item: T) => React.ReactNode, itemType: 'reminder' | 'event', locale: string }) => {
    const grouped = useMemo(() => {
        return items.reduce((acc, item) => {
            const dateStr = new Date(itemType === 'reminder' ? (item as Reminder).datetime : (item as Event).start).toDateString();
            if (!acc[dateStr]) acc[dateStr] = [];
            acc[dateStr].push(item);
            return acc;
        }, {} as Record<string, T[]>);
    }, [items, itemType]);

    const sortedDates = Object.keys(grouped).sort((a,b) => new Date(a).getTime() - new Date(b).getTime());

    return (
        <div className="space-y-4">
            {sortedDates.map(date => (
                <div key={date}>
                    <h4 className="font-semibold text-text-secondary mb-2">{new Date(date).toLocaleDateString(locale, { weekday: 'long', month: 'long', day: 'numeric' })}</h4>
                    <div className="space-y-2">
                        {grouped[date].map(item => renderItem(item))}
                    </div>
                </div>
            ))}
        </div>
    );
}
