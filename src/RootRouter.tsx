import React from 'react';
import {
    BrowserRouter as Router,
    Redirect,
    Switch,
    Route
} from 'react-router-dom';

import { LEGAL_OFFICER_PATH, USER_PATH } from './RootPaths';
import { DEFAULT_LEGAL_OFFICER, ANOTHER_LEGAL_OFFICER } from './legal-officer/Types';
import LegalOfficerWallet from './legal-officer/LegalOfficerWallet';
import Wallet from './wallet-user/Wallet';
import { useRootContext } from './RootContext';

const LEGAL_OFFICERS: string[] = [ DEFAULT_LEGAL_OFFICER, ANOTHER_LEGAL_OFFICER ];

export default function RootRouter() {
    const { currentAddress } = useRootContext();

    if(currentAddress === "") {
        return null;
    }

    const isLegalOfficer = LEGAL_OFFICERS.includes(currentAddress);
    let redirectTo;
    if(isLegalOfficer) {
        redirectTo = LEGAL_OFFICER_PATH;
    } else {
        redirectTo = USER_PATH;
    }

    return (
        <Router>
            <Switch>
                <Route path={ LEGAL_OFFICER_PATH }>
                    { isLegalOfficer ? <LegalOfficerWallet /> : <Redirect to={ USER_PATH } /> }
                </Route>
                <Route path={ USER_PATH }>
                    { !isLegalOfficer ? <Wallet /> : <Redirect to={ LEGAL_OFFICER_PATH } /> }
                </Route>
                <Route path="/">
                    <Redirect to={ redirectTo } />
                </Route>
            </Switch>
        </Router>
    );
}
