


import React, { useState, useRef } from 'react';
import { FolderCustomization } from '../../types';
import Icon from '../Icon';
import { ColorPicker } from './common';
import { t } from '../../localization';

const PREDEFINED_ICONS = ['notes', 'book', 'briefcase', 'code', 'lightbulb', 'dollar', 'heart', 'star', 'home', 'cart', 'chart', 'cog', 'gamepad', 'music', 'plane', 'movie', 'leaf', 'lock', 'cloud', 'image'];

export const FolderIcon = ({ customization, className }: { customization: FolderCustomization, className?: string }) => {
    const iconName = customization?.icon || 'notes';
    const color = customization?.color || '#3a3a3a';

    if (iconName.startsWith('data:image')) {
        return <img src={iconName} className={`${className} object-cover bg-cover bg-center`} style={{ backgroundColor: color }} />;
    }
    
    return (
        <div className="p-2 rounded-lg flex items-center justify-center" style={{ backgroundColor: color }}>
            <Icon name={iconName} className="h-5 w-5 text-white" />
        </div>
    );
};


const FolderEditModal: React.FC<{
    folderName: string;
    customization?: FolderCustomization;
    onClose: () => void;
    onSave: (originalName: string, newData: { name: string } & FolderCustomization) => void;
}> = ({ folderName, customization, onClose, onSave }) => {
    const [name, setName] = useState(folderName);
    const [color, setColor] = useState(customization?.color || '#3a3a3a');
    const [icon, setIcon] = useState(customization?.icon || 'notes');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    const img = new Image();
                    img.src = event.target.result as string;
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        const MAX_WIDTH = 128;
                        const MAX_HEIGHT = 128;
                        let width = img.width;
                        let height = img.height;

                        if (width > height) {
                            if (width > MAX_WIDTH) {
                                height *= MAX_WIDTH / width;
                                width = MAX_WIDTH;
                            }
                        } else {
                            if (height > MAX_HEIGHT) {
                                width *= MAX_HEIGHT / height;
                                height = MAX_HEIGHT;
                            }
                        }
                        canvas.width = width;
                        canvas.height = height;
                        const ctx = canvas.getContext('2d');
                        ctx?.drawImage(img, 0, 0, width, height);
                        const dataUrl = canvas.toDataURL('image/jpeg', 0.8); // Compress to jpeg
                        setIcon(dataUrl);
                    };
                }
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleSave = () => {
        onSave(folderName, { name, color, icon });
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-secondary rounded-lg shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b border-border-color">
                    <h2 className="text-xl font-bold">{t('dashboard.editFolder')}</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-border-color">
                        <Icon name="close" className="h-6 w-6 text-text-secondary" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">{t('dashboard.folderName')}</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-primary border border-border-color rounded-md py-2 px-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">{t('dashboard.iconColor')}</label>
                        <ColorPicker selectedColor={color} onSelectColor={setColor} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">{t('dashboard.chooseIcon')}</label>
                        <div className="grid grid-cols-6 gap-2">
                            {PREDEFINED_ICONS.map(iconName => (
                                <button key={iconName} onClick={() => setIcon(iconName)} className={`rounded-lg p-2 flex items-center justify-center transition-all ${icon === iconName && !icon.startsWith('data:') ? 'ring-2 ring-accent' : 'hover:bg-primary'}`}>
                                    <FolderIcon customization={{icon: iconName, color}} />
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">{t('dashboard.uploadIcon')}</label>
                        <div className="flex items-center gap-4">
                            <button type="button" onClick={() => fileInputRef.current?.click()} className="px-4 py-2 text-sm rounded-md border border-border-color text-text-primary hover:bg-border-color">
                                {t('dashboard.chooseImage')}
                            </button>
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden"/>
                            {icon.startsWith('data:image') && <FolderIcon customization={{icon, color}} className="w-10 h-10 rounded-lg" />}
                        </div>
                    </div>
                </div>
                <div className="p-4 border-t border-border-color flex justify-end space-x-2">
                    <button onClick={onClose} className="px-4 py-2 rounded-md border border-border-color text-text-primary hover:bg-border-color">{t('common.cancel')}</button>
                    <button onClick={handleSave} className="px-4 py-2 rounded-md bg-accent text-white hover:bg-accent-hover">{t('dashboard.saveChanges')}</button>
                </div>
            </div>
        </div>
    );
};

export default FolderEditModal;