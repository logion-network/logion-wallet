import React from 'react';

import Dashboard from '../common/Dashboard';

import LegalOfficerRouter from './LegalOfficerRouter';
import { useCommonContext } from '../common/CommonContext';

import {
    HOME_PATH,
    PROTECTION_REQUESTS_PATH,
    RECOVERY_REQUESTS_PATH,
    SETTINGS_PATH,
    WALLET_PATH,
    LOC_REQUESTS_PATH,
} from './LegalOfficerPaths';

export default function ContextualizedWallet() {
    const { selectAddress, accounts, colorTheme } = useCommonContext();

    if(accounts === null || selectAddress === null) {
        return null;
    }

    return (
        <Dashboard
            menuTop={[
                {
                    id: "home",
                    text: "Home",
                    to: HOME_PATH,
                    exact: true,
                    icon: {
                        icon: {
                            id: 'home'
                        },
                        background: colorTheme.topMenuItems.iconGradient,
                    },
                },
                {
                    id: "wallet",
                    text: "Wallet",
                    to: WALLET_PATH,
                    exact: true,
                    icon: {
                        icon: {
                            id: 'wallet'
                        },
                        background: colorTheme.topMenuItems.iconGradient,
                    },
                },
                {
                    id: "loc",
                    text: "Transactions",
                    to: LOC_REQUESTS_PATH,
                    exact: true,
                    icon: {
                        icon: {
                            id: 'loc'
                        },
                        background: colorTheme.topMenuItems.iconGradient,
                    },
                }
            ]}
            menuMiddle={[
                {
                    id: "protection",
                    text: "Protection Management",
                    to: PROTECTION_REQUESTS_PATH,
                    exact: true,
                    icon: {
                        icon: {
                            id: 'shield',
                            hasVariants: true,
                        },
                        height: 'auto',
                        width: '60px',
                    }
                },
                {
                    id: "recovery",
                    text: "Recovery Requests",
                    to: RECOVERY_REQUESTS_PATH,
                    exact: true,
                    icon: {
                        icon: {
                            id: 'recovery_request',
                            hasVariants: true,
                        },
                        height: 'auto',
                        width: '60px',
                    }
                }
            ]}
            menuBottom={[
                {
                    id: "settings",
                    text: "Settings",
                    to: SETTINGS_PATH,
                    exact: true,
                    icon: {
                        icon: {
                            id: 'settings'
                        },
                        background: colorTheme.bottomMenuItems.iconGradient,
                    },
                }
            ]}
        >
            <LegalOfficerRouter />
        </Dashboard>
    );
}
