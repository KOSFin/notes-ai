


import React, { useState } from 'react';
import { AppSettings, NavItem, NavItemId } from '../../types';
import { ALL_NAV_ITEMS } from '../../constants';
import Icon from '../Icon';
import { t } from '../../localization';

const TabButton = ({ name, isActive, onClick }: { name: string, isActive: boolean, onClick: () => void }) => (
    <button onClick={onClick} className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md text-sm font-semibold transition-colors ${isActive ? 'bg-accent text-white' : 'text-text-secondary hover:bg-border-color'}`}>
        <span>{name}</span>
    </button>
);


const NavigationSettings = ({ settings, setSettings, isMobile }: { settings: AppSettings, setSettings: React.Dispatch<React.SetStateAction<AppSettings>>, isMobile: boolean }) => {
    const [currentEditor, setCurrentEditor] = useState<'header' | 'bottom_bar'>('header');

    const handleMobileStyleChange = (style: 'header' | 'bottom_bar') => {
        setSettings(prev => ({
            ...prev,
            navigation: { ...prev.navigation, mobileStyle: style },
        }));
    };
    
    const handleDesktopStyleChange = (style: 'header' | 'side_bar_left' | 'side_bar_right') => {
        setSettings(prev => ({
            ...prev,
            navigation: { ...prev.navigation, desktopStyle: style },
        }));
    };
    
    const handleSideBarLabelsChange = (style: 'show' | 'hide_on_hover') => {
        setSettings(prev => ({
            ...prev,
            navigation: { ...prev.navigation, sideBarLabels: style },
        }));
    };

    const handleMobileBarHeightChange = (height: 'normal' | 'compact') => {
        setSettings(prev => ({
            ...prev,
            navigation: { ...prev.navigation, mobileBottomBarHeight: height },
        }));
    };

    return (
        <div className="space-y-8">
            <h3 className="text-2xl font-bold">{t('settings.navigation.title')}</h3>

            {!isMobile && (
                <section>
                    <h4 className="text-lg font-semibold mb-3">{t('settings.navigation.desktopStyle')}</h4>
                    <div className="p-4 bg-primary rounded-lg space-y-3">
                        <p className="text-sm text-text-secondary">{t('settings.navigation.desktopStyle.description')}</p>
                        <BehaviorOption
                            title={t('settings.navigation.desktopStyle.header')}
                            description={t('settings.navigation.desktopStyle.header.desc')}
                            isActive={settings.navigation.desktopStyle === 'header'}
                            onClick={() => handleDesktopStyleChange('header')}
                        />
                        <BehaviorOption
                            title={t('settings.navigation.desktopStyle.sidebarLeft')}
                            description={t('settings.navigation.desktopStyle.sidebarLeft.desc')}
                            isActive={settings.navigation.desktopStyle === 'side_bar_left'}
                            onClick={() => handleDesktopStyleChange('side_bar_left')}
                        />
                        <BehaviorOption
                            title={t('settings.navigation.desktopStyle.sidebarRight')}
                            description={t('settings.navigation.desktopStyle.sidebarRight.desc')}
                            isActive={settings.navigation.desktopStyle === 'side_bar_right'}
                            onClick={() => handleDesktopStyleChange('side_bar_right')}
                        />
                        {settings.navigation.desktopStyle !== 'header' && (
                            <div className="pt-4 border-t border-border-color/50 space-y-3">
                                <p className="text-sm text-text-secondary">{t('settings.navigation.sidebarLabels')}</p>
                                <BehaviorOption
                                    title={t('settings.navigation.sidebarLabels.show')}
                                    description={t('settings.navigation.sidebarLabels.show.desc')}
                                    isActive={settings.navigation.sideBarLabels === 'show'}
                                    onClick={() => handleSideBarLabelsChange('show')}
                                />
                                <BehaviorOption
                                    title={t('settings.navigation.sidebarLabels.hover')}
                                    description={t('settings.navigation.sidebarLabels.hover.desc')}
                                    isActive={settings.navigation.sideBarLabels === 'hide_on_hover'}
                                    onClick={() => handleSideBarLabelsChange('hide_on_hover')}
                                />
                            </div>
                        )}
                    </div>
                </section>
            )}
            
            {isMobile && (
                <section>
                    <h4 className="text-lg font-semibold mb-3">{t('settings.navigation.mobileStyle')}</h4>
                    <div className="p-4 bg-primary rounded-lg space-y-3">
                        <p className="text-sm text-text-secondary">{t('settings.navigation.mobileStyle.description')}</p>
                        <BehaviorOption
                            title={t('settings.navigation.desktopStyle.header')}
                            description={t('settings.navigation.desktopStyle.header.desc')}
                            isActive={settings.navigation.mobileStyle === 'header'}
                            onClick={() => handleMobileStyleChange('header')}
                        />
                        <BehaviorOption
                            title={t('settings.navigation.mobileStyle.bottom')}
                            description={t('settings.navigation.mobileStyle.bottom.desc')}
                            isActive={settings.navigation.mobileStyle === 'bottom_bar'}
                            onClick={() => handleMobileStyleChange('bottom_bar')}
                        />
                        {settings.navigation.mobileStyle === 'bottom_bar' && (
                            <div className="pt-4 border-t border-border-color/50 space-y-3">
                                <p className="text-sm text-text-secondary">{t('settings.navigation.mobileHeight')}</p>
                                <BehaviorOption
                                    title={t('settings.navigation.mobileHeight.normal')}
                                    description={t('settings.navigation.mobileHeight.normal.desc')}
                                    isActive={settings.navigation.mobileBottomBarHeight === 'normal'}
                                    onClick={() => handleMobileBarHeightChange('normal')}
                                />
                                <BehaviorOption
                                    title={t('settings.navigation.mobileHeight.compact')}
                                    description={t('settings.navigation.mobileHeight.compact.desc')}
                                    isActive={settings.navigation.mobileBottomBarHeight === 'compact'}
                                    onClick={() => handleMobileBarHeightChange('compact')}
                                />
                            </div>
                        )}
                    </div>
                </section>
            )}
            
            <section>
                <h4 className="text-lg font-semibold mb-3">{t('settings.navigation.customize')}</h4>
                 <div className="p-4 bg-primary rounded-lg">
                    <div className="flex space-x-1 bg-secondary p-1 rounded-lg mb-4">
                        <TabButton name={t('settings.navigation.customize.header')} isActive={currentEditor === 'header'} onClick={() => setCurrentEditor('header')} />
                        <TabButton name={t('settings.navigation.customize.bottomBar')} isActive={currentEditor === 'bottom_bar'} onClick={() => setCurrentEditor('bottom_bar')} />
                    </div>
                    
                    <div className="animate-fade-in">
                        {currentEditor === 'header' && (
                            <NavLayoutEditor
                                title={t('settings.navigation.customize.header')}
                                description={t('settings.navigation.customize.header.desc')}
                                visibleItems={settings.navigation.desktopHeaderItems}
                                setVisibleItems={(items) => setSettings(prev => ({ ...prev, navigation: { ...prev.navigation, desktopHeaderItems: items } }))}
                            />
                        )}
                        {currentEditor === 'bottom_bar' && (
                            <NavLayoutEditor
                                title={t('settings.navigation.customize.bottomBar')}
                                description={t('settings.navigation.customize.bottomBar.desc')}
                                visibleItems={settings.navigation.mobileBottomBarItems}
                                setVisibleItems={(items) => setSettings(prev => ({ ...prev, navigation: { ...prev.navigation, mobileBottomBarItems: items } }))}
                                itemLimit={5}
                            />
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
};

const BehaviorOption = ({ title, description, isActive, onClick }: { title: string, description: string, isActive: boolean, onClick: () => void }) => (
    <div 
        onClick={onClick}
        className={`p-4 rounded-lg border-2 cursor-pointer transition-all flex items-center gap-4 ${isActive ? 'border-accent bg-accent/10' : 'border-border-color hover:border-text-secondary/50'}`}
    >
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isActive ? 'bg-accent border-accent' : 'border-border-color'}`}>
            {isActive && <Icon name="check" className="h-3 w-3 text-white" />}
        </div>
        <div className="flex-1">
            <h5 className="font-semibold text-text-primary">{title}</h5>
            <p className="text-sm text-text-secondary">{description}</p>
        </div>
    </div>
);


const NavLayoutEditor = ({ title, description, visibleItems, setVisibleItems, itemLimit }: { title: string, description: string, visibleItems: NavItemId[], setVisibleItems: (items: NavItemId[]) => void, itemLimit?: number }) => {
    const hiddenItems = ALL_NAV_ITEMS.filter(item => !visibleItems.includes(item.id)).map(item => item.id);
    const [draggedItem, setDraggedItem] = useState<NavItemId | null>(null);

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: NavItemId) => {
        setDraggedItem(id);
        if (e.dataTransfer) {
            e.dataTransfer.effectAllowed = 'move';
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetList: 'visible' | 'hidden') => {
        e.preventDefault();
        if (!draggedItem) return;

        const currentList = visibleItems.includes(draggedItem) ? 'visible' : 'hidden';

        // Find the element being hovered over to determine insertion point
        const targetElement = (e.target as HTMLElement).closest('[data-id]');
        const dragOverId = targetElement?.getAttribute('data-id') as NavItemId | null;

        if (targetList === 'visible') {
            if (itemLimit && visibleItems.length >= itemLimit && currentList === 'hidden') {
                setDraggedItem(null);
                return;
            }
            let newVisible = [...visibleItems];
            
            // Remove from old position
            if (currentList === 'visible') {
                newVisible = newVisible.filter(id => id !== draggedItem);
            }

            // Insert at new position
            if (dragOverId && newVisible.includes(dragOverId)) {
                const index = newVisible.indexOf(dragOverId);
                newVisible.splice(index, 0, draggedItem);
            } else {
                newVisible.push(draggedItem);
            }
            setVisibleItems(newVisible);

        } else { // target is 'hidden'
            const newVisible = visibleItems.filter(id => id !== draggedItem);
            setVisibleItems(newVisible);
        }
        setDraggedItem(null);
    };

    return (
        <div>
            <h5 className="font-semibold mb-1">{title}</h5>
            <p className="text-sm text-text-secondary mb-3">{description}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DropZone title={t('settings.navigation.customize.visible')} onDrop={(e) => handleDrop(e, 'visible')} isOverfilled={itemLimit ? visibleItems.length > itemLimit : false}>
                    {visibleItems.map(id => {
                        const item = ALL_NAV_ITEMS.find(i => i.id === id);
                        if (!item) return null;
                        return (
                            <NavItemDraggable 
                                key={id} 
                                item={item} 
                                onDragStart={(e) => handleDragStart(e, id)}
                            />
                        );
                    })}
                     {itemLimit && visibleItems.length > itemLimit && (
                        <p className="text-xs text-red-400 p-2">{t('settings.navigation.customize.limitError', {count: visibleItems.length - itemLimit})}</p>
                     )}
                </DropZone>
                <DropZone title={t('settings.navigation.customize.hidden')} onDrop={(e) => handleDrop(e, 'hidden')}>
                     {hiddenItems.map(id => {
                        const item = ALL_NAV_ITEMS.find(i => i.id === id);
                        if (!item) return null;
                         return (
                            <NavItemDraggable 
                                key={id} 
                                item={item} 
                                onDragStart={(e) => handleDragStart(e, id)}
                            />
                        );
                    })}
                </DropZone>
            </div>
        </div>
    );
};

const DropZone: React.FC<{ title: string; onDrop: (e: React.DragEvent<HTMLDivElement>) => void; children: React.ReactNode; isOverfilled?: boolean }> = ({ title, onDrop, children, isOverfilled }) => {
    const [isOver, setIsOver] = useState(false);

    return (
        <div
            onDragOver={(e) => { e.preventDefault(); setIsOver(true); }}
            onDragLeave={() => setIsOver(false)}
            onDrop={(e) => { onDrop(e); setIsOver(false); }}
            className={`p-3 bg-secondary rounded-lg space-y-2 min-h-[100px] transition-all
             ${isOver ? 'ring-2 ring-accent' : ''}
             ${isOverfilled ? 'ring-2 ring-red-500' : ''}
            `}
        >
            <h6 className="text-sm font-bold text-text-secondary">{title}</h6>
            <div className="space-y-2">
                {children}
            </div>
        </div>
    );
};

const NavItemDraggable = ({ item, onDragStart }: { item: NavItem; onDragStart: (e: React.DragEvent<HTMLDivElement>) => void; }) => (
    <div
        draggable
        onDragStart={onDragStart}
        data-id={item.id}
        className="flex items-center p-2 bg-primary rounded-md border border-border-color cursor-grab active:cursor-grabbing"
    >
        <Icon name="drag" className="h-5 w-5 mr-3 text-text-secondary" />
        <Icon name={item.icon} className="h-5 w-5 mr-3 text-text-secondary" />
        <span className="font-medium text-text-primary">{t(`nav.${item.id}`)}</span>
    </div>
);


export default NavigationSettings;