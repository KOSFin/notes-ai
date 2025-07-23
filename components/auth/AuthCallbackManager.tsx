import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { EmailOtpType } from '@supabase/supabase-js';
import Icon from '../Icon';
import confetti from 'canvas-confetti';

type View = 'loading' | 'passwordForm' | 'success' | 'error';

const AuthCallbackManager: React.FC = () => {
    const [view, setView] = useState<View>('loading');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        if (password.length < 12) {
            setError("Password must be at least 12 characters long.");
            return;
        }
        setIsUpdating(true);
        setError('');
        const { error } = await supabase.auth.updateUser({ password });
        setIsUpdating(false);

        if (error) {
            setError(error.message);
        } else {
            setMessage("Your password has been successfully updated!");
            setView('success');
            triggerConfetti();
        }
    };
    
    const triggerConfetti = useCallback(() => {
         confetti({
            particleCount: 150,
            spread: 90,
            origin: { y: 0.6 }
        });
    }, []);

    useEffect(() => {
        const params = new URLSearchParams(window.location.hash.split('?')[1]);
        const token_hash = params.get('token');
        const type = params.get('type') as EmailOtpType | null;

        if (!token_hash || !type) {
            setError("Invalid verification link. Missing token or type.");
            setView('error');
            return;
        }

        const verify = async () => {
            const { data, error } = await supabase.auth.verifyOtp({ token_hash, type });
            if (error) {
                setError(error.message);
                setView('error');
            } else if (data.session) {
                if (type === 'recovery') {
                    setView('passwordForm');
                } else {
                    setMessage("Your email has been successfully verified!");
                    setView('success');
                    triggerConfetti();
                }
            } else {
                setError("Verification failed. The link may be invalid or expired.");
                setView('error');
            }
        };

        verify();
    }, [triggerConfetti]);
    
    const goToLogin = () => {
        window.location.hash = '';
        window.location.reload(); // Easiest way to re-trigger the auth flow
    };
    
    const renderContent = () => {
        switch(view) {
            case 'loading':
                return (
                    <>
                        <Spinner />
                        <h2 className="text-2xl font-bold text-text-primary mt-4">Verifying...</h2>
                        <p className="text-text-secondary">Please wait a moment.</p>
                    </>
                );
            case 'success':
                return (
                     <>
                        <Icon name="check" className="h-16 w-16 text-green-500" />
                        <h2 className="text-2xl font-bold text-text-primary mt-4">Success!</h2>
                        <p className="text-text-secondary">{message}</p>
                        <button onClick={goToLogin} className="mt-6 w-full max-w-xs px-4 py-2 rounded-md bg-accent text-white font-semibold hover:bg-accent-hover">
                            Go to Login
                        </button>
                    </>
                );
             case 'error':
                 return (
                     <>
                        <Icon name="close" className="h-16 w-16 text-red-500" />
                        <h2 className="text-2xl font-bold text-text-primary mt-4">An Error Occurred</h2>
                        <p className="text-text-secondary bg-primary p-2 rounded-md font-mono text-xs">{error}</p>
                        <button onClick={goToLogin} className="mt-6 w-full max-w-xs px-4 py-2 rounded-md bg-accent text-white font-semibold hover:bg-accent-hover">
                            Back to Login
                        </button>
                    </>
                 );
            case 'passwordForm':
                 return (
                     <div className="w-full">
                        <Icon name="lock" className="h-12 w-12 text-accent" />
                        <h2 className="text-2xl font-bold text-text-primary mt-4 mb-2">Create New Password</h2>
                        <p className="text-text-secondary mb-6 text-sm">Please enter a new password for your account.</p>
                        {error && <p className="bg-red-500/10 text-red-500 text-sm text-center p-3 rounded-md mb-4">{error}</p>}
                        <form onSubmit={handlePasswordUpdate} className="space-y-4 text-left w-full">
                            <InputField type="password" placeholder="New Password" value={password} onChange={e => setPassword(e.target.value)} required />
                            <InputField type="password" placeholder="Confirm New Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
                            <button type="submit" disabled={isUpdating} className="w-full mt-2 px-4 py-3 rounded-md bg-accent text-white font-semibold hover:bg-accent-hover disabled:bg-border-color flex justify-center">
                                {isUpdating ? <Spinner /> : 'Update Password'}
                            </button>
                        </form>
                    </div>
                 );
        }
    }

    return (
        <div className="fixed inset-0 bg-primary flex items-center justify-center p-4">
            <div className="bg-secondary rounded-lg shadow-2xl p-8 text-center animate-fade-in w-full max-w-md flex flex-col items-center">
                {renderContent()}
            </div>
        </div>
    );
};


const InputField = (props: React.InputHTMLAttributes<HTMLInputElement>) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const isPassword = props.type === 'password';
    const currentType = isPassword ? (isPasswordVisible ? 'text' : 'password') : props.type;

    return (
        <div className="relative">
            <input
                {...props}
                type={currentType}
                className={`w-full bg-primary border border-border-color rounded-md py-2.5 px-4 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent ${isPassword ? 'pr-10' : ''}`}
            />
            {isPassword && (
                <button
                    type="button"
                    onClick={() => setIsPasswordVisible(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-text-secondary hover:text-text-primary focus:outline-none"
                    aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
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

export default AuthCallbackManager;