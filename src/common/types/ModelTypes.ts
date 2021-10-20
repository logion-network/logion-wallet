import Identity from './Identity';
import PostalAddress from './PostalAddress';

export type LegalOfficerDecisionStatus = "PENDING" | "REJECTED" | "ACCEPTED";

export type ProtectionRequestStatus = "PENDING" | "ACTIVATED";

export interface LegalOfficerDecision {
    legalOfficerAddress: string,
    status: LegalOfficerDecisionStatus,
    rejectReason: string | null,
    decisionOn: string | null,
    requestId?: string;
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
    type: string,
}

export interface TransactionsSet {
    transactions: Transaction[],
}

export interface LocFile {
    name: string;
    hash: string;
    addedOn: string;
}

export interface LocMetadataItem {
    name: string;
    value: string;
    addedOn: string;
}

export interface LocRequest {
    ownerAddress: string;
    requesterAddress: string;
    description: string;
    createdOn: string;
    decisionOn?: string;
    id: string;
    status: "OPEN" | "REQUESTED" | "REJECTED";
    rejectReason?: string;
    userIdentity?: Identity;
    closedOn?: string;
    files: LocFile[];
    metadata: LocMetadataItem[];
}

export type LocRequestStatus = "OPEN" | "REQUESTED" | "REJECTED" | "CLOSED";
