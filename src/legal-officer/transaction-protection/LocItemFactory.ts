import { LocItem, LocItemStatus, LocItemType } from "./types";
import { File, Link, MetadataItem } from "../../logion-chain/Types";

export const UNKNOWN_NAME = "-";

export interface CreateFileLocItemParameters {
    file: File,
    submitter: string
}

export function createPublishedFileLocItem(parameters: CreateFileLocItemParameters): LocItem {
    return {
        name: UNKNOWN_NAME,
        value: parameters.file.hash,
        nature: parameters.file.nature,
        submitter: parameters.submitter,
        timestamp: null,
        type: 'Document',
        status: 'PUBLISHED',
    };
}

export function createPublishedMetadataLocItem(item: MetadataItem, submitter: string): LocItem {
    return createItem(item.name, item.value, submitter, 'Data', 'PUBLISHED')
}

export interface CreateDraftFileLocItemParameters extends CreateFileLocItemParameters {
    name: string
}

export function createDraftFileLocItem(parameters: CreateDraftFileLocItemParameters): LocItem {
    return {
        name: parameters.name,
        value: parameters.file.hash,
        nature: parameters.file.nature,
        submitter: parameters.submitter,
        timestamp: null,
        type: 'Document',
        status: 'DRAFT',
    };
}

export function createDraftMetadataLocItem(name: string, value: string, submitter: string): LocItem {
    return createItem(name, value, submitter, 'Data', 'DRAFT')
}

export function createDraftLinkedLocItem(link: Link, otherLocDescription: string, submitter:string): LocItem {
    return {
        name: otherLocDescription,
        value: link.id.toDecimalString(),
        submitter,
        timestamp: null,
        type: 'Linked LOC',
        status: 'DRAFT',
        target: link.id,
        nature: link.nature,
    };
}

export function createPublishedLinkedLocItem(link: Link, submitter: string): LocItem {
    return {
        name: UNKNOWN_NAME,
        value: link.id.toDecimalString(),
        submitter,
        timestamp: null,
        type: 'Linked LOC',
        status: 'PUBLISHED',
        target: link.id,
        nature: link.nature,
    };
}

function createItem(name: string, value: string, submitter: string, type: LocItemType, status: LocItemStatus): LocItem {
    return {
        name,
        value,
        submitter,
        timestamp: null,
        type,
        status
    };
}
