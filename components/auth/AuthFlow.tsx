

import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import { languages, t, setLanguage, getLocale } from '../../localization';
import { countries } from '../../lib/countries';
import Icon from '../Icon';
import CountrySelect from './CountrySelect';
import PrivacyModal from './PrivacyModal';
import TermsModal from './TermsModal';

type AuthStep = 'intro' | 'language' | 'auth' | 'verifyEmail';
type AuthMode = 'login' | 'register';
type AuthView = 'auth' | 'forgotPassword' | 'forgotPasswordSuccess';

const AuthFlow: React.FC = () => {
    const [step, setStep] = useState<AuthStep>('intro');
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const [isPrivacyModalOpen, setPrivacyModalOpen] = useState(false);
    const [isTermsModalOpen, setTermsModalOpen] = useState(false);

    useEffect(() => {
        // Theme is set in App.tsx now
    }, []);

    const handleLanguageAndThemeSelect = (theme: 'light' | 'dark', lang: 'en' | 'ru') => {
        localStorage.setItem('nexus-initial-theme', theme);
        localStorage.setItem('nexus-initial-language', lang);
        setStep('auth');
    };

    const renderStep = () => {
        switch (step) {
            case 'intro':
                return <IntroStep onContinue={() => setStep('language')} />;
            case 'language':
                return <LanguageAndThemeStep onContinue={handleLanguageAndThemeSelect} />;
            case 'auth':
                return (
                    <AuthStepComponent
                        onShowPrivacy={() => setPrivacyModalOpen(true)}
                        onShowTerms={() => setTermsModalOpen(true)}
                    />
                );
        }
    };

    return (
        <div className="fixed inset-0 bg-primary flex items-center justify-center p-4">
             {isPrivacyModalOpen && <PrivacyModal onClose={() => setPrivacyModalOpen(false)} />}
             {isTermsModalOpen && <TermsModal onClose={() => setTermsModalOpen(false)} />}
            <div className="w-full max-w-md transition-all duration-500 min-h-[550px] flex items-center">
                <div className="w-full">
                    {renderStep()}
                </div>
            </div>
        </div>
    );
};

const LanguageAndThemeStep = ({ onContinue }: { onContinue: (theme: 'light' | 'dark', lang: 'en' | 'ru') => void }) => {
    const [selectedLang, setSelectedLang] = useState<'en' | 'ru'>(() => {
        const lang = navigator.language.startsWith('ru') ? 'ru' : 'en';
        setLanguage(lang); // Set language on initial component mount
        return lang;
    });
    const [selectedTheme, setSelectedTheme] = useState<'light' | 'dark'>('dark');

    const handleLangClick = (lang: 'en' | 'ru') => {
        setSelectedLang(lang);
        setLanguage(lang); // Update language immediately on click
    };

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', selectedTheme);
        document.documentElement.setAttribute('data-contrast', 'medium');
    }, [selectedTheme]);

    return (
        <div className="bg-secondary rounded-lg shadow-2xl p-8 text-center animate-fade-in">
            <h2 className="text-2xl font-bold text-text-primary mb-2">{t('auth.language.title')}</h2>
            <p className="text-text-secondary mb-6">{t('auth.language.description')}</p>
            <div className="flex gap-4 mb-8">
                {Object.entries(languages).map(([code, { name, flag }]) => (
                    <button
                        key={code}
                        onClick={() => handleLangClick(code as 'en' | 'ru')}
                        className={`flex-1 text-lg flex flex-col items-center justify-center gap-2 p-4 rounded-md border-2 transition-colors ${selectedLang === code ? 'border-accent bg-primary' : 'border-transparent bg-primary/50 hover:bg-primary'}`}
                    >
                        <span className="text-4xl">{flag}</span>
                        <span className="font-semibold">{name}</span>
                    </button>
                ))}
            </div>

            <h2 className="text-2xl font-bold text-text-primary mb-2">{t('auth.theme.title')}</h2>
            <p className="text-text-secondary mb-6">{t('auth.theme.description')}</p>
            <div className="flex gap-4 mb-8">
                <ThemePreview name={t('settings.personalization.theme.light')} theme="light" selected={selectedTheme === 'light'} onClick={() => setSelectedTheme('light')} />
                <ThemePreview name={t('settings.personalization.theme.dark')} theme="dark" selected={selectedTheme === 'dark'} onClick={() => setSelectedTheme('dark')} />
            </div>

            <button
                onClick={() => onContinue(selectedTheme, selectedLang)}
                className="w-full px-4 py-3 rounded-md bg-accent text-white font-semibold hover:bg-accent-hover transition-colors"
            >
                {t('onboarding.next')}
            </button>
        </div>
    );
};


const ThemePreview = ({ name, theme, selected, onClick }: { name: string, theme: 'light' | 'dark', selected: boolean, onClick: () => void }) => {
    const isLight = theme === 'light';
    return (
        <div onClick={onClick} className={`flex-1 cursor-pointer rounded-lg border-2 p-2 transition-colors ${selected ? 'border-accent' : 'border-transparent bg-primary/50 hover:bg-primary'}`}>
            <div className={`rounded-md p-4 transition-colors ${isLight ? 'bg-gray-100' : 'bg-gray-900'}`}>
                <div className={`h-4 rounded mb-2 ${isLight ? 'bg-gray-300' : 'bg-gray-700'}`}></div>
                <div className={`h-8 rounded ${isLight ? 'bg-white' : 'bg-black'}`}></div>
            </div>
            <p className="text-text-secondary font-semibold mt-2">{name}</p>
        </div>
    );
};


const IntroStep = ({ onContinue }: { onContinue: () => void }) => (
     <div className="bg-secondary rounded-lg shadow-2xl p-8 text-center animate-fade-in">
        <Icon name="logo" className="h-12 w-12 text-accent mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-text-primary mb-2">{t('onboarding.welcome.title')}</h2>
        <p className="text-text-secondary mb-6">{t('onboarding.welcome.description')}</p>
        <button
            onClick={onContinue}
            className="w-full px-4 py-3 rounded-md bg-accent text-white font-semibold hover:bg-accent-hover transition-colors"
        >
            {t('auth.getStarted')}
        </button>
    </div>
);

const AuthStepComponent = ({ onShowPrivacy, onShowTerms }: { onShowPrivacy: () => void; onShowTerms: () => void; }) => {
    const [mode, setMode] = useState<AuthMode>('login');
    const [view, setView] = useState<AuthView>('auth');
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [dob, setDob] = useState('');
    const [country, setCountry] = useState<string | undefined>(undefined);
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [agreedToTerms, setAgreedToTerms] = useState(false);

    const [isPasswordFocused, setIsPasswordFocused] = useState(false);

    useEffect(() => {
        // Auto-detect country
        if (!country) {
            fetch('https://ipapi.co/json/')
                .then(res => res.json())
                .then(data => {
                    if (data && data.country_code) {
                        setCountry(data.country_code);
                    }
                })
                .catch(console.error);
        }
    }, [country]);
    
    const handleAuthSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (mode === 'register') {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        first_name: firstName,
                        last_name: lastName,
                        dob,
                        country,
                        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                    }
                }
            });

            if (error) setError(error.message);
            else setView('forgotPasswordSuccess'); // Re-use this view for "check your email"
        } else { // Login
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) setError(error.message);
        }
        setLoading(false);
    };

    const handlePasswordReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) setError(error.message);
        else setView('forgotPasswordSuccess');
        setLoading(false);
    };

    const handleResendConfirmation = async () => {
        setLoading(true);
        setError(null);
        const { error } = await supabase.auth.resend({ type: 'signup', email });
        if (error) setError(error.message);
        else setError('A new confirmation email has been sent.'); // Use error state for feedback
        setLoading(false);
    };

    const isRegisterDisabled = !firstName || !dob || !country || !agreedToTerms;
    const switchMode = () => {
        setMode(mode === 'login' ? 'register' : 'login');
        setError(null);
        setPassword('');
    };

    if (view === 'forgotPasswordSuccess') {
        return (
            <div className="bg-secondary rounded-lg shadow-2xl p-8 text-center animate-fade-in">
                <Icon name="send" className="h-12 w-12 text-accent mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-text-primary mb-2">{t('auth.verify.title')}</h2>
                <p className="text-text-secondary">
                    {mode === 'register' ? t('auth.verify.message') : 'We have sent password reset instructions to'} <strong className="text-text-primary">{email}</strong>.
                </p>
                <button onClick={() => {setView('auth'); setMode('login')}} className="mt-6 w-full px-4 py-2 rounded-md bg-primary text-text-primary font-semibold hover:bg-border-color">
                    Back to Login
                </button>
            </div>
        );
    }
    
    if (view === 'forgotPassword') {
        return (
             <div className="bg-secondary rounded-lg shadow-2xl p-8 animate-fade-in">
                <h2 className="text-2xl font-bold text-text-primary text-center mb-2">Reset Password</h2>
                <p className="text-text-secondary text-center mb-6">Enter your email to receive a password reset link.</p>
                {error && <p className="bg-red-500/10 text-red-500 text-sm text-center p-3 rounded-md mb-4">{error}</p>}
                <form onSubmit={handlePasswordReset} className="space-y-4">
                     <InputField type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required icon="user" />
                     <button type="submit" disabled={loading} className="w-full mt-2 px-4 py-3 rounded-md bg-accent text-white font-semibold hover:bg-accent-hover disabled:bg-border-color flex justify-center">
                        {loading ? <Spinner /> : 'Send Reset Link'}
                    </button>
                    <button type="button" onClick={() => setView('auth')} className="w-full text-center text-sm text-accent font-semibold hover:underline">
                        Back to Login
                    </button>
                </form>
             </div>
        )
    }

    return (
        <div className="bg-secondary rounded-lg shadow-2xl animate-fade-in">
            <div className="p-8">
                <Icon name="logo" className="h-10 w-10 text-accent mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-text-primary text-center mb-6">{mode === 'login' ? t('auth.login.title') : t('auth.register.title')}</h2>
                
                {error && (
                    <div className="bg-red-500/10 text-red-500 text-sm text-center p-3 rounded-md mb-4">
                        {error}
                        {error.includes('Email not confirmed') && (
                            <button onClick={handleResendConfirmation} disabled={loading} className="font-bold underline ml-2 hover:text-red-400">
                                Resend confirmation
                            </button>
                        )}
                    </div>
                )}
                
                <form onSubmit={handleAuthSubmit} className="space-y-4">
                    <InputField type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required icon="user" />
                    
                    <div className={`transition-all duration-500 ease-in-out overflow-hidden ${mode === 'register' ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                        <div className="space-y-4 pt-1">
                            <div className="grid grid-cols-2 gap-4">
                                <InputField placeholder={t('profile.firstName')} value={firstName} onChange={e => setFirstName(e.target.value)} />
                                <InputField placeholder={t('profile.lastName')} value={lastName} onChange={e => setLastName(e.target.value)} />
                            </div>
                            <InputField type="date" value={dob} onChange={e => setDob(e.target.value)} />
                            <CountrySelect selectedCountry={country} onSelectCountry={setCountry} />
                        </div>
                    </div>

                    <div className="relative">
                        {mode === 'register' && isPasswordFocused && <PasswordStrengthMeter password={password} />}
                        <InputField type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required icon="lock" onFocus={() => setIsPasswordFocused(true)} onBlur={() => setIsPasswordFocused(false)} />
                    </div>
                    
                    {mode === 'login' && (
                        <div className="text-right">
                             <button type="button" onClick={() => setView('forgotPassword')} className="text-xs text-accent font-semibold hover:underline">
                                Forgot Password?
                            </button>
                        </div>
                    )}
                    
                    {mode === 'register' && (
                        <div className="pt-2">
                             <label className="flex items-start space-x-3 cursor-pointer text-xs text-text-secondary">
                                <input type="checkbox" checked={agreedToTerms} onChange={e => setAgreedToTerms(e.target.checked)} className="mt-0.5 h-4 w-4 rounded bg-primary border-border-color text-accent focus:ring-accent flex-shrink-0" />
                                <span>
                                    {t('auth.agree.prefix')} <button type="button" onClick={onShowTerms} className="text-accent hover:underline font-semibold">{t('auth.agree.terms')}</button> {t('auth.agree.and')} <button type="button" onClick={onShowPrivacy} className="text-accent hover:underline font-semibold">{t('auth.agree.policy')}</button>.
                                </span>
                            </label>
                        </div>
                    )}

                    <button type="submit" disabled={loading || (mode === 'register' && isRegisterDisabled)} className="w-full mt-2 px-4 py-3 rounded-md bg-accent text-white font-semibold hover:bg-accent-hover transition-colors disabled:bg-border-color disabled:cursor-not-allowed flex items-center justify-center">
                        {loading ? <Spinner /> : (mode === 'login' ? t('auth.login.action') : t('auth.register.action'))}
                    </button>
                </form>
            </div>
            <div className="bg-primary rounded-b-lg p-4 text-center">
                 <button onClick={switchMode} className="text-sm text-accent font-semibold hover:underline">
                    {mode === 'login' ? t('auth.login.switch') : t('auth.register.switch')}
                </button>
            </div>
        </div>
    );
};

const PasswordRequirement = ({ met, text }: { met: boolean; text: string }) => (
    <div className={`flex items-center text-xs transition-colors ${met ? 'text-green-400' : 'text-text-secondary'}`}>
        <Icon name={met ? "check" : "close"} className={`h-4 w-4 mr-2 flex-shrink-0 ${met ? 'text-green-500' : 'text-red-500'}`} />
        <span>{text}</span>
    </div>
);

const estimateCrackTime = (password: string): string => {
    if (!password) return '...';

    let pool = 0;
    if (/[a-z]/.test(password)) pool += 26;
    if (/[A-Z]/.test(password)) pool += 26;
    if (/\d/.test(password)) pool += 10;
    if (/[^a-zA-Z\d]/.test(password)) pool += 32;

    if (pool === 0) return '...';

    const combinations = Math.pow(pool, password.length);
    const guessesPerSecond = 1e10; // 10 billion guesses/sec
    let seconds = combinations / guessesPerSecond;
    
    if (seconds < 1) return t('auth.password.strength.crack.instantly');
    if (seconds < 60) return `${Math.ceil(seconds)} ${t('auth.password.strength.crack.seconds')}`;
    if (seconds < 3600) return `${Math.ceil(seconds / 60)} ${t('auth.password.strength.crack.minutes')}`;
    if (seconds < 86400) return `${Math.ceil(seconds / 3600)} ${t('auth.password.strength.crack.hours')}`;
    if (seconds < 2592000) return `${Math.ceil(seconds / 86400)} ${t('auth.password.strength.crack.days')}`;
    if (seconds < 31536000) return `${Math.ceil(seconds / 2592000)} ${t('auth.password.strength.crack.months')}`;
    
    const years = seconds / 31536000;
    if (years < 1000) return `${Math.ceil(years)} ${t('auth.password.strength.crack.years')}`;
    if (years < 1000000) return `${Math.ceil(years / 1000)} ${t('auth.password.strength.crack.thousandYears')}`;
    
    return t('auth.password.strength.crack.centuries');
};


const PasswordStrengthMeter = ({ password }: { password: string }) => {
    const checks = useMemo(() => {
        const hasLowercase = /[a-z]/.test(password);
        const hasUppercase = /[A-Z]/.test(password);
        const hasSpecial = /[^a-zA-Z0-9]/.test(password);
        const hasNonEnglish = /[^a-zA-Z0-9!"#$%&'()*+,-./:;<=>?@[\\\]^_`{|}~ \t\n\r]/.test(password);

        return {
            length: password.length >= 12,
            case: hasLowercase && hasUppercase,
            special: hasSpecial,
            englishOnly: !hasNonEnglish,
        };
    }, [password]);

    const crackTime = useMemo(() => estimateCrackTime(password), [password]);

    return (
        <div className="absolute bottom-full left-0 w-full mb-2 p-4 bg-primary border border-border-color rounded-lg shadow-lg z-10 animate-fade-in-up">
            <div className="space-y-2">
                <PasswordRequirement met={checks.length} text={t('auth.password.strength.length')} />
                <PasswordRequirement met={checks.case} text={t('auth.password.strength.case')} />
                <PasswordRequirement met={checks.special} text={t('auth.password.strength.special')} />
                <PasswordRequirement met={checks.englishOnly} text={t('auth.password.strength.englishOnly')} />
            </div>
            <div className="mt-3 pt-3 border-t border-border-color/50 text-xs text-text-secondary">
                <p><strong>{t('auth.password.strength.crackTime')}</strong> <span className="font-mono text-accent">{crackTime}</span></p>
            </div>
        </div>
    );
};

const InputField = ({ icon, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { icon?: string }) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const isPassword = props.type === 'password';
    const currentType = isPassword ? (isPasswordVisible ? 'text' : 'password') : props.type;

    return (
        <div className="relative">
            {icon && <Icon name={icon} className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary" />}
            <input
                {...props}
                type={currentType}
                className={`w-full bg-primary border border-border-color rounded-md py-2.5 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent ${icon ? 'pl-10' : 'px-4'} ${isPassword ? 'pr-10' : 'pr-4'}`}
            />
            {isPassword && (
                <button
                    type="button"
                    onClick={() => setIsPasswordVisible(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-text-secondary hover:text-text-primary focus:outline-none"
                    aria-label={isPasswordVisible ? t('auth.password.hide') : t('auth.password.show')}
                >
                    <Icon name={isPasswordVisible ? 'eye-slash' : 'eye'} className="h-5 w-5" />
                </button>
            )}
        </div>
    );
};

const Spinner = () => (
    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
);

export default AuthFlow;