import { Routes, Route, Navigate } from 'react-router-dom';

import {
    RECOVERY_REQUESTS_RELATIVE_PATH,
    SETTINGS_RELATIVE_PATH,
    RECOVERY_DETAILS_RELATIVE_PATH,
    WALLET_RELATIVE_PATH,
    WALLET_PATH,
    transactionsPath,
    TRANSACTIONS_RELATIVE_PATH,
    SETTINGS_PATH,
    locDetailsPath,
    locRequestsPath,
    VAULT_OUT_REQUESTS_RELATIVE_PATH,
    locSelectIssuerPath,
    VOTES_RELATIVE_PATH,
    VOTES_PATH,
    VOTE_LOC_RELATIVE_PATH,
    DOCUMENT_CLAIM_HISTORY_RELATIVE_PATH,
    TOKENS_RECORD_RELATIVE_PATH,
    tokensRecordPath,
    TOKENS_RECORD_ISSUER_RELATIVE_PATH,
    TOKENS_RECORD_DOCUMENT_CLAIM_HISTORY_RELATIVE_PATH,
    INVITED_CONTRIBUTORS_RELATIVE_PATH,
} from './LegalOfficerPaths';

import Home from './Home';
import RecoveryRequests from './RecoveryRequests';
import Settings from '../settings/Settings';
import RecoveryDetails from "./RecoveryDetails";
import Wallet from "../common/Wallet";
import Transactions from "../common/Transactions";
import TransactionProtection from './transaction-protection/TransactionProtection';
import LocDetails, { VoterLocDetails } from "../loc/LocDetails";
import IdentityProtection from './transaction-protection/IdentityProtection';
import { useCommonContext } from '../common/CommonContext';
import { FullWidthPane } from '../common/Dashboard';
import DangerFrame from '../common/DangerFrame';
import DashboardCertificateRouter from "../loc/DashboardCertificateRouter";

import './LegalOfficerRouter.css';
import {
    locRequestsRelativePath,
    locDetailsRelativePath,
    relativeDashboardCertificateRelativePath,
} from "../RootPaths";
import VaultOutRequests from './vault/VaultOutRequests';
import { useLogionChain } from '../logion-chain';
import { useLegalOfficerContext } from './LegalOfficerContext';
import IssuerSelection from "../loc/issuer/IssuerSelection";
import Votes from './votes/Votes';
import {
    GuardianDocumentClaimHistory,
    LegalOfficerTokensRecordDocumentClaimHistory
} from 'src/loc/DocumentClaimHistory';
import { LegalOfficerTokensRecordPane } from 'src/loc/record/TokensRecordPane';
import { LegalInvitedContributorsPane } from "../loc/invited-contributor/InvitedContributorsPane";

export default function LegalOfficerRouter() {
    const { accounts } = useLogionChain();
    const { nodesDown, availableLegalOfficers, balanceState } = useCommonContext();
    const { missingSettings } = useLegalOfficerContext();

    if(availableLegalOfficers === undefined || !(accounts?.current?.accountId)) {
        return null;
    }

    const currentLegalOfficerUnavailable = availableLegalOfficers.find(node => node.address === accounts?.current?.accountId.address) === undefined;
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
            <Route path={ VAULT_OUT_REQUESTS_RELATIVE_PATH } element={ <VaultOutRequests /> } />
            <Route path={ RECOVERY_REQUESTS_RELATIVE_PATH } element={ <RecoveryRequests /> } />
            <Route path={ RECOVERY_DETAILS_RELATIVE_PATH } element={ <RecoveryDetails /> } />
            <Route path={ SETTINGS_RELATIVE_PATH } element={ <Settings showContactInformation={ true } missingSettings={ missingSettings !== undefined } /> } />
            <Route path={ WALLET_RELATIVE_PATH } element={ <Wallet
                transactionsPath={ transactionsPath }
                settingsPath={ SETTINGS_PATH }
                balances={ balanceState?.balances || [] }
                transactions={ balanceState?.transactions || [] }
                address={ accounts.current.accountId.address }
            />} />
            <Route path={ TRANSACTIONS_RELATIVE_PATH } element={ <Transactions
                    address={ accounts!.current!.accountId.address }
                    backPath={ WALLET_PATH }
                    balances={ balanceState?.balances || [] }
                    transactions={ balanceState?.transactions || [] }
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
            <Route path={ locDetailsRelativePath('Transaction') } element={
                <LocDetails
                    backPath={ locRequestsPath('Transaction') }
                    detailsPath={ locDetailsPath }
                />
            } />
            <Route path={ locDetailsRelativePath('Collection') } element={
                <LocDetails
                    backPath={ locRequestsPath('Collection') }
                    detailsPath={ locDetailsPath }
                />
            } />
            <Route path={ relativeDashboardCertificateRelativePath('Collection') } element={
                <DashboardCertificateRouter
                    detailsPath={ locDetailsPath }
                    viewer='LegalOfficer'
                    locType='Collection'
                />
            } />
            <Route path={ locRequestsRelativePath('Identity') } element={ <IdentityProtection /> } />
            <Route path={ locDetailsRelativePath('Identity') } element={
                <LocDetails
                    backPath={ locRequestsPath('Identity') }
                    detailsPath={ locDetailsPath }
                />
            } />
            <Route path={ locSelectIssuerPath('Transaction') } element={
                <IssuerSelection
                    detailsPath={ locDetailsPath }
                    backPath={ locId => locDetailsPath(locId, 'Transaction') }
                />
            }/>
            <Route path={ locSelectIssuerPath('Collection') } element={
                <IssuerSelection
                    detailsPath={ locDetailsPath }
                    backPath={ locId => locDetailsPath(locId, 'Collection') }
                />
            }/>
            <Route path={ locSelectIssuerPath('Identity') } element={
                <IssuerSelection
                    detailsPath={ locDetailsPath }
                    backPath={ locId => locDetailsPath(locId, 'Identity') }
                />
            }/>
            <Route path={ VOTES_RELATIVE_PATH } element={ <Votes />} />
            <Route path={ VOTE_LOC_RELATIVE_PATH } element={
                <VoterLocDetails
                    backPath={ VOTES_PATH }
                    detailsPath={ locDetailsPath }
                />
            } />
            <Route path={ DOCUMENT_CLAIM_HISTORY_RELATIVE_PATH } element={ <GuardianDocumentClaimHistory/> } />
            <Route path={ TOKENS_RECORD_RELATIVE_PATH } element={ <LegalOfficerTokensRecordPane/> }/>
            <Route path={ TOKENS_RECORD_ISSUER_RELATIVE_PATH } element={
                <IssuerSelection
                    detailsPath={ locDetailsPath }
                    backPath={ locId => tokensRecordPath(locId) }
                />
            }/>
            <Route path={ TOKENS_RECORD_DOCUMENT_CLAIM_HISTORY_RELATIVE_PATH } element={ <LegalOfficerTokensRecordDocumentClaimHistory/> } />
            <Route path="" element={ currentLegalOfficerUnavailable ? <Navigate to={ SETTINGS_PATH }/> : <Home /> } />
            <Route path={ INVITED_CONTRIBUTORS_RELATIVE_PATH } element={ <LegalInvitedContributorsPane/> }/>
        </Routes>
    );
}
