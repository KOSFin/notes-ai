import { Session } from '@supabase/supabase-js';

export { Session };

export interface NoteUpdateContent {
    noteId: string;
    noteTitle: string;
    summary: string;
}

export interface CommandResult {
    command: string;
    payload: any;
    status: 'success' | 'error';
    message: string;
}

export interface CommandGroupContent {
    results: CommandResult[];
    executionTime: number;
}

export interface ChatMessage {
    id: number;
    sender: 'user' | 'ai' | 'system' | 'system-command-group' | 'system_note_update';
    content: string | CommandGroupContent | NoteUpdateContent;
    timestamp?: string;
}

export interface BackgroundSetting {
    type: 'none' | 'preset' | 'custom';
    value: string; // preset name/path or base64 data URL
    dim: number; // 0-100
}

export interface Note {
    id: string;
    title: string;
    content: string; // Can be Markdown or HTML
    folder: string;
    createdAt: string;
    updatedAt: string;
    tags?: string[];
    background?: BackgroundSetting;
}

export interface FolderCustomization {
    color: string;
    icon: string; // Icon name from Icon.tsx or base64 data URL for custom images
}

export interface Reminder {
    id: string;
    title: string;
    description: string;
    datetime: string; // ISO 8601 format
    color: string;
    isCompleted: boolean;
    noteId?: string;
    createdAt: string;
    updatedAt?: string;
}

export interface Event {
    id: string;
    title: string;
    description: string;
    start: string; // ISO 8601 format
    end: string;   // ISO 8601 format
    isAllDay: boolean;
    color: string;
    noteId?: string;
    createdAt: string;
    updatedAt?: string;
}

export interface ItemToEdit {
    type: 'event' | 'reminder';
    item: Event | Reminder | 'new' | Partial<Event> | Partial<Reminder>;
    mode: 'sheet' | 'full';
}

export interface UserProfile {
    firstName: string;
    lastName: string;
    dob: string; // YYYY-MM-DD
    description: string;
    timezone: string;
    country?: string; // ISO 3166-1 alpha-2 code
}

export interface Country {
    code: string;
    name: string;
    flag: string;
}


export interface AIMemory {
    [key: string]: any;
}

export interface ActiveTimer {
    id: number;
    duration: number;
    remaining: number;
    label: string;
}

export interface ScriptCode {
    html: string;
    css: string;
    javascript: string;
}

export interface SavedApp extends ScriptCode {
    id: string;
    title: string;
}

export interface RunningApp extends SavedApp {
    position: { x: number, y: number };
    size: { width: number, height: number };
    zIndex: number;
    isMinimized: boolean;
}

// All AI command payloads
type PlainResponsePayload = { text: string };
type SummarizeSchedulePayload = { time_range: "day" | "week" | "month" | "year", date_context?: string, include: ("events" | "reminders")[] };
type CreateNotePayload = { title: string, content: string, folder?: string };
type UpdateNotePayload = { id: string, title?: string, content?: string, append_content?: string };
type ReadNotesPayload = {};
type UpdateMemoryPayload = { key: string, value: any };
type SetReminderPayload = { title: string, description?: string, datetime: string, color?: string };
type UpdateReminderPayload = { id: string, title?: string, description?: string, datetime?: string, isCompleted?: boolean };
type DeleteReminderPayload = { id: string };
type CreateEventPayload = { title: string, description?: string, start: string, end: string, isAllDay?: boolean, color?: string };
type UpdateEventPayload = { id: string, title?: string, description?: string, start?: string, end?: string, color?: string };
type DeleteEventPayload = { id: string };
type SetTimerPayload = { durationSeconds: number, label?: string };
type AskUserPayload = { question: string, actions: { label: string, value: string }[] };
type OpenLinkPayload = { url: string };
type ExecuteScriptPayload = { title: string, html: string, css: string, javascript: string };
type UpdateScriptPayload = { id: string, title?: string, html?: string, css?: string, javascript?: string };
type ResetContextPayload = {};

// AI Command discriminated union
export type AICommand = 
    | { command: 'PLAIN_RESPONSE', payload: PlainResponsePayload }
    | { command: 'SUMMARIZE_SCHEDULE', payload: SummarizeSchedulePayload }
    | { command: 'CREATE_NOTE', payload: CreateNotePayload }
    | { command: 'UPDATE_NOTE', payload: UpdateNotePayload }
    | { command: 'READ_NOTES', payload: ReadNotesPayload }
    | { command: 'UPDATE_MEMORY', payload: UpdateMemoryPayload }
    | { command: 'SET_REMINDER', payload: SetReminderPayload }
    | { command: 'UPDATE_REMINDER', payload: UpdateReminderPayload }
    | { command: 'DELETE_REMINDER', payload: DeleteReminderPayload }
    | { command: 'CREATE_EVENT', payload: CreateEventPayload }
    | { command: 'UPDATE_EVENT', payload: UpdateEventPayload }
    | { command: 'DELETE_EVENT', payload: DeleteEventPayload }
    | { command: 'SET_TIMER', payload: SetTimerPayload }
    | { command: 'ASK_USER', payload: AskUserPayload }
    | { command: 'OPEN_LINK', payload: OpenLinkPayload }
    | { command: 'EXECUTE_SCRIPT', payload: ExecuteScriptPayload }
    | { command: 'UPDATE_SCRIPT', payload: UpdateScriptPayload }
    | { command: 'RESET_CONTEXT', payload: ResetContextPayload };

export interface ConfirmationRequest {
    question: string;
    actions: { label: string; value: string }[];
}

export type NavItemId = 'dashboard' | 'calendar' | 'apps' | 'chat' | 'profile' | 'settings';

export interface NavItem {
    id: NavItemId;
    name: string;
    icon: string;
}

export interface AppSettings {
    theme: 'dark' | 'light';
    themeContrast: 'low' | 'medium' | 'high';
    accentColor: string;
    combineLogoAndUIHide: boolean;
    calendar: {
        showWeekNumbers: boolean;
        showMonthNumber: boolean;
        startOfWeek: 0 | 1;
        highlightWeekends: boolean;
        weekendDays: number[];
    };
    calendarBackground: BackgroundSetting;
    customBackgrounds: BackgroundSetting[];
    chat: {
        behavior: 'overlay' | 'header_button';
    };
    navigation: {
        desktopStyle: 'header' | 'side_bar_left' | 'side_bar_right';
        sideBarLabels: 'show' | 'hide_on_hover';
        mobileStyle: 'header' | 'bottom_bar';
        mobileBottomBarHeight: 'normal' | 'compact';
        desktopHeaderItems: NavItemId[];
        mobileBottomBarItems: NavItemId[];
    };
    language: {
        appLanguage: 'en' | 'ru';
        voiceInputLanguage: string;
    };
}