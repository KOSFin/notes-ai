


import React from 'react';
import { NavItem, NavItemId, AppSettings } from '../types';
import Icon from './Icon';
import { t } from '../localization';

interface BottomNavBarProps {
    items: NavItem[];
    hiddenItemCount: number;
    onItemClick: (id: NavItemId) => void;
    onMoreClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
    settings: AppSettings;
    getIsActive: (id: NavItemId) => boolean;
}

const BottomNavBar: React.FC<BottomNavBarProps> = ({ items, hiddenItemCount, onItemClick, onMoreClick, settings, getIsActive }) => {
    const itemsToShow = items.slice(0, 4);
    const hasMoreButton = hiddenItemCount > 0 || items.length > 4;
    const heightClass = settings.navigation.mobileBottomBarHeight === 'compact' ? 'h-16' : 'h-20';

    return (
        <footer className={`fixed bottom-0 left-0 right-0 z-40 bg-secondary/80 backdrop-blur-lg border-t border-border-color ${heightClass}`}>
            <div className="flex justify-around items-center h-full">
                {itemsToShow.map(item => (
                    <NavItemButton 
                        key={item.id} 
                        item={item} 
                        onClick={() => onItemClick(item.id)} 
                        isActive={getIsActive(item.id)}
                    />
                ))}
                {hasMoreButton && (
                    <NavItemButton 
                        item={{ id: 'more', name: t('common.more'), icon: 'menu' } as any}
                        onClick={onMoreClick}
                        isActive={false} // 'More' button is never active
                    />
                )}
            </div>
        </footer>
    );
};

const NavItemButton: React.FC<{ item: NavItem, onClick: (event: React.MouseEvent<HTMLButtonElement>) => void, isActive: boolean }> = ({ item, onClick, isActive }) => (
    <button onClick={onClick} className={`flex flex-col items-center justify-center w-16 transition-colors ${isActive ? 'text-accent' : 'text-text-secondary hover:text-accent'}`}>
        <Icon name={item.icon} className="h-6 w-6 mb-1" />
        <span className="text-xs font-medium">{t(`nav.${item.id}` as any) || item.name}</span>
    </button>
);

export default BottomNavBar;