import React, { useState, useEffect } from 'react';
import { ActiveTimer } from '../types';
import Icon from './Icon';

interface TimerWidgetProps {
    timer: ActiveTimer;
    onDelete: (id: number) => void;
    onFinish: (timer: ActiveTimer) => void;
}

const TimerWidget: React.FC<TimerWidgetProps> = ({ timer, onDelete, onFinish }) => {
    const [remaining, setRemaining] = useState(timer.remaining);

    useEffect(() => {
        if (remaining <= 0) {
            onFinish(timer);
            return;
        }

        const intervalId = setInterval(() => {
            setRemaining(r => r - 1);
        }, 1000);

        return () => clearInterval(intervalId);
    }, [remaining, timer, onFinish]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    };

    return (
        <div className="bg-secondary rounded-lg shadow-xl p-3 w-64 flex items-center justify-between animate-fade-in">
            <div className="flex-1 min-w-0">
                <p className="text-text-secondary text-sm truncate">{timer.label}</p>
                <p className="text-text-primary text-2xl font-mono font-bold">{formatTime(remaining)}</p>
            </div>
            <button
                onClick={() => onDelete(timer.id)}
                className="p-2 rounded-full text-text-secondary hover:bg-border-color hover:text-red-500 flex-shrink-0"
                aria-label="Dismiss timer"
            >
                <Icon name="close" className="h-5 w-5" />
            </button>
        </div>
    );
};

export default TimerWidget;
