import React from 'react';
import {
    BrowserRouter as Router,
    Redirect,
    Switch,
    Route
} from 'react-router-dom';

import { LEGAL_OFFICER_PATH, USER_PATH } from './RootPaths';
import { isLegalOfficer as isLegalOfficerFunction } from './common/types/LegalOfficer';
import LegalOfficerMain from './legal-officer/Main';
import UserMain from './wallet-user/Main';
import { useCommonContext } from './common/CommonContext';

export default function RootRouter() {
    const { currentAddress } = useCommonContext();

    if(currentAddress === "") {
        return null;
    }

    const isLegalOfficer = isLegalOfficerFunction(currentAddress);
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
                    { isLegalOfficer ? <LegalOfficerMain /> : <Redirect to={ USER_PATH } /> }
                </Route>
                <Route path={ USER_PATH }>
                    { !isLegalOfficer ? <UserMain /> : <Redirect to={ LEGAL_OFFICER_PATH } /> }
                </Route>
                <Route path="/">
                    <Redirect to={ redirectTo } />
                </Route>
            </Switch>
        </Router>
    );
}
