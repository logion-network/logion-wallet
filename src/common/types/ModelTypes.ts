import { UserIdentity, PostalAddress } from '@logion/client';
import { File, LocType, MetadataItem, Link, CollectionItem } from '@logion/node-api/dist/Types';

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

export type MergedCollectionItem = CollectionItem & Partial<AddedOn>

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
    userIdentity?: UserIdentity;
    userPostalAddress?: PostalAddress;
    closedOn?: string;
    files: LocFile[];
    metadata: LocMetadataItem[];
    links: LocLink[];
    voidInfo?: LocRequestVoidInfo;
    seal?: string;
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
