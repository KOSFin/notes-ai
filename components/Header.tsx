
import React from 'react';
import Icon from './Icon';
import { AppSettings, NavItem, NavItemId } from '../types';
import { t } from '../localization';

interface HeaderProps {
    onToggleUI: () => void;
    onClearScript: () => void;
    isScriptActive: boolean;
    userName?: string;
    settings: AppSettings;
    onNavAction: (id: NavItemId) => void;
    items: NavItem[];
    hiddenItemCount: number;
    onMoreClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
    getIsActive: (id: NavItemId) => boolean;
    unreadNotificationsCount: number;
    onNotificationsClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

const Header: React.FC<HeaderProps> = ({ 
    onToggleUI, 
    onClearScript,
    isScriptActive,
    userName,
    settings,
    onNavAction,
    items,
    hiddenItemCount,
    onMoreClick,
    getIsActive,
    unreadNotificationsCount,
    onNotificationsClick,
}) => {
    
    return (
        <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between p-3 bg-secondary/50 border-b border-border-color shadow-md backdrop-blur-sm">
            <div className="flex items-center space-x-3">
                <button onClick={onToggleUI} className="p-1 rounded-full hover:bg-primary/50" title={t('header.toggleUI')}>
                    <Icon name="logo" className="h-8 w-8 text-accent"/>
                </button>
                <h1 className="text-xl font-bold text-text-primary hidden sm:block">{t('header.title')}</h1>
            </div>
            <div className="flex items-center space-x-1 md:space-x-2">
                {userName && <span className="text-text-secondary hidden md:inline">{t('header.greeting', {name: userName})}</span>}
                 
                {items.map(item => (
                    <HeaderButton
                        key={item.id}
                        onClick={(e) => item.id === 'notifications' ? onNotificationsClick(e) : onNavAction(item.id)}
                        tooltip={t(`nav.${item.id}`)}
                        isActive={getIsActive(item.id)}
                    >
                        <Icon name={item.icon} className="h-6 w-6 md:h-5 md:w-5"/>
                        {item.id === 'notifications' && unreadNotificationsCount > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold animate-pop-in">
                                {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                            </span>
                        )}
                    </HeaderButton>
                ))}

                {hiddenItemCount > 0 && (
                    <HeaderButton onClick={onMoreClick} tooltip={t('common.more')} aria-label="More menu button">
                        <Icon name="menu" className="h-6 w-6 md:h-5 md:w-5" />
                    </HeaderButton>
                )}

                {isScriptActive && (
                    <HeaderButton onClick={() => onClearScript()} tooltip={t('header.closeAllApps')}>
                        <Icon name="clearScript" className="h-6 w-6 md:h-5 md:w-5"/>
                    </HeaderButton>
                )}
              
                {!settings.combineLogoAndUIHide && (
                    <HeaderButton onClick={() => onToggleUI()} tooltip={t('header.hideUI')}>
                       <Icon name={"hide"} className="h-6 w-6 md:h-5 md:w-5"/>
                    </HeaderButton>
                )}
            </div>
        </header>
    );
};

interface HeaderButtonProps {
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
    children: React.ReactNode;
    tooltip: string;
    isActive?: boolean;
    'aria-label'?: string;
}

const HeaderButton: React.FC<HeaderButtonProps> = ({ onClick, children, tooltip, isActive = false, ...props }) => (
    <div className="relative group">
        <button
            onClick={onClick}
            aria-label={props['aria-label'] || tooltip}
            className={`p-3 md:p-2 rounded-full text-text-secondary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent ${
                isActive 
                ? 'bg-accent text-white' 
                : 'bg-primary hover:bg-border-color hover:text-text-primary'
            }`}
        >
            {children}
        </button>
        <div className="absolute top-full mt-2 right-1/2 translate-x-1/2 px-2 py-1 bg-secondary text-text-primary text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            {tooltip}
        </div>
    </div>
);


export default Header;
