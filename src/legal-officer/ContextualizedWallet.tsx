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
                    iconGradient: colorTheme.topMenu.iconGradient,
                }
            ]}
            shieldItem={{
                text: "Protection Requests",
                to: PROTECTION_REQUESTS_PATH,
                exact: true
            }}
            menuBottom={[
                {
                    text: "Settings",
                    to: SETTINGS_PATH,
                    exact: true,
                    iconGradient: colorTheme.bottomMenu.iconGradient,
                }
            ]}
        >
            <LegalOfficerRouter />
        </Dashboard>
    );
}
