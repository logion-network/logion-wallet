import React from 'react';
import { Switch, Route } from 'react-router-dom';

import {
    PROTECTION_REQUESTS_PATH,
    RECOVERY_REQUESTS_PATH,
    SETTINGS_PATH,
    RECOVERY_DETAILS_PATH,
    WALLET_PATH,
    transactionsPath,
    TRANSACTIONS_PATH,
    LOC_REQUESTS_PATH, LOC_DETAILS_PATH,
} from './LegalOfficerPaths';

import Home from './Home';
import ProtectionRequests from './ProtectionRequests';
import RecoveryRequests from './RecoveryRequests';
import Settings from '../Settings';
import RecoveryDetails from "./RecoveryDetails";
import Wallet from "../common/Wallet";
import Transactions from "../common/Transactions";
import TransactionProtection from './transaction-protection/TransactionProtection';
import LocDetails from "./transaction-protection/LocDetails";

export default function LegalOfficerRouter() {

    return (
        <>
            <Switch>
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
                <Route path={ WALLET_PATH }>
                    <Wallet
                        transactionsPath={ transactionsPath }
                    />
                </Route>
                <Route path={ TRANSACTIONS_PATH }>
                    <Transactions
                        backPath={ WALLET_PATH }
                    />
                </Route>
                <Route path={ LOC_REQUESTS_PATH }>
                    <TransactionProtection />
                </Route>
                <Route path={ LOC_DETAILS_PATH }>
                    <LocDetails
                        backPath={ LOC_REQUESTS_PATH }
                    />
                </Route>
                <Route path="">
                    <Home />
                </Route>
            </Switch>
        </>
    );
}
