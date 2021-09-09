import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { useLogionChain } from '../logion-chain';

import Dashboard from '../common/Dashboard';
import WarningDialog from '../common/WarningDialog';

import UserRouter, {
    HOME_PATH,
    TOKENS_PATH,
    TRUST_PROTECTION_PATH,
    SETTINGS_PATH,
    RECOVERY_PATH,
    WALLET_PATH,
} from "./UserRouter";
import { useUserContext } from "./UserContext";
import { useCommonContext } from '../common/CommonContext';

export default function ContextualizedWallet() {
    const { apiState } = useLogionChain();
    const { selectAddress, addresses, colorTheme } = useCommonContext();
    const { pendingProtectionRequests, acceptedProtectionRequests } = useUserContext();
    const [ discardProtection, setDiscardProtection ] = useState<boolean>(false);

    if(selectAddress === null || addresses === null) {
        return null;
    }

    const userContext = apiState === 'READY' ? <UserRouter /> : null;
    const noProtection = (pendingProtectionRequests !== null && pendingProtectionRequests.length === 0)
        && (acceptedProtectionRequests !== null && acceptedProtectionRequests.length === 0);

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
                    id: "tokens",
                    text: "Tokens",
                    to: TOKENS_PATH,
                    exact: true,
                    icon: {
                        icon: {
                            id: 'tokens'
                        },
                        background: colorTheme.topMenuItems.iconGradient,
                    },
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
                }
            ]}
        >
            {userContext}
            <WarningDialog
                show={noProtection && !discardProtection}
                size='lg'
                actions={[
                    {
                        buttonText: "I will do it later",
                        callback: () => setDiscardProtection(true),
                        id: "discard",
                        buttonVariant: 'secondary'
                    },
                    {
                        buttonText: <Link to={ TRUST_PROTECTION_PATH }>Activate the logion protection</Link>,
                        callback: () => setDiscardProtection(true),
                        id: "protection",
                        buttonVariant: 'primary'
                    },
                    {
                        buttonText: <Link to={ RECOVERY_PATH }>Start a recovery process</Link>,
                        callback: () => setDiscardProtection(true),
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
