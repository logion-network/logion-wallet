import { useCallback } from 'react';

import { useLogionChain } from '../logion-chain';

import Dashboard from '../common/Dashboard';

import UserRouter, {
    HOME_PATH,
    TRUST_PROTECTION_PATH,
    SETTINGS_PATH,
    RECOVERY_PATH,
    WALLET_PATH,
    locRequestsPath, VAULT_PATH,
} from "./UserRouter";
import { useUserContext } from "./UserContext";
import { useCommonContext } from '../common/CommonContext';

export default function ContextualizedWallet() {
    const { selectAddress, accounts, api } = useLogionChain();
    const { colorTheme, refresh } = useCommonContext();
    const { refreshRequests, vaultState } = useUserContext();

    const refreshAll = useCallback(() => {
        refresh(false);
        refreshRequests!(false);
    }, [ refresh, refreshRequests ]);

    if(selectAddress === null || accounts === null) {
        return null;
    }

    const userContext = api !== null ? <UserRouter /> : null;

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
                },
                {
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
                },
                {
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
                },
            ]}
            menuMiddle={[
                {
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
                },
                {
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
                }
            ]}
        >
            {userContext}
        </Dashboard>
    );
}
