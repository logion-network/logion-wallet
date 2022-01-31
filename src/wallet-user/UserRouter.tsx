import { Routes, Route } from 'react-router-dom';

import { USER_PATH } from '../RootPaths';

import Home from "./Home";
import Settings from "../settings/Settings";
import TrustProtection from "./trust-protection/TrustProtection";
import Recovery from "./trust-protection/Recovery";
import Wallet from "../common/Wallet";
import Transactions from "../common/Transactions";
import TransactionProtection from "./transaction-protection/TransactionProtection";
import { UUID } from '../logion-chain/UUID';
import LocDetails from '../loc/LocDetails';

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

export const TRANSACTION_PROTECTION_RELATIVE_PATH = "/transaction-protection";
export const TRANSACTION_PROTECTION_PATH = USER_PATH + TRANSACTION_PROTECTION_RELATIVE_PATH;

export const TRANSACTION_LOC_DETAILS_RELATIVE_PATH = TRANSACTION_PROTECTION_RELATIVE_PATH + '/:locId';
export const TRANSACTION_LOC_DETAILS_PATH = USER_PATH + TRANSACTION_LOC_DETAILS_RELATIVE_PATH;
export function transactionLocDetailsPath(locId: string) {
    return TRANSACTION_LOC_DETAILS_PATH.replace(":locId", locId)
}

export function locDetailsPath(locId: string | UUID) {
    let stringId;
    if(locId instanceof UUID) {
        stringId = locId.toString();
    } else {
        stringId = locId;
    }
    return transactionLocDetailsPath(stringId);
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
            <Route path={ TRANSACTION_PROTECTION_RELATIVE_PATH } element={ <TransactionProtection/> } />
            <Route path={ TRANSACTION_LOC_DETAILS_RELATIVE_PATH } element={
                <LocDetails
                    backPath={ TRANSACTION_PROTECTION_PATH }
                    detailsPath={ locDetailsPath }
                    viewer='User'
                />
            } />
            <Route path="/" element={ <Home /> } />
        </Routes>
    );
}
