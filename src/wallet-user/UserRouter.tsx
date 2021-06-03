import React from 'react';
import { Switch, Route } from 'react-router-dom';

import { USER_PATH } from '../RootPaths';

import MyTokens from './MyTokens';
import TokenizationRequests from "./TokenizationRequests";
import TrustProtection from "./trust-protection/TrustProtection";
import LegalOfficerSelection from "./trust-protection/LegalOfficerSelection";

export const MY_TOKENS_PATH = USER_PATH + '/tokens/:address';
export const TRUST_PROTECTION_PATH = USER_PATH + '/trust-protection';

export default function UserRouter() {
    return (
        <>
            <Switch>
                <Route path={ MY_TOKENS_PATH }>
                    <MyTokens />
                </Route>
                <Route path={ TRUST_PROTECTION_PATH }>
                    <LegalOfficerSelection />
                </Route>
                <Route path="">
                    <TrustProtection />
                    <TokenizationRequests />
                </Route>
            </Switch>
        </>
    );
}
