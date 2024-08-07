import { useCallback } from 'react';

import { useLogionChain } from '../logion-chain';

import Dashboard from '../common/Dashboard';

import UserRouter from "./UserRouter";
import {
    HOME_PATH,
    TRUST_PROTECTION_PATH,
    SETTINGS_PATH,
    locRequestsPath,
    ISSUER_PATH,
    TRANSACTIONS_PATH,
    VAULT_TRANSACTIONS_PATH,
} from "./UserPaths";
import { useUserContext } from "./UserContext";
import { useCommonContext } from '../common/CommonContext';

export default function UserDashboard() {
    const { accounts, api } = useLogionChain();
    const { colorTheme, refresh } = useCommonContext();
    const { refreshRequests, vaultState, locsState } = useUserContext();

    const refreshAll = useCallback(() => {
        refresh(false);
        refreshRequests!(false);
    }, [ refresh, refreshRequests ]);

    if(accounts === null) {
        return null;
    }

    const userContext = api !== null ? <UserRouter /> : null;

    const menuTop = [];
    if(accounts.current?.accountId.type === "Polkadot") {
        menuTop.push({
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
        });
        menuTop.push({
            id: "wallet",
            text: "Wallet",
            to: TRANSACTIONS_PATH,
            exact: false,
            icon: {
                icon: {
                    id: 'wallet'
                },
                background: colorTheme.topMenuItems.iconGradient,
            },
            onClick: refreshAll,
        });
        menuTop.push({
            id: "vault",
            text: "Vault",
            to: VAULT_TRANSACTIONS_PATH,
            exact: false,
            icon: {
                icon: {
                    id: 'vault'
                },
                background: colorTheme.topMenuItems.iconGradient,
            },
            onClick: refreshAll,
            disabled: !vaultState,
        });
        menuTop.push({
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
        });
        menuTop.push({
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
        });
    };
    menuTop.push({
        id: "loc-identity",
        text: "Identity",
        to: locRequestsPath('Identity'),
        exact: false,
        icon: {
            icon: {
                id: 'identity'
            },
            background: colorTheme.topMenuItems.iconGradient,
        },
        onClick: refreshAll,
    });

    if (locsState && !locsState.discarded && locsState?.isVerifiedIssuer) {
        menuTop.push({
                id: "issuer",
                text: "Issuer LOC",
                to: ISSUER_PATH,
                exact: false,
                icon: {
                    icon: {
                        id: 'issuer-icon'
                    },
                    background: colorTheme.topMenuItems.iconGradient,
                },
                onClick: refreshAll,
            }
        )
    }

    const menuMiddle = [];
    if(accounts.current?.accountId.type === "Polkadot") {
        menuMiddle.push({
            id: "protection",
            text: "My Logion Protection",
            to: TRUST_PROTECTION_PATH,
            exact: true,
            icon: {
                icon: {
                    id: 'shield',
                    hasVariants: true,
                },
                height: 'auto',
                width: 'auto',
            },
            onClick: refreshAll,
        });
    }

    const menuBottom = [];
    if(accounts.current?.accountId.type === "Polkadot") {
        menuBottom.push({
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
        });
    }

    return (
        <Dashboard
            menuTop={ menuTop }
            menuMiddle={ menuMiddle }
            menuBottom={ menuBottom }
        >
            {userContext}
        </Dashboard>
    );
}
