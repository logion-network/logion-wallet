import { Routes, Route } from 'react-router-dom';
import { UUID } from '@logion/node-api/dist/UUID';
import { LocType } from "@logion/node-api/dist/Types";

import { USER_PATH, locRequestsRelativePath, dataLocDetailsRelativePath } from '../RootPaths';

import Settings from "../settings/Settings";
import Wallet from "../common/Wallet";
import Transactions from "../common/Transactions";
import LocDetails from '../loc/LocDetails';
import { useCommonContext } from "../common/CommonContext";

import { useUserContext } from "./UserContext";
import Home from "./Home";
import TrustProtection from "./trust-protection/TrustProtection";
import TransactionProtection from "./transaction-protection/TransactionProtection";
import Recovery from "./trust-protection/Recovery";
import Vault from "./trust-protection/Vault";

export const HOME_PATH = USER_PATH;

export const TRUST_PROTECTION_RELATIVE_PATH = '/protection';
export const TRUST_PROTECTION_PATH = USER_PATH + TRUST_PROTECTION_RELATIVE_PATH;
export const SETTINGS_RELATIVE_PATH = '/settings';
export const SETTINGS_PATH = USER_PATH + SETTINGS_RELATIVE_PATH;
export const RECOVERY_RELATIVE_PATH = '/recovery';
export const RECOVERY_PATH = USER_PATH + RECOVERY_RELATIVE_PATH;
export const WALLET_RELATIVE_PATH = '/wallet';
export const WALLET_PATH = USER_PATH + WALLET_RELATIVE_PATH;
export const VAULT_RELATIVE_PATH = '/vault';
export const VAULT_PATH = USER_PATH + VAULT_RELATIVE_PATH;

export const TRANSACTIONS_RELATIVE_PATH = WALLET_RELATIVE_PATH + '/:coinId';
const TRANSACTIONS_PATH = USER_PATH + TRANSACTIONS_RELATIVE_PATH;
export function transactionsPath(coinId: string): string {
    return TRANSACTIONS_PATH.replace(":coinId", coinId);
}

export const VAULT_TRANSACTIONS_RELATIVE_PATH = VAULT_RELATIVE_PATH + '/:coinId';
const VAULT_TRANSACTIONS_PATH = USER_PATH + VAULT_TRANSACTIONS_RELATIVE_PATH;
export function vaultTransactionsPath(coinId: string): string {
    return VAULT_TRANSACTIONS_PATH.replace(":coinId", coinId);
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
    const { accounts, balances, transactions } = useCommonContext();
    const { vaultAddress, vaultBalances, vaultTransactions } = useUserContext();

    return (
        <Routes>
            <Route path={ TRUST_PROTECTION_RELATIVE_PATH } element={ <TrustProtection />} />
            <Route path={ SETTINGS_RELATIVE_PATH } element={ <Settings showContactInformation={ false } /> } />
            <Route path={ RECOVERY_RELATIVE_PATH } element={ <Recovery /> } />
            <Route path={ WALLET_RELATIVE_PATH } element={ <Wallet
                    transactionsPath={ transactionsPath }
                    settingsPath={ SETTINGS_PATH }
                    balances={ balances }
                    transactions={ transactions }
                    vaultAddress = { vaultAddress || undefined }
                />
            } />
            <Route path={ TRANSACTIONS_RELATIVE_PATH } element={ <Transactions
                    address={ accounts!.current?.address! }
                    backPath={ WALLET_PATH }
                    balances={ balances }
                    transactions={ transactions }
                    type="Wallet"
                    vaultAddress={ vaultAddress || undefined }
                />
            } />
            <Route path={ VAULT_RELATIVE_PATH } element={ <Vault
                    transactionsPath={ vaultTransactionsPath }
                    settingsPath={ SETTINGS_PATH }
                    balances={ vaultBalances }
                    transactions={ vaultTransactions }
                />
            } />
            <Route path={ VAULT_TRANSACTIONS_RELATIVE_PATH } element={ <Transactions
                    address={ vaultAddress! }
                    backPath={ VAULT_PATH }
                    balances={ vaultBalances }
                    transactions={ vaultTransactions }
                    type="Vault"
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
                       requestButtonLabel="Request a Transaction Protection"
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
                       requestButtonLabel="Request a Collection Protection"
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
