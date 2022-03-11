import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import {
    PROTECTION_REQUESTS_RELATIVE_PATH,
    RECOVERY_REQUESTS_RELATIVE_PATH,
    SETTINGS_RELATIVE_PATH,
    RECOVERY_DETAILS_RELATIVE_PATH,
    WALLET_RELATIVE_PATH,
    WALLET_PATH,
    transactionsPath,
    TRANSACTIONS_RELATIVE_PATH,
    IDENTITIES_RELATIVE_PATH,
    SETTINGS_PATH,
    IDENTITY_LOC_DETAILS_RELATIVE_PATH,
    locDetailsPath,
    IDENTITIES_PATH,
    locRequestsPath,
} from './LegalOfficerPaths';

import Home from './Home';
import ProtectionRequests from './ProtectionRequests';
import RecoveryRequests from './RecoveryRequests';
import Settings from '../settings/Settings';
import RecoveryDetails from "./RecoveryDetails";
import Wallet from "../common/Wallet";
import Transactions from "../common/Transactions";
import TransactionProtection from './transaction-protection/TransactionProtection';
import LocDetails from "../loc/LocDetails";
import IdentityProtection from './transaction-protection/IdentityProtection';
import { useCommonContext } from '../common/CommonContext';
import { FullWidthPane } from '../common/Dashboard';
import DangerFrame from '../common/DangerFrame';

import './LegalOfficerRouter.css';
import { locRequestsRelativePath, dataLocDetailsRelativePath } from "../RootPaths";

export default function LegalOfficerRouter() {
    const { accounts, nodesDown, availableLegalOfficers, balances, transactions } = useCommonContext();

    if(availableLegalOfficers === undefined) {
        return null;
    }

    const currentLegalOfficerUnavailable = availableLegalOfficers.find(node => node.address === accounts?.current?.address) === undefined;
    if(nodesDown.length > 0 && currentLegalOfficerUnavailable) {
        return (
            <FullWidthPane
                className="node-unreacheable"
                mainTitle="Node unreachable"
                titleIcon={{
                    icon: {
                        id: 'ko'
                    },
                }}
            >
                <DangerFrame>
                    <h1>Your node is currently unreachable. Please take action in order to recover.</h1>
                </DangerFrame>
            </FullWidthPane>
        );
    }

    return (
        <Routes>
            <Route path={ PROTECTION_REQUESTS_RELATIVE_PATH } element={ <ProtectionRequests /> } />
            <Route path={ RECOVERY_REQUESTS_RELATIVE_PATH } element={ <RecoveryRequests /> } />
            <Route path={ RECOVERY_DETAILS_RELATIVE_PATH } element={ <RecoveryDetails /> } />
            <Route path={ SETTINGS_RELATIVE_PATH } element={ <Settings showContactInformation={ true } /> } />
            <Route path={ WALLET_RELATIVE_PATH } element={ <Wallet
                transactionsPath={ transactionsPath }
                settingsPath={ SETTINGS_PATH }
                balances={ balances }
                transactions={ transactions }
            />} />
            <Route path={ TRANSACTIONS_RELATIVE_PATH } element={ <Transactions
                    address={ accounts!.current!.address }
                    backPath={ WALLET_PATH }
                    balances={ balances }
                    transactions={ transactions }
                    type="Wallet"
            /> } />
            <Route path={ locRequestsRelativePath('Transaction') }
                   element={ <TransactionProtection
                       locType='Transaction'
                       titles={ {
                           main: "Transaction Case Management",
                           loc: "Transaction Protection Case(s)",
                           request: "Transaction Protection Case Request(s)"
                       } }
                       iconId="loc"
                   /> } />
            <Route path={ locRequestsRelativePath('Collection') }
                   element={ <TransactionProtection
                       locType='Collection'
                       titles={{
                           main: "Collection Protection Management",
                           loc: "Collection Protection Case(s)",
                           request: "Collection Protection Request(s)"
                       }}
                       iconId="collection"
                   /> } />
            <Route path={ dataLocDetailsRelativePath('Transaction') } element={
                <LocDetails
                    backPath={ locRequestsPath('Transaction') }
                    detailsPath={ locDetailsPath }
                    viewer='LegalOfficer'
                />
            } />
            <Route path={ dataLocDetailsRelativePath('Collection') } element={
                <LocDetails
                    backPath={ locRequestsPath('Collection') }
                    detailsPath={ locDetailsPath }
                    viewer='LegalOfficer'
                />
            } />
            <Route path={ IDENTITIES_RELATIVE_PATH } element={ <IdentityProtection /> } />
            <Route path={ IDENTITY_LOC_DETAILS_RELATIVE_PATH } element={
                <LocDetails
                    backPath={ IDENTITIES_PATH }
                    detailsPath={ locDetailsPath }
                    viewer='LegalOfficer'
                />
            } />
            <Route path="" element={ currentLegalOfficerUnavailable ? <Navigate to={ SETTINGS_PATH }/> : <Home /> } />
        </Routes>
    );
}
