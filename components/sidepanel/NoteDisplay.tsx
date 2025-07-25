
import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import ReactQuill from 'react-quill';
import { Note, BackgroundSetting, AppSettings } from '../../types';
import Icon from '../Icon';
import NoteBackgroundMenu from './NoteBackgroundMenu';
import { t } from '../../localization';

interface NoteDisplayProps {
    note: Note | null;
    onBack: () => void;
    startInEditMode: boolean;
    onCreate: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
    onUpdate: (note: Note) => void;
    onDelete: (noteId: string) => void;
    allFolders: string[];
    settings: AppSettings;
    setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
}

const NoteDisplay: React.FC<NoteDisplayProps> = ({ note, onBack, startInEditMode, onCreate, onUpdate, onDelete, allFolders, settings, setSettings }) => {
    const [isEditing, setIsEditing] = useState(startInEditMode || !note?.id || note.id === 'new');
    const [isBackgroundMenuOpen, setBackgroundMenuOpen] = useState(false);
    const [title, setTitle] = useState(note?.title || '');
    const [folder, setFolder] = useState(note?.folder || 'Uncategorized');
    const [content, setContent] = useState(note?.content || '');
    const [background, setBackground] = useState<BackgroundSetting>(note?.background || { type: 'none', value: '', dim: 50 });
    const quillRef = useRef<ReactQuill>(null);

    useEffect(() => {
        if (note) {
            setBackground(note.background || { type: 'none', value: '', dim: 50 });
            if (!isEditing) {
                setTitle(note.title);
                setFolder(note.folder);
                setContent(note.content);
            }
        }
    }, [isEditing, note]);

    const imageHandler = useCallback(() => {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = async () => {
            if (!input.files || !quillRef.current) return;
            const file = input.files[0];
            const reader = new FileReader();
            reader.onload = (e) => {
                const base64Image = e.target?.result;
                if (base64Image) {
                    const quill = quillRef.current.getEditor();
                    const range = quill.getSelection(true);
                    quill.insertEmbed(range.index, 'image', base64Image as string, 'user');
                    quill.setSelection(range.index + 1, 0);
                }
            };
            reader.readAsDataURL(file);
        };
    }, []);

    const modules = useMemo(() => ({
        toolbar: {
            container: [
                [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
                [{ 'color': [] }, { 'background': [] }],
                ['link', 'image'],
                ['clean']
            ],
            handlers: {
                image: imageHandler,
            }
        },
        clipboard: {
            matchVisual: false,
        }
    }), [imageHandler]);

    const formats = [
        'header', 'font', 'size',
        'bold', 'italic', 'underline', 'strike', 'blockquote',
        'list', 'bullet', 'indent', 'color', 'background',
        'link', 'image'
    ];


    const handleSave = () => {
        if (!title.trim() || !note) return;
        const newContent = content;

        if (note.id === 'new') {
            onCreate({ title, content: newContent, folder, background });
        } else {
            onUpdate({ ...note, title, content: newContent, folder, background });
        }
        setIsEditing(false);
    };
    
    const handleDelete = () => {
        if (note && note.id !== 'new') {
            onDelete(note.id);
            onBack();
        }
    }

    const handleCancel = () => {
        if (note?.id === 'new') {
            onBack();
        } else {
            setIsEditing(false);
            setBackground(note?.background || { type: 'none', value: '', dim: 50 });
        }
    };
    
    const handleBackgroundUpdate = (bg: BackgroundSetting) => {
        setBackground(bg);
        if (note && note.id !== 'new') {
            onUpdate({ ...note, background: bg });
        }
    };

    const editorStyles = `
        .note-editor-container .ql-toolbar { 
            position: sticky; top: -1px; z-index: 10;
            background-color: var(--ql-toolbar-bg, #2a2a2a) !important; 
            border-top: 1px solid var(--ql-border-color, #3a3a3a) !important; 
            border-bottom: 1px solid var(--ql-border-color, #3a3a3a) !important; 
            border-left: none !important;
            border-right: none !important;
        }
        [data-theme='light'] .note-editor-container .ql-toolbar {
             --ql-toolbar-bg: #e5e7eb;
             --ql-border-color: #d1d5db;
        }
        [data-theme='dark'] .note-editor-container .ql-toolbar {
             --ql-toolbar-bg: #1f2937;
             --ql-border-color: #374151;
        }
        .note-editor-container .ql-container { 
            background: transparent !important; 
            border: none !important; 
            font-size: 1rem;
        }
        .note-editor-container .ql-editor { 
            color: hsl(var(--text-primary-hsl)); 
            min-height: 50vh;
            height: auto !important;
            padding-bottom: 30vh !important;
            width: 100%;
        }
        .note-editor-container .ql-editor.ql-blank::before { 
            color: hsl(var(--text-secondary-hsl)) !important; 
            font-style: normal !important;
        }
        .ql-snow .ql-stroke { stroke: hsl(var(--text-secondary-hsl)); }
        .ql-snow .ql-fill { fill: hsl(var(--text-secondary-hsl)); }
        .ql-snow .ql-picker { color: hsl(var(--text-secondary-hsl)); }
        .ql-snow .ql-picker-options { background-color: hsl(var(--secondary-hsl)); border-color: hsl(var(--border-hsl)) !important; color: hsl(var(--text-primary-hsl)); }

        .note-content-display.ql-editor { 
            min-height: 0; 
            border: none !important; 
            padding: 0;
            height: fit-content;
        }
        .note-content-display.ql-editor img { max-width: 100%; height: auto; border-radius: 8px; }
    `;

    return (
        <div className="flex flex-col h-full bg-secondary relative">
            {background.type !== 'none' && (
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <div
                        className="absolute inset-0 bg-cover bg-center transition-all duration-300"
                        style={{ backgroundImage: `url(${background.value})` }}
                    />
                    <div
                        className="absolute inset-0 bg-primary transition-opacity duration-300"
                        style={{ opacity: background.dim / 100 }}
                    />
                </div>
            )}
            <div className="relative z-10 flex flex-col h-full bg-transparent">
                <style>{editorStyles}</style>
                <div className="flex items-center p-4 border-b border-border-color/50 flex-shrink-0 bg-secondary/50 backdrop-blur-sm">
                    <div className="flex-none">
                        <button onClick={isEditing ? handleCancel : onBack} className="flex items-center gap-2 p-2 rounded-full hover:bg-border-color">
                            <Icon name="back" className="h-6 w-6" />
                        </button>
                    </div>
                    
                    <h2 className="flex-1 text-center text-lg md:text-xl font-bold truncate px-2">
                        {isEditing ? (note?.id === 'new' ? t('dashboard.newNote') : t('dashboard.editNote')) : ''}
                    </h2>

                    <div className="flex-none flex items-center space-x-2">
                        {isEditing ? (
                             <button onClick={handleSave} className="px-4 py-2 rounded-md bg-accent text-white hover:bg-accent-hover">{t('common.save')}</button>
                        ) : (
                            <>
                                {note?.id !== 'new' && (
                                    <button onClick={() => setBackgroundMenuOpen(p => !p)} className={`p-2 rounded-full hover:bg-border-color text-text-secondary ${isBackgroundMenuOpen ? 'bg-accent text-white' : 'hover:text-accent'}`} title={t('dashboard.note.style')}>
                                        <Icon name="shirt" className="h-5 w-5" />
                                    </button>
                                )}
                                {note?.id !== 'new' && (
                                    <button onClick={() => setIsEditing(true)} className="p-2 rounded-full hover:bg-border-color text-text-secondary hover:text-accent" title={t('common.edit')}>
                                        <Icon name="edit" className="h-5 w-5" />
                                    </button>
                                )}
                                {note?.id !== 'new' && (
                                    <button onClick={handleDelete} className="p-2 rounded-full hover:bg-border-color text-text-secondary hover:text-red-500" title={t('common.delete')}>
                                        <Icon name="delete" className="h-5 w-5" />
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto scrollbar-hide">
                    {isEditing ? (
                        <div className="note-editor-container bg-primary/80">
                            <div className="p-4 space-y-4">
                                <input placeholder={t('dashboard.note.title.placeholder')} id="note-title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-transparent text-3xl font-bold border-none focus:outline-none placeholder-text-secondary"/>
                                <input placeholder={t('dashboard.note.folder.placeholder')} id="note-folder" type="text" value={folder} onChange={(e) => setFolder(e.target.value)} list="folder-suggestions" className="w-full border-0 border-b-2 border-border-color bg-transparent py-2 px-3 text-text-primary focus:outline-none focus:ring-0 focus:border-accent"/>
                                <datalist id="folder-suggestions">
                                    {allFolders.map(f => <option key={f} value={f} />)}
                                </datalist>
                            </div>
                            <ReactQuill 
                                ref={quillRef}
                                theme="snow"
                                value={content}
                                onChange={setContent}
                                modules={modules}
                                formats={formats}
                                placeholder={t('dashboard.note.content.placeholder')}
                            />
                        </div>
                    ) : (
                        <div className="p-4 cursor-text" onClick={() => note?.id !== 'new' ? setIsEditing(true) : undefined}>
                            <div className="pb-3 mb-3 border-b border-border-color/50">
                                <h2 className="text-3xl font-bold">{note?.title || t('common.untitled')}</h2>
                                <p className="text-sm text-text-secondary mt-1">{t('dashboard.note.folder_prefix')}: {note?.folder}</p>
                            </div>
                            <div className="ql-snow">
                                <div
                                    className="note-content-display ql-editor"
                                    dangerouslySetInnerHTML={{ __html: note?.content || `<p class="text-text-secondary"><em>${t('dashboard.note.empty')}</em></p>` }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {isBackgroundMenuOpen && (
                <NoteBackgroundMenu 
                    currentBackground={background}
                    onUpdate={handleBackgroundUpdate}
                    onClose={() => setBackgroundMenuOpen(false)}
                    settings={settings}
                    setSettings={setSettings}
                />
            )}
        </div>
    );
};

export default NoteDisplay;
