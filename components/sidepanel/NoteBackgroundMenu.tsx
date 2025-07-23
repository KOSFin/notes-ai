import React, { useRef } from 'react';
import { AppSettings, BackgroundSetting } from '../../types';
import { NOTE_PRESETS } from '../../assets/presets';
import { resizeImage } from '../../utils/imageUtils';
import Icon from '../Icon';
import { t } from '../../localization';

interface NoteBackgroundMenuProps {
    currentBackground: BackgroundSetting;
    onUpdate: (bg: BackgroundSetting) => void;
    onClose: () => void;
    settings: AppSettings;
    setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
}

const NoteBackgroundMenu: React.FC<NoteBackgroundMenuProps> = ({ currentBackground, onUpdate, onClose, settings, setSettings }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            try {
                const file = e.target.files[0];
                const resizedDataUrl = await resizeImage(file, 800, 800, 0.7);
                const newBg: BackgroundSetting = { type: 'custom', value: resizedDataUrl, dim: currentBackground.dim };
                
                // Add to global custom backgrounds if it doesn't exist
                setSettings(prev => {
                    const exists = prev.customBackgrounds.some(bg => bg.value === newBg.value);
                    return exists ? prev : { ...prev, customBackgrounds: [...prev.customBackgrounds, newBg] };
                });
                
                // Update current note's background
                onUpdate(newBg);

            } catch (error) {
                console.error("Error resizing image:", error);
            }
        }
    }
    
    const handleBgSelect = (bg: BackgroundSetting) => {
        onUpdate({...bg, dim: currentBackground.dim });
    }

    return (
        <div className="absolute bottom-0 left-0 right-0 z-20 bg-secondary/80 backdrop-blur-lg border-t border-border-color/50 shadow-2xl animate-fade-in-up">
            <div className="p-4 space-y-4">
                {/* Background Choices */}
                <div>
                    <label className="text-sm font-medium text-text-secondary block mb-2">{t('dashboard.note.background')}</label>
                    <div className="flex items-center space-x-3 overflow-x-auto scrollbar-hide pb-2">
                        <PresetButton
                            selected={currentBackground.type === 'none'}
                            onClick={() => handleBgSelect({ type: 'none', value: '', dim: 50 })}
                        >
                            <Icon name="close" className="h-6 w-6" />
                        </PresetButton>
                        {NOTE_PRESETS.map(p => (
                             <PresetButton
                                key={p.name}
                                selected={currentBackground.value === p.value}
                                onClick={() => handleBgSelect({ type: 'preset', value: p.value, dim: 50 })}
                             >
                                <img src={p.value} className="w-full h-full object-cover" alt={p.name} />
                             </PresetButton>
                        ))}
                        {settings.customBackgrounds.map((bg, index) => (
                             <PresetButton
                                key={index}
                                selected={currentBackground.value === bg.value}
                                onClick={() => handleBgSelect(bg)}
                             >
                                <img src={bg.value} className="w-full h-full object-cover" alt={`custom ${index + 1}`} />
                             </PresetButton>
                        ))}
                         <PresetButton onClick={() => fileInputRef.current?.click()}>
                            <Icon name="image" className="h-6 w-6" />
                             <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden"/>
                        </PresetButton>
                    </div>
                </div>
                 {/* Dim Slider */}
                {currentBackground.type !== 'none' && (
                     <div className="pt-3 border-t border-border-color/50">
                        <label htmlFor="dim-slider" className="text-sm font-medium text-text-secondary block mb-1">{t('dashboard.note.dim')}</label>
                        <div className="flex items-center gap-3">
                            <input
                                id="dim-slider"
                                type="range"
                                min="0"
                                max="95"
                                value={currentBackground.dim}
                                onChange={(e) => onUpdate({ ...currentBackground, dim: parseInt(e.target.value, 10) })}
                                className="w-full h-2 bg-border-color rounded-lg appearance-none cursor-pointer accent-accent"
                            />
                             <span className="text-sm font-mono w-10 text-right">{currentBackground.dim}%</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const PresetButton: React.FC<{ selected?: boolean, onClick: () => void, children: React.ReactNode }> = ({ selected = false, onClick, children }) => (
    <button
        onClick={onClick}
        className={`w-16 h-12 flex-shrink-0 rounded-lg border-2 overflow-hidden
                    flex items-center justify-center transition-all
                    ${selected ? 'border-accent' : 'border-border-color hover:border-accent'}`}
    >
        {children}
    </button>
)

export default NoteBackgroundMenu;