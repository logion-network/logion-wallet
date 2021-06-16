import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';

import {
    TOKENIZATION_REQUESTS_PATH,
    PROTECTION_REQUESTS_PATH,
    SETTINGS_PATH
} from './LegalOfficerPaths';

import TokenizationRequests from './TokenizationRequests';
import ProtectionRequests from './ProtectionRequests';
import Settings from './Settings';

export default function LegalOfficerRouter() {

    return (
        <>
            <Switch>
                <Route path={ TOKENIZATION_REQUESTS_PATH }>
                    <TokenizationRequests />
                </Route>
                <Route path={ PROTECTION_REQUESTS_PATH }>
                    <ProtectionRequests />
                </Route>
                <Route path={ SETTINGS_PATH }>
                    <Settings />
                </Route>
                <Route path="">
                    <Redirect to={ TOKENIZATION_REQUESTS_PATH } />
                </Route>
            </Switch>
        </>
    );
}
