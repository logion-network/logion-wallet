import { UUID } from "@logion/node-api/dist/UUID"

import { sha256HexFromString } from "../common/hash";
import { SignAndSubmit } from "../ExtrinsicSubmitter"

export type LocItemStatus = 'DRAFT' | 'PUBLISHED'

export type LocItemType = 'Data' | 'Document' | 'Linked LOC'

export interface LocItem {
    name: string,
    value: string,
    timestamp: string | null,
    type: LocItemType,
    submitter: string,
    status: LocItemStatus,
    nature?: string,
    target?: UUID,
    newItem: boolean,
    linkDetailsPath?: string,
}

export enum PublishStatus {
    NONE,
    START,
    PUBLISH_PENDING,
    PUBLISHING,
    PUBLISHED,
    ERROR
}

export interface PublishState {
    status: PublishStatus;
}

export interface PublishProps {
    locItem: LocItem;
    itemType: 'Public Data' | 'Document' | 'Link';
    signAndSubmitFactory: ((item: LocItem) => SignAndSubmit) | null;
    confirm: ((item: LocItem) => void) | null;
}

export type Viewer = 'User' | 'LegalOfficer';


export function toItemId(maybeHex: string): string | undefined {
    if(maybeHex.startsWith("0x") && maybeHex.length === 66) {
        return maybeHex;
    } else if(maybeHex.startsWith("0x") && maybeHex.length !== 66) {
        return undefined;
    } else {
        return `0x${sha256HexFromString(maybeHex)}`;
    }
}
