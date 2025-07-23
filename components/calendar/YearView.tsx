


import React from 'react';

const YearView: React.FC<{ currentDate: Date; onMonthClick: (date: Date) => void; locale: string }> = ({ currentDate, onMonthClick, locale }) => {
    const year = currentDate.getFullYear();
    const months = Array.from({ length: 12 }, (_, i) => new Date(year, i, 1));
    const weekdays = Array.from({ length: 7 }, (_, i) => new Date(2023, 0, 1 + i).toLocaleString(locale, { weekday: 'narrow' }));

    return (
        <div className="h-full overflow-y-auto p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 scrollbar-hide">
            {months.map(monthDate => {
                const monthName = monthDate.toLocaleString(locale, { month: 'long' });
                const firstDay = monthDate.getDay();
                const daysInMonth = new Date(year, monthDate.getMonth() + 1, 0).getDate();
                
                return (
                    <div key={monthName} className="p-2 bg-secondary rounded-lg">
                        <button onClick={() => onMonthClick(monthDate)} className="font-bold text-accent text-center w-full mb-2 hover:underline">{monthName}</button>
                        <div className="grid grid-cols-7 text-center text-xs text-text-secondary">
                            {weekdays.map(d => <div key={d}>{d}</div>)}
                        </div>
                        <div className="grid grid-cols-7 text-center text-xs text-text-primary">
                            {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`}></div>)}
                            {Array.from({ length: daysInMonth }).map((_, i) => {
                                const day = i + 1;
                                const isToday = new Date().getFullYear() === year && new Date().getMonth() === monthDate.getMonth() && new Date().getDate() === day;
                                return (
                                    <div key={day} className={`py-0.5 ${isToday ? 'bg-accent text-white rounded-full' : ''}`}>
                                        {day}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default YearView;