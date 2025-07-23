
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { AIMemory, UserProfile } from '../types';
import Icon from './Icon';
import { t } from '../localization';
import CountrySelect from './auth/CountrySelect';

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    profile: UserProfile | null;
    setProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>;
    memory: AIMemory;
    setMemory: React.Dispatch<React.SetStateAction<AIMemory>>;
    isMobile: boolean;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, profile, setProfile, memory, setMemory, isMobile }) => {
    const [formData, setFormData] = useState<UserProfile>({
        firstName: '', lastName: '', dob: '', description: '', timezone: '', country: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (profile) {
            setFormData(profile);
        }
        setError(null);
        setLoading(false);
    }, [profile, isOpen]);

    if (!isOpen) return null;

    const handleSave = async () => {
        setLoading(true);
        setError(null);
        const { error: updateError } = await supabase.auth.updateUser({
            data: {
                first_name: formData.firstName,
                last_name: formData.lastName,
                dob: formData.dob,
                description: formData.description,
                country: formData.country,
            }
        });
        setLoading(false);

        if (updateError) {
            setError(updateError.message);
        } else {
            setProfile(formData); // Update local state immediately for responsiveness
            onClose();
        }
    };

    const clearMemoryItem = (key: string) => {
        setMemory(prev => {
            const newMemory = { ...prev };
            delete newMemory[key];
            return newMemory;
        });
    };

    const clearAllMemory = () => {
        setMemory({});
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 md:p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-secondary shadow-2xl w-full h-full md:rounded-lg md:max-w-2xl md:h-auto md:max-h-[80vh] flex flex-col animate-pop-in" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b border-border-color">
                    <h2 className="text-xl font-bold">{t('profile.title')}</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-border-color">
                        <Icon name="close" className="h-6 w-6 text-text-secondary" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {/* Profile Section */}
                    <div className="space-y-4">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField label={t('profile.firstName')} name="firstName" value={formData.firstName} onChange={handleInputChange} />
                            <InputField label={t('profile.lastName')} name="lastName" value={formData.lastName} onChange={handleInputChange} />
                         </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField label={t('profile.dob')} name="dob" type="date" value={formData.dob} onChange={handleInputChange} />
                            <InputField label={t('profile.timezone')} name="timezone" value={formData.timezone} onChange={handleInputChange} disabled />
                         </div>
                         <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">Country</label>
                            <CountrySelect
                                selectedCountry={formData.country}
                                onSelectCountry={(code) => setFormData(prev => ({...prev, country: code}))}
                            />
                         </div>
                         <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">{t('profile.about')}</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows={4}
                                className="w-full bg-primary border border-border-color rounded-md py-2 px-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                            />
                         </div>
                    </div>

                    {/* AI Memory Section */}
                    <div>
                        <h3 className="text-lg font-semibold border-t border-border-color pt-4">{t('profile.memory.title')}</h3>
                        <p className="text-sm text-text-secondary mb-3">{t('profile.memory.description')}</p>
                        <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                             {Object.entries(memory).length > 0 ? Object.entries(memory).map(([key, value]) => (
                                <div key={key} className="bg-primary p-3 rounded-lg border border-border-color flex justify-between items-center">
                                    <div>
                                        <p className="font-mono text-sm text-accent">{key}</p>
                                        <p className="text-text-primary mt-1">{JSON.stringify(value)}</p>
                                    </div>
                                    <button onClick={() => clearMemoryItem(key)} className="p-2 rounded-full text-text-secondary hover:text-red-500">
                                        <Icon name="delete" className="h-4 w-4" />
                                    </button>
                                </div>
                            )) : (
                                <p className="text-center text-text-secondary py-4">{t('profile.memory.empty')}</p>
                            )}
                        </div>
                        {Object.keys(memory).length > 0 && (
                             <button onClick={clearAllMemory} className="text-red-500 hover:text-red-400 text-sm mt-3">
                                {t('profile.memory.clearAll')}
                            </button>
                        )}
                    </div>
                     {error && <p className="text-red-500 text-sm text-center bg-red-500/10 p-2 rounded-md">{error}</p>}
                </div>
                <div className="p-4 border-t border-border-color flex justify-end space-x-2">
                     <button onClick={onClose} className="px-4 py-2 rounded-md border border-border-color text-text-primary hover:bg-border-color">
                        {t('common.cancel')}
                    </button>
                    <button onClick={handleSave} disabled={loading} className="px-4 py-2 rounded-md bg-accent text-white hover:bg-accent-hover disabled:bg-border-color flex items-center justify-center min-w-[120px]">
                        {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : `${t('common.save')} ${t('nav.profile')}`}
                    </button>
                </div>
            </div>
        </div>
    );
};

const InputField = ({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) => (
    <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">{label}</label>
        <input 
            {...props}
            className="w-full bg-primary border border-border-color rounded-md py-2 px-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
        />
    </div>
);

export default ProfileModal;
