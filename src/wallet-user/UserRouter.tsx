import { Routes, Route } from 'react-router-dom';
import { UUID, LocType } from '@logion/node-api';
import {
    locRequestsRelativePath,
    locDetailsRelativePath,
    relativeDashboardCertificateRelativePath,
} from '../RootPaths';
import {
    TRUST_PROTECTION_RELATIVE_PATH,
    SETTINGS_RELATIVE_PATH,
    RECOVERY_RELATIVE_PATH,
    TRANSACTIONS_RELATIVE_PATH,
    VAULT_TRANSACTIONS_RELATIVE_PATH,
    SETTINGS_PATH,
    locDetailsPath,
    locRequestsPath,
    requestLocRelativePath,
    ISSUER_RELATIVE_PATH,
    ISSUER_DETAILS_RELATIVE_PATH,
    ISSUER_PATH,
    issuerDetailsPath,
    IDENFY_RELATIVE_PATH,
    DOCUMENT_CLAIM_HISTORY_RELATIVE_PATH,
    TOKENS_RECORD_RELATIVE_PATH,
    ISSUER_TOKENS_RECORD_RELATIVE_PATH,
    TOKENS_RECORD_DOCUMENT_CLAIM_HISTORY_RELATIVE_PATH,
    ISSUER_TOKENS_RECORD_DOCUMENT_CLAIM_HISTORY_RELATIVE_PATH,
    INVITED_CONTRIBUTORS_RELATIVE_PATH
} from "./UserPaths";
import Settings from "../settings/Settings";
import Transactions from "../common/Transactions";
import { UserLocDetails } from '../loc/LocDetails';
import DashboardCertificateRouter from "../loc/DashboardCertificateRouter";
import { useCommonContext } from "../common/CommonContext";
import { useUserContext } from "./UserContext";
import Home from "./home/Home";
import TrustProtection from "./trust-protection/TrustProtection";
import Recovery from "./trust-protection/Recovery";
import { useLogionChain } from '../logion-chain';
import IdentityLocRequest from "../loc/IdentityLocRequest";
import IssuerDashboard from "./issuer/IssuerDashboard";
import IdenfyVerificationResult from './idenfy/IdenfyVerificationResult';
import { UserDocumentClaimHistory, UserTokensRecordDocumentClaimHistory } from 'src/loc/DocumentClaimHistory';
import { UserTokensRecordPane } from 'src/loc/record/TokensRecordPane';
import { Navigate } from 'react-router-dom';
import { UserInvitedContributorsPane } from "../loc/invited-contributor/InvitedContributorsPane";
import LocsDashboard from 'src/loc/dashboard/LocsDashboard';
import LocRequestButton from "../components/locrequest/LocRequestButton";
import DataLocRequest from "../loc/DataLocRequest";

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
            <Route path={ TRANSACTIONS_RELATIVE_PATH } element={ <Transactions
                    address={ accounts!.current?.accountId!.address }
                    balances={ balanceState?.balances || null }
                    transactions={ balanceState?.transactions || null }
                    type="Wallet"
                    vaultAddress={ vaultState?.vaultAddress || undefined }
                />
            } />
            <Route path={ VAULT_TRANSACTIONS_RELATIVE_PATH } element={ <Transactions
                    address={ vaultState?.vaultAddress || "" }
                    balances={ vaultState?.balances || null }
                    transactions={ vaultState?.transactions || null }
                    type="Vault"
                    vaultAddress={ vaultState?.vaultAddress || undefined }
                />
            } />
            <Route
                path={ locRequestsRelativePath('Transaction') }
                element={ <LocsDashboard
                    title="Transaction LOCs"
                    iconId="loc"
                    actions={ <LocRequestButton locType="Transaction" /> }
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
                    actions={ <LocRequestButton locType="Collection"/> }
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
                    actions={ <LocRequestButton locType="Identity"/> }
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
            <Route path={ requestLocRelativePath("Identity") } element={
                <IdentityLocRequest backPath={ locRequestsPath('Identity') }/>
            } />
            <Route path={ requestLocRelativePath("Collection") } element={
                <DataLocRequest backPath={ locRequestsPath('Collection') } iconId="collection" locType="Collection"/>
            } />
            <Route path={ requestLocRelativePath("Transaction") } element={
                <DataLocRequest backPath={ locRequestsPath('Transaction') } iconId="loc" locType="Transaction"/>
            } />
            <Route path={ ISSUER_RELATIVE_PATH } element={
                <IssuerDashboard/>
            } />
            <Route path={ ISSUER_DETAILS_RELATIVE_PATH } element={
                <UserLocDetails
                    backPath={ ISSUER_PATH }
                    detailsPath={ (locId: UUID, _: LocType) => issuerDetailsPath(locId) }
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
