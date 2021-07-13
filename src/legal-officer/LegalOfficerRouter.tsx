import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';

import {
    TOKENIZATION_REQUESTS_PATH,
    PROTECTION_REQUESTS_PATH,
    RECOVERY_REQUESTS_PATH,
    SETTINGS_PATH,
    RECOVERY_DETAILS_PATH
} from './LegalOfficerPaths';

import TokenizationRequests from './TokenizationRequests';
import ProtectionRequests from './ProtectionRequests';
import RecoveryRequests from './RecoveryRequests';
import Settings from './Settings';
import RecoveryDetails from "./RecoveryDetails";

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
                <Route path={ RECOVERY_REQUESTS_PATH }>
                    <RecoveryRequests />
                </Route>
                <Route path={ RECOVERY_DETAILS_PATH }>
                    <RecoveryDetails />
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
