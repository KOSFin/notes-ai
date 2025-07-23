

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Event, Note, Reminder, ItemToEdit } from '../../types';
import Icon from '../Icon';
import { ColorPicker, AttachedNotePreview } from './common';
import { t } from '../../localization';

const ToggleSwitch = ({ checked, onChange }: { checked: boolean, onChange: (checked: boolean) => void }) => (
    <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${checked ? 'bg-accent' : 'bg-primary'}`}
    >
        <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
);


interface ItemEditorProps {
    isMobile: boolean;
    itemToEdit: ItemToEdit;
    onSave: (item: Event | Reminder) => void;
    onDelete: (item: Event | Reminder) => void;
    onClose: () => void;
    onBack: () => void;
    allNotes: Note[];
    setHighlightedRange: (range: { start: string, end: string } | null) => void;
    onDragMove: (deltaY: number) => void;
    onDragEnd: (velocityY: number) => void;
    isSheetExpanded: boolean;
}

const ItemEditor: React.FC<ItemEditorProps> = ({
    isMobile, itemToEdit, onSave, onDelete, onClose, onBack, allNotes, setHighlightedRange,
    onDragMove, onDragEnd, isSheetExpanded
}) => {
    const prefillData = typeof itemToEdit.item === 'object' ? itemToEdit.item : {};
    const isNew = !prefillData.id;
    
    const [title, setTitle] = useState(prefillData.title || '');
    const [description, setDescription] = useState(prefillData.description || '');
    const [noteId, setNoteId] = useState(prefillData.noteId || '');
    const [color, setColor] = useState(prefillData.color || (itemToEdit.type === 'event' ? '#10b981' : '#4f46e5'));
    
    // Event specific
    const [start, setStart] = useState('start' in prefillData && prefillData.start ? toLocalISOString(new Date(prefillData.start)) : toLocalISOString(new Date()));
    const [end, setEnd] = useState('end' in prefillData && prefillData.end ? toLocalISOString(new Date(prefillData.end)) : toLocalISOString(new Date(Date.now() + 3600 * 1000)));
    const [isAllDay, setIsAllDay] = useState('isAllDay' in prefillData ? prefillData.isAllDay || false : false);

    // Reminder specific
    const [datetime, setDatetime] = useState('datetime' in prefillData && prefillData.datetime ? toLocalISOString(new Date(prefillData.datetime)) : toLocalISOString(new Date()));

    const [errors, setErrors] = useState<{ title?: string; dates?: string }>({});
    
    // Bottom sheet drag handling
    const dragRef = useRef({ startY: 0, lastY: 0, lastTime: 0, velocityY: 0, isDragging: false });
    const editorContentRef = useRef<HTMLDivElement>(null);
    const sheetHeaderRef = useRef<HTMLDivElement>(null);


    function toLocalISOString(date: Date) {
        const tzoffset = date.getTimezoneOffset() * 60000;
        const localISOTime = (new Date(date.getTime() - tzoffset)).toISOString().slice(0, 16);
        return localISOTime;
    }

    // Effect to sync with parent when a new date range is selected while editor is open
    useEffect(() => {
        if (itemToEdit.type === 'event' && typeof itemToEdit.item === 'object' && 'start' in itemToEdit.item && itemToEdit.item.start) {
             const newStart = toLocalISOString(new Date(itemToEdit.item.start!));
             const newEnd = toLocalISOString(new Date(itemToEdit.item.end!));
             if (newStart !== start) setStart(newStart);
             if (newEnd !== end) setEnd(newEnd);
        }
    }, [itemToEdit.item]);


    useEffect(() => {
        if (itemToEdit.type === 'event') {
            const startDate = new Date(start);
            const endDate = new Date(end);

            // Check if dates are valid before using them.
            // An invalid string to `new Date()` results in a date object where getTime() is NaN.
            if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
                setHighlightedRange({ start: startDate.toISOString(), end: endDate.toISOString() });
            } else {
                // If the user is typing and the date is temporarily invalid, clear the highlight.
                setHighlightedRange(null);
            }
        }
        return () => {
            setHighlightedRange(null);
        };
    }, [start, end, itemToEdit.type, setHighlightedRange]);


    const handleSave = () => {
        const newErrors: { title?: string; dates?: string } = {};

        if (!title.trim()) {
            newErrors.title = t('dashboard.itemEditor.error.title');
        }

        if (itemToEdit.type === 'event') {
            const startDate = new Date(start);
            const endDate = new Date(end);

            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                newErrors.dates = t('dashboard.itemEditor.error.dates.invalid');
            } else if (startDate >= endDate) {
                newErrors.dates = t('dashboard.itemEditor.error.dates.order');
            } else if (!isAllDay && endDate.getTime() - startDate.getTime() < 5 * 60 * 1000) {
                newErrors.dates = t('dashboard.itemEditor.error.dates.duration');
            }
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({}); // Clear errors on successful save

        if (itemToEdit.type === 'event') {
            const eventData: Event = {
                id: 'id' in prefillData ? prefillData.id! : `event_${Date.now()}`,
                createdAt: 'createdAt' in prefillData ? prefillData.createdAt! : new Date().toISOString(),
                title, description, color, noteId, isAllDay,
                start: new Date(start).toISOString(),
                end: new Date(end).toISOString(),
            };
            onSave(eventData);
        } else {
            const reminderData: Reminder = {
                id: 'id' in prefillData ? prefillData.id! : `reminder_${Date.now()}`,
                createdAt: 'createdAt' in prefillData ? prefillData.createdAt! : new Date().toISOString(),
                isCompleted: 'isCompleted' in prefillData ? prefillData.isCompleted! : false,
                title, description, color, noteId,
                datetime: new Date(datetime).toISOString(),
            };
            onSave(reminderData);
        }
    };

    const handleDelete = () => {
        if (!isNew) {
            onDelete(prefillData as Event | Reminder);
        }
    };
    
    const handleTouchStart = (e: React.TouchEvent) => {
        const scrollableContent = editorContentRef.current;
        const sheetTop = sheetHeaderRef.current?.parentElement?.parentElement?.getBoundingClientRect().top || 0;
        
        // Only allow dragging from header if content is not scrolled
        if (scrollableContent && scrollableContent.scrollTop === 0) {
            dragRef.current = {
                startY: e.touches[0].clientY,
                lastY: e.touches[0].clientY,
                lastTime: Date.now(),
                velocityY: 0,
                isDragging: true
            };
        }
    };

    const handleTouchMove = useCallback((e: TouchEvent) => {
        if (!dragRef.current.isDragging) return;
        e.preventDefault();
        
        const currentY = e.touches[0].clientY;
        const deltaY = currentY - dragRef.current.lastY;
        
        const now = Date.now();
        const deltaTime = now - dragRef.current.lastTime;
        
        if (deltaTime > 0) {
            dragRef.current.velocityY = deltaY / deltaTime;
        }

        dragRef.current.lastY = currentY;
        dragRef.current.lastTime = now;
        
        onDragMove(deltaY);
    }, [onDragMove]);

    const handleTouchEnd = useCallback(() => {
        if (!dragRef.current.isDragging) return;
        
        onDragEnd(dragRef.current.velocityY);
        dragRef.current.isDragging = false;
    }, [onDragEnd]);

    const isBottomSheet = isMobile && itemToEdit.mode === 'sheet';
    const showDetails = !isBottomSheet || isSheetExpanded;

    useEffect(() => {
        if (isBottomSheet) {
            // We use the window to capture events even if the finger moves off the header
            window.addEventListener('touchmove', handleTouchMove, { passive: false });
            window.addEventListener('touchend', handleTouchEnd);
            window.addEventListener('touchcancel', handleTouchEnd);
            
            return () => {
                window.removeEventListener('touchmove', handleTouchMove);
                window.removeEventListener('touchend', handleTouchEnd);
                window.removeEventListener('touchcancel', handleTouchEnd);
            };
        }
    }, [isBottomSheet, handleTouchMove, handleTouchEnd]);


    const Header = () => {
        const typeName = t(`common.${itemToEdit.type}` as any);
        const headerTitle = isNew ? t('common.new_entity', { entity: typeName }) : t('common.edit_entity', { entity: typeName });

        return (
            <div className="relative flex justify-between items-center p-2 md:p-4 border-b border-border-color">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-border-color">
                    <Icon name="back" className="h-6 w-6 text-text-secondary" />
                </button>
                <h2 className="text-xl font-bold absolute left-1/2 -translate-x-1/2 whitespace-nowrap">
                    {headerTitle}
                </h2>
                <div className="flex items-center space-x-2">
                     {!isNew && !isMobile && (
                        <button onClick={handleDelete} className="px-4 py-2 rounded-md text-sm text-red-500 hover:bg-red-500/10">{t('common.delete')}</button>
                    )}
                    <button onClick={handleSave} className="px-5 py-2 rounded-md bg-accent text-white hover:bg-accent-hover font-semibold">{t('common.save')}</button>
                </div>
            </div>
        )
    };
    
    const typeName = t(`common.${itemToEdit.type}` as any);

    return (
        <div className="flex flex-col h-full bg-secondary">
             <div 
                ref={sheetHeaderRef}
                className="flex-shrink-0"
                {...(isBottomSheet && { onTouchStart: handleTouchStart })}
            >
                {isBottomSheet && (
                    <div className="py-2.5 cursor-grab active:cursor-grabbing">
                        <div className="w-10 h-1.5 bg-border-color rounded-full mx-auto" />
                    </div>
                )}
                <Header />
            </div>
            
            <div ref={editorContentRef} className="flex-1 overflow-y-auto scrollbar-hide p-4 md:p-6 space-y-6">
                <div>
                    <input
                        placeholder={t('dashboard.itemEditor.title.placeholder', { type: typeName })}
                        value={title}
                        onChange={(e) => {
                            setTitle(e.target.value);
                            if (errors.title) setErrors(prev => ({...prev, title: undefined}));
                        }}
                        className={`w-full bg-transparent text-3xl font-bold border-none focus:outline-none placeholder-text-secondary ${errors.title ? 'placeholder-red-400' : ''}`}
                    />
                    {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                </div>

                {itemToEdit.type === 'event' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between bg-primary p-3 rounded-lg">
                            <span className="text-text-primary font-medium">{t('dashboard.itemEditor.allDay')}</span>
                            <ToggleSwitch checked={isAllDay} onChange={setIsAllDay}/>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-4">
                                <div className="flex-1">
                                    <label className="text-xs text-text-secondary">{t('dashboard.itemEditor.start')}</label>
                                    <input type={isAllDay ? 'date' : 'datetime-local'} value={start.substring(0, isAllDay ? 10 : 16)} onChange={e => {
                                        setStart(e.target.value);
                                        if (errors.dates) setErrors(prev => ({...prev, dates: undefined}));
                                    }} className="w-full bg-primary border border-border-color rounded-md py-2 px-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent" required />
                                </div>
                                <div className="flex-1">
                                    <label className="text-xs text-text-secondary">{t('dashboard.itemEditor.end')}</label>
                                    <input type={isAllDay ? 'date' : 'datetime-local'} value={end.substring(0, isAllDay ? 10 : 16)} onChange={e => {
                                        setEnd(e.target.value);
                                        if (errors.dates) setErrors(prev => ({...prev, dates: undefined}));
                                    }} className="w-full bg-primary border border-border-color rounded-md py-2 px-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent" required />
                                </div>
                            </div>
                            {errors.dates && <p className="text-red-500 text-sm">{errors.dates}</p>}
                        </div>
                    </div>
                )}
                
                {itemToEdit.type === 'reminder' && (
                     <div>
                        <label className="text-xs text-text-secondary">{t('dashboard.itemEditor.datetime')}</label>
                        <input type="datetime-local" value={datetime} onChange={e => setDatetime(e.target.value)} className="w-full bg-primary border border-border-color rounded-md py-2 px-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent" required/>
                    </div>
                )}

                {showDetails ? (
                    <div className='space-y-6 animate-fade-in'>
                        <textarea
                            placeholder={t('dashboard.itemEditor.description.placeholder')}
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            rows={4}
                            className="w-full bg-primary border border-border-color rounded-md py-2 px-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                        />
                        
                        <div>
                             <label className="block text-sm font-medium text-text-secondary mb-2">{t('dashboard.itemEditor.color')}</label>
                            <ColorPicker selectedColor={color} onSelectColor={setColor} />
                        </div>

                        <select value={noteId} onChange={e => setNoteId(e.target.value)} className="w-full bg-primary border border-border-color rounded-md py-2 px-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent">
                            <option value="">{t('dashboard.itemEditor.attachNote')}</option>
                            {allNotes.map(note => <option key={note.id} value={note.id}>{note.title}</option>)}
                        </select>

                        {noteId && allNotes.find(n => n.id === noteId) && (
                            <AttachedNotePreview note={allNotes.find(n => n.id === noteId)!} onOpenNote={() => {}} />
                        )}
                        
                         {!isNew && isMobile && (
                            <button onClick={handleDelete} className="w-full px-4 py-2 rounded-md text-red-500 border border-red-500/50 hover:bg-red-500/10">
                                {t('dashboard.itemEditor.delete_entity', { type: typeName })}
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="text-center text-text-secondary text-sm pt-4">
                        {t('dashboard.itemEditor.sheet.prompt')}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ItemEditor;