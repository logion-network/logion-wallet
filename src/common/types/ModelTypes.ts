import Identity from './Identity';
import PostalAddress from './PostalAddress';

export type TokenizationRequestStatus = "PENDING" | "REJECTED" | "ACCEPTED";

export interface AssetDescription {
    assetId: string,
    decimals: number,
}

export interface TokenizationRequest {
    id: string,
    legalOfficerAddress: string,
    requesterAddress: string,
    requestedTokenName: string,
    bars: number,
    status: TokenizationRequestStatus,
    rejectReason?: string | null,
    createdOn?: string,
    decisionOn?: string,
    assetDescription?: AssetDescription,
}

export type LegalOfficerDecisionStatus = "PENDING" | "REJECTED" | "ACCEPTED";

export type ProtectionRequestStatus = "PENDING" | "ACTIVATED";

export interface LegalOfficerDecision {
    legalOfficerAddress: string,
    status: LegalOfficerDecisionStatus,
    rejectReason: string | null,
    decisionOn: string | null,
}

export interface ProtectionRequest {
    id: string,
    requesterAddress: string,
    decisions: LegalOfficerDecision[],
    userIdentity: Identity,
    userPostalAddress: PostalAddress,
    createdOn: string,
    isRecovery: boolean,
    addressToRecover: string | null,
    status: ProtectionRequestStatus,
}

export type TransactionType = 'Sent' | 'Received' | 'Other';

export interface Transaction {
    from: string,
    to: string,
    pallet: string,
    method: string,
    transferValue: string,
    tip: string,
    fee: string,
    reserved: string,
    total: string,
    createdOn: string,
    type: TransactionType,
}

export interface TransactionsSet {
    transactions: Transaction[],
}
