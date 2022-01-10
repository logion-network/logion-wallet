import { SignAndSubmit } from "../ExtrinsicSubmitter"
import { UUID } from "../logion-chain/UUID"

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
