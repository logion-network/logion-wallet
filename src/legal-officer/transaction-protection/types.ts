import { ReservedName } from "../../logion-chain/Types";

export type LocItemStatus = 'DRAFT' | 'PUBLISHED'

export type LocItemType = 'Data' | 'Document' | 'Linked LOC'

export interface LocItem {
    name: string,
    value: string,
    timestamp: string | null,
    type: LocItemType,
    submitter: string,
    status: LocItemStatus
}

export const LOC_ITEM_TYPES: Record<ReservedName, LocItemType> = {
    [ReservedName.LinkedLocId]: "Linked LOC"
}
