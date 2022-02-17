import { LocType, MetadataItem, Link, CollectionItem } from '../../logion-chain/Types';
import Identity from './Identity';
import PostalAddress from './PostalAddress';
import { File } from '../../logion-chain/Types'
import UserIdentity from './Identity';

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
    successful: boolean,
    error?: TransactionError
}

export interface TransactionError {
    section: string,
    name: string,
    details: string
}

export interface TransactionsSet {
    transactions: Transaction[],
}

export interface AddedOn {
    addedOn: string;
}

/**
 * Blockchain File, extended with private attributes and timestamp.
 */
export interface LocFile extends File, AddedOn {
    name: string;
}

/**
 * Blockchain MetadataItem, extended with timestamp.
 */
export interface LocMetadataItem extends MetadataItem, AddedOn {
}

/**
 * Blockchain MetadataItem, extended with timestamp.
 */
export interface LocLink extends Link, AddedOn {
    target: string; // is redundant with inherited "id: UUID"
}

export interface LocCollectionItem extends AddedOn {
    itemId: string,
}

export type MergedCollectionItem = CollectionItem & AddedOn

export interface LocRequestVoidInfo {
    reason?: string; // undefined in public view
    voidedOn?: string;
}

export interface LocRequest {
    ownerAddress: string;
    requesterAddress?: string | null;
    requesterIdentityLoc?: string | null;
    description: string;
    locType: LocType;
    createdOn: string;
    decisionOn?: string;
    id: string;
    status: "OPEN" | "REQUESTED" | "REJECTED" | "CLOSED";
    rejectReason?: string;
    userIdentity?: Identity;
    closedOn?: string;
    files: LocFile[];
    metadata: LocMetadataItem[];
    links: LocLink[];
    voidInfo?: LocRequestVoidInfo;
}

export type LocRequestStatus = "OPEN" | "REQUESTED" | "REJECTED" | "CLOSED";

export interface LocRequestFragment {
    requesterAddress?: string | null;
    requesterIdentityLoc?: string | null;
    locType: LocType;
    userIdentity?: UserIdentity;
}

export function isLogionIdentityLoc(loc: LocRequestFragment): boolean {
    return loc.locType === 'Identity' && !loc.requesterAddress && !loc.requesterIdentityLoc;
}

export function isLogionTransactionLoc(loc: LocRequestFragment): boolean {
    return loc.locType === 'Transaction' && (loc.requesterIdentityLoc !== undefined && loc.requesterIdentityLoc !== null);
}
