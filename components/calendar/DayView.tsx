


import React, { useMemo } from 'react';
import { Event, Reminder } from '../../types';
import Icon from '../Icon';

const getContrastColor = (hex: string): string => {
    if (!hex || hex.length < 7) return '#ffffff';
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 150) ? '#1a1a1a' : '#ffffff';
};

const DayView: React.FC<{ currentDate: Date, events: Event[], reminders: Reminder[], onItemClick: (item: Event | Reminder) => void, locale: string }> = ({ currentDate, events, reminders, onItemClick, locale }) => {
    
    const HOUR_HEIGHT_PX = 120;
    const MINUTE_HEIGHT_PX = HOUR_HEIGHT_PX / 60;

    const itemsForDay = useMemo(() => {
        const dayStart = new Date(currentDate);
        dayStart.setHours(0,0,0,0);
        const dayEnd = new Date(currentDate);
        dayEnd.setHours(23,59,59,999);

        const todaysEvents = events.filter(e => new Date(e.end) >= dayStart && new Date(e.start) <= dayEnd);
        const todaysReminders = reminders.filter(r => {
            const rDate = new Date(r.datetime);
            return rDate >= dayStart && rDate <= dayEnd;
        });
        
        return [...todaysEvents, ...todaysReminders];
    }, [currentDate, events, reminders]);

    const layoutItems = useMemo(() => {
        const sortedItems = itemsForDay.map(item => {
            const isEvent = 'start' in item;
            const start = new Date(isEvent ? item.start : item.datetime);
            const end = new Date(isEvent ? item.end : item.datetime);
            if (!isEvent) end.setMinutes(end.getMinutes() + 30); // Give reminders a 30min block
            return { item, start, end };
        }).sort((a, b) => a.start.getTime() - b.start.getTime());

        const columns: { item: any, start: Date, end: Date }[][] = [];
        
        for (const item of sortedItems) {
            let placed = false;
            for (const col of columns) {
                const lastInCol = col[col.length - 1];
                if (item.start.getTime() >= lastInCol.end.getTime()) {
                    col.push(item);
                    placed = true;
                    break;
                }
            }
            if (!placed) {
                columns.push([item]);
            }
        }

        return columns.flatMap((col, colIndex) => col.map(item => ({...item, colIndex, totalCols: columns.length})));

    }, [itemsForDay]);

    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
        <div className="h-full overflow-y-auto border-t border-border-color scrollbar-hide">
            <div className="relative">
                {hours.map(hour => (
                    <div key={hour} className="flex border-b border-border-color" style={{height: `${HOUR_HEIGHT_PX}px`}}>
                        <div className="w-20 text-center text-sm text-text-secondary pt-1 border-r border-border-color flex-shrink-0">
                            {new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), hour).toLocaleTimeString(locale, { hour: 'numeric', hour12: true})}
                        </div>
                        <div className="flex-1"></div>
                    </div>
                ))}
                <div className="absolute top-0 bottom-0 right-0" style={{left: '5rem'}}>
                    {layoutItems.map(({item, start, end, colIndex, totalCols}) => {
                        const dayStart = new Date(currentDate);
                        dayStart.setHours(0,0,0,0);
                        
                        const effectiveStart = start < dayStart ? dayStart : start;
                        
                        const startMinutesIntoDay = effectiveStart.getHours() * 60 + effectiveStart.getMinutes();
                        
                        const dayEnd = new Date(dayStart);
                        dayEnd.setHours(23, 59, 59, 999);
                        const effectiveEnd = end > dayEnd ? dayEnd : end;

                        const endMinutesIntoDay = effectiveEnd.getHours() * 60 + effectiveEnd.getMinutes();
                        const durationMinutes = Math.max(1, endMinutesIntoDay - startMinutesIntoDay);

                        const top = startMinutesIntoDay * MINUTE_HEIGHT_PX;
                        const height = durationMinutes * MINUTE_HEIGHT_PX;

                        const width = `calc(${100 / totalCols}% - 4px)`;
                        const left = `calc(${colIndex * (100 / totalCols)}% + 2px)`;

                        const isCompleted = !('start' in item) && (item as Reminder).isCompleted;
                        const isOverdue = !('start' in item) && !isCompleted && new Date(item.datetime) < new Date();
                        const textColor = getContrastColor(item.color);

                        const isShort = durationMinutes < 30;
                        const isVeryShort = durationMinutes < 15;
                        
                        let itemClasses = `absolute rounded-lg cursor-pointer overflow-hidden flex transition-all duration-200 ease-in-out`;
                        if (isShort) {
                            itemClasses += ` p-1 items-center ${isVeryShort ? 'gap-1' : 'gap-2'}`;
                        } else {
                            itemClasses += ' p-2 flex-col';
                        }
                        if (isCompleted) {
                            itemClasses += ' line-through opacity-70';
                        }

                        return (
                            <div
                                key={item.id}
                                className={itemClasses}
                                style={{ backgroundColor: item.color, color: textColor, top: `${top}px`, height: `${height}px`, left, width }}
                                onClick={() => onItemClick(item)}
                            >
                                <p className={`font-bold ${isShort ? 'truncate' : ''} ${isVeryShort ? 'text-xs' : 'text-sm'}`}>{item.title}</p>
                                <div className={`flex items-center gap-1 ${isOverdue ? 'font-bold' : ''} ${isVeryShort ? 'text-xs' : 'text-sm'}`}>
                                    <span style={{color: isOverdue ? 'red': textColor}}>{start.toLocaleTimeString(locale, { hour: 'numeric', minute: '2-digit' })}</span>
                                    {'start' in item && <span>- {end.toLocaleTimeString(locale, { hour: 'numeric', minute: '2-digit' })}</span>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default DayView;