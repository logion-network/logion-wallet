import React, { useCallback } from 'react';

import Dashboard from '../common/Dashboard';

import LegalOfficerRouter from './LegalOfficerRouter';
import { useCommonContext } from '../common/CommonContext';

import {
    HOME_PATH,
    PROTECTION_REQUESTS_PATH,
    RECOVERY_REQUESTS_PATH,
    SETTINGS_PATH,
    WALLET_PATH,
    IDENTITIES_PATH, locRequestsPath,
} from './LegalOfficerPaths';
import { useLegalOfficerContext } from './LegalOfficerContext';

export default function ContextualizedWallet() {
    const { selectAddress, accounts, colorTheme, refresh, availableLegalOfficers } = useCommonContext();
    const { refreshRequests } = useLegalOfficerContext();

    const refreshAll = useCallback(() => {
        refresh(false);
        refreshRequests!(false);
    }, [ refresh, refreshRequests ]);

    if(accounts === null || selectAddress === null || availableLegalOfficers === undefined) {
        return null;
    }

    const currentLegalOfficerUnavailable = availableLegalOfficers.find(node => node.address === accounts?.current?.address) === undefined;

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
                    onClick: refreshAll,
                    disabled: currentLegalOfficerUnavailable,
                },
                {
                    id: "wallet",
                    text: "Wallet",
                    to: WALLET_PATH,
                    exact: false,
                    icon: {
                        icon: {
                            id: 'wallet'
                        },
                        background: colorTheme.topMenuItems.iconGradient,
                    },
                    onClick: refreshAll,
                    disabled: currentLegalOfficerUnavailable,
                },
                {
                    id: "loc-collection",
                    text: "Collections",
                    to: locRequestsPath('Collection'),
                    exact: false,
                    icon: {
                        icon: {
                            id: 'collection'
                        },
                        background: colorTheme.topMenuItems.iconGradient,
                    },
                    onClick: refreshAll,
                    disabled: currentLegalOfficerUnavailable,
                },
                {
                    id: "loc-transaction",
                    text: "Transactions",
                    to: locRequestsPath('Transaction'),
                    exact: false,
                    icon: {
                        icon: {
                            id: 'loc'
                        },
                        background: colorTheme.topMenuItems.iconGradient,
                    },
                    onClick: refreshAll,
                    disabled: currentLegalOfficerUnavailable,
                },
                {
                    id: "identity",
                    text: "Identities",
                    to: IDENTITIES_PATH,
                    exact: false,
                    icon: {
                        icon: {
                            id: 'identity'
                        },
                        background: colorTheme.topMenuItems.iconGradient,
                    },
                    onClick: refreshAll,
                    disabled: currentLegalOfficerUnavailable,
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
                    },
                    onClick: refreshAll,
                    disabled: currentLegalOfficerUnavailable,
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
                    },
                    onClick: refreshAll,
                    disabled: currentLegalOfficerUnavailable,
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
                    onClick: refreshAll,
                }
            ]}
        >
            <LegalOfficerRouter />
        </Dashboard>
    );
}
