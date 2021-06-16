import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';

import { USER_PATH } from '../RootPaths';

import Account from "./Account";
import ProtectionRequestStatus from "./trust-protection/ProtectionRequestStatus";
import Settings from "./Settings";

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
                    <ProtectionRequestStatus />
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
