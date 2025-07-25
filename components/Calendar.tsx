





import React, { useState, useEffect } from 'react';
import { Event, Reminder, AppSettings } from '../types';
import Icon from './Icon';
import MonthView from './calendar/MonthView';
import DayView from './calendar/DayView';
import YearView from './calendar/YearView';
import { getLocale, t } from '../localization';

interface CalendarProps {
    currentDate: Date;
    setCurrentDate: (date: Date) => void;
    events: Event[];
    reminders: Reminder[];
    onDayClick: (date: Date) => void;
    onItemClick: (item: Event | Reminder) => void;
    onDateRangeSelect: (start: Date, end: Date) => void;
    onNewItemRequest: (type: 'event' | 'reminder', date: Date) => void;
    dateFilter: Date | null;
    highlightedRange: {start: string, end: string} | null;
    settings: AppSettings;
    isMobile: boolean;
}

type CalendarViewMode = 'month' | 'day' | 'year';

const CalendarHeader = ({
    currentDate,
    view,
    onPrev,
    onNext,
    onToday,
    onViewChange,
    settings
}: {
    currentDate: Date;
    view: CalendarViewMode;
    onPrev: () => void;
    onNext: () => void;
    onToday: () => void;
    onViewChange: (view: CalendarViewMode) => void;
    settings: AppSettings;
}) => {
    const locale = getLocale(settings.language.appLanguage);
    const monthName = currentDate.toLocaleString(locale, { month: 'long' });
    const year = currentDate.getFullYear();
    const showMonthNumber = settings.calendar.showMonthNumber;

    let title = `${monthName} ${year}`;
    if (showMonthNumber) {
        const monthNumber = (currentDate.getMonth() + 1).toString().padStart(2, '0');
        title = `${monthName} (${monthNumber}) ${year}`;
    }


    if (view === 'day') {
        const dayName = currentDate.toLocaleString(locale, { weekday: 'long' });
        const dayOfMonth = currentDate.getDate();
        title = `${dayName}, ${monthName} ${dayOfMonth}`;
        if (showMonthNumber) {
            const monthNumber = (currentDate.getMonth() + 1).toString().padStart(2, '0');
            title = `${dayName}, ${monthName} (${monthNumber}) ${dayOfMonth}, ${year}`;
        }
    } else if (view === 'year') {
        title = `${year}`;
    }

    return (
        <div className="flex items-center justify-between flex-wrap gap-y-2 md:flex-nowrap md:gap-x-2 relative z-10">
            <div className="flex items-center gap-2">
                 <div className="flex items-center">
                    <button onClick={onPrev} className="p-2 rounded-full hover:bg-border-color"><Icon name="chevron" className="h-5 w-5 rotate-90" /></button>
                    <button onClick={onNext} className="p-2 rounded-full hover:bg-border-color"><Icon name="chevron" className="h-5 w-5 -rotate-90" /></button>
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-text-primary whitespace-nowrap">{title}</h2>
            </div>
            <div className="flex items-center gap-2">
                <button onClick={onToday} className="px-3 py-1.5 text-xs md:text-sm rounded-md border border-border-color hover:bg-border-color">{t('common.today')}</button>
                <div className="flex items-center gap-1 bg-primary p-1 rounded-lg">
                    <button onClick={() => onViewChange('year')} className={`px-2 py-0.5 text-xs md:text-sm rounded-md ${view === 'year' ? 'bg-accent text-white' : 'hover:bg-border-color'}`}>
                        <span className="hidden md:inline">Year</span>
                        <span className="md:hidden">Y</span>
                    </button>
                    <button onClick={() => onViewChange('month')} className={`px-2 py-0.5 text-xs md:text-sm rounded-md ${view === 'month' ? 'bg-accent text-white' : 'hover:bg-border-color'}`}>
                         <span className="hidden md:inline">Month</span>
                         <span className="md:hidden">M</span>
                    </button>
                    <button onClick={() => onViewChange('day')} className={`px-2 py-0.5 text-xs md:text-sm rounded-md ${view === 'day' ? 'bg-accent text-white' : 'hover:bg-border-color'}`}>
                         <span className="hidden md:inline">Day</span>
                         <span className="md:hidden">D</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export const Calendar: React.FC<CalendarProps> = ({ currentDate, setCurrentDate, events, reminders, onDayClick, onItemClick, onDateRangeSelect, onNewItemRequest, dateFilter, highlightedRange, settings, isMobile }) => {
    const [view, setView] = useState<CalendarViewMode>('month');
    const [quickAddMenu, setQuickAddMenu] = useState<{ x: number, y: number, date: Date } | null>(null);
    const { calendar: calendarSettings, calendarBackground } = settings;
    const locale = getLocale(settings.language.appLanguage);

    const handlePrev = () => {
        const newDate = new Date(currentDate);
        if (view === 'month') newDate.setMonth(newDate.getMonth() - 1);
        else if (view === 'year') newDate.setFullYear(newDate.getFullYear() - 1);
        else if (view === 'day') newDate.setDate(newDate.getDate() - 1);
        setCurrentDate(newDate);
    };

    const handleNext = () => {
        const newDate = new Date(currentDate);
        if (view === 'month') newDate.setMonth(newDate.getMonth() + 1);
        else if (view === 'year') newDate.setFullYear(newDate.getFullYear() + 1);
        else if (view === 'day') newDate.setDate(newDate.getDate() + 1);
        setCurrentDate(newDate);
    };
    
    const handleToday = () => {
        const today = new Date();
        const isAlreadyOnCurrentMonth =
            currentDate.getMonth() === today.getMonth() &&
            currentDate.getFullYear() === today.getFullYear();

        setCurrentDate(new Date()); // Always navigate to today's date

        if (view === 'month' && isAlreadyOnCurrentMonth) {
            // If we are on the current month, open the day filter
            onDayClick(today);
        } else if (view !== 'month') {
            // If we are on year or day view, switch to month view
            setView('month');
        }
    };

    const handleMonthClickInYearView = (date: Date) => {
        setCurrentDate(date);
        setView('month');
    }

    const handleDayContextMenu = (date: Date, position: { x: number, y: number }) => {
        setQuickAddMenu({ ...position, date });
    }

    useEffect(() => {
        const handleClickOutside = () => setQuickAddMenu(null);
        window.addEventListener('click', handleClickOutside, true); // Use capture phase
        return () => window.removeEventListener('click', handleClickOutside, true);
    }, []);

    const renderView = () => {
        switch(view) {
            case 'month':
                return <MonthView currentDate={currentDate} events={events} reminders={reminders} onDayClick={onDayClick} onItemClick={onItemClick} onDateRangeSelect={onDateRangeSelect} onDayContextMenu={handleDayContextMenu} dateFilter={dateFilter} highlightedRange={highlightedRange} settings={settings.calendar} language={settings.language.appLanguage} isMobile={isMobile} />;
            case 'day':
                return <DayView currentDate={currentDate} events={events} reminders={reminders} onItemClick={onItemClick} locale={locale}/>;
            case 'year':
                return <YearView currentDate={currentDate} onMonthClick={handleMonthClickInYearView} locale={locale} />;
            default:
                return null;
        }
    }

    return (
        <div className="flex flex-col h-full bg-primary overflow-hidden relative">
            {calendarBackground.type !== 'none' && (
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <div
                        className="absolute inset-0 bg-cover bg-center transition-all duration-500"
                        style={{ backgroundImage: `url(${calendarBackground.value})` }}
                    />
                    <div
                        className="absolute inset-0 bg-primary transition-opacity duration-500"
                        style={{ opacity: calendarBackground.dim / 100 }}
                    />
                </div>
            )}
            <div className="p-2 md:p-4">
                <CalendarHeader
                    currentDate={currentDate}
                    view={view}
                    onPrev={handlePrev}
                    onNext={handleNext}
                    onToday={handleToday}
                    onViewChange={setView}
                    settings={settings}
                />
            </div>
            <div className="flex-1 flex flex-col overflow-y-auto relative scrollbar-hide">
                {renderView()}
                {quickAddMenu && (
                    <div 
                        style={{ top: quickAddMenu.y, left: quickAddMenu.x }}
                        className="absolute z-50 bg-secondary rounded-lg shadow-2xl border border-border-color p-2 flex flex-col gap-1"
                        onClick={e => e.stopPropagation()}
                    >
                         <button 
                            onClick={() => {
                                onNewItemRequest('event', quickAddMenu.date);
                                setQuickAddMenu(null);
                            }}
                            className="flex items-center gap-2 w-full text-left px-3 py-1.5 rounded-md text-sm text-text-primary hover:bg-accent hover:text-white"
                        >
                            <Icon name="calendar" className="h-4 w-4" />
                            {t('dashboard.newEvent')}
                        </button>
                        <button 
                            onClick={() => {
                                onNewItemRequest('reminder', quickAddMenu.date);
                                setQuickAddMenu(null);
                            }}
                            className="flex items-center gap-2 w-full text-left px-3 py-1.5 rounded-md text-sm text-text-primary hover:bg-accent hover:text-white"
                        >
                            <Icon name="bell" className="h-4 w-4" />
                            {t('dashboard.newReminder')}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};