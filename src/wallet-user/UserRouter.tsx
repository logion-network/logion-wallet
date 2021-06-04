import React from 'react';
import { Switch, Route } from 'react-router-dom';

import { USER_PATH } from '../RootPaths';

import MyTokens from './MyTokens';
import TokenizationRequests from "./TokenizationRequests";
import TrustProtection from "./trust-protection/TrustProtection";
import LegalOfficerSelection from "./trust-protection/LegalOfficerSelection";
import {useUserContext} from "./UserContext";
import ConfirmProtectionRequest from "./trust-protection/ConfirmProtectionRequest";

export const MY_TOKENS_PATH = USER_PATH + '/tokens/:address';
export const TRUST_PROTECTION_PATH = USER_PATH + '/trust-protection';

export default function UserRouter() {

    const {createdProtectionRequest} = useUserContext();

    return (
        <>
            <Switch>
                <Route path={ MY_TOKENS_PATH }>
                    <MyTokens />
                    <ConfirmProtectionRequest/>
                </Route>
                <Route path={ TRUST_PROTECTION_PATH }>
                    <LegalOfficerSelection />
                </Route>
                <Route path="">
                    {createdProtectionRequest === null && (
                        <TrustProtection/>
                    )}
                    <TokenizationRequests/>
                </Route>
            </Switch>
        </>
    );
}
