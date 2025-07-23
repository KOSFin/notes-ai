import React, { useState, useEffect, useCallback } from 'react';
import { RunningApp } from '../types';
import Icon from './Icon';

interface ScriptWindowProps {
    app: RunningApp;
    setApps: React.Dispatch<React.SetStateAction<RunningApp[]>>;
    isMobile: boolean;
    onFocus: (appId: string) => void;
    onClose: (appId: string) => void;
    onMinimize: (appId: string) => void;
}

const ScriptWindow: React.FC<ScriptWindowProps> = ({ app, setApps, isMobile, onFocus, onClose, onMinimize }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [resizeHandle, setResizeHandle] = useState<string | null>(null);

    const handleDragMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (isMobile) return;
        onFocus(app.id);
        setIsDragging(true);
        setDragOffset({
            x: e.clientX - app.position.x,
            y: e.clientY - app.position.y,
        });
        e.preventDefault();
    };

    const handleResizeMouseDown = (e: React.MouseEvent<HTMLDivElement>, handle: string) => {
        if (isMobile) return;
        onFocus(app.id);
        setIsResizing(true);
        setResizeHandle(handle);
        e.stopPropagation();
        e.preventDefault();
    }

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (isDragging) {
            setApps(prev => prev.map(p => 
                p.id === app.id 
                ? { ...p, position: { x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y } } 
                : p
            ));
        }
        if (isResizing && resizeHandle) {
             setApps(prev => prev.map(p => {
                if (p.id === app.id) {
                    let { x, y } = p.position;
                    let { width, height } = p.size;
                    const minWidth = 200;
                    const minHeight = 150;

                    if (resizeHandle.includes('e')) {
                        width = Math.max(minWidth, width + e.movementX);
                    }
                    if (resizeHandle.includes('w')) {
                        const newWidth = width - e.movementX;
                        if (newWidth >= minWidth) {
                            x += e.movementX;
                            width = newWidth;
                        }
                    }
                    if (resizeHandle.includes('s')) {
                        height = Math.max(minHeight, height + e.movementY);
                    }
                    if (resizeHandle.includes('n')) {
                        const newHeight = height - e.movementY;
                        if (newHeight >= minHeight) {
                            y += e.movementY;
                            height = newHeight;
                        }
                    }
                    return { ...p, position: { x, y }, size: { width, height } };
                }
                return p;
            }));
        }
    }, [isDragging, isResizing, resizeHandle, dragOffset, app.id, setApps]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
        setIsResizing(false);
        setResizeHandle(null);
    }, []);

    useEffect(() => {
        if (isDragging || isResizing) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp, { once: true });
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

    const srcDoc = `
        <html>
            <head>
                <style>
                    body { margin: 0; background-color: #1a1a1a; color: #f0f0f0; font-family: sans-serif; overflow: auto; }
                    ${app.css}
                </style>
            </head>
            <body>
                ${app.html}
                <script>${app.javascript}</script>
            </body>
        </html>
    `;
    
    const windowStyle: React.CSSProperties = isMobile
        ? { zIndex: app.zIndex }
        : {
            left: `${app.position.x}px`,
            top: `${app.position.y}px`,
            width: `${app.size.width}px`,
            height: `${app.size.height}px`,
            zIndex: app.zIndex,
          };

    return (
        <div
            className={isMobile
                ? "fixed inset-x-0 bottom-0 top-16 bg-secondary flex flex-col pointer-events-auto"
                : "absolute bg-secondary rounded-lg shadow-2xl flex flex-col border border-border-color/50 overflow-hidden pointer-events-auto"
            }
            style={windowStyle}
            onMouseDown={() => !isMobile && onFocus(app.id)}
        >
            <div
                className={`h-8 flex items-center justify-between px-2 text-text-secondary flex-shrink-0 ${isMobile ? 'bg-primary' : 'bg-border-color cursor-move'}`}
                onMouseDown={handleDragMouseDown}
            >
                <span className="text-sm font-bold truncate select-none">{app.title}</span>
                <div className="flex items-center space-x-1">
                    <button 
                        onClick={() => onMinimize(app.id)} 
                        className="p-2 rounded-full hover:bg-primary/50"
                        onMouseDown={(e) => e.stopPropagation()}
                    >
                        <Icon name="minimize" className="h-4 w-4" />
                    </button>
                    <button 
                        onClick={() => onClose(app.id)} 
                        className="p-2 rounded-full hover:bg-red-500 hover:text-white"
                        onMouseDown={(e) => e.stopPropagation()}
                    >
                        <Icon name="close" className="h-4 w-4" />
                    </button>
                </div>
            </div>
            <div className="flex-1 bg-primary relative">
                 <iframe
                    srcDoc={srcDoc}
                    sandbox="allow-scripts allow-forms"
                    className="w-full h-full border-0"
                    title={app.title}
                />
                {!isMobile && (
                    <>
                        <div onMouseDown={(e) => handleResizeMouseDown(e, 'nw')} className="absolute -top-1 -left-1 w-3 h-3 cursor-nwse-resize z-10" />
                        <div onMouseDown={(e) => handleResizeMouseDown(e, 'ne')} className="absolute -top-1 -right-1 w-3 h-3 cursor-nesw-resize z-10" />
                        <div onMouseDown={(e) => handleResizeMouseDown(e, 'sw')} className="absolute -bottom-1 -left-1 w-3 h-3 cursor-nesw-resize z-10" />
                        <div onMouseDown={(e) => handleResizeMouseDown(e, 'se')} className="absolute -bottom-1 -right-1 w-3 h-3 cursor-nwse-resize z-10" />
                        <div onMouseDown={(e) => handleResizeMouseDown(e, 'n')} className="absolute inset-x-2 -top-1 h-2 cursor-ns-resize z-10" />
                        <div onMouseDown={(e) => handleResizeMouseDown(e, 's')} className="absolute inset-x-2 -bottom-1 h-2 cursor-ns-resize z-10" />
                        <div onMouseDown={(e) => handleResizeMouseDown(e, 'w')} className="absolute inset-y-2 -left-1 w-2 cursor-ew-resize z-10" />
                        <div onMouseDown={(e) => handleResizeMouseDown(e, 'e')} className="absolute inset-y-2 -right-1 w-2 cursor-ew-resize z-10" />
                    </>
                )}
            </div>
        </div>
    );
};

export default ScriptWindow;