import { LocItem, LocItemStatus, LocItemType } from "./types";
import { MetadataItem, ReservedName } from "../../logion-chain/Types";
import { UUID } from "../../logion-chain/UUID";

export const UNKNOWN_NAME = "-";

const LOC_ITEM_TYPES: Record<ReservedName, LocItemType> = {
    [ReservedName.LinkedLocId]: "Linked LOC"
}

export function createPublishedFileLocItem(hash: string, submitter: string): LocItem {
    return createItem(UNKNOWN_NAME, hash, submitter, 'Document', 'PUBLISHED')
}

export function createPublishedMetadataLocItem(item: MetadataItem, submitter: string): LocItem {
    let type: LocItemType = LOC_ITEM_TYPES[item.name as ReservedName]
    if (type) {
        return createItem(UNKNOWN_NAME, item.value, submitter, type, 'PUBLISHED')
    } else {
        return createItem(item.name, item.value, submitter, 'Data', 'PUBLISHED')
    }
}

export function createDraftFileLocItem(name: string, hash: string, submitter: string): LocItem {
    return createItem(name, hash, submitter, 'Document', 'DRAFT')
}

export function createDraftMetadataLocItem(name: string, value: string, submitter: string): LocItem {
    return createItem(name, value, submitter, 'Data', 'DRAFT')
}

export function createDraftLinkedLocItem(otherLocId: UUID, otherLocDescription: string, submitter:string): LocItem {
    return createItem(otherLocDescription, otherLocId.toDecimalString(), submitter, 'Linked LOC', 'DRAFT')
}

function createItem(name: string, value: string, submitter: string, type: LocItemType, status: LocItemStatus) {
    return {
        name,
        value,
        submitter,
        timestamp: null,
        type,
        status
    };

}

