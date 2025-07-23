
import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Event, Reminder, AppSettings } from '../../types';
import Icon from '../Icon';
import { getLocale, t } from '../../localization';

const getContrastColor = (hex: string): string => {
    if (!hex || hex.length < 7) return '#ffffff';
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 150) ? '#1a1a1a' : '#ffffff';
};

const isFirstDay = (item: Event | Reminder, day: Date) => {
    const itemDate = 'start' in item ? item.start : item.datetime;
    return new Date(itemDate).toDateString() === day.toDateString();
}

const getWeekNumber = (d: Date): number => {
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return weekNo;
};


interface MonthViewProps {
    currentDate: Date;
    events: Event[];
    reminders: Reminder[];
    onDayClick: (date: Date) => void;
    onItemClick: (item: Event | Reminder) => void;
    onDateRangeSelect: (start: Date, end: Date) => void;
    onDayContextMenu: (date: Date, position: { x: number, y: number }) => void;
    dateFilter: Date | null;
    highlightedRange: {start: string, end: string} | null;
    settings: AppSettings['calendar'];
    language: 'en' | 'ru';
}

const MonthView: React.FC<MonthViewProps> = ({ currentDate, events, reminders, onDayClick, onItemClick, onDateRangeSelect, onDayContextMenu, dateFilter, highlightedRange, settings, language }) => {
    const { showWeekNumbers, startOfWeek, highlightWeekends, weekendDays } = settings;
    const locale = getLocale(language);
    
    const weekdays = useMemo(() => {
        const days = [];
        for (let i = 0; i < 7; i++) {
            const dayIndex = (startOfWeek + i) % 7;
            // 2017-01-01 is a Sunday (index 0)
            const date = new Date(2017, 0, 1 + dayIndex);
            days.push(new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(date));
        }
        return days;
    }, [startOfWeek, locale]);

    const gridRef = useRef<HTMLDivElement>(null);
    const [selectionStart, setSelectionStart] = useState<Date | null>(null);
    const [selectionEnd, setSelectionEnd] = useState<Date | null>(null);
    const mouseDownRef = useRef<{ date: Date, event: React.MouseEvent } | null>(null);

    const daysInGrid = useMemo(() => {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const firstDayOfMonth = (date.getDay() - startOfWeek + 7) % 7;
        
        const gridStartDate = new Date(date);
        gridStartDate.setDate(date.getDate() - firstDayOfMonth);

        const days = [];
        for (let i = 0; i < 42; i++) {
            days.push(new Date(gridStartDate));
            gridStartDate.setDate(gridStartDate.getDate() + 1);
        }
        return days;
    }, [currentDate, startOfWeek]);

    const handleMouseDown = (day: Date, e: React.MouseEvent) => {
        setSelectionStart(day);
        setSelectionEnd(day);
        mouseDownRef.current = { date: day, event: e };
    };

    const handleMouseMove = useCallback((day: Date) => {
        if (selectionStart && mouseDownRef.current) { // Only drag with mouse if mouse started it
            setSelectionEnd(day);
        }
    }, [selectionStart]);

    const handleTouchStart = (day: Date, e: React.TouchEvent) => {
        if (e.touches.length === 1) { // single touch only
            mouseDownRef.current = null; // Ensure mouse logic doesn't run
            setSelectionStart(day);
            setSelectionEnd(day);
        }
    };

    const handleTouchMove = useCallback((e: TouchEvent) => {
        if (selectionStart && !mouseDownRef.current) { // Only drag with touch if touch started it
            if (e.touches.length === 1) {
                e.preventDefault(); // Prevent page scrolling during selection
                const touch = e.touches[0];
                const element = document.elementFromPoint(touch.clientX, touch.clientY);
                const dayCell = element?.closest<HTMLDivElement>('[data-date]');
                if (dayCell?.dataset.date) {
                    setSelectionEnd(new Date(dayCell.dataset.date));
                }
            }
        }
    }, [selectionStart]);

    const handlePointerUp = useCallback(() => {
        if (selectionStart && selectionEnd) {
            const start = selectionStart < selectionEnd ? selectionStart : selectionEnd;
            const end = selectionStart > selectionEnd ? selectionStart : selectionEnd;
            
            if (start.toDateString() === end.toDateString()) {
                // This is a single day click/tap
                if (dateFilter?.toDateString() === start.toDateString() && mouseDownRef.current) {
                    onDayContextMenu(start, { x: mouseDownRef.current.event.clientX, y: mouseDownRef.current.event.clientY });
                } else {
                    onDayClick(start);
                }
            } else {
                onDateRangeSelect(start, end);
            }
        }
        setSelectionStart(null);
        setSelectionEnd(null);
        mouseDownRef.current = null;
    }, [selectionStart, selectionEnd, dateFilter, onDayClick, onDateRangeSelect, onDayContextMenu]);
    
    useEffect(() => {
        const gridElement = gridRef.current;
        if (gridElement) {
            gridElement.addEventListener('touchmove', handleTouchMove, { passive: false });
        }
        window.addEventListener('mouseup', handlePointerUp);
        window.addEventListener('touchend', handlePointerUp);
        return () => {
            if (gridElement) {
                gridElement.removeEventListener('touchmove', handleTouchMove);
            }
            window.removeEventListener('mouseup', handlePointerUp);
            window.removeEventListener('touchend', handlePointerUp);
        };
    }, [handlePointerUp, handleTouchMove]);


    const laidOutItems = useMemo(() => {
        const gridStartDate = daysInGrid[0];
        const gridEndDate = daysInGrid[daysInGrid.length - 1];

        const allItems: (Event | Reminder)[] = [...events, ...reminders].filter(item => {
            const itemStart = new Date('start' in item ? item.start : item.datetime);
            const itemEnd = new Date('start' in item ? item.end : item.datetime);
            return itemEnd >= gridStartDate && itemStart <= gridEndDate;
        });

        allItems.sort((a, b) => {
            const startA = new Date('start' in a ? a.start : a.datetime);
            const startB = new Date('start' in b ? b.start : b.datetime);
            const durationA = ('start' in a ? new Date(a.end).getTime() : startA.getTime()) - startA.getTime();
            const durationB = ('start' in b ? new Date(b.end).getTime() : startB.getTime()) - startB.getTime();
            if (durationB !== durationA) return durationB - durationA; // Longer events first
            return startA.getTime() - startB.getTime();
        });

        const dayToLevelBookings = new Map<string, boolean[]>();
        daysInGrid.forEach(d => dayToLevelBookings.set(d.toDateString(), []));
        
        const finalLayout = new Map<string, { item: Event | Reminder; level: number }[]>();
        daysInGrid.forEach(day => finalLayout.set(day.toDateString(), []));

        for (const item of allItems) {
            const itemStart = new Date('start' in item ? item.start : item.datetime);
            const itemEnd = new Date('start' in item ? item.end : item.datetime);

            let currentDay = new Date(itemStart);
            currentDay.setHours(0,0,0,0);
            
            let targetLevel = 0;
            let levelFound = false;

            while(!levelFound) {
                let isLevelFree = true;
                let dayRunner = new Date(currentDay);
                while (dayRunner <= itemEnd) {
                    const dayBookings = dayToLevelBookings.get(dayRunner.toDateString());
                    if (dayBookings && dayBookings[targetLevel]) {
                        isLevelFree = false;
                        break;
                    }
                    dayRunner.setDate(dayRunner.getDate() + 1);
                }
                
                if (isLevelFree) {
                    levelFound = true;
                } else {
                    targetLevel++;
                }
            }

            let dayRunner = new Date(currentDay);
             while (dayRunner <= itemEnd) {
                const dateStr = dayRunner.toDateString();
                const dayBookings = dayToLevelBookings.get(dateStr);
                const dayLayout = finalLayout.get(dateStr);
                if(dayBookings && dayLayout) {
                    dayBookings[targetLevel] = true;
                    dayLayout.push({ item, level: targetLevel });
                }
                dayRunner.setDate(dayRunner.getDate() + 1);
            }
        }
        
        const filledLayout = new Map<string, (Event | Reminder | null)[]>();
        finalLayout.forEach((dayItems, dateStr) => {
            const levels = [];
            dayItems.forEach(({ item, level }) => {
                while (levels.length <= level) {
                    levels.push(null);
                }
                levels[level] = item;
            });
            filledLayout.set(dateStr, levels);
        });

        return filledLayout;
    }, [daysInGrid, events, reminders]);
    
    const getSelectionRange = () => {
        if (selectionStart && selectionEnd) {
            const start = selectionStart < selectionEnd ? selectionStart : selectionEnd;
            const end = selectionStart > selectionEnd ? selectionStart : selectionEnd;
            return { start, end };
        }
        if (highlightedRange) {
            const start = new Date(highlightedRange.start);
            const end = new Date(highlightedRange.end);
            start.setHours(0,0,0,0);
            end.setHours(0,0,0,0);
            return { start, end };
        }
        return null;
    };

    const selectionRange = getSelectionRange();
    
    const gridContainerClasses = showWeekNumbers ? 'grid-cols-[auto,repeat(7,1fr)]' : 'grid-cols-7';


    return (
        <div className="flex flex-col h-full bg-transparent">
            <div className={`grid ${gridContainerClasses} border-t border-l border-border-color/50 flex-shrink-0 sticky top-0 bg-secondary/50 backdrop-blur-sm z-20`}>
                {showWeekNumbers && (
                    <div className="text-center font-semibold text-text-secondary py-2 border-r border-b border-border-color/50 text-sm">#</div>
                )}
                {weekdays.map(day => (
                    <div key={day} className="text-center font-semibold text-text-secondary py-2 border-r border-b border-border-color/50 text-sm">{day}</div>
                ))}
            </div>
            <div
                ref={gridRef}
                className={`grid ${gridContainerClasses} flex-1 border-l border-border-color/50 select-none`}
            >
                {daysInGrid.map((day, index) => {
                    const dayDateOnly = new Date(day);
                    dayDateOnly.setHours(0,0,0,0);
                    const isToday = day.toDateString() === new Date().toDateString();
                    const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                    const isSelectedAndFiltered = dateFilter?.toDateString() === day.toDateString();
                    const isInSelection = selectionRange && dayDateOnly >= selectionRange.start && dayDateOnly <= selectionRange.end;
                    const isWeekend = highlightWeekends && weekendDays.includes(day.getDay());

                    const getDayBgClass = () => {
                        if (isInSelection) return 'bg-accent/30';
                        if (isWeekend) {
                            return isCurrentMonth ? 'bg-red-500/5 dark:bg-red-500/10' : 'bg-red-800/10 dark:bg-red-900/15';
                        }
                        if (!isCurrentMonth) return 'bg-black/10';
                        return '';
                    };
                    
                    const itemsForDay = laidOutItems.get(day.toDateString()) || [];
                    const maxItemsToShow = 3;
                    const totalItemCount = itemsForDay.filter(i => i).length;
                    const itemsToDisplay = itemsForDay.slice(0, maxItemsToShow);
                    const moreItemsCount = totalItemCount - itemsToDisplay.filter(i => i).length;

                    let title = `View ${day.toLocaleDateString(locale)}`;
                    if (isSelectedAndFiltered) {
                        title = 'Click again to add an event or reminder';
                    }

                    return (
                       <React.Fragment key={day.toISOString()}>
                            {showWeekNumbers && index % 7 === 0 && (
                                <div className="border-r border-b border-border-color/50 text-center text-xs text-text-secondary pt-2">
                                    {getWeekNumber(day)}
                                </div>
                            )}
                            <div
                                data-date={day.toISOString()}
                                className={`relative border-r border-b border-border-color/50 flex flex-col transition-colors cursor-pointer
                                    ${getDayBgClass()}
                                    ${isSelectedAndFiltered ? 'ring-2 ring-accent z-10' : ''}
                                    ${selectionStart || highlightedRange ? '' : 'hover:bg-black/20'}
                                `}
                                onMouseDown={(e) => handleMouseDown(day, e)}
                                onMouseMove={() => handleMouseMove(day)}
                                onTouchStart={(e) => handleTouchStart(day, e)}
                                title={title}
                            >
                                <div className="absolute top-1 right-1 z-10">
                                    <span className={`text-sm h-6 w-6 flex items-center justify-center font-bold ${isToday ? 'bg-accent text-white rounded-full' : isCurrentMonth ? 'text-text-primary' : 'text-text-secondary/50'}`}>
                                        {day.getDate()}
                                    </span>
                                </div>
                                <div className="mt-8 space-y-1 px-0.5 min-h-[110px] md:min-h-[90px]">
                                    {itemsToDisplay.map((item, levelIndex) => {
                                        if (!item) {
                                            return <div key={`placeholder-${levelIndex}`} className="h-[22px]" />;
                                        }

                                        const dayStr = day.toDateString();
                                        const dayOfWeek = day.getDay();
                                        const isEvent = 'start' in item;
                                        const isReminder = 'datetime' in item;
                                        const isCompleted = isReminder && (item as Reminder).isCompleted;
                                        const isOverdue = isReminder && !isCompleted && new Date(item.datetime) < new Date();
                                        const textColor = getContrastColor(item.color);
                                        
                                        let itemClasses = "text-xs px-2 py-0.5 flex items-center gap-1.5 cursor-pointer h-[22px] relative ";
                                        let style: React.CSSProperties = { backgroundColor: item.color, color: textColor };
                                        
                                        if (isCompleted) {
                                            itemClasses += " line-through opacity-60 ";
                                        }
                                        if(isOverdue) {
                                            itemClasses += " ring-1 ring-red-500/80 ";
                                        }

                                        const isSegmentStart = isFirstDay(item, day) || dayOfWeek === startOfWeek;
                                        let segmentSpan = 1;

                                        if (isEvent && isSegmentStart) {
                                            const event = item as Event;
                                            const eventEnd = new Date(event.end);
                                            let runner = new Date(day);
                                            const endOfWeek = new Date(runner);
                                            endOfWeek.setDate(runner.getDate() + (6 - ((runner.getDay() - startOfWeek + 7) % 7)));
                                            
                                            while (runner < endOfWeek && runner < eventEnd) {
                                                segmentSpan++;
                                                runner.setDate(runner.getDate() + 1);
                                                if (runner > eventEnd) {
                                                    segmentSpan--;
                                                    break;
                                                }
                                            }
                                        }

                                        if (isEvent) {
                                            const event = item as Event;
                                            const eventStart = new Date(event.start);
                                            const eventEnd = new Date(event.end);
                                            const eventStartDateStr = eventStart.toDateString();
                                            const eventEndDateStr = eventEnd.toDateString();

                                            const isMultiDay = eventStartDateStr !== eventEndDateStr;
                                            const isCurrentSegmentStart = dayStr === eventStartDateStr || dayOfWeek === startOfWeek;

                                            const endOfWeekDay = (startOfWeek + 6) % 7;
                                            const isCurrentSegmentEnd = dayStr === eventEndDateStr || dayOfWeek === endOfWeekDay;
                                            
                                            if(isMultiDay && !isCurrentSegmentStart) {
                                                style.marginLeft = '-2px';
                                                style.borderTopLeftRadius = 0;
                                                style.borderBottomLeftRadius = 0;
                                            } else {
                                                style.borderTopLeftRadius = '0.375rem';
                                                style.borderBottomLeftRadius = '0.375rem';
                                            }

                                            if(isMultiDay && !isCurrentSegmentEnd) {
                                                style.marginRight = '-2px';
                                                style.borderTopRightRadius = 0;
                                                style.borderBottomRightRadius = 0;
                                            } else {
                                                style.borderTopRightRadius = '0.375rem';
                                                style.borderBottomRightRadius = '0.375rem';
                                            }
                                        } else {
                                            itemClasses += " rounded-md";
                                        }

                                        return (
                                            <div 
                                                key={`${item.id}-${levelIndex}`} 
                                                className={itemClasses}
                                                style={style}
                                                onMouseDown={(e) => e.stopPropagation()}
                                                onClick={(e) => { e.stopPropagation(); onItemClick(item); }}
                                                title={item.title}
                                            >
                                                {isSegmentStart &&
                                                    <div 
                                                        className="absolute top-0 left-0 h-full flex items-center gap-1.5 px-2 z-10"
                                                        style={{
                                                            width: `calc(${segmentSpan * 100}% + ${(segmentSpan - 1) * 2}px)`,
                                                            color: textColor
                                                        }}
                                                    >
                                                        <Icon name={isEvent ? 'calendar' : 'bell'} className="h-3 w-3 flex-shrink-0" />
                                                        <div className="flex-1 truncate">
                                                            <span className="desktop-only font-semibold mr-1" style={{color: isOverdue ? '' : textColor}}>
                                                                {isEvent && !(item as Event).isAllDay && new Date((item as Event).start).toLocaleTimeString(locale, { hour: 'numeric', minute: '2-digit' })}
                                                                {isReminder && new Date((item as Reminder).datetime).toLocaleTimeString(locale, { hour: 'numeric', minute: '2-digit' })}
                                                            </span>
                                                            <span>{item.title}</span>
                                                        </div>
                                                    </div>
                                                }
                                            </div>
                                        )
                                    })}
                                </div>
                                {moreItemsCount > 0 && (
                                    <div className="text-xs text-text-secondary mt-1 font-bold px-1">
                                        {t('common.moreItems', { count: moreItemsCount })}
                                    </div>
                                )}
                            </div>
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
};
export default MonthView;