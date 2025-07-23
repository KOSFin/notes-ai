



import React from 'react';
import { AppSettings } from '../../types';
import Icon from '../Icon';
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


const CalendarSettings = ({ settings, setSettings }: { settings: AppSettings, setSettings: React.Dispatch<React.SetStateAction<AppSettings>> }) => {
    
    const handleSettingChange = (key: keyof AppSettings['calendar'], value: any) => {
        setSettings(prev => ({
            ...prev,
            calendar: {
                ...prev.calendar,
                [key]: value,
            }
        }));
    };

    const handleWeekendDayToggle = (dayIndex: number) => {
        const currentWeekendDays = settings.calendar.weekendDays;
        const newWeekendDays = currentWeekendDays.includes(dayIndex)
            ? currentWeekendDays.filter(d => d !== dayIndex)
            : [...currentWeekendDays, dayIndex];
        handleSettingChange('weekendDays', newWeekendDays.sort());
    };

    const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    return (
        <div className="space-y-8">
            <h3 className="text-2xl font-bold">{t('settings.calendar.title')}</h3>
            
            <section>
                <h4 className="text-lg font-semibold mb-3">{t('settings.calendar.general')}</h4>
                <div className="p-4 bg-primary rounded-lg space-y-4 divide-y divide-border-color/50">
                     <div className="flex items-center justify-between pb-4">
                        <p className="font-medium text-text-primary">{t('settings.calendar.startWeekOn')}</p>
                        <select 
                            value={settings.calendar.startOfWeek}
                            onChange={e => handleSettingChange('startOfWeek', parseInt(e.target.value))}
                            className="bg-secondary border border-border-color rounded-md py-1.5 px-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                        >
                            <option value="0">{t('settings.calendar.startWeekOn.sunday')}</option>
                            <option value="1">{t('settings.calendar.startWeekOn.monday')}</option>
                        </select>
                    </div>
                    <div className="flex items-center justify-between pt-4">
                        <div>
                            <p className="font-medium text-text-primary">{t('settings.calendar.showWeekNumbers')}</p>
                            <p className="text-sm text-text-secondary">{t('settings.calendar.showWeekNumbers.desc')}</p>
                        </div>
                        <ToggleSwitch 
                            checked={settings.calendar.showWeekNumbers}
                            onChange={checked => handleSettingChange('showWeekNumbers', checked)}
                        />
                    </div>
                     <div className="flex items-center justify-between pt-4">
                        <div>
                            <p className="font-medium text-text-primary">{t('settings.calendar.showMonthNumber')}</p>
                            <p className="text-sm text-text-secondary">{t('settings.calendar.showMonthNumber.desc')}</p>
                        </div>
                        <ToggleSwitch 
                            checked={settings.calendar.showMonthNumber}
                            onChange={checked => handleSettingChange('showMonthNumber', checked)}
                        />
                    </div>
                </div>
            </section>
            
            <section>
                <h4 className="text-lg font-semibold mb-3">{t('settings.calendar.weekends')}</h4>
                <div className="p-4 bg-primary rounded-lg space-y-4">
                     <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-text-primary">{t('settings.calendar.highlightWeekends')}</p>
                            <p className="text-sm text-text-secondary">{t('settings.calendar.highlightWeekends.desc')}</p>
                        </div>
                        <ToggleSwitch 
                            checked={settings.calendar.highlightWeekends}
                            onChange={checked => handleSettingChange('highlightWeekends', checked)}
                        />
                    </div>
                    {settings.calendar.highlightWeekends && (
                        <div className="pt-4 border-t border-border-color/50">
                            <p className="text-sm text-text-secondary mb-3">{t('settings.calendar.selectWeekends')}</p>
                            <div className="flex flex-wrap gap-2">
                                {weekdays.map((day, index) => (
                                    <button
                                        key={day}
                                        onClick={() => handleWeekendDayToggle(index)}
                                        className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${settings.calendar.weekendDays.includes(index) ? 'bg-accent text-white' : 'bg-secondary hover:bg-border-color'}`}
                                    >
                                        {day}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </section>

        </div>
    );
};

export default CalendarSettings;