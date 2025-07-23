

import React from 'react';
import Icon from '../Icon';
import { t } from '../../localization';

interface AccountSettingsProps {
    onRestartOnboarding: () => void;
    onDeleteAllData: () => void;
    dataCounts: { notes: number; events: number; reminders: number; };
}

const AccountSettings: React.FC<AccountSettingsProps> = ({ onRestartOnboarding, onDeleteAllData, dataCounts }) => {
    return (
        <div className="space-y-8">
            <h3 className="text-2xl font-bold">{t('settings.account.title')}</h3>

            <section>
                <h4 className="text-lg font-semibold mb-3">{t('settings.account.restartOnboarding')}</h4>
                <div className="p-4 bg-primary rounded-lg flex items-center justify-between">
                    <p className="text-sm text-text-secondary">{t('settings.account.restartOnboardingDesc')}</p>
                    <button onClick={onRestartOnboarding} className="px-4 py-2 text-sm rounded-md border border-border-color text-text-primary hover:bg-border-color font-semibold">
                        Restart
                    </button>
                </div>
            </section>

            <section>
                <h4 className="text-lg font-semibold mb-3 text-red-500">{t('settings.account.deleteData')}</h4>
                <div className="p-4 bg-primary rounded-lg border border-red-500/30">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-text-secondary">{t('settings.account.deleteDataDesc')}</p>
                            <p className="text-xs text-text-secondary mt-1">{t('deleteDataModal.dataSummary', dataCounts)}</p>
                        </div>
                        <button onClick={onDeleteAllData} className="px-4 py-2 text-sm rounded-md bg-red-600 text-white hover:bg-red-700 font-semibold">
                            Delete...
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AccountSettings;