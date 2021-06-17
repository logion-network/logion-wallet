import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';

import { USER_PATH } from '../RootPaths';

import Account from "./Account";
import Settings from "./Settings";
import TrustProtection from "./trust-protection/TrustProtection";

export const ACCOUNT_PATH = USER_PATH + '/account';
export const TRUST_PROTECTION_PATH = USER_PATH + '/protection';
export const SETTINGS_PATH = USER_PATH + '/settings';

export default function UserRouter() {
    return (
        <>
            <Switch>
                <Route path={ ACCOUNT_PATH }>
                    <Account />
                </Route>
                <Route path={ TRUST_PROTECTION_PATH }>
                    <TrustProtection />
                </Route>
                <Route path={ SETTINGS_PATH }>
                    <Settings />
                </Route>
                <Route path="">
                    <Redirect to={ ACCOUNT_PATH } />
                </Route>
            </Switch>
        </>
    );
}
