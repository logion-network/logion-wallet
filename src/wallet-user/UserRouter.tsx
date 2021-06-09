import React from 'react';
import { Switch, Route } from 'react-router-dom';
import Alert from 'react-bootstrap/Alert';

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
    const { createdProtectionRequest, recoveryConfig } = useUserContext();

    const checkingTrustProtection = createdProtectionRequest === null || recoveryConfig === null;
    const mustActivateTrustProtection = !checkingTrustProtection && recoveryConfig!.isEmpty;

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
                    {
                        checkingTrustProtection &&
                        <Alert variant="info">
                            <p>Checking your trust protection...</p>
                        </Alert>
                    }
                    {
                        mustActivateTrustProtection &&
                        <TrustProtection/>
                    }
                    <TokenizationRequests/>
                </Route>
            </Switch>
        </>
    );
}
