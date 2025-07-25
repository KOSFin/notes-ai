

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { GoogleGenAI, Chat } from '@google/genai';
import { Session } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';
import { ChatMessage, Note, AIMemory, ConfirmationRequest, ActiveTimer, SavedApp, RunningApp, Reminder, UserProfile, Event, CommandResult, FolderCustomization, ItemToEdit, AppSettings, NavItemId, NavItem, AICommand, SystemNotification } from './types';
import { getAIResponse } from './services/geminiService';
import { useLocalStorage } from './hooks/useLocalStorage';
import Header from './components/Header';
import ChatInterface from './components/ChatInterface';
import InputBar from './components/InputBar';
import SidePanel from './components/NotesModal';
import ProfileModal from './components/MemoryModal';
import ConfirmationModal from './components/ConfirmationModal';
import DeleteConfirmationModal from './components/DeleteConfirmationModal';
import DeleteDataConfirmationModal from './components/DeleteDataConfirmationModal';
import TimerWidget from './components/TimerWidget';
import { SYSTEM_PROMPT, ALL_NAV_ITEMS } from './constants';
import AuthFlow from './components/auth/AuthFlow';
import AppsModal from './components/AppsModal';
import ScriptContainer from './components/ScriptContainer';
import { Calendar } from './components/Calendar';
import Icon from './components/Icon';
import useWindowDimensions from './hooks/useWindowDimensions';
import PinnedChatPanel from './components/PinnedChatPanel';
import SettingsModal from './components/SettingsModal';
import BottomNavBar from './components/BottomNavBar';
import MoreMenu from './components/MoreMenu';
import SideNavBar from './components/SideNavBar';
import { t, setLanguage } from './localization';
import OnboardingModal from './components/OnboardingModal';
import AuthCallbackManager from './components/auth/AuthCallbackManager';
import NotificationsPanel from './components/NotificationsPanel';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';


const App: React.FC = () => {
    const [route, setRoute] = useState(window.location.hash);

    useEffect(() => {
        const handleHashChange = () => setRoute(window.location.hash);
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    // Set a default theme for auth pages to ensure consistent background
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', 'dark');
        document.documentElement.setAttribute('data-contrast', 'medium');
        document.documentElement.style.setProperty('--accent-h', '244');
        document.documentElement.style.setProperty('--accent-s', '79%');
        document.documentElement.style.setProperty('--accent-l', '58%');
    }, []);

    if (route.startsWith('#/verify')) {
        return <AuthCallbackManager />;
    }

    return <AppLoader />;
};

const AppLoader: React.FC = () => {
    const [session, setSession] = useState<Session | null>(null);
    const [isLoadingUser, setIsLoadingUser] = useState(true);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setIsLoadingUser(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            // This will handle password recovery session as well
            if (_event === 'PASSWORD_RECOVERY') {
                // We don't set the session here, instead we redirect to the reset page
                window.location.hash = '#/verify?type=recovery';
            } else {
                 setSession(session);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    if (isLoadingUser) {
        return (
            <div className="flex items-center justify-center h-screen bg-primary">
                <Icon name="logo" className="h-16 w-16 text-accent animate-pulse" />
            </div>
        );
    }

    if (!session) {
        return <AuthFlow />;
    }

    return <MainApp key={session.user.id} session={session} />;
};

const getDefaultSettings = (): AppSettings => {
    const initialTheme = (localStorage.getItem('nexus-initial-theme') as 'light' | 'dark' | null) || 'dark';
    if(localStorage.getItem('nexus-initial-theme')) {
        localStorage.removeItem('nexus-initial-theme');
    }
    
    const initialLanguage = (localStorage.getItem('nexus-initial-language') as 'en' | 'ru' | null) || (navigator.language.startsWith('ru') ? 'ru' : 'en');
    if (localStorage.getItem('nexus-initial-language')) {
        localStorage.removeItem('nexus-initial-language');
    }

    return {
        theme: initialTheme,
        themeContrast: 'medium',
        accentColor: '#4f46e5',
        combineLogoAndUIHide: false,
        calendar: {
            showWeekNumbers: false,
            showMonthNumber: false,
            startOfWeek: 1, // Monday
            highlightWeekends: true,
            weekendDays: [6, 0], // Saturday, Sunday
        },
        calendarBackground: {
            type: 'none',
            value: '',
            dim: 50,
        },
        customBackgrounds: [],
        chat: {
            behavior: 'overlay',
        },
        navigation: {
            desktopStyle: 'header',
            sideBarLabels: 'show',
            mobileStyle: 'bottom_bar',
            mobileBottomBarHeight: 'normal',
            desktopHeaderItems: ['notifications', 'profile', 'settings', 'apps', 'chat', 'calendar', 'dashboard'],
            mobileBottomBarItems: ['dashboard', 'calendar', 'apps', 'chat', 'notifications'],
        },
        language: {
            appLanguage: initialLanguage,
            voiceInputLanguage: initialLanguage === 'ru' ? 'ru-RU' : 'en-US',
        }
    };
};

const DataDeletionAnimation = () => {
    const icons = ['notes', 'calendar', 'bell', 'apps', 'user', 'cog'];
    return (
        <div className="fixed inset-0 bg-black/80 z-[1000] flex items-center justify-center overflow-hidden">
            <div className="relative w-full h-full">
                {icons.map((icon, i) => {
                     const startX = `${Math.random() * 80 + 10}vw`;
                     const startY = `${Math.random() * 80 + 10}vh`;
                    return (
                        <div
                            key={icon}
                            className="absolute text-accent animate-fly-to-trash"
                            style={{
                                top: 0,
                                left: 0,
                                '--start-x': startX,
                                '--start-y': startY,
                                animationDelay: `${i * 100}ms`
                            } as React.CSSProperties}
                        >
                            <Icon name={icon} className="h-12 w-12" />
                        </div>
                    );
                })}
            </div>
             <Icon name="delete" className="absolute bottom-[-100px] left-1/2 -translate-x-1/2 h-24 w-24 text-red-500/50" />
        </div>
    );
};

const MainApp: React.FC<{ session: Session }> = ({ session }) => {
    const userId = session.user.id;

    // Persisted states, now user-specific
    const [messages, setMessages] = useLocalStorage<ChatMessage[]>(`nexus-chat-history-${userId}`, []);
    const [notes, setNotes] = useLocalStorage<Note[]>(`nexus-notes-${userId}`, []);
    const [events, setEvents] = useLocalStorage<Event[]>(`nexus-events-${userId}`, []);
    const [userProfile, setUserProfile] = useLocalStorage<UserProfile | null>(`nexus-user-profile-${userId}`, null);
    const [aiMemory, setAiMemory] = useLocalStorage<AIMemory>(`nexus-ai-memory-${userId}`, {});
    const [savedApps, setSavedApps] = useLocalStorage<SavedApp[]>(`nexus-saved-apps-${userId}`, []);
    const [reminders, setReminders] = useLocalStorage<Reminder[]>(`nexus-reminders-${userId}`, []);
    const [folderCustomization, setFolderCustomization] = useLocalStorage<Record<string, FolderCustomization>>(`nexus-folder-customization-${userId}`, {});
    const [settings, setSettings] = useLocalStorage<AppSettings>(`nexus-settings-${userId}`, getDefaultSettings());
    const [notifications, setNotifications] = useLocalStorage<SystemNotification[]>(`nexus-notifications-${userId}`, []);
    
    // Set language immediately on render to avoid flicker in onboarding.
    setLanguage(settings.language.appLanguage);

    // Non-persisted states
    const [isLoading, setIsLoading] = useState(false);
    const [isUIVisible, setIsUIVisible] = useState(true);
    const [inputDraft, setInputDraft] = useLocalStorage<string>(`nexus-input-draft-${userId}`, '');
    const [isProfileModalOpen, setProfileModalOpen] = useState(false);
    const [isSettingsModalOpen, setSettingsModalOpen] = useState(false);
    const [isAppsModalOpen, setAppsModalOpen] = useState(false);
    const [isMoreMenuOpen, setMoreMenuOpen] = useState(false);
    const [moreMenuStyle, setMoreMenuStyle] = useState<React.CSSProperties>({});
    const [confirmationRequest, setConfirmationRequest] = useState<ConfirmationRequest | null>(null);
    const [itemToDelete, setItemToDelete] = useState<{ type: string, id: string, name: string } | null>(null);
    const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
    const [panelWasOpenBeforeFilter, setPanelWasOpenBeforeFilter] = useState(false);
    const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
    const [activeFolder, setActiveFolder] = useState<string | null>(null);
    const [activeItemId, setActiveItemId] = useState<string | null>(null);
    const [startEditing, setStartEditing] = useState(false);
    const [editingItem, setEditingItem] = useState<ItemToEdit | null>(null);
    const [isCalendarOpen, setIsCalendarOpen] = useState(true);
    const [isChatOverlayVisible, setIsChatOverlayVisible] = useState(false);
    const [isChatPinned, setIsChatPinned] = useLocalStorage<boolean>(`nexus-chat-pinned-${userId}`, false);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [dateFilter, setDateFilter] = useState<Date | null>(null);
    const [highlightedRange, setHighlightedRange] = useState<{start: string, end: string} | null>(null);
    const [runningApps, setRunningApps] = useState<RunningApp[]>([]);
    const [timers, setTimers] = useState<ActiveTimer[]>([]);
    const [isDeleteDataModalOpen, setDeleteDataModalOpen] = useState(false);
    const [isDeletingData, setIsDeletingData] = useState(false);
    const [aiStatus, setAiStatus] = useState<'initializing' | 'ready' | 'error'>('initializing');
    const [isNotificationsOpen, setNotificationsOpen] = useState(false);
    const [notificationsAnchor, setNotificationsAnchor] = useState<HTMLElement | null>(null);

    // Onboarding
    const [onboardingComplete, setOnboardingComplete] = useLocalStorage<boolean>(`nexus-onboarding-complete-${userId}`, false);
    const [showOnboarding, setShowOnboarding] = useState(!onboardingComplete);
    
    const chatRef = useRef<Chat | null>(null);
    const moreMenuButtonRef = useRef<HTMLElement | null>(null);
    const lastMessageId = useRef(Math.max(0, ...messages.map(m => m.id)));
    const chatOverlayRef = useRef<HTMLDivElement>(null);

    const { width } = useWindowDimensions();
    const isMobile = width < 768;

    const dummyOnTranscript = useCallback(() => {}, []);
    const { isAvailable: isSpeechAvailable } = useSpeechRecognition(dummyOnTranscript, settings.language.voiceInputLanguage);

    const showHeader = (isMobile && settings.navigation.mobileStyle === 'header') || (!isMobile && settings.navigation.desktopStyle === 'header');
    const showSideBar = !isMobile && settings.navigation.desktopStyle !== 'header';
    const showBottomBar = isMobile && settings.navigation.mobileStyle === 'bottom_bar';

    // Fetch user profile from Supabase Auth metadata
    useEffect(() => {
        const metadata = session.user.user_metadata;
        const profileData: UserProfile = {
            firstName: metadata.first_name || '',
            lastName: metadata.last_name || '',
            dob: metadata.dob || '',
            description: metadata.description || '',
            timezone: metadata.timezone || '',
            country: metadata.country || '',
        };
        // Update profile only if it's different to avoid loops
        if (JSON.stringify(userProfile) !== JSON.stringify(profileData)) {
          setUserProfile(profileData);
        }
    }, [session, setUserProfile, userProfile]);

    useEffect(() => {
        setLanguage(settings.language.appLanguage);
    }, [settings.language.appLanguage]);

    const hexToHsl = (hex: string): { h: number, s: string, l: string } | null => {
        if (!hex || !/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) return null;

        let c = hex.substring(1).split('');
        if (c.length === 3) {
            c = [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        const r = parseInt(c.slice(0, 2).join(''), 16) / 255;
        const g = parseInt(c.slice(2, 4).join(''), 16) / 255;
        const b = parseInt(c.slice(4, 6).join(''), 16) / 255;

        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h = 0, s = 0, l = (max + min) / 2;

        if (max !== min) {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }

        return {
            h: Math.round(h * 360),
            s: `${(s * 100).toFixed(1)}%`,
            l: `${(l * 100).toFixed(1)}%`,
        };
    };

    useEffect(() => {
        const root = document.documentElement;
        root.setAttribute('data-theme', settings.theme);
        root.setAttribute('data-contrast', settings.themeContrast);

        const hsl = hexToHsl(settings.accentColor);
        if (hsl) {
            root.style.setProperty('--accent-h', hsl.h.toString());
            root.style.setProperty('--accent-s', hsl.s);
            root.style.setProperty('--accent-l', hsl.l);
        }
    }, [settings.theme, settings.themeContrast, settings.accentColor]);

    useEffect(() => {
        if(isMobile) {
            setIsChatPinned(false);
        }
    }, [isMobile, setIsChatPinned]);


    const handleInputBlur = () => {
        setTimeout(() => {
            const activeEl = document.activeElement;
            const inputBar = document.getElementById('main-input-bar');
            if (chatOverlayRef.current && !chatOverlayRef.current.contains(activeEl) && !inputBar?.contains(activeEl)) {
                setIsChatOverlayVisible(false);
            }
        }, 150);
    };

    const addMessage = useCallback((sender: ChatMessage['sender'], content: ChatMessage['content']) => {
        lastMessageId.current += 1;
        const newMessage: ChatMessage = { id: lastMessageId.current, sender, content, timestamp: new Date().toISOString() };
        setMessages(prev => [...prev, newMessage]);
        return newMessage;
    }, [setMessages]);
    
    // AI Initialization
    useEffect(() => {
        const initializeChat = () => {
            if (!process.env.API_KEY) {
                setAiStatus('error');
                return;
            }
            try {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                chatRef.current = ai.chats.create({
                    model: 'gemini-2.5-flash',
                    config: {
                        systemInstruction: SYSTEM_PROMPT,
                        temperature: 0.7,
                        topP: 0.95,
                        responseMimeType: 'application/json',
                    }
                });
                setAiStatus('ready');
            } catch (error) {
                console.error("Failed to initialize Gemini Chat:", error);
                setAiStatus('error');
            }
        };
        initializeChat();
    }, []); // Run only once

    const addNotification = useCallback((notification: Omit<SystemNotification, 'id' | 'timestamp' | 'read'>) => {
        setNotifications(prev => {
            const similarExists = prev.some(n => n.title === notification.title);
            if (similarExists) {
                return prev;
            }
            const newNotification: SystemNotification = {
                ...notification,
                id: `notif_${Date.now()}_${Math.random()}`,
                timestamp: new Date().toISOString(),
                read: false,
            };
            return [newNotification, ...prev];
        });
    }, [setNotifications]);

    useEffect(() => {
        if (aiStatus === 'error') {
            addNotification({
                type: 'error',
                title: t('system.notification.aiError.title'),
                message: t('system.notification.aiError.message'),
            });
        }
    }, [aiStatus, addNotification]);

    useEffect(() => {
        // This check runs after the speech hook has had a chance to determine availability
        if (!isSpeechAvailable) {
            addNotification({
                type: 'warning',
                title: t('system.notification.speechError.title'),
                message: t('system.notification.speechError.message'),
            });
        }
    }, [isSpeechAvailable, addNotification]);
    
    const handleClearChat = useCallback(() => {
        setMessages([]);
        if (aiStatus === 'ready' && process.env.API_KEY) {
            try {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                chatRef.current = ai.chats.create({
                    model: 'gemini-2.5-flash',
                    config: {
                        systemInstruction: SYSTEM_PROMPT,
                        temperature: 0.7,
                        topP: 0.95,
                        responseMimeType: 'application/json',
                    }
                });
                addMessage('ai', t('chat.cleared'));
            } catch (error) {
                console.error("Failed to re-initialize Gemini Chat:", error);
                setAiStatus('error');
                addMessage('system', t('chat.error.init'));
            }
        } else {
            if (aiStatus !== 'error') setAiStatus('error');
            addMessage('system', t('chat.error.init'));
        }
    }, [addMessage, setMessages, aiStatus, setAiStatus]);

    // Reminder checker
    useEffect(() => {
        const intervalId = setInterval(() => {
            const now = new Date();
            reminders.forEach(reminder => {
                if (!reminder.isCompleted && new Date(reminder.datetime) <= now) {
                    const existingNotification = messages.find(m => m.sender === 'system' && typeof m.content === 'string' && m.content.includes(reminder.title));
                    if (existingNotification) return;

                    const message = t('chat.reminderNotification', { title: reminder.title });
                    addMessage('system', message);
                    if (Notification.permission === 'granted') {
                        new Notification('Nexus AI Reminder', {
                            body: reminder.title,
                            icon: '/vite.svg'
                        });
                    }
                }
            });
        }, 15000); // Check every 15 seconds

        return () => clearInterval(intervalId);
    }, [reminders, setReminders, addMessage, messages]);

    const launchApp = useCallback((appId: string) => {
        const appToLaunch = savedApps.find(app => app.id === appId);
        if (!appToLaunch) {
            addMessage('system', t('chat.appLaunchError', {appId}));
            return;
        }

        const alreadyRunning = runningApps.some(app => app.id === appId);
        if (alreadyRunning) {
            setRunningApps(prev => prev.map(app => app.id === appId ? { ...app, isMinimized: false } : app));
            return;
        }
        
        const newRunningApp: RunningApp = {
            ...appToLaunch,
            position: { x: Math.random() * 200 + 50, y: Math.random() * 200 + 50 },
            size: { width: 500, height: 400 },
            zIndex: (Math.max(0, ...runningApps.map(a => a.zIndex)) || 10) + 1,
            isMinimized: false,
        };
        setRunningApps(prev => [...prev, newRunningApp]);
    }, [savedApps, runningApps, addMessage]);

    const handleCommand = (command: AICommand, index: number): CommandResult => {
        const result: Omit<CommandResult, 'message'> = { command: command.command, payload: command.payload, status: 'success' };
        try {
            switch (command.command) {
                case 'PLAIN_RESPONSE':
                    addMessage('ai', command.payload.text);
                    return { ...result, message: `Responded: "${command.payload.text.substring(0, 50)}..."` };
                case 'CREATE_NOTE': {
                    const newNote: Note = {
                        id: `note_${Date.now()}_${index}`,
                        title: command.payload.title,
                        content: command.payload.content,
                        folder: command.payload.folder || 'Uncategorized',
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                    };
                    setNotes(prev => [...prev, newNote]);
                    setIsSidePanelOpen(true);
                    setActiveNoteId(newNote.id);
                    setStartEditing(false);
                    return { ...result, message: `Note "${newNote.title}" created.` };
                }
                case 'UPDATE_NOTE': {
                    const { id, title, content, append_content } = command.payload;
                    const noteToUpdate = notes.find(n => n.id === id);
                    if (!noteToUpdate) {
                        return { ...result, status: 'error', message: `Note with id ${id} not found.` };
                    }
                    let summary = '';
                    setNotes(prev => prev.map(n => {
                        if (n.id === id) {
                            const newContent = append_content ? `${n.content}\n\n<p>${append_content}</p>` : content;
                            const updatedNote: Note = {
                                ...n,
                                title: title || n.title,
                                content: newContent ?? n.content,
                                updatedAt: new Date().toISOString(),
                            };
                            if (append_content) summary = `Appended content to "${updatedNote.title}".`;
                            else if (content) summary = `Content of "${updatedNote.title}" was replaced.`;
                            else if (title) summary = `Note title updated to "${updatedNote.title}".`
                            else summary = `Note "${updatedNote.title}" updated.`;

                            addMessage('system_note_update', { noteId: updatedNote.id, noteTitle: updatedNote.title, summary });
                            return updatedNote;
                        }
                        return n;
                    }));
                    return { ...result, message: summary || `Note with id ${id} not found.` };
                }
                case 'READ_NOTES':
                    setIsSidePanelOpen(true);
                    setActiveNoteId(null);
                    setActiveItemId(null);
                    return { ...result, message: `Opened notes dashboard.` };
                case 'UPDATE_MEMORY':
                    setAiMemory(prev => ({ ...prev, [command.payload.key]: command.payload.value }));
                    return { ...result, message: `Remembered: ${command.payload.key}.` };
                case 'ASK_USER':
                    setConfirmationRequest({ question: command.payload.question, actions: command.payload.actions });
                    return { ...result, message: `Asking user: "${command.payload.question}"` };
                case 'OPEN_LINK':
                    window.open(command.payload.url, '_blank');
                    return { ...result, message: `Opening link: ${command.payload.url}` };
                case 'SET_TIMER': {
                    const newTimer: ActiveTimer = {
                        id: Date.now(),
                        duration: command.payload.durationSeconds,
                        remaining: command.payload.durationSeconds,
                        label: command.payload.label || 'Timer',
                    };
                    setTimers(prev => [...prev, newTimer]);
                    return { ...result, message: `Timer "${newTimer.label}" set for ${command.payload.durationSeconds}s.` };
                }
                case 'SET_REMINDER': {
                    const newReminder: Reminder = {
                        id: `reminder_${Date.now()}_${index}`,
                        title: command.payload.title,
                        description: command.payload.description || '',
                        datetime: command.payload.datetime,
                        color: command.payload.color || '#4f46e5',
                        isCompleted: false,
                        createdAt: new Date().toISOString(),
                    }
                    setReminders(prev => [...prev, newReminder]);
                    return { ...result, message: `Reminder set: "${command.payload.title}".` };
                }
                case 'UPDATE_REMINDER': {
                    const { id, ...updates } = command.payload;
                    const reminderToUpdate = reminders.find(r => r.id === id);
                    if (!reminderToUpdate) {
                        return { ...result, status: 'error', message: `Reminder with id ${id} not found.` };
                    }
                    setReminders(prev => prev.map(r => r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r));
                    return { ...result, message: `Reminder "${updates.title || reminderToUpdate.title}" updated.` };
                }
                case 'DELETE_REMINDER': {
                    const reminderToDelete = reminders.find(r => r.id === command.payload.id);
                    if (!reminderToDelete) {
                        return { ...result, status: 'error', message: `Reminder with id ${command.payload.id} not found.` };
                    }
                    setReminders(prev => prev.filter(r => r.id !== command.payload.id));
                    return { ...result, message: `Reminder "${reminderToDelete.title}" deleted.` };
                }
                case 'CREATE_EVENT': {
                    const newEvent: Event = {
                        id: `event_${Date.now()}_${index}`,
                        title: command.payload.title,
                        description: command.payload.description || '',
                        start: command.payload.start,
                        end: command.payload.end,
                        isAllDay: command.payload.isAllDay || false,
                        color: command.payload.color || '#10b981',
                        createdAt: new Date().toISOString(),
                    }
                    setEvents(prev => [...prev, newEvent]);
                    return { ...result, message: `Event created: "${newEvent.title}".` };
                }
                case 'UPDATE_EVENT': {
                    const { id, ...updates } = command.payload;
                    const eventToUpdate = events.find(e => e.id === id);
                    if (!eventToUpdate) {
                        return { ...result, status: 'error', message: `Event with id ${id} not found.` };
                    }
                    setEvents(prev => prev.map(e => e.id === id ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e));
                    return { ...result, message: `Event "${updates.title || eventToUpdate.title}" updated.` };
                }
                case 'DELETE_EVENT': {
                    const eventToDelete = events.find(e => e.id === command.payload.id);
                     if (!eventToDelete) {
                        return { ...result, status: 'error', message: `Event with id ${command.payload.id} not found.` };
                    }
                    setEvents(prev => prev.filter(e => e.id !== command.payload.id));
                    return { ...result, message: `Event "${eventToDelete.title}" deleted.` };
                }
                case 'SUMMARIZE_SCHEDULE': {
                    addMessage('ai', 'Let me get that schedule for you...');
                    return { ...result, message: "Summarized user's schedule." };
                }
                case 'EXECUTE_SCRIPT': {
                    const newApp: SavedApp = {
                        id: `app_${Date.now()}_${index}`,
                        title: command.payload.title,
                        ...command.payload,
                    };
                    setSavedApps(prev => [...prev, newApp]);
                    launchApp(newApp.id);
                    return { ...result, message: `Launched new app: "${newApp.title}".` };
                }
                case 'UPDATE_SCRIPT': {
                     const { id, ...updates } = command.payload;
                     let appTitle = 'App';
                     setSavedApps(prev => prev.map(app => {
                        if(app.id === id) {
                            appTitle = updates.title || app.title;
                            return { ...app, ...updates, title: appTitle }
                        }
                        return app;
                    }));
                     setRunningApps(prev => prev.map(app => {
                        if(app.id === id) {
                            appTitle = updates.title || app.title;
                            return { ...app, ...updates, title: appTitle }
                        }
                        return app;
                    }));
                     return { ...result, message: `Application "${appTitle}" updated.` };
                }
                case 'RESET_CONTEXT':
                    setMessages(prev => prev.filter(m => m.sender === 'system'));
                    // Re-initialize chat session
                    if (aiStatus === 'ready' && process.env.API_KEY) {
                        try {
                            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                            chatRef.current = ai.chats.create({
                                model: 'gemini-2.5-flash',
                                config: {
                                    systemInstruction: SYSTEM_PROMPT,
                                    temperature: 0.7,
                                    topP: 0.95,
                                    responseMimeType: 'application/json',
                                }
                            });
                            addMessage('ai', 'Starting a new conversation topic.');
                        } catch (e) {
                            console.error("Failed to re-initialize Gemini Chat:", e);
                            setAiStatus('error');
                        }
                    }
                    return { ...result, message: `Conversation context has been reset.` };
                default:
                     const _exhaustiveCheck: never = command;
                     const unknownCommand = (_exhaustiveCheck as any)?.command;
                     return { command: unknownCommand || 'UNKNOWN', payload: {}, status: 'error', message: `Unknown command received: ${unknownCommand}` };
            }
        } catch (error: any) {
            console.error(`Error executing command ${command.command}:`, error);
            return { ...result, status: 'error', message: `Execution failed: ${error.message}` };
        }
    };

    const processUserInput = useCallback(async (prompt: string) => {
        if (!prompt.trim()) return;

        if (aiStatus !== 'ready' || !chatRef.current) {
            addMessage('system', t('chat.error.init'));
            return;
        }
        
        setIsLoading(true);
        const startTime = performance.now();
        addMessage('user', prompt);
        setInputDraft('');
        
        let contextualNoteContent = '';
        const noteMentionRegex = /(?:in|my|the|to|from|on|of) ['"](.+?)['"](?: note| list)?/i;
        const match = prompt.match(noteMentionRegex);

        if (match && match[1]) {
            const noteTitle = match[1].toLowerCase();
            const foundNote = notes.find(n => n.title.toLowerCase() === noteTitle);
            if (foundNote) {
                contextualNoteContent = `\n## CONTEXTUAL NOTE CONTENT:\n- Title: ${foundNote.title}\n- ID: ${foundNote.id}\n- Content:\n---\n${foundNote.content}\n---\n`;
            }
        }

        try {
            const currentState = `
            ## CURRENT STATE:
            - User Profile: ${JSON.stringify(userProfile)}
            - AI Memory: ${JSON.stringify(aiMemory)}
            - Notes: ${JSON.stringify(notes.map(n => ({id: n.id, title: n.title, folder: n.folder})))}
            - Events: ${JSON.stringify(events.map(e => ({id: e.id, title: e.title, start: e.start, end: e.end})))}
            - Reminders: ${JSON.stringify(reminders.map(r => ({id: r.id, title: r.title, datetime: r.datetime, isCompleted: r.isCompleted})))}
            - Saved Apps: ${JSON.stringify(savedApps.map(a => ({id: a.id, title: a.title})))}
            - Current Datetime: ${new Date().toISOString()}
            `;
            const fullPrompt = `${currentState}\n${contextualNoteContent}\n\n## USER PROMPT:\n"${prompt}"`;
            
            const responseText = await getAIResponse(chatRef.current, fullPrompt);
            const responseData = JSON.parse(responseText);
            
            if (responseData.commands && Array.isArray(responseData.commands)) {
                const commandResults: CommandResult[] = [];
                responseData.commands.sort((a: AICommand, b: AICommand) => {
                    if (a.command === 'UPDATE_MEMORY') return -1;
                    if (b.command === 'UPDATE_MEMORY') return 1;
                    return 0;
                });
                for (const [index, command] of responseData.commands.entries()) {
                    if (command.command === 'SUMMARIZE_SCHEDULE') {
                        handleCommand(command, index);
                        commandResults.push({ command: command.command, payload: command.payload, status: 'success', message: `Summarized schedule.` });
                        continue;
                    }
                    const result = handleCommand(command, index);
                    commandResults.push(result);
                }

                if (commandResults.length > 0) {
                     const endTime = performance.now();
                     addMessage('system-command-group', {
                        results: commandResults,
                        executionTime: Math.round(endTime - startTime),
                     });
                }
            } else {
                 addMessage('ai', t('chat.error.badResponse'));
                 console.error("Invalid command structure from AI:", responseData);
            }
        } catch (error) {
            console.error("Error processing user input:", error);
            addMessage('system', t('chat.error.generic'));
        } finally {
            setIsLoading(false);
        }
    }, [addMessage, userProfile, aiMemory, notes, savedApps, reminders, events, launchApp, setNotes, setAiMemory, setTimers, setReminders, setEvents, setSavedApps, setInputDraft, handleCommand, aiStatus]);

    const handleConfirmation = (value: string) => {
        setConfirmationRequest(null);
        processUserInput(`I have chosen: ${value}`);
    };

    const handleDeleteTimer = (id: number) => {
        setTimers(prev => prev.filter(t => t.id !== id));
    };

    const handleTimerFinish = (timer: ActiveTimer) => {
        addMessage('system', t('chat.timerFinished', {label: timer.label}));
        handleDeleteTimer(timer.id);
    }
    
    const openNoteById = (noteId: string) => {
        const noteToOpen = notes.find(n => n.id === noteId);
        if(noteToOpen) {
            resetSidePanel();
            setIsSidePanelOpen(true);
            setActiveNoteId(noteId);
            setStartEditing(false);
        }
    }

    const handleNewNote = () => {
        // Clear other views but preserve activeFolder if present
        setEditingItem(null);
        setDateFilter(null);
        setActiveItemId(null);
        
        setIsSidePanelOpen(true);
        setActiveNoteId('new');
        setStartEditing(true);
    };

    const handleCreateNote = (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
        const newNoteWithId: Note = { ...note, id: `note_${Date.now()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
        setNotes(prev => [...prev, newNoteWithId]);
        setActiveNoteId(newNoteWithId.id);
        setStartEditing(false);
    }

    const handleUpdateNote = (updatedNote: Note) => {
        setNotes(prev => prev.map(n => n.id === updatedNote.id ? {...updatedNote, updatedAt: new Date().toISOString()} : n));
        setStartEditing(false);
    }
    
    const requestDeleteItem = (type: string, id: string, name: string) => {
        setItemToDelete({ type, id, name });
    };

    const cancelDeleteItem = () => {
        setItemToDelete(null);
    };

    const confirmDeleteItem = () => {
        if (!itemToDelete) return;
        const { type, id } = itemToDelete;

        const closeViews = (itemId: string) => {
            if (activeNoteId === itemId) setActiveNoteId(null);
            if (activeItemId === itemId) setActiveItemId(null);
            if (editingItem && typeof editingItem.item === 'object' && 'id' in editingItem.item && editingItem.item.id === itemId) setEditingItem(null);
        };

        switch (type) {
            case 'note':
                setNotes(prev => prev.filter(n => n.id !== id));
                break;
            case 'event':
                setEvents(prev => prev.filter(e => e.id !== id));
                break;
            case 'reminder':
                setReminders(prev => prev.filter(r => r.id !== id));
                break;
            case 'app':
                setSavedApps(prev => prev.filter(a => a.id !== id));
                break;
        }
        closeViews(id);
        setItemToDelete(null);
    };
    
    const handleDeleteNote = (noteId: string) => {
        const note = notes.find(n => n.id === noteId);
        if (note) {
            requestDeleteItem('note', noteId, note.title);
        }
    };
    
    const handleRenameFolder = (oldName: string, newName: string) => {
        if (!newName || oldName === newName) return;
        setNotes(prev => prev.map(note => note.folder === oldName ? { ...note, folder: newName } : note));
    };
    
    const resetSidePanel = () => {
        setEditingItem(null);
        setDateFilter(null);
        setActiveItemId(null);
        setActiveNoteId(null);
        setActiveFolder(null);
    }

    const handleDayClick = (day: Date) => {
        setPanelWasOpenBeforeFilter(isSidePanelOpen);
        resetSidePanel();
        setDateFilter(day);
        setIsSidePanelOpen(true);
    }

    const handleItemClick = (item: Event | Reminder) => {
        resetSidePanel();
        setActiveItemId(item.id);
        setIsSidePanelOpen(true);
    }
    
    const handleSidePanelClose = () => {
        setIsSidePanelOpen(false);
        resetSidePanel();
    }

    const handleDateRangeSelect = (start: Date, end: Date) => {
        if (editingItem && editingItem.type === 'event') {
            setEditingItem(prev => {
                if (!prev || prev.type !== 'event' || typeof prev.item !== 'object') {
                    return prev;
                }
                const updatedEventData = {
                    ...prev.item,
                    start: start.toISOString(),
                    end: end.toISOString(),
                };
                return { ...prev, item: updatedEventData };
            });
        } else {
            resetSidePanel();
            setEditingItem({
                type: 'event',
                item: {
                    start: start.toISOString(),
                    end: end.toISOString(),
                },
                mode: isMobile ? 'sheet' : 'full'
            });
            setIsSidePanelOpen(true);
        }
    }

    const handleNewItemRequest = (type: 'event' | 'reminder', date: Date) => {
        resetSidePanel();
        setEditingItem({
            type: type,
            item: type === 'event' 
                ? { start: date.toISOString(), end: new Date(date.getTime() + 3600*1000).toISOString() }
                : { datetime: date.toISOString() },
            mode: 'full'
        });
        setIsSidePanelOpen(true);
    }
    
    const handleEditItem = (item: Event | Reminder) => {
        resetSidePanel();
        setEditingItem({
            type: 'start' in item ? 'event' : 'reminder',
            item: item,
            mode: 'full'
        });
        setIsSidePanelOpen(true);
    }

    const getIsActive = (id: NavItemId): boolean => {
        switch (id) {
            case 'dashboard':
                return isSidePanelOpen;
            case 'calendar':
                return isCalendarOpen;
            case 'apps':
                return isAppsModalOpen;
            case 'chat':
                return isChatOverlayVisible || isChatPinned;
            case 'notifications':
                return isNotificationsOpen;
            case 'profile':
                return isProfileModalOpen;
            case 'settings':
                return isSettingsModalOpen;
            default:
                return false;
        }
    };
    
    const unreadNotificationsCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

    useEffect(() => {
        if (isNotificationsOpen) {
            const timeoutId = setTimeout(() => {
                setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            }, 1000);
            return () => clearTimeout(timeoutId);
        }
    }, [isNotificationsOpen, setNotifications]);
    
    const handleMoreClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        moreMenuButtonRef.current = event.currentTarget;
        setMoreMenuOpen(p => {
            const isOpening = !p;
            if (isOpening) {
                const anchorEl = event.currentTarget as HTMLElement;
                const rect = anchorEl.getBoundingClientRect();
    
                if (isMobile) {
                    setMoreMenuStyle({});
                } else if (showSideBar) {
                    const isLeft = settings.navigation.desktopStyle === 'side_bar_left';
                    setMoreMenuStyle({
                        position: 'absolute',
                        bottom: `${window.innerHeight - rect.top}px`,
                        left: isLeft ? `${rect.right + 8}px` : 'auto',
                        right: !isLeft ? `${window.innerWidth - rect.left + 8}px` : 'auto',
                        transformOrigin: `bottom ${isLeft ? 'left' : 'right'}`,
                    });
                } else {
                    setMoreMenuStyle({
                        position: 'absolute',
                        top: `${rect.bottom + 8}px`,
                        right: `${window.innerWidth - rect.right}px`,
                        transformOrigin: 'top right',
                    });
                }
            }
            return isOpening;
        });
    };

    const handleNavAction = (id: NavItemId, event?: React.MouseEvent<HTMLElement | HTMLButtonElement>) => {
        if (id !== 'notifications') {
          setMoreMenuOpen(false);
        }

        switch (id) {
            case 'dashboard':
                setIsSidePanelOpen(p => !p);
                if (isSidePanelOpen) resetSidePanel();
                break;
            case 'profile':
                setProfileModalOpen(true);
                break;
            case 'settings':
                setSettingsModalOpen(true);
                break;
            case 'apps':
                setAppsModalOpen(true);
                break;
            case 'calendar':
                setIsCalendarOpen(p => !p);
                break;
            case 'chat':
                 if (isMobile || settings.chat.behavior === 'header_button') {
                    setIsChatOverlayVisible(p => !p);
                 } else {
                    setIsChatPinned(p => !p);
                 }
                break;
            case 'notifications': {
                setMoreMenuOpen(false);
                const anchor = event ? event.currentTarget : moreMenuButtonRef.current;
                if (anchor) {
                    setNotificationsAnchor(anchor as HTMLElement);
                    setNotificationsOpen(p => !p);
                }
                break;
            }
        }
    };

    const navItems = useMemo(() => {
        const itemIds = isMobile
            ? settings.navigation.mobileStyle === 'bottom_bar' ? settings.navigation.mobileBottomBarItems : settings.navigation.desktopHeaderItems
            : settings.navigation.desktopHeaderItems;

        return itemIds
            .map(id => ALL_NAV_ITEMS.find(item => item.id === id))
            .filter((item): item is NavItem => !!item);
    }, [isMobile, settings.navigation]);

    const hiddenNavItems = useMemo(() => {
        const visibleSet = new Set(navItems.map(i => i.id));
        return ALL_NAV_ITEMS.filter(item => !visibleSet.has(item.id));
    }, [navItems]);
    
    const mainContentPadding = useMemo(() => {
        let classes = '';
        if (showHeader) classes += ' pt-16';
        if (showSideBar && settings.navigation.desktopStyle && settings.navigation.sideBarLabels) {
            const sidebarWidth = settings.navigation.sideBarLabels === 'show' ? 'pl-44' : 'pl-20';
            classes += settings.navigation.desktopStyle === 'side_bar_left' ? ` ${sidebarWidth}` : ' pr-20';
        }
        if (showBottomBar) {
            const bottomPadding = settings.navigation.mobileBottomBarHeight === 'compact' ? 'pb-16' : 'pb-20';
            classes += ` ${bottomPadding}`;
        }
        return classes;
    }, [showHeader, showSideBar, showBottomBar, settings.navigation]);

    const bottomNavHeight = useMemo(() => {
        if (!isMobile || !showBottomBar) return '0rem';
        return settings.navigation.mobileBottomBarHeight === 'compact' ? '4rem' : '5rem';
    }, [isMobile, showBottomBar, settings.navigation.mobileBottomBarHeight]);

    const mobileInputBottom = isChatOverlayVisible ? '0' : bottomNavHeight;

    const handleOnboardingFinish = () => {
        if(userProfile?.firstName) {
            addMessage('ai', t('onboarding.welcomeMessage', { name: userProfile.firstName }));
        }
        setOnboardingComplete(true);
        setShowOnboarding(false);
    };
    
    const handleRestartOnboarding = () => {
        setOnboardingComplete(false);
        setShowOnboarding(true);
        setSettingsModalOpen(false);
    };

    const handleDeleteAllDataRequest = () => {
        setSettingsModalOpen(false);
        setDeleteDataModalOpen(true);
    };

    const handleDeleteAllDataConfirm = async () => {
        setDeleteDataModalOpen(false);
        setIsDeletingData(true);

        await new Promise(resolve => setTimeout(resolve, 2000));

        const keysToClear = Object.keys(localStorage).filter(key => key.startsWith('nexus-') && key.includes(userId));
        keysToClear.forEach(key => localStorage.removeItem(key));
        
        await supabase.auth.signOut();
        window.location.reload();
    };

    return (
        <div className={`flex flex-col h-screen bg-primary text-text-primary font-sans overflow-hidden`}>
            {isDeletingData && <DataDeletionAnimation />}
            <OnboardingModal
                isOpen={showOnboarding}
                onFinish={handleOnboardingFinish}
                isMobile={isMobile}
            />
            <ScriptContainer 
                apps={runningApps}
                setApps={setRunningApps}
                isMobile={isMobile}
            />
            
            {showHeader && (
                <Header
                    onToggleUI={() => setIsUIVisible(p => !p)}
                    onClearScript={() => setRunningApps([])}
                    isScriptActive={runningApps.length > 0}
                    userName={userProfile?.firstName}
                    settings={settings}
                    onNavAction={handleNavAction}
                    items={navItems}
                    hiddenItemCount={hiddenNavItems.length}
                    onMoreClick={handleMoreClick}
                    getIsActive={getIsActive}
                    unreadNotificationsCount={unreadNotificationsCount}
                    isMobile={isMobile}
                />
            )}
             {showSideBar && (
                 <SideNavBar
                    items={navItems}
                    hiddenItemCount={hiddenNavItems.length}
                    onItemClick={handleNavAction}
                    onMoreClick={handleMoreClick}
                    settings={settings}
                    getIsActive={getIsActive}
                    onLogoClick={() => setIsUIVisible(p => !p)}
                    unreadNotificationsCount={unreadNotificationsCount}
                 />
             )}

             <main className={`flex-1 flex overflow-hidden transition-all duration-300 ${isUIVisible ? 'opacity-100' : 'opacity-0'} ${mainContentPadding}`}>
                <div className="fixed top-20 right-4 z-10 space-y-2">
                    {timers.map(timer => (
                        <TimerWidget key={timer.id} timer={timer} onDelete={handleDeleteTimer} onFinish={handleTimerFinish} />
                    ))}
                </div>

                <div className="flex-1 flex">
                    {isChatPinned && !isMobile && (
                        <PinnedChatPanel
                            messages={messages}
                            isLoading={isLoading}
                            onSendMessage={processUserInput}
                            onNoteClick={openNoteById}
                            onClose={() => setIsChatPinned(false)}
                            onClearChat={handleClearChat}
                            voiceInputLanguage={settings.language.voiceInputLanguage}
                            inputDraft={inputDraft}
                            setInputDraft={setInputDraft}
                        />
                    )}
                    
                    <div className="flex-1 flex flex-col relative">
                        <div className="flex-1 relative overflow-hidden">
                            {isCalendarOpen && (
                                <Calendar 
                                    currentDate={currentDate}
                                    setCurrentDate={setCurrentDate}
                                    events={events}
                                    reminders={reminders}
                                    onDayClick={handleDayClick}
                                    onItemClick={handleItemClick}
                                    onDateRangeSelect={handleDateRangeSelect}
                                    onNewItemRequest={handleNewItemRequest}
                                    dateFilter={dateFilter}
                                    highlightedRange={highlightedRange}
                                    settings={settings}
                                    isMobile={isMobile}
                                />
                            )}
                        
                            {isChatOverlayVisible && !isChatPinned && (
                                <div 
                                    className={`bg-primary/70 backdrop-blur-sm z-40 flex flex-col items-center justify-end animate-fade-in ${isMobile ? 'fixed inset-0' : 'absolute inset-0'}`} 
                                    ref={chatOverlayRef}
                                    onClick={() => setIsChatOverlayVisible(false)}
                                >
                                   <div 
                                        className="relative flex flex-col h-full w-full max-w-3xl mx-auto"
                                        onClick={e => e.stopPropagation()}
                                    >
                                        <div className="p-2 flex justify-end items-center gap-2">
                                            <button onClick={handleClearChat} className="px-3 py-1 text-sm rounded-md bg-secondary/70 hover:bg-border-color">{t('chat.clear')}</button>
                                            {!isMobile && <button onClick={() => { setIsChatPinned(true); setIsChatOverlayVisible(false); }} className="px-3 py-1 text-sm rounded-md bg-secondary/70 hover:bg-border-color">{t('chat.pin')}</button>}
                                            <button onClick={() => setIsChatOverlayVisible(false)} className="p-2 rounded-full bg-secondary/70 hover:bg-border-color">
                                                <Icon name="close" className="h-5 w-5"/>
                                            </button>
                                        </div>
                                        <div className={`flex-1 overflow-y-auto p-4 md:p-6 ${(settings.chat.behavior === 'overlay' && !isMobile) ? '' : 'pb-20 md:pb-6'}`}>
                                            <ChatInterface messages={messages} isLoading={isLoading} onNoteClick={openNoteById} />
                                        </div>
                                        { (settings.chat.behavior === 'header_button' || isMobile) &&
                                            <footer className="p-2 bg-secondary border-t border-border-color flex-shrink-0">
                                                <InputBar
                                                    onSendMessage={processUserInput}
                                                    isLoading={isLoading}
                                                    voiceInputLanguage={settings.language.voiceInputLanguage}
                                                    inputDraft={inputDraft}
                                                    setInputDraft={setInputDraft}
                                                />
                                            </footer>
                                        }
                                   </div>
                                </div>
                            )}
                        </div>
                        
                        {(!isChatPinned && settings.chat.behavior === 'overlay' && !isMobile) && (
                            <footer id="main-input-bar" className="p-4 bg-primary border-t border-border-color z-20 flex-shrink-0">
                                <InputBar 
                                    onSendMessage={processUserInput} 
                                    isLoading={isLoading}
                                    onFocus={() => setIsChatOverlayVisible(true)}
                                    onBlur={handleInputBlur}
                                    voiceInputLanguage={settings.language.voiceInputLanguage}
                                    inputDraft={inputDraft}
                                    setInputDraft={setInputDraft}
                                 />
                            </footer>
                        )}
                    </div>

                    <SidePanel
                        isOpen={isSidePanelOpen}
                        isMobile={isMobile}
                        onClose={handleSidePanelClose}
                        notes={notes}
                        reminders={reminders}
                        setReminders={setReminders}
                        events={events}
                        setEvents={setEvents}
                        folderCustomization={folderCustomization}
                        setFolderCustomization={setFolderCustomization}
                        settings={settings}
                        setSettings={setSettings}
                        activeNoteId={activeNoteId}
                        setActiveNoteId={setActiveNoteId}
                        activeFolder={activeFolder}
                        setActiveFolder={setActiveFolder}
                        activeItemId={activeItemId}
                        setActiveItemId={setActiveItemId}
                        editingItem={editingItem}
                        setEditingItem={setEditingItem}
                        startEditing={startEditing}
                        onNewNote={handleNewNote}
                        onCreateNote={handleCreateNote}
                        onUpdateNote={handleUpdateNote}
                        onDeleteNote={handleDeleteNote}
                        onRequestDeleteItem={requestDeleteItem}
                        onRenameFolder={handleRenameFolder}
                        panelWasOpenBeforeFilter={panelWasOpenBeforeFilter}
                        dateFilter={dateFilter}
                        setDateFilter={setDateFilter}
                        onOpenNote={openNoteById}
                        onEditItem={handleEditItem}
                        onNewItemRequest={handleNewItemRequest}
                        setHighlightedRange={setHighlightedRange}
                    />
                </div>
            </main>
            
             {isMobile && settings.chat.behavior === 'overlay' && (
                <footer 
                    id="main-input-bar" 
                    className="fixed left-0 right-0 p-2 bg-primary border-t border-border-color z-50 transition-all duration-300 ease-in-out"
                    style={{ 
                        bottom: mobileInputBottom,
                        opacity: isSidePanelOpen || (editingItem && editingItem.mode === 'full') ? 0 : 1,
                        pointerEvents: isSidePanelOpen || (editingItem && editingItem.mode === 'full') ? 'none' : 'auto'
                    }}
                >
                    <InputBar 
                        onSendMessage={processUserInput} 
                        isLoading={isLoading}
                        onFocus={() => setIsChatOverlayVisible(true)}
                        onBlur={handleInputBlur}
                        voiceInputLanguage={settings.language.voiceInputLanguage}
                        inputDraft={inputDraft}
                        setInputDraft={setInputDraft}
                    />
                </footer>
            )}

            {showBottomBar && (
                 <BottomNavBar
                    items={navItems}
                    hiddenItemCount={hiddenNavItems.length}
                    onItemClick={handleNavAction}
                    onMoreClick={handleMoreClick}
                    settings={settings}
                    getIsActive={getIsActive}
                    unreadNotificationsCount={unreadNotificationsCount}
                 />
            )}

            <MoreMenu
                isOpen={isMoreMenuOpen}
                onClose={() => setMoreMenuOpen(false)}
                items={hiddenNavItems}
                onItemClick={handleNavAction}
                isMobile={isMobile}
                style={moreMenuStyle}
            />

            <ProfileModal
                isOpen={isProfileModalOpen}
                isMobile={isMobile}
                onClose={() => setProfileModalOpen(false)}
                profile={userProfile}
                setProfile={setUserProfile}
                memory={aiMemory}
                setMemory={setAiMemory}
            />

            <SettingsModal
                isOpen={isSettingsModalOpen}
                onClose={() => setSettingsModalOpen(false)}
                settings={settings}
                setSettings={setSettings}
                onRestartOnboarding={handleRestartOnboarding}
                onDeleteAllData={handleDeleteAllDataRequest}
                dataCounts={{ notes: notes.length, events: events.length, reminders: reminders.length }}
            />

            <AppsModal
                isOpen={isAppsModalOpen}
                isMobile={isMobile}
                onClose={() => setAppsModalOpen(false)}
                apps={savedApps}
                onDeleteApp={(app) => requestDeleteItem('app', app.id, app.title)}
                setApps={setSavedApps}
                onLaunchApp={launchApp}
            />
            
            {confirmationRequest && (
                <ConfirmationModal
                    question={confirmationRequest.question}
                    actions={confirmationRequest.actions}
                    onClose={() => setConfirmationRequest(null)}
                    onConfirm={handleConfirmation}
                />
            )}

            <NotificationsPanel
                isOpen={isNotificationsOpen}
                onClose={() => setNotificationsOpen(false)}
                anchorEl={notificationsAnchor}
                notifications={notifications}
                onClearAll={() => setNotifications([])}
                isMobile={isMobile}
            />

            <DeleteConfirmationModal
                isOpen={!!itemToDelete}
                itemType={itemToDelete?.type || ''}
                itemName={itemToDelete?.name || ''}
                onConfirm={confirmDeleteItem}
                onCancel={cancelDeleteItem}
            />

            <DeleteDataConfirmationModal
                isOpen={isDeleteDataModalOpen}
                onConfirm={handleDeleteAllDataConfirm}
                onCancel={() => setDeleteDataModalOpen(false)}
                counts={{ notes: notes.length, events: events.length, reminders: reminders.length }}
            />
        </div>
    );
};

export default App;