import { Routes, Route } from 'react-router-dom';

import { USER_PATH, locRequestsRelativePath, dataLocDetailsRelativePath } from '../RootPaths';

import Home from "./Home";
import Settings from "../settings/Settings";
import TrustProtection from "./trust-protection/TrustProtection";
import Recovery from "./trust-protection/Recovery";
import Wallet from "../common/Wallet";
import Transactions from "../common/Transactions";
import TransactionProtection from "./transaction-protection/TransactionProtection";
import { UUID } from '../logion-chain/UUID';
import LocDetails from '../loc/LocDetails';
import { LocType } from "../logion-chain/Types";
import React from "react";

export const HOME_PATH = USER_PATH;

export const TRUST_PROTECTION_RELATIVE_PATH = '/protection';
export const TRUST_PROTECTION_PATH = USER_PATH + TRUST_PROTECTION_RELATIVE_PATH;
export const SETTINGS_RELATIVE_PATH = '/settings';
export const SETTINGS_PATH = USER_PATH + SETTINGS_RELATIVE_PATH;
export const RECOVERY_RELATIVE_PATH = '/recovery';
export const RECOVERY_PATH = USER_PATH + RECOVERY_RELATIVE_PATH;
export const WALLET_RELATIVE_PATH = '/wallet';
export const WALLET_PATH = USER_PATH + WALLET_RELATIVE_PATH;

export const TRANSACTIONS_RELATIVE_PATH = WALLET_RELATIVE_PATH + '/:coinId';
const TRANSACTIONS_PATH = USER_PATH + TRANSACTIONS_RELATIVE_PATH;
export function transactionsPath(coinId: string): string {
    return TRANSACTIONS_PATH.replace(":coinId", coinId);
}

export function dataLocDetailsPath(locType: LocType, locId: string) {
    return USER_PATH + dataLocDetailsRelativePath(locType)
        .replace(":locId", locId)
}

export function locRequestsPath(locType: LocType) {
    return USER_PATH + locRequestsRelativePath(locType)
}

export function locDetailsPath(locId: string | UUID, locType: LocType) {
    let stringId;
    if(locId instanceof UUID) {
        stringId = locId.toString();
    } else {
        stringId = locId;
    }
    return dataLocDetailsPath(locType, stringId);
}

export default function UserRouter() {

    return (
        <Routes>
            <Route path={ TRUST_PROTECTION_RELATIVE_PATH } element={ <TrustProtection />} />
            <Route path={ SETTINGS_RELATIVE_PATH } element={ <Settings showContactInformation={ false } /> } />
            <Route path={ RECOVERY_RELATIVE_PATH } element={ <Recovery /> } />
            <Route path={ WALLET_RELATIVE_PATH } element={ <Wallet
                    transactionsPath={ transactionsPath }
                    settingsPath={ SETTINGS_PATH }
                />
            } />
            <Route path={ TRANSACTIONS_RELATIVE_PATH } element={ <Transactions
                    backPath={ WALLET_PATH }
                />
            } />
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
                    viewer='User'
                />
            } />
            <Route path={ dataLocDetailsRelativePath('Collection') } element={
                <LocDetails
                    backPath={ locRequestsPath('Collection') }
                    detailsPath={ locDetailsPath }
                    viewer='User'
                />
            } />
            <Route path="/" element={ <Home /> } />
        </Routes>
    );
}
