import React from 'react';
import { RunningApp } from '../types';
import ScriptWindow from './ScriptWindow';
import Icon from './Icon';

interface ScriptContainerProps {
    apps: RunningApp[];
    setApps: React.Dispatch<React.SetStateAction<RunningApp[]>>;
    isMobile: boolean;
}

const ScriptContainer: React.FC<ScriptContainerProps> = ({ apps, setApps, isMobile }) => {

    const bringToFront = (appId: string) => {
        const maxZ = Math.max(0, ...apps.map(a => a.zIndex));
        setApps(prev => prev.map(app => app.id === appId ? { ...app, zIndex: maxZ + 1, isMinimized: false } : app));
    };

    const closeApp = (appId: string) => {
        setApps(prev => prev.filter(app => app.id !== appId));
    };
    
    const toggleMinimize = (appId: string) => {
        setApps(prev => prev.map(app => app.id === appId ? { ...app, isMinimized: !app.isMinimized } : app));
    };

    const minimizedApps = apps.filter(app => app.isMinimized);

    return (
        <>
            <div className="absolute inset-0 z-20 pointer-events-none">
                {apps.filter(app => !app.isMinimized).map(app => (
                    <ScriptWindow
                        key={app.id}
                        app={app}
                        setApps={setApps}
                        isMobile={isMobile}
                        onFocus={bringToFront}
                        onClose={closeApp}
                        onMinimize={toggleMinimize}
                    />
                ))}
            </div>
            {minimizedApps.length > 0 && (
                 <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-40 flex space-x-2 p-2">
                    {minimizedApps.map(app => (
                        <button 
                            key={app.id}
                            onClick={() => toggleMinimize(app.id)}
                            className="bg-secondary hover:bg-accent hover:text-white text-text-secondary rounded-md px-4 py-2 text-sm font-semibold shadow-lg pointer-events-auto transition-colors"
                        >
                            {app.title}
                        </button>
                    ))}
                 </div>
            )}
        </>
    );
};

export default ScriptContainer;