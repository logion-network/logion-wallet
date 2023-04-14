import { useCallback } from 'react';

import { useLogionChain } from '../logion-chain';

import Dashboard from '../common/Dashboard';

import UserRouter, {
    HOME_PATH,
    TRUST_PROTECTION_PATH,
    SETTINGS_PATH,
    RECOVERY_PATH,
    WALLET_PATH,
    locRequestsPath,
    VAULT_PATH,
    VTP_PATH,
} from "./UserRouter";
import { useUserContext } from "./UserContext";
import { useCommonContext } from '../common/CommonContext';

export default function ContextualizedWallet() {
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
            to: WALLET_PATH,
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
            to: VAULT_PATH,
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

    if (locsState && !locsState.discarded && locsState?.isVerifiedThirdParty) {
        menuTop.push({
                id: "vtp",
                text: "Issuer LOC",
                to: VTP_PATH,
                exact: false,
                icon: {
                    icon: {
                        id: 'vtp-icon'
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
        menuBottom.push({
            id: "recovery",
            text: "Recovery",
            to: RECOVERY_PATH,
            exact: true,
            icon: {
                icon: {
                    id: 'recovery'
                },
                background: colorTheme.recoveryItems.iconGradient,
            },
            onClick: refreshAll,
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
