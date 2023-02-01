import { LocRequestState } from "@logion/client";
import { UUID } from "@logion/node-api";
import { CallCallback } from "src/ClientExtrinsicSubmitter";

import { sha256HexFromString } from "../common/hash";

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
    publishMutator: (current: LocRequestState, callback: CallCallback) => Promise<LocRequestState>;
}

export function toItemId(maybeHex: string): string | undefined {
    if(maybeHex.startsWith("0x") && maybeHex.length === 66) {
        return maybeHex;
    } else if(maybeHex.startsWith("0x") && maybeHex.length !== 66) {
        return undefined;
    } else {
        return `0x${sha256HexFromString(maybeHex)}`;
    }
}

export type ContributionMode = 'Requester' | 'VTP';
