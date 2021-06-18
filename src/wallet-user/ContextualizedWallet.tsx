import React from 'react';

import { useLogionChain } from '../logion-chain';

import Dashboard from '../component/Dashboard';
import UserRouter, { ACCOUNT_PATH, TRUST_PROTECTION_PATH, SETTINGS_PATH } from "./UserRouter";
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
            {userContext}
        </Dashboard>
    );
}
