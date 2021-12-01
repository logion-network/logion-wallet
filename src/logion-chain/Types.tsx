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
    requester: string;
    metadata: MetadataItem[];
    files: File[];
    links: Link[];
    closed: boolean;
    locType: LocType;
}

export type LocType = 'Transaction' | 'Identity';

export interface VoidInfo {
    reason: string;
    replacerLocId?: UUID;
}
