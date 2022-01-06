import { UUID } from "../../logion-chain/UUID"

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
}

export enum PublishStatus {
    NONE,
    START,
    PUBLISH_PENDING,
    PUBLISHING,
    PUBLISHED
}

export interface PublishState {
    status: PublishStatus;
}

export interface PublishProps {
    locItem: LocItem
}
