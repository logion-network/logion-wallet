import React from 'react';
import { Routes, Route } from 'react-router-dom';

import {
    PROTECTION_REQUESTS_RELATIVE_PATH,
    RECOVERY_REQUESTS_RELATIVE_PATH,
    SETTINGS_RELATIVE_PATH,
    RECOVERY_DETAILS_RELATIVE_PATH,
    WALLET_RELATIVE_PATH,
    WALLET_PATH,
    transactionsPath,
    TRANSACTIONS_RELATIVE_PATH,
    LOC_REQUESTS_RELATIVE_PATH,
    LOC_DETAILS_RELATIVE_PATH,
    IDENTITIES_RELATIVE_PATH,
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
import IdentityProtection from './transaction-protection/IdentityProtection';

export default function LegalOfficerRouter() {

    return (
        <Routes>
            <Route path={ PROTECTION_REQUESTS_RELATIVE_PATH } element={ <ProtectionRequests /> } />
            <Route path={ RECOVERY_REQUESTS_RELATIVE_PATH } element={ <RecoveryRequests /> } />
            <Route path={ RECOVERY_DETAILS_RELATIVE_PATH } element={ <RecoveryDetails /> } />
            <Route path={ SETTINGS_RELATIVE_PATH } element={ <Settings /> } />
            <Route path={ WALLET_RELATIVE_PATH } element={ <Wallet
                    transactionsPath={ transactionsPath }
            />} />
            <Route path={ TRANSACTIONS_RELATIVE_PATH } element={ <Transactions
                    backPath={ WALLET_PATH }
            /> } />
            <Route path={ LOC_REQUESTS_RELATIVE_PATH } element={ <TransactionProtection /> } />
            <Route path={ LOC_DETAILS_RELATIVE_PATH } element={ <LocDetails /> } />
            <Route path={ IDENTITIES_RELATIVE_PATH } element={ <IdentityProtection /> } />
            <Route path="" element={ <Home /> } />
        </Routes>
    );
}
