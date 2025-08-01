


import React, { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import { Note, Reminder, Event, FolderCustomization, ItemToEdit, AppSettings } from '../types';
import NoteDisplay from './sidepanel/NoteDisplay';
import { EventDisplay } from './sidepanel/EventComponents';
import { ReminderDisplay } from './sidepanel/ReminderComponents';
import ListView from './sidepanel/ListView';
import ItemEditor from './sidepanel/ItemEditor';
import useWindowDimensions from '../hooks/useWindowDimensions';


export interface SidePanelProps {
    isOpen: boolean;
    isMobile: boolean;
    onClose: () => void;
    notes: Note[];
    reminders: Reminder[];
    setReminders: React.Dispatch<React.SetStateAction<Reminder[]>>;
    events: Event[];
    setEvents: React.Dispatch<React.SetStateAction<Event[]>>;
    folderCustomization: Record<string, FolderCustomization>;
    setFolderCustomization: React.Dispatch<React.SetStateAction<Record<string, FolderCustomization>>>;
    settings: AppSettings;
    setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
    
    // View state props
    activeNoteId: string | 'new' | null;
    setActiveNoteId: (id: string | 'new' | null) => void;
    activeFolder: string | null;
    setActiveFolder: (folder: string | null) => void;
    activeItemId: string | null;
    setActiveItemId: (id: string | null) => void;
    editingItem: ItemToEdit | null;
    setEditingItem: (item: ItemToEdit | null) => void;

    startEditing: boolean;
    onNewNote: () => void;
    onCreateNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
    onUpdateNote: (note: Note) => void;
    onDeleteNote: (noteId: string) => void;
    onRequestDeleteItem: (type: string, id: string, name: string) => void;
    onRenameFolder: (oldName: string, newName: string) => void;
    
    panelWasOpenBeforeFilter: boolean;
    dateFilter: Date | null;
    setDateFilter: (date: Date | null) => void;
    
    onOpenNote: (noteId: string) => void;
    onEditItem: (item: Event | Reminder) => void;
    onNewItemRequest: (type: 'event' | 'reminder', date: Date) => void;

    setHighlightedRange: (range: {start: string, end: string} | null) => void;
}

const SidePanel: React.FC<SidePanelProps> = (props) => {
    const { 
        isOpen, isMobile, activeNoteId, activeItemId, editingItem, setEditingItem,
        notes, events, reminders, setEvents, setReminders,
        onClose, onCreateNote, onUpdateNote, onDeleteNote, setHighlightedRange,
        setActiveNoteId, setActiveItemId, dateFilter, setDateFilter, panelWasOpenBeforeFilter,
        settings, setSettings, onRequestDeleteItem, activeFolder, setActiveFolder
    } = props;
    
    const { height: windowHeight } = useWindowDimensions();
    const isBottomSheet = isMobile && editingItem?.mode === 'sheet';
    
    const [shouldRender, setShouldRender] = useState(isOpen);
    const [isAnimatingOutFromSheet, setIsAnimatingOutFromSheet] = useState(false);


    useEffect(() => {
        if (isOpen) {
            setShouldRender(true);
            // When opening, always reset the 'closing from sheet' flag to allow normal animations.
            setIsAnimatingOutFromSheet(false);
        } else {
            // After isOpen is set to false, wait for animation to finish before un-rendering.
            const timer = setTimeout(() => setShouldRender(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    // State for the bottom sheet's position and interaction
    const [sheetY, setSheetY] = useState(windowHeight);
    const [isSnapping, setIsSnapping] = useState(false);
    const sheetYRef = useRef(sheetY);
    useEffect(() => { sheetYRef.current = sheetY }, [sheetY]);

    // Define snap points for the sheet
    const expandedY = windowHeight * 0.05; // 5% from top
    const collapsedHeight = 270; // The visible height of the sheet when collapsed
    const collapsedY = windowHeight - collapsedHeight;
    const closedY = windowHeight;
    
    // Derived state to determine if the sheet is in its expanded mode.
    const isSheetExpanded = isBottomSheet && sheetY < collapsedY - 20;


    // Effect to open/close the sheet with animation
    useEffect(() => {
        if (isOpen && isBottomSheet) {
            // Start from the fully closed position to ensure animation runs every time
            setSheetY(closedY);
            const frameId = requestAnimationFrame(() => {
                setIsSnapping(true);
                setSheetY(collapsedY); // Animate to the collapsed (visible) state
            });
            return () => cancelAnimationFrame(frameId);
        } else if (!isOpen) {
            // Instantly reset position when the panel is fully closed, preparing for next open
            setIsSnapping(false);
            setSheetY(closedY);
        }
    }, [isOpen, isBottomSheet, collapsedY, closedY]);
    
    const handleSheetClose = useCallback(() => {
        // This function is only for the mobile bottom sheet.
        // It sets a flag to prevent the panel's slide-out animation from playing,
        // then starts the sheet's slide-down animation.
        setIsAnimatingOutFromSheet(true);
        setSheetY(closedY);
        const timer = setTimeout(() => {
            onClose(); // This will trigger the parent to set isOpen=false
        }, 300); // Must match animation duration
        return () => clearTimeout(timer);
    }, [closedY, onClose]);


    const handleDragMove = useCallback((deltaY: number) => {
        setIsSnapping(false); // Disable transitions while dragging
        setSheetY(prevY => Math.max(expandedY, prevY + deltaY)); // Clamp at the top
    }, [expandedY]);
    
    const handleDragEnd = useCallback((velocityY: number) => {
        setIsSnapping(true);
        const flickThreshold = 0.5; // pixels/ms
        const currentY = sheetYRef.current;

        const snapTo = (targetY: number) => {
            setSheetY(targetY);
            if (targetY >= closedY) {
                // Wait for animation to finish before calling onClose
                setTimeout(handleSheetClose, 0);
            }
        };

        if (velocityY < -flickThreshold) { // Strong flick up -> expand
            snapTo(expandedY);
        } else if (velocityY > flickThreshold) { // Strong flick down -> collapse or close
            snapTo(currentY < collapsedY + collapsedY / 2 ? collapsedY : closedY);
        } else { // Positional snapping for slow drags
            if (currentY < (expandedY + collapsedY) / 2) {
                snapTo(expandedY); // Closer to top -> expand
            } else if (currentY < (collapsedY + closedY) / 2) {
                snapTo(collapsedY); // Closer to middle -> collapse
            } else {
                snapTo(closedY); // Closer to bottom -> close
            }
        }
    }, [expandedY, collapsedY, closedY, handleSheetClose]);

    const activeNote = useMemo(() => {
        if (activeNoteId === 'new' || !activeNoteId) return null;
        return notes.find(n => n.id === activeNoteId) || null;
    }, [activeNoteId, notes]);

    const activeItem = useMemo(() => {
        if (!activeItemId) return null;
        return [...events, ...reminders].find(item => item.id === activeItemId) || null;
    }, [activeItemId, events, reminders]);
    
    const allFolders = useMemo(() => {
       const folderSet = new Set(notes.map(n => n.folder));
       return Array.from(folderSet);
    },[notes]);

    const handleItemSave = (itemData: Event | Reminder) => {
        if ('start' in itemData) { // It's an Event
            if (props.events.some(e => e.id === itemData.id)) {
                setEvents(prev => prev.map(e => e.id === itemData.id ? itemData : e));
            } else {
                setEvents(prev => [...prev, itemData]);
            }
        } else { // It's a Reminder
            if (props.reminders.some(r => r.id === itemData.id)) {
                 setReminders(prev => prev.map(r => r.id === itemData.id ? itemData : r));
            } else {
                setReminders(prev => [...prev, itemData]);
            }
        }

        // On mobile, if creating via bottom sheet, just close it after saving.
        if (isMobile && editingItem?.mode === 'sheet') {
            handleSheetClose();
            return;
        }

        // Desktop behavior: After saving, transition to the item's display view
        setEditingItem(null);
        setHighlightedRange(null);
        setActiveNoteId(null);
        setActiveFolder(null);
        setActiveItemId(itemData.id);
    }
    
    const handleItemDelete = (itemToDelete: Event | Reminder) => {
         const type = 'start' in itemToDelete ? 'event' : 'reminder';
         onRequestDeleteItem(type, itemToDelete.id, itemToDelete.title);
    }

    const handleEditorClose = () => {
        setHighlightedRange(null);
        setEditingItem(null); // Also clear editing item state
        if (isBottomSheet) {
             handleSheetClose();
        } else {
            // If we are closing the editor, go back, don't close the whole panel
            // unless it's the only thing open.
            handleInternalBack();
        }
    }
    
    const handleInternalBack = useCallback(() => {
        // Case 1: If an editor is open, go back to the view that opened it.
        if (editingItem) {
            // On mobile, if it's the bottom sheet, "back" should just close the whole thing.
            if (isMobile && editingItem.mode === 'sheet') {
                handleSheetClose();
                return;
            }
            setEditingItem(null);
            setHighlightedRange(null);
            return;
        }

        // Case 2: If a specific note or item is being displayed, go back to the list view.
        if (activeNoteId || activeItemId) {
            setActiveNoteId(null);
            setActiveItemId(null);
            return;
        }

        // Case 3: If viewing notes inside a folder
        if (activeFolder) {
            setActiveFolder(null);
            return;
        }

        // Case 4: If a daily agenda is being viewed (from a date filter).
        if (dateFilter) {
            // On mobile, "back" from the date filter should always close the panel.
            if (isMobile) {
                onClose();
                return;
            }
            // On desktop, it depends on how the panel was opened.
            if (panelWasOpenBeforeFilter) {
                setDateFilter(null);
            } else {
                onClose();
            }
            return;
        }

        // Default Case: We are at the root view (ListView), so "back" closes the panel.
        onClose();
    }, [
        editingItem, activeNoteId, activeItemId, dateFilter, panelWasOpenBeforeFilter,
        activeFolder, setActiveFolder, setEditingItem, setActiveNoteId, setActiveItemId, 
        setHighlightedRange, onClose, setDateFilter, isMobile, handleSheetClose
    ]);


    const renderContent = () => {
        if (editingItem) {
            return (
                <ItemEditor
                    key={typeof editingItem.item === 'object' ? editingItem.item.id : 'new'}
                    isMobile={isMobile}
                    itemToEdit={editingItem}
                    onSave={handleItemSave}
                    onDelete={handleItemDelete}
                    onClose={handleEditorClose} // Use the custom close handler
                    onBack={handleInternalBack}
                    allNotes={notes}
                    setHighlightedRange={setHighlightedRange}
                    onDragMove={handleDragMove}
                    onDragEnd={handleDragEnd}
                    isSheetExpanded={isSheetExpanded}
                />
            );
        }
        
        if (activeNoteId) {
             const note = activeNoteId === 'new' ? {
                id: 'new',
                title: '',
                content: '',
                folder: activeFolder || 'Uncategorized',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            } : activeNote;

            return (
                 <NoteDisplay 
                    key={note?.id}
                    note={note}
                    onBack={handleInternalBack}
                    startInEditMode={props.startEditing}
                    onCreate={onCreateNote}
                    onUpdate={onUpdateNote}
                    onDelete={onDeleteNote}
                    allFolders={allFolders}
                    settings={settings}
                    setSettings={setSettings}
                />
            )
        }
        
        if (activeItem) {
            return 'datetime' in activeItem ? (
                <ReminderDisplay 
                    reminder={activeItem as Reminder}
                    onBack={handleInternalBack}
                    onDelete={onRequestDeleteItem}
                    allNotes={props.notes}
                    onOpenNote={props.onOpenNote}
                    onEdit={props.onEditItem}
                    setReminders={setReminders}
                    language={settings.language.appLanguage}
                />
            ) : (
                <EventDisplay
                    event={activeItem as Event}
                    onBack={handleInternalBack}
                    onDelete={onRequestDeleteItem}
                    allNotes={props.notes}
                    onOpenNote={props.onOpenNote}
                    onEdit={props.onEditItem}
                    setHighlightedRange={setHighlightedRange}
                    language={settings.language.appLanguage}
                />
            )
        }

        return <ListView {...props} onBack={handleInternalBack} />;
    }
    
    
    if (!shouldRender) {
        return null;
    }
    
    let asideClasses = 'bg-secondary/90 backdrop-blur-sm shadow-2xl flex-shrink-0 flex flex-col';
    let asideStyle: React.CSSProperties = { };

    if (isMobile) {
        if (isBottomSheet) {
            asideClasses += ' fixed inset-x-0 top-0 h-full z-[55] rounded-t-2xl overflow-hidden';
            asideStyle = { 
                transform: `translateY(${sheetY}px)`,
                transition: isSnapping ? 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none'
            };
        } else {
             const animationClass = isOpen ? 'animate-slide-in-right' : (isAnimatingOutFromSheet ? '' : 'animate-slide-out-right');
             asideClasses += ` fixed inset-0 z-[55] duration-300 ease-in-out ${animationClass}`;
        }
    } else {
        asideClasses += ` relative w-[450px] max-w-[450px] border-l border-border-color z-30 duration-300 ease-in-out ${isOpen ? 'animate-slide-in-right' : 'animate-slide-out-right'}`;
    }


    return (
        <aside 
            className={asideClasses}
            style={asideStyle}
        >
           {renderContent()}
        </aside>
    );
};

export default SidePanel;