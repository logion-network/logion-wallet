import React from 'react';
import { Switch, Route } from 'react-router-dom';

import { USER_PATH } from '../RootPaths';

import Home from "./Home";
import Account from "./Account";
import Settings from "./Settings";
import TrustProtection from "./trust-protection/TrustProtection";
import Recovery from "./trust-protection/Recovery";
import Nft from "./Nft";

export const HOME_PATH = USER_PATH;
export const ACCOUNT_PATH = USER_PATH + '/account';
export const TRUST_PROTECTION_PATH = USER_PATH + '/protection';
export const SETTINGS_PATH = USER_PATH + '/settings';
export const RECOVERY_PATH = USER_PATH + '/recovery';
export const NFT_PATH = USER_PATH + '/nft';

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
                <Route path={ RECOVERY_PATH }>
                    <Recovery />
                </Route>
                <Route path={ NFT_PATH }>
                    <Nft />
                </Route>
                <Route path="">
                    <Home />
                </Route>
            </Switch>
        </>
    );
}
