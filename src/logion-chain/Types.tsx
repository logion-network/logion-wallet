import { UUID } from "./UUID";

export interface MetadataItem {
    name: string;
    value: string;
    submitter: string;
}

export interface File {
    hash: string;
    nature: string;
    submitter: string;
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

export type DataLocType = 'Transaction' | 'Collection';

export type LocType = DataLocType | 'Identity';

export type IdentityLocType = 'Polkadot' | 'Logion';

export interface VoidInfo {
    replacer?: UUID;
}

export interface CollectionItem {
    id: string,
    description: string
}

export function isLogionIdentityLoc(loc: LegalOfficerCase): boolean {
    return loc.locType === 'Identity' && !loc.requesterAddress && !loc.requesterLocId;
}

export function isLogionDataLoc(loc: LegalOfficerCase): boolean {
    return loc.locType !== 'Identity' && (loc.requesterLocId !== undefined && loc.requesterLocId !== null);
}
