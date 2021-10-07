export interface MetadataItem {
    name: string;
    value: string;
}

export interface LegalOfficerCase {
    owner: string;
    requester: string;
    metadata: MetadataItem[];
    hashes: string[];
    closed: boolean;
}
