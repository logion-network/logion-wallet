import { useCallback, useState } from 'react';

import { useLogionChain } from '../logion-chain';

import Dashboard from '../common/Dashboard';
import WarningDialog from '../common/WarningDialog';

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
import { useNavigate } from 'react-router';

export default function ContextualizedWallet() {
    const { api } = useLogionChain();
    const { selectAddress, accounts, colorTheme, nodesDown, refresh } = useCommonContext();
    const { pendingProtectionRequests, acceptedProtectionRequests, recoveryConfig, refreshRequests } = useUserContext();
    const [ discardProtection, setDiscardProtection ] = useState<boolean>(false);
    const navigate = useNavigate();

    const refreshAll = useCallback(() => {
        refresh(false);
        refreshRequests!(false);
    }, [ refresh, refreshRequests ]);

    if(selectAddress === null || accounts === null) {
        return null;
    }

    const userContext = api !== null ? <UserRouter /> : null;
    const noProtection = (pendingProtectionRequests !== null && pendingProtectionRequests.length === 0)
        && (acceptedProtectionRequests !== null && acceptedProtectionRequests.length === 0)
        && (recoveryConfig !== null && recoveryConfig === undefined);

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
                    disabled: (recoveryConfig === null || recoveryConfig === undefined)
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
                }
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
            <WarningDialog
                show={ noProtection && !discardProtection && nodesDown.length === 0 }
                size='lg'
                actions={[
                    {
                        buttonText: "I will do it later",
                        callback: () => setDiscardProtection(true),
                        id: "discard",
                        buttonVariant: 'secondary'
                    },
                    {
                        buttonText: "Activate the logion protection",
                        callback: () => { setDiscardProtection(true); navigate(TRUST_PROTECTION_PATH)},
                        id: "protection",
                        buttonVariant: 'primary'
                    },
                    {
                        buttonText: "Start a recovery process",
                        callback: () => { setDiscardProtection(true); navigate(RECOVERY_PATH) },
                        id: "recovery",
                        buttonVariant: 'recovery'
                    }
                ]}
            >
                <>
                    Dear user,<br/>
                    We strongly recommend that you activate your logion trust protection right now in order to enjoy
                    all logion's features and benefits. You can also immediately start a recovery process if you need
                    to recover your assets locked in another account by clicking on the related button below.
                </>
            </WarningDialog>
        </Dashboard>
    );
}
