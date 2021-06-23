import React from 'react';

import { useLogionChain } from '../logion-chain';

import Dashboard from '../component/Dashboard';
import UserRouter, { ACCOUNT_PATH, TRUST_PROTECTION_PATH, SETTINGS_PATH, RECOVERY_PATH } from "./UserRouter";
import { useUserContext } from "./UserContext";
import { useRootContext } from '../RootContext';

export default function ContextualizedWallet() {
    const { apiState } = useLogionChain();
    const { selectAddress, addresses } = useRootContext();
    const { colorTheme } = useUserContext();

    if(selectAddress === null || addresses === null) {
        return null;
    }

    const userContext = apiState === 'READY' ? <UserRouter /> : null;

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
        </Dashboard>
    );
}
