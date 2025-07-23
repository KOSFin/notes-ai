


import React from 'react';
import { NavItem, NavItemId, AppSettings } from '../types';
import Icon from './Icon';
import { t } from '../localization';

interface SideNavBarProps {
    items: NavItem[];
    hiddenItemCount: number;
    onItemClick: (id: NavItemId) => void;
    onMoreClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
    settings: AppSettings;
    getIsActive: (id: NavItemId) => boolean;
    onLogoClick: () => void;
}

const SideNavBar: React.FC<SideNavBarProps> = ({
    items,
    hiddenItemCount,
    onItemClick,
    onMoreClick,
    settings,
    getIsActive,
    onLogoClick
}) => {
    const { desktopStyle, sideBarLabels } = settings.navigation;
    const isLeft = desktopStyle === 'side_bar_left';
    const showLabels = sideBarLabels === 'show';
    const hasMoreButton = hiddenItemCount > 0;

    const navClasses = `fixed top-0 bottom-0 z-40 bg-secondary border-border-color flex flex-col items-center py-4 transition-all duration-300 ease-in-out group ${
        isLeft ? 'left-0 border-r' : 'right-0 border-l'
    } ${
        showLabels ? 'w-44' : 'w-20 hover:w-44'
    }`;
    
    return (
        <nav className={navClasses}>
            <button onClick={onLogoClick} className="p-2 rounded-full hover:bg-primary/50 mb-8" title={t('header.toggleUI')}>
                <Icon name="logo" className="h-10 w-10 text-accent"/>
            </button>
            
            <div className="flex flex-col items-center gap-2 w-full px-2">
                {items.map(item => (
                    <NavItemButton 
                        key={item.id}
                        item={item}
                        onClick={() => onItemClick(item.id)}
                        isActive={getIsActive(item.id)}
                        showLabel={showLabels}
                    />
                ))}
            </div>

            <div className="mt-auto w-full px-2">
                {hasMoreButton && (
                    <NavItemButton
                         item={{ id: 'more', name: t('common.more'), icon: 'menu' } as any}
                         onClick={onMoreClick}
                         isActive={false}
                         showLabel={showLabels}
                         aria-label={t('common.more')}
                     />
                )}
            </div>
        </nav>
    );
};

const NavItemButton: React.FC<{ item: NavItem, onClick: (event: React.MouseEvent<HTMLButtonElement>) => void, isActive: boolean, showLabel: boolean, 'aria-label'?: string }> = ({ item, onClick, isActive, showLabel, ...props }) => {
    const buttonClasses = `flex items-center w-full rounded-lg p-3 transition-colors duration-200 ${
        isActive ? 'bg-accent text-white' : 'text-text-secondary hover:bg-border-color hover:text-text-primary'
    } ${
        showLabel ? 'justify-start' : 'justify-center group-hover:justify-start'
    }`;

    const label = t(`nav.${item.id}` as any) || item.name;

    return (
        <button onClick={onClick} className={buttonClasses} aria-label={props['aria-label'] || label}>
            <Icon name={item.icon} className="h-6 w-6 flex-shrink-0" />
            <span className={`font-semibold whitespace-nowrap transition-all duration-200 ${
                showLabel ? 'ml-4 opacity-100' : 'w-0 ml-0 opacity-0 group-hover:w-auto group-hover:ml-4 group-hover:opacity-100'
            }`}>
                {label}
            </span>
        </button>
    );
};


export default SideNavBar;