import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { useLogionChain } from '../logion-chain';

import Dashboard from '../component/Dashboard';
import WarningDialog from '../component/WarningDialog';

import UserRouter, { ACCOUNT_PATH, TRUST_PROTECTION_PATH, SETTINGS_PATH, RECOVERY_PATH } from "./UserRouter";
import { useUserContext } from "./UserContext";
import { useRootContext } from '../RootContext';

export default function ContextualizedWallet() {
    const { apiState } = useLogionChain();
    const { selectAddress, addresses } = useRootContext();
    const { colorTheme, pendingProtectionRequests, acceptedProtectionRequests } = useUserContext();
    const [ discardProtection, setDiscardProtection ] = useState<boolean>(false);

    if(selectAddress === null || addresses === null || pendingProtectionRequests === null || acceptedProtectionRequests === null) {
        return null;
    }

    const userContext = apiState === 'READY' ? <UserRouter /> : null;
    const noProtection = pendingProtectionRequests.length === 0 && acceptedProtectionRequests.length === 0;

    return (
        <Dashboard
            colors={ colorTheme }
            addresses={ addresses }
            selectAddress={ selectAddress }
            menuTop={[
                {
                    id: "tokens",
                    text: "Tokens",
                    to: ACCOUNT_PATH,
                    exact: true,
                    icon: {
                        icon: {
                            id: 'tokens'
                        },
                        background: colorTheme.topMenuItems.iconGradient,
                    },
                }
            ]}
            shieldItem={{
                id: "protection",
                text: "My Logion Trust Protection",
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
            }}
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
                        background: colorTheme.bottomMenuItems.iconGradient,
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
                        buttonText: <Link to={ TRUST_PROTECTION_PATH }>Let's go</Link>,
                        callback: () => setDiscardProtection(true),
                        id: "discard",
                        buttonVariant: 'primary'
                    }
                ]}
                colors={ colorTheme }
                spaceAbove="25vh"
            >
                <>
                    Dear user,<br/>
                    we recommend that you activate your trust protection right now in order to
                    enjoy all the features of Logion.
                </>
            </WarningDialog>
        </Dashboard>
    );
}
