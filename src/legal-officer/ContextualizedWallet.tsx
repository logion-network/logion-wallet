import React from 'react';

import Dashboard from '../component/Dashboard';

import LegalOfficerRouter from './LegalOfficerRouter';
import { useLegalOfficerContext } from './LegalOfficerContext';
import { useRootContext } from '../RootContext';

import {
    TOKENIZATION_REQUESTS_PATH,
    PROTECTION_REQUESTS_PATH,
    SETTINGS_PATH,
} from './LegalOfficerPaths';

export default function ContextualizedWallet() {
    const { selectAddress, addresses } = useRootContext();
    const { colorTheme } = useLegalOfficerContext();

    if(addresses === null || selectAddress === null) {
        return null;
    }

    return (
        <Dashboard
            colors={ colorTheme }
            addresses={ addresses }
            selectAddress={ selectAddress }
            menuTop={[
                {
                    text: "Tokens",
                    to: TOKENIZATION_REQUESTS_PATH,
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
                text: "Protection Management",
                to: PROTECTION_REQUESTS_PATH,
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
            <LegalOfficerRouter />
        </Dashboard>
    );
}
