
import React, { useRef } from 'react';
import { AppSettings, BackgroundSetting } from '../../types';
import Icon from '../Icon';
import { CALENDAR_PRESETS } from '../../assets/presets';
import { resizeImage } from '../../utils/imageUtils';
import { t } from '../../localization';

const PRESET_COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#3b82f6'];

const PersonalizationSettings = ({ settings, setSettings }: { settings: AppSettings, setSettings: React.Dispatch<React.SetStateAction<AppSettings>> }) => {
    const customColorInputRef = useRef<HTMLInputElement>(null);
    const customCalendarBgRef = useRef<HTMLInputElement>(null);

    const handleThemeChange = (theme: 'light' | 'dark') => {
        setSettings(prev => ({ ...prev, theme }));
    };
    
    const handleContrastChange = (contrast: 'low' | 'medium' | 'high') => {
        setSettings(prev => ({ ...prev, themeContrast: contrast }));
    };

    const handleAccentChange = (color: string) => {
        setSettings(prev => ({ ...prev, accentColor: color }));
    };
    
    const handleCalendarBgChange = (bg: Partial<BackgroundSetting>) => {
        setSettings(prev => ({ ...prev, calendarBackground: {...prev.calendarBackground, ...bg} }));
    };

    const handleCustomBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
             try {
                const file = e.target.files[0];
                // Resize to a reasonable background size to prevent storage issues
                const resizedDataUrl = await resizeImage(file, 1920, 1080, 0.7);
                const newBg: BackgroundSetting = { type: 'custom', value: resizedDataUrl, dim: 50 };
                
                setSettings(prev => {
                    // Check if this image already exists to avoid duplicates
                    const exists = prev.customBackgrounds.some(bg => bg.value === newBg.value);
                    const updatedCustomBgs = exists ? prev.customBackgrounds : [...prev.customBackgrounds, newBg];

                    return {
                        ...prev,
                        customBackgrounds: updatedCustomBgs,
                        calendarBackground: newBg, // Set the newly uploaded image as current
                    }
                });

            } catch (error) {
                console.error("Error resizing image for calendar background:", error);
                // Optionally, show an error message to the user
            }
        }
    };
    
    const ContrastButton = ({ level }: { level: 'low' | 'medium' | 'high' }) => (
        <button
            onClick={() => handleContrastChange(level)}
            className={`px-4 py-2 rounded-md text-sm capitalize font-semibold transition-colors ${settings.themeContrast === level ? 'bg-accent text-white' : 'bg-primary hover:bg-border-color'}`}
        >
            {t(`settings.personalization.contrast.${level}`)}
        </button>
    );

    return (
        <div className="space-y-8">
            <h3 className="text-2xl font-bold">{t('settings.personalization.title')}</h3>

            {/* Theme Settings */}
            <section>
                <h4 className="text-lg font-semibold mb-3">{t('settings.personalization.theme')}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ThemePreview name={t('settings.personalization.theme.light')} theme="light" settings={settings} onSelect={() => handleThemeChange('light')} />
                    <ThemePreview name={t('settings.personalization.theme.dark')} theme="dark" settings={settings} onSelect={() => handleThemeChange('dark')} />
                </div>
            </section>
            
            {/* Contrast Settings */}
            <section>
                <h4 className="text-lg font-semibold mb-3">{t('settings.personalization.contrast')}</h4>
                 <div className="p-4 bg-primary rounded-lg flex flex-wrap items-center justify-between gap-y-3">
                    <p className="text-text-secondary text-sm" dangerouslySetInnerHTML={{__html: t('settings.personalization.contrast.description', { theme: `<b>${t(`settings.personalization.theme.${settings.theme}`)}</b>`})}}></p>
                     <div className="flex items-center gap-2 p-1 bg-secondary rounded-lg">
                        <ContrastButton level="low" />
                        <ContrastButton level="medium" />
                        <ContrastButton level="high" />
                    </div>
                 </div>
            </section>

            {/* Accent Color Settings */}
            <section>
                <h4 className="text-lg font-semibold mb-3">{t('settings.personalization.accent')}</h4>
                <div className="flex flex-wrap items-center gap-4">
                    {PRESET_COLORS.map(color => (
                        <button
                            key={color}
                            onClick={() => handleAccentChange(color)}
                            className={`w-10 h-10 rounded-full transition-transform transform hover:scale-110 ${settings.accentColor === color ? 'ring-2 ring-offset-2 ring-offset-primary ring-white' : ''}`}
                            style={{ backgroundColor: color }}
                            aria-label={`Select accent color ${color}`}
                        />
                    ))}
                    <div className="relative w-10 h-10">
                        <button
                            type="button"
                            onClick={() => customColorInputRef.current?.click()}
                            className="w-10 h-10 rounded-full bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 flex items-center justify-center"
                            aria-label={t('settings.personalization.accent.custom')}
                        >
                            <Icon name="palette" className="h-5 w-5 text-white" />
                        </button>
                        <input
                            ref={customColorInputRef}
                            type="color"
                            value={settings.accentColor}
                            onChange={(e) => handleAccentChange(e.target.value)}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                    </div>
                </div>
            </section>
            
            {/* Calendar Background */}
            <section>
                <h4 className="text-lg font-semibold mb-3">{t('settings.personalization.calendarBg')}</h4>
                <div className="p-4 bg-primary rounded-lg space-y-4">
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                        <BgChoiceButton selected={settings.calendarBackground.type === 'none'} onClick={() => handleCalendarBgChange({type: 'none'})}>
                            <Icon name="close" className="h-6 w-6 text-text-secondary" />
                            <span className="text-xs absolute bottom-1">{t('settings.personalization.calendarBg.none')}</span>
                        </BgChoiceButton>
                        {CALENDAR_PRESETS.map(p => (
                            <BgChoiceButton key={p.name} selected={settings.calendarBackground.value === p.value} onClick={() => handleCalendarBgChange({type: 'preset', value: p.value})}>
                                <img src={p.value} className="w-full h-full object-cover rounded-md" alt={p.name} />
                                <span className="text-xs absolute bottom-1 text-white bg-black/50 px-1 rounded">{t(`settings.personalization.calendarBg.preset.${p.name.toLowerCase()}` as any)}</span>
                            </BgChoiceButton>
                        ))}
                        {settings.customBackgrounds.map((bg, index) => (
                             <BgChoiceButton key={index} selected={settings.calendarBackground.value === bg.value} onClick={() => handleCalendarBgChange({type: 'custom', value: bg.value})}>
                                <img src={bg.value} className="w-full h-full object-cover rounded-md" alt={`Custom ${index+1}`} />
                            </BgChoiceButton>
                        ))}
                         <BgChoiceButton selected={false} onClick={() => customCalendarBgRef.current?.click()}>
                            <Icon name="image" className="h-6 w-6 text-text-secondary" />
                            <span className="text-xs absolute bottom-1">{t('settings.personalization.calendarBg.upload')}</span>
                            <input type="file" ref={customCalendarBgRef} onChange={handleCustomBgUpload} accept="image/*" className="hidden"/>
                        </BgChoiceButton>
                    </div>
                    {settings.calendarBackground.type !== 'none' && (
                        <div className="pt-4 border-t border-border-color/50 flex items-center gap-4">
                            <label htmlFor="dim-slider" className="text-sm font-medium text-text-secondary whitespace-nowrap">{t('settings.personalization.calendarBg.dim')}</label>
                            <input
                                id="dim-slider"
                                type="range"
                                min="0"
                                max="95"
                                value={settings.calendarBackground.dim}
                                onChange={(e) => handleCalendarBgChange({ dim: parseInt(e.target.value, 10) })}
                                className="w-full h-2 bg-border-color rounded-lg appearance-none cursor-pointer accent-accent"
                            />
                            <span className="text-sm font-mono w-10 text-right">{settings.calendarBackground.dim}%</span>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};


const ThemePreview = ({ name, theme, settings, onSelect }: { name: string, theme: 'light' | 'dark', settings: AppSettings, onSelect: () => void }) => {
    
    const contrastColors = {
        light: {
            low: { bg: '#f9fafb', secondary: '#ffffff', text: '#9ca3af' },
            medium: { bg: '#ffffff', secondary: '#f3f4f6', text: '#6b7280' },
            high: { bg: '#ffffff', secondary: '#e5e7eb', text: '#4b5563' },
        },
        dark: {
            low: { bg: '#1f2937', secondary: '#374151', text: '#6b7280' },
            medium: { bg: '#111827', secondary: '#1f2937', text: '#4b5563' },
            high: { bg: '#000000', secondary: '#111827', text: '#374151' },
        }
    }
    
    const colors = contrastColors[theme][settings.themeContrast];
    
    return (
        <div 
            onClick={onSelect}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${settings.theme === theme ? 'border-accent' : 'border-border-color hover:border-text-secondary'}`}
        >
            <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-lg">{name}</h4>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${settings.theme === theme ? 'bg-accent border-accent' : 'border-border-color'}`}>
                    {settings.theme === theme && <Icon name="check" className="h-3 w-3 text-white" />}
                </div>
            </div>
            <div className="h-24 rounded-md p-3 transition-colors" style={{ backgroundColor: colors.bg }}>
                <div className="h-4 rounded" style={{ backgroundColor: settings.accentColor }}></div>
                <div className="h-8 mt-2 rounded transition-colors" style={{ backgroundColor: colors.secondary }}>
                     <div className="h-3 w-3/4 ml-2 mt-1 rounded-sm transition-colors" style={{ backgroundColor: colors.text }}></div>
                </div>
            </div>
        </div>
    );
};

const BgChoiceButton: React.FC<{selected: boolean, onClick: () => void, children: React.ReactNode}> = ({ selected, onClick, children }) => (
    <button
        onClick={onClick}
        className={`relative aspect-video rounded-lg border-2 transition-all flex items-center justify-center
            ${selected ? 'border-accent' : 'border-primary hover:border-border-color'}`}
    >
        {children}
    </button>
);

export default PersonalizationSettings;
