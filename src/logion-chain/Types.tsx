import { UUID } from "./UUID";

export interface MetadataItem {
    name: string;
    value: string;
}

export interface File {
    hash: string;
    nature: string;
}

export interface Link {
    id: UUID;
    nature: string;
}

export interface LegalOfficerCase {
    owner: string;
    requesterAddress?: string;
    requesterLocId?: UUID;
    metadata: MetadataItem[];
    files: File[];
    links: Link[];
    closed: boolean;
    locType: LocType;
    voidInfo?: VoidInfo;
    replacerOf?: UUID;
}

export type LocType = 'Transaction' | 'Identity';

export type IdentityLocType = 'Polkadot' | 'Logion';

export interface VoidInfo {
    replacer?: UUID;
}

export function isLogionIdentityLoc(loc: LegalOfficerCase): boolean {
    return loc.locType === 'Identity' && !loc.requesterAddress && !loc.requesterLocId;
}

export function isLogionTransactionLoc(loc: LegalOfficerCase): boolean {
    return loc.locType === 'Transaction' && (loc.requesterLocId !== undefined && loc.requesterLocId !== null);
}
