


import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Icon from './Icon';
import { t } from '../localization';
import confetti from 'canvas-confetti';


interface OnboardingModalProps {
    isOpen: boolean;
    onFinish: () => void;
    isMobile: boolean;
}

const ProgressBar = ({ step, totalSteps }: { step: number; totalSteps: number }) => (
    <div className="w-full bg-primary rounded-full h-1.5">
        <div
            className="bg-accent h-1.5 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
        ></div>
    </div>
);

const AnimatedPrompt = ({ prompt, onComplete }: { prompt: string; onComplete: () => void }) => {
    const [text, setText] = useState('');

    useEffect(() => {
        setText(''); // Reset on prompt change
        let i = 0;
        let timeoutId: number;

        const type = () => {
            if (i < prompt.length) {
                setText(prev => prev + prompt.charAt(i));
                i++;
                timeoutId = window.setTimeout(type, 35); // Use window.setTimeout for clarity
            } else {
                onComplete();
            }
        };

        const startTimeoutId = window.setTimeout(type, 500);

        return () => {
            clearTimeout(startTimeoutId);
            clearTimeout(timeoutId);
        };
    }, [prompt, onComplete]);


    return (
        <div className="bg-primary p-3 rounded-lg border border-border-color">
            <p className="font-mono text-sm text-text-primary min-h-[4.5rem] md:min-h-[3rem] whitespace-pre-wrap">{text}<span className="animate-pulse">|</span></p>
        </div>
    );
};

// --- Onboarding Steps ---

const WelcomeStep = () => (
    <div className="text-center">
        <Icon name="logo" className="h-20 w-20 text-accent mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-text-primary mb-3">{t('onboarding.welcome.title')}</h2>
        <p className="text-text-secondary mb-8 max-w-sm mx-auto">{t('onboarding.welcome.description')}</p>
    </div>
);

const DemoStep1 = ({ onAnimationComplete }: { onAnimationComplete: () => void }) => {
    const [promptDone, setPromptDone] = useState(false);
    const [noteVisible, setNoteVisible] = useState(false);

    const handlePromptComplete = useCallback(() => {
        setPromptDone(true);
    }, []);

    useEffect(() => {
        if (promptDone) {
            const timer = setTimeout(() => setNoteVisible(true), 500);
            return () => clearTimeout(timer);
        }
    }, [promptDone]);

    useEffect(() => {
        if (noteVisible) {
            const timer = setTimeout(onAnimationComplete, 1000);
            return () => clearTimeout(timer);
        }
    }, [noteVisible, onAnimationComplete]);

    return (
        <div className="text-center">
            <Icon name="chat" className="h-12 w-12 text-accent mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-text-primary mb-3">{t('onboarding.demo1.title')}</h2>
            <p className="text-text-secondary mb-6">{t('onboarding.demo1.description')}</p>
            <div className="space-y-4">
                <AnimatedPrompt prompt={t('onboarding.demo1.prompt')} onComplete={handlePromptComplete} />
                {promptDone && (
                    <div className={`p-4 bg-secondary rounded-lg text-left transition-all duration-500 ease-out ${noteVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                        <h4 className="font-bold text-text-primary">Project Ideas</h4>
                        <ul className="list-disc list-inside text-sm text-text-secondary mt-1">
                            <li>Integrate new AI features</li>
                            <li>Redesign user dashboard</li>
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

const DemoStep2 = ({ onAnimationComplete }: { onAnimationComplete: () => void }) => {
    const [promptDone, setPromptDone] = useState(false);
    const [reminderVisible, setReminderVisible] = useState(false);

    const handlePromptComplete = useCallback(() => {
        setPromptDone(true);
    }, []);

    useEffect(() => {
        if (promptDone) {
            const timer = setTimeout(() => setReminderVisible(true), 500);
            return () => clearTimeout(timer);
        }
    }, [promptDone]);

     useEffect(() => {
        if (reminderVisible) {
            const timer = setTimeout(onAnimationComplete, 1000);
            return () => clearTimeout(timer);
        }
    }, [reminderVisible, onAnimationComplete]);

    return (
        <div className="text-center">
            <Icon name="lightbulb" className="h-12 w-12 text-accent mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-text-primary mb-3">{t('onboarding.demo2.title')}</h2>
            <p className="text-text-secondary mb-6">{t('onboarding.demo2.description')}</p>
            <div className="space-y-4">
                <AnimatedPrompt prompt={t('onboarding.demo2.prompt')} onComplete={handlePromptComplete} />
                {promptDone && (
                    <div className={`p-3 bg-secondary rounded-lg border-l-4 border-accent transition-all duration-500 ease-out ${reminderVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                        <div className="flex items-center justify-between">
                            <p className="font-semibold text-text-primary">Call John</p>
                            <p className="text-sm text-text-secondary">Tomorrow, 2:00 PM</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const DemoNotesStep = ({ onAnimationComplete }: { onAnimationComplete: () => void }) => {
    useEffect(() => {
        const timer = setTimeout(onAnimationComplete, 1500);
        return () => clearTimeout(timer);
    }, [onAnimationComplete]);

    return (
        <div className="text-center">
            <Icon name="notes" className="h-12 w-12 text-accent mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-text-primary mb-3">{t('onboarding.demo_notes.title')}</h2>
            <p className="text-text-secondary mb-6">{t('onboarding.demo_notes.description')}</p>
            <div className="p-4 bg-secondary rounded-lg text-left relative overflow-hidden animate-pop-in">
                <img src="/assets/images/preset_cosmos.webp" className="absolute inset-0 w-full h-full object-cover" alt="Cosmos background"/>
                <div className="absolute inset-0 bg-primary/70"/>
                <div className="relative z-10">
                    <h1 className="text-xl font-bold text-white">My Epic Space Adventure</h1>
                    <ul className="list-disc list-inside text-sm text-gray-300 mt-1">
                        <li>Explore the <strong>Orion Nebula</strong></li>
                        <li>Find a cool alien</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

const DemoCalendarStep = ({ onAnimationComplete }: { onAnimationComplete: () => void }) => {
    useEffect(() => {
        const timer = setTimeout(onAnimationComplete, 1500);
        return () => clearTimeout(timer);
    }, [onAnimationComplete]);

    return (
        <div className="text-center">
            <Icon name="calendar" className="h-12 w-12 text-accent mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-text-primary mb-3">{t('onboarding.demo_calendar.title')}</h2>
            <p className="text-text-secondary mb-6">{t('onboarding.demo_calendar.description')}</p>
            <div className="grid grid-cols-7 gap-1 bg-primary p-2 rounded-lg text-xs animate-pop-in">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => <div key={i} className="text-center text-text-secondary font-bold">{d}</div>)}
                {Array.from({ length: 35 }).map((_, i) => {
                    const isInRange = i >= 9 && i <= 11;
                    return (
                        <div key={i} className={`h-8 rounded flex items-center justify-center ${isInRange ? 'bg-accent/50' : 'bg-secondary'}`}>
                           {i > 3 ? i-3 : ''}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const DemoCustomizeStep = ({ onAnimationComplete }: { onAnimationComplete: () => void }) => {
    useEffect(() => {
        const timer = setTimeout(onAnimationComplete, 1500);
        return () => clearTimeout(timer);
    }, [onAnimationComplete]);
    
    return (
        <div className="text-center">
            <Icon name="cog" className="h-12 w-12 text-accent mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-text-primary mb-3">{t('onboarding.demo_customize.title')}</h2>
            <p className="text-text-secondary mb-6">{t('onboarding.demo_customize.description')}</p>
            <div className="p-4 bg-primary rounded-lg space-y-3 animate-pop-in">
                <div className="flex justify-between items-center bg-secondary p-3 rounded-lg">
                    <span className="font-semibold">Theme</span>
                    <div className="flex gap-2">
                        <div className="w-16 h-8 rounded-md bg-gray-200"></div>
                        <div className="w-16 h-8 rounded-md bg-gray-800 ring-2 ring-accent"></div>
                    </div>
                </div>
                <div className="flex justify-between items-center bg-secondary p-3 rounded-lg">
                    <span className="font-semibold">Accent Color</span>
                    <div className="flex gap-2">
                        <div className="w-8 h-8 rounded-full bg-red-500"></div>
                        <div className="w-8 h-8 rounded-full bg-green-500"></div>
                        <div className="w-8 h-8 rounded-full bg-blue-500 ring-2 ring-accent"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};


const PermissionsStep = () => {
    const [permission, setPermission] = useState(Notification.permission);
    const [isRequesting, setIsRequesting] = useState(false);

    const requestNotifications = useCallback(async () => {
        if (permission !== 'default' || isRequesting) return;
        setIsRequesting(true);
        const result = await Notification.requestPermission();
        setPermission(result);
        setIsRequesting(false);
    }, [permission, isRequesting]);

    return (
        <div className="text-center">
            <Icon name="bell" className="h-12 w-12 text-accent mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-text-primary mb-3">{t('onboarding.permissions.title')}</h2>
            <p className="text-text-secondary mb-6">{t('onboarding.permissions.notificationsDescription')}</p>

            {permission === 'default' && (
                <button 
                    onClick={requestNotifications} 
                    disabled={isRequesting}
                    className="w-full max-w-xs mx-auto mb-4 px-4 py-3 rounded-md bg-secondary text-text-primary font-semibold hover:bg-border-color transition-colors"
                >
                    {t('onboarding.permissions.grant')}
                </button>
            )}
            
            {(permission === 'granted') && (
                 <p className="text-lg font-semibold text-green-500 mb-4 animate-pop-in">{t('onboarding.permissions.granted')}</p>
            )}
            {(permission === 'denied') && (
                 <p className="text-lg font-semibold text-red-500 mb-4 animate-pop-in">{t('onboarding.permissions.denied')}</p>
            )}
        </div>
    );
};

const FinishStep = () => {
    useEffect(() => {
        confetti({
            particleCount: 150,
            spread: 90,
            origin: { y: 0.6 }
        });
    }, []);

    return (
        <div className="text-center">
             <div className="relative inline-block">
                <Icon name="check" className="h-20 w-20 text-green-500 mx-auto animate-pop-in" />
            </div>
            <h2 className="text-3xl font-bold text-text-primary mb-3 mt-4">{t('onboarding.finish.title')}</h2>
            <p className="text-text-secondary mb-8">{t('onboarding.finish.description')}</p>
        </div>
    );
};


const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onFinish, isMobile }) => {
    const [step, setStep] = useState(0);
    const [animation, setAnimation] = useState('animate-fade-in');
    const [isNextEnabled, setIsNextEnabled] = useState(false);

    const handleAnimationDone = useCallback(() => setIsNextEnabled(true), []);

    const handleNextStep = useCallback(() => {
        if (step < stepComponents.length - 1) {
            setAnimation('animate-slide-out-left');
            setTimeout(() => {
                setStep(s => s + 1);
                setIsNextEnabled(false);
                setAnimation('animate-slide-in-right');
            }, 500);
        } else {
            onFinish();
        }
    }, [step, onFinish]);

    const stepComponents = useMemo(() => [
        <WelcomeStep />,
        <DemoStep1 onAnimationComplete={handleAnimationDone} />,
        <DemoStep2 onAnimationComplete={handleAnimationDone} />,
        <DemoNotesStep onAnimationComplete={handleAnimationDone} />,
        <DemoCalendarStep onAnimationComplete={handleAnimationDone} />,
        <DemoCustomizeStep onAnimationComplete={handleAnimationDone} />,
        <PermissionsStep />,
        <FinishStep />
    ], [handleAnimationDone]);
    
    const totalSteps = stepComponents.length;

    const handlePrevStep = useCallback(() => {
        if (step > 0) {
            setAnimation('animate-slide-out-right');
            setTimeout(() => {
                setStep(s => s - 1);
                setIsNextEnabled(true);
                setAnimation('animate-slide-in-left');
            }, 500);
        }
    }, [step]);


    useEffect(() => {
        if (step === 0) { // Welcome step
            setIsNextEnabled(true);
        }
    }, [step]);

    if (!isOpen) return null;

    const modalClasses = isMobile
        ? "fixed inset-0 bg-secondary flex flex-col justify-between"
        : "bg-secondary shadow-2xl rounded-lg w-full max-w-xl mx-auto flex flex-col";

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4 animate-fade-in">
            <div className={modalClasses}>
                <div className="p-4 text-right h-12">
                     {step < totalSteps - 1 && (
                         <button onClick={onFinish} className="text-sm text-text-secondary hover:text-text-primary">{t('common.skip')}</button>
                    )}
                </div>
                
                <div className="flex-1 flex flex-col justify-center items-center px-8 overflow-hidden">
                    <div className={`${animation} w-full`}>
                        {stepComponents[step]}
                    </div>
                </div>
                
                <div className="p-8 space-y-4">
                     <ProgressBar step={step} totalSteps={totalSteps} />
                     <div className="flex justify-between items-center h-10">
                        {step > 0 && step < totalSteps -1 && (
                            <button onClick={handlePrevStep} className="px-4 py-2 rounded-md text-text-secondary font-semibold hover:bg-border-color transition-colors">
                                {t('onboarding.back')}
                            </button>
                        )}
                        
                        <button
                            onClick={step === totalSteps - 1 ? onFinish : handleNextStep}
                            disabled={step < totalSteps - 2 && !isNextEnabled}
                            className={`px-4 py-2 rounded-md bg-accent text-white font-semibold hover:bg-accent-hover transition-colors disabled:bg-border-color disabled:cursor-not-allowed ${step === 0 || step === totalSteps - 1 ? 'ml-auto' : ''}`}
                        >
                            {step === totalSteps - 1 ? t('onboarding.finish.button') : t('onboarding.next')}
                        </button>
                     </div>
                </div>
            </div>
        </div>
    );
};

export default OnboardingModal;