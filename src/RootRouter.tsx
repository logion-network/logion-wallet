import React from 'react';
import {
    BrowserRouter as Router,
    Redirect,
    Switch,
    Route,
} from 'react-router-dom';

import { LEGAL_OFFICER_PATH, USER_PATH } from './RootPaths';
import { isLegalOfficer as isLegalOfficerFunction } from './common/types/LegalOfficer';
import LegalOfficerMain from './legal-officer/Main';
import UserMain from './wallet-user/Main';
import { useCommonContext } from './common/CommonContext';
import Login, { LOGIN_PATH } from './Login';
import RenderOrRedirectToLogin from './RenderOrRedirectToLogin';

export default function RootRouter() {
    const { accounts } = useCommonContext();

    if(accounts === null || accounts.all.length === 0) {
        return null;
    }

    const isLegalOfficer = isLegalOfficerFunction(accounts?.current?.address);
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
                    { isLegalOfficer ? <RenderOrRedirectToLogin render={ () => <LegalOfficerMain /> }/> : <Redirect to={ USER_PATH } /> }
                </Route>
                <Route path={ USER_PATH }>
                    { !isLegalOfficer ? <RenderOrRedirectToLogin render={ () => <UserMain /> }/> : <Redirect to={ LEGAL_OFFICER_PATH } /> }
                </Route>
                <Route path={ LOGIN_PATH }>
                    <Login />
                </Route>
                <Route path="/">
                    <Redirect to={ redirectTo } />
                </Route>
            </Switch>
        </Router>
    );
}
