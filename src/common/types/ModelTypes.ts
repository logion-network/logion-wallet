import Identity from './Identity';
import PostalAddress from './PostalAddress';

export type ProtectionRequestStatus = "PENDING" | "REJECTED" | "ACCEPTED" | "ACTIVATED";

export interface LegalOfficerDecision {
    rejectReason: string | null,
    decisionOn: string | null,
    locId?: string | null,
}

export interface ProtectionRequest {
    id: string,
    requesterAddress: string,
    decision: LegalOfficerDecision,
    userIdentity: Identity,
    userPostalAddress: PostalAddress,
    createdOn: string,
    isRecovery: boolean,
    addressToRecover: string | null,
    status: ProtectionRequestStatus,
    legalOfficerAddress: string,
    otherLegalOfficerAddress: string,
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
    status: "OPEN" | "REQUESTED" | "REJECTED" | "CLOSED";
    rejectReason?: string;
    userIdentity?: Identity;
    closedOn?: string;
    files: LocFile[];
    metadata: LocMetadataItem[];
}

export type LocRequestStatus = "OPEN" | "REQUESTED" | "REJECTED" | "CLOSED";
