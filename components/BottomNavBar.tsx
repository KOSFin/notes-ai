
import React from 'react';
import { NavItem, NavItemId, AppSettings } from '../types';
import Icon from './Icon';
import { t } from '../localization';

interface BottomNavBarProps {
    items: NavItem[];
    hiddenItemCount: number;
    onItemClick: (id: NavItemId, event: React.MouseEvent<HTMLButtonElement>) => void;
    onMoreClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
    settings: AppSettings;
    getIsActive: (id: NavItemId) => boolean;
    unreadNotificationsCount: number;
}

const BottomNavBar: React.FC<BottomNavBarProps> = ({ items, hiddenItemCount, onItemClick, onMoreClick, settings, getIsActive, unreadNotificationsCount }) => {
    const hasMoreButton = hiddenItemCount > 0;
    const heightClass = settings.navigation.mobileBottomBarHeight === 'compact' ? 'h-16' : 'h-20';

    return (
        <footer className={`fixed bottom-0 left-0 right-0 z-40 bg-secondary/80 backdrop-blur-lg border-t border-border-color ${heightClass}`}>
            <div className="flex justify-around items-center h-full">
                {items.map(item => (
                    <NavItemButton 
                        key={item.id} 
                        item={item} 
                        onClick={(e) => onItemClick(item.id, e)} 
                        isActive={getIsActive(item.id)}
                        unreadCount={item.id === 'notifications' ? unreadNotificationsCount : 0}
                    />
                ))}
                {hasMoreButton && (
                    <NavItemButton 
                        item={{ id: 'more', name: t('common.more'), icon: 'menu' } as any}
                        onClick={onMoreClick}
                        isActive={false}
                        unreadCount={0}
                    />
                )}
            </div>
        </footer>
    );
};

const NavItemButton: React.FC<{ item: NavItem, onClick: (event: React.MouseEvent<HTMLButtonElement>) => void, isActive: boolean, unreadCount: number }> = ({ item, onClick, isActive, unreadCount }) => (
    <button onClick={onClick} className={`relative flex flex-col items-center justify-center w-16 transition-colors ${isActive ? 'text-accent' : 'text-text-secondary hover:text-accent'}`}>
        <Icon name={item.icon} className="h-6 w-6 mb-1" />
        <span className="text-xs font-medium">{t(`nav.${item.id}` as any) || item.name}</span>
        {unreadCount > 0 && (
             <span className="absolute top-1 right-3 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold">
                {unreadCount > 9 ? '9+' : unreadCount}
            </span>
        )}
    </button>
);

export default BottomNavBar;