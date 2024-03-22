import { Routes, Route } from 'react-router-dom';
import { UUID, LocType, Hash } from '@logion/node-api';

import {
    USER_PATH,
    locRequestsRelativePath,
    locDetailsRelativePath,
    relativeDashboardCertificateRelativePath,
    LOC_DETAILS_RELATIVE_PATH
} from '../RootPaths';

import Settings from "../settings/Settings";
import Wallet from "../common/Wallet";
import Transactions from "../common/Transactions";
import { UserLocDetails } from '../loc/LocDetails';
import DashboardCertificateRouter from "../loc/DashboardCertificateRouter";
import { useCommonContext } from "../common/CommonContext";

import { useUserContext } from "./UserContext";
import Home from "./Home";
import TrustProtection from "./trust-protection/TrustProtection";
import Recovery from "./trust-protection/Recovery";
import Vault from "./trust-protection/Vault";
import { useLogionChain } from '../logion-chain';
import LocCreation from "./transaction-protection/LocCreation";
import IdentityLocRequest from "./trust-protection/IdentityLocRequest";
import IssuerDashboard from "./issuer/IssuerDashboard";
import IdenfyVerificationResult from './IdenfyVerificationResult';
import { UserDocumentClaimHistory, UserTokensRecordDocumentClaimHistory } from 'src/loc/DocumentClaimHistory';
import { UserTokensRecordPane } from 'src/loc/record/TokensRecordPane';
import { Navigate } from 'react-router-dom';
import { getBaseUrl } from "../PublicPaths";
import { UserInvitedContributorsPane } from "../loc/invited-contributor/InvitedContributorsPane";
import LocsDashboard from 'src/loc/dashboard/LocsDashboard';
import IdentityLocCreation from "./IdentityLocCreation";

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
export const IDENTITY_REQUEST_RELATIVE_PATH = "/loc/identity-request";
export const IDENTITY_REQUEST_PATH = USER_PATH + IDENTITY_REQUEST_RELATIVE_PATH;
export const ISSUER_RELATIVE_PATH = '/verified-issuer';
export const ISSUER_PATH = USER_PATH + ISSUER_RELATIVE_PATH;
export const ISSUER_DETAILS_RELATIVE_PATH = ISSUER_RELATIVE_PATH + '/:locId';
export const IDENFY_RELATIVE_PATH = '/idenfy';
export const IDENFY_PATH = USER_PATH + IDENFY_RELATIVE_PATH;

export function issuerDetailsPath(locId: UUID | string) {
    return USER_PATH + ISSUER_DETAILS_RELATIVE_PATH
        .replace(":locId", locId.toString())
}

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
    return USER_PATH + locDetailsRelativePath(locType)
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

export const PARAM_RESULT = "result";
export const PARAM_LOC_ID = "locId";

export function resumeAfterIDenfyProcessUrl(result: 'success' | 'error' | 'unverified', locId: UUID): string {
    return `${ getBaseUrl() }${ IDENFY_PATH }?${ PARAM_RESULT }=${ result }&${ PARAM_LOC_ID }=${ locId.toString() }`;
}

export const DOCUMENT_CLAIM_HISTORY_RELATIVE_PATH = LOC_DETAILS_RELATIVE_PATH + "/claims/:hash";
export function documentClaimHistoryPath(locId: UUID, hash: Hash) {
    return USER_PATH + DOCUMENT_CLAIM_HISTORY_RELATIVE_PATH
        .replace(":locType", "Collection")
        .replace(":locId", locId.toString())
        .replace(":hash", hash.toHex());
}

export const TOKENS_RECORD_RELATIVE_PATH = LOC_DETAILS_RELATIVE_PATH + "/records";
export function tokensRecordPath(locId: UUID) {
    return USER_PATH + TOKENS_RECORD_RELATIVE_PATH
        .replace(":locType", "Collection")
        .replace(":locId", locId.toString());
}

export const ISSUER_TOKENS_RECORD_RELATIVE_PATH = ISSUER_DETAILS_RELATIVE_PATH + "/records";
export function issuerTokensRecordPath(locId: UUID) {
    return USER_PATH + ISSUER_TOKENS_RECORD_RELATIVE_PATH
        .replace(":locType", "Collection")
        .replace(":locId", locId.toString());
}

export const TOKENS_RECORD_DOCUMENT_CLAIM_HISTORY_RELATIVE_PATH = LOC_DETAILS_RELATIVE_PATH + "/records/:recordId/claims/:hash";
export function tokensRecordDocumentClaimHistoryPath(locId: UUID, recordId: Hash, hash: Hash) {
    return USER_PATH + TOKENS_RECORD_DOCUMENT_CLAIM_HISTORY_RELATIVE_PATH
        .replace(":locType", "Collection")
        .replace(":locId", locId.toString())
        .replace(":recordId", recordId.toHex())
        .replace(":hash", hash.toHex());
}

export const ISSUER_TOKENS_RECORD_DOCUMENT_CLAIM_HISTORY_RELATIVE_PATH = ISSUER_DETAILS_RELATIVE_PATH + "/records/:recordId/claims/:hash";
export function issuerTokensRecordDocumentClaimHistoryPath(locId: UUID, recordId: Hash, hash: Hash) {
    return USER_PATH + ISSUER_TOKENS_RECORD_DOCUMENT_CLAIM_HISTORY_RELATIVE_PATH
        .replace(":locType", "Collection")
        .replace(":locId", locId.toString())
        .replace(":recordId", recordId.toHex())
        .replace(":hash", hash.toHex());
}

export const INVITED_CONTRIBUTORS_RELATIVE_PATH = LOC_DETAILS_RELATIVE_PATH + "/invited-contributors";
export function invitedContributorsPath(locId: UUID) {
    return USER_PATH + INVITED_CONTRIBUTORS_RELATIVE_PATH
        .replace(":locType", "collection")
        .replace(":locId", locId.toString());
}

export default function UserRouter() {
    const { accounts } = useLogionChain();
    const { balanceState } = useCommonContext();
    const { vaultState, locs, locsState } = useUserContext();

    if(!(accounts?.current?.accountId)) {
        return null;
    }

    return (
        <Routes>
            <Route path={ TRUST_PROTECTION_RELATIVE_PATH } element={ <TrustProtection />} />
            <Route path={ SETTINGS_RELATIVE_PATH } element={ <Settings showContactInformation={ false } /> } />
            <Route path={ RECOVERY_RELATIVE_PATH } element={ <Recovery /> } />
            <Route path={ WALLET_RELATIVE_PATH } element={ <Wallet
                    transactionsPath={ transactionsPath }
                    settingsPath={ SETTINGS_PATH }
                    balances={ balanceState?.balances || [] }
                    transactions={ balanceState?.transactions || [] }
                    vaultAddress = { vaultState?.vaultAddress || undefined }
                    address={ accounts.current.accountId.address }
                />
            } />
            <Route path={ TRANSACTIONS_RELATIVE_PATH } element={ <Transactions
                    address={ accounts!.current?.accountId!.address }
                    backPath={ WALLET_PATH }
                    balances={ balanceState?.balances || null }
                    transactions={ balanceState?.transactions || null }
                    type="Wallet"
                    vaultAddress={ vaultState?.vaultAddress || undefined }
                />
            } />
            <Route path={ VAULT_RELATIVE_PATH } element={ <Vault
                    transactionsPath={ vaultTransactionsPath }
                    settingsPath={ SETTINGS_PATH }
                    balances={ vaultState?.balances || null }
                    transactions={ vaultState?.transactions || null }
                    address={ accounts.current.accountId.address }
                />
            } />
            <Route path={ VAULT_TRANSACTIONS_RELATIVE_PATH } element={ <Transactions
                    address={ vaultState?.vaultAddress || "" }
                    backPath={ VAULT_PATH }
                    balances={ vaultState?.balances || null }
                    transactions={ vaultState?.transactions || null }
                    type="Vault"
                />
            } />
            <Route
                path={ locRequestsRelativePath('Transaction') }
                element={ <LocsDashboard
                    title="Transaction LOCs"
                    iconId="loc"
                    actions={ <LocCreation
                        locType='Transaction'
                        requestButtonLabel="Request a Transaction Protection"
                    /> }
                    settingsPath={ SETTINGS_PATH }
                    locs={ locs["Transaction"] }
                    loading={ locsState === undefined || locsState.discarded }
                    locDetailsPath={ locDetailsPath }
                /> }
            />
            <Route
                path={ locRequestsRelativePath('Collection') }
                element={ <LocsDashboard
                    title="Collection LOCs"
                    iconId="collection"
                    actions={ <LocCreation
                        locType='Collection'
                        requestButtonLabel="Request a Collection Protection"
                    /> }
                    settingsPath={ SETTINGS_PATH }
                    locs={ locs["Collection"] }
                    loading={ locsState === undefined || locsState.discarded }
                    locDetailsPath={ locDetailsPath }
                /> }
            />
            <Route
                path={ locRequestsRelativePath('Identity') }
                element={ <LocsDashboard
                    title="Identity LOCs"
                    iconId="identity"
                    actions={ <IdentityLocCreation/> }
                    settingsPath={ SETTINGS_PATH }
                    locs={ locs["Identity"] }
                    loading={ locsState === undefined || locsState.discarded }
                    locDetailsPath={ locDetailsPath }
                /> }
            />
            <Route path={ locDetailsRelativePath('Transaction') } element={
                <UserLocDetails
                    backPath={ locRequestsPath('Transaction') }
                    detailsPath={ locDetailsPath }
                    contributionMode='Requester'
                />
            } />
            <Route path={ locDetailsRelativePath('Collection') } element={
                <UserLocDetails
                    backPath={ locRequestsPath('Collection') }
                    detailsPath={ locDetailsPath }
                    contributionMode='Requester'
                />
            } />
            <Route path={ relativeDashboardCertificateRelativePath('Collection') } element={
                <DashboardCertificateRouter
                    detailsPath={ locDetailsPath }
                    viewer='User'
                    locType='Collection'
                />
            } />
            <Route path={ locDetailsRelativePath('Identity') } element={
                <UserLocDetails
                    backPath={ locRequestsPath('Identity') }
                    detailsPath={ locDetailsPath }
                    contributionMode='Requester'
                />
            } />
            <Route path="/" element={ accounts.current.accountId.type === "Polkadot" ? <Home /> : <Navigate to={ locRequestsPath('Identity') } /> } />
            <Route path={ IDENTITY_REQUEST_RELATIVE_PATH } element={
                <IdentityLocRequest backPath={ locRequestsPath('Identity') }/>
            } />
            <Route path={ ISSUER_RELATIVE_PATH } element={
                <IssuerDashboard/>
            } />
            <Route path={ ISSUER_DETAILS_RELATIVE_PATH } element={
                <UserLocDetails
                    backPath={ ISSUER_PATH }
                    detailsPath={ (locId: UUID, type: LocType) => issuerDetailsPath(locId) }
                    contributionMode='VerifiedIssuer'
                />
            } />
            <Route path={ IDENFY_RELATIVE_PATH } element={
                <IdenfyVerificationResult
                    detailsPath={ locDetailsPath }
                />
            } />
            <Route path={ DOCUMENT_CLAIM_HISTORY_RELATIVE_PATH } element={ <UserDocumentClaimHistory/> } />
            <Route path={ TOKENS_RECORD_RELATIVE_PATH } element={ <UserTokensRecordPane contributionMode='Requester'/> }/>
            <Route path={ ISSUER_TOKENS_RECORD_RELATIVE_PATH } element={ <UserTokensRecordPane contributionMode='VerifiedIssuer'/> }/>
            <Route path={ TOKENS_RECORD_DOCUMENT_CLAIM_HISTORY_RELATIVE_PATH } element={ <UserTokensRecordDocumentClaimHistory contributionMode='Requester'/> } />
            <Route path={ ISSUER_TOKENS_RECORD_DOCUMENT_CLAIM_HISTORY_RELATIVE_PATH } element={ <UserTokensRecordDocumentClaimHistory contributionMode='VerifiedIssuer'/> } />
            <Route path={ INVITED_CONTRIBUTORS_RELATIVE_PATH } element={ <UserInvitedContributorsPane contributionMode='Requester'/> }/>
        </Routes>
    );
}
