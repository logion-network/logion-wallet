import { LocItem, LocItemStatus, LocItemType } from "./types";
import { File, Link, MetadataItem } from "../../logion-chain/Types";
import { LocFile } from "../../common/types/ModelTypes";

export const UNKNOWN_NAME = "-";

export interface MergeLocFileParameters {
    fileFromBackend: LocFile,
    fileFromChain?: File,
    submitter: string
}

export interface MergeResult {
    locItem: LocItem,
    refreshNeeded: boolean
}

export function mergeLocFile(parameters: MergeLocFileParameters): MergeResult {
    const { fileFromBackend, fileFromChain, submitter } = parameters;
    if (fileFromChain) {
        const refreshNeeded = !fileFromBackend.addedOn
        const locItem = createPublishedFileLocItem({
            name: fileFromBackend.name,
            timestamp: fileFromBackend.addedOn,
            file: fileFromChain,
            submitter
        });
        return { locItem, refreshNeeded }
    } else {
        const locItem = createDraftFileLocItem({
            name: fileFromBackend.name,
            file: fileFromBackend,
            submitter
        })
        return { locItem, refreshNeeded: false }
    }
}

export interface CreateFileLocItemParameters {
    file: File,
    submitter: string,
    name: string
}

interface Timestamp {
    timestamp: string | null
}

function createPublishedFileLocItem(parameters: CreateFileLocItemParameters & Timestamp): LocItem {
    return {
        name: parameters.name,
        value: parameters.file.hash,
        nature: parameters.file.nature,
        submitter: parameters.submitter,
        timestamp: parameters.timestamp,
        type: 'Document',
        status: 'PUBLISHED',
    };
}

export function createPublishedMetadataLocItem(item: MetadataItem, submitter: string): LocItem {
    return createItem(item.name, item.value, submitter, 'Data', 'PUBLISHED')
}

export function createDraftFileLocItem(parameters: CreateFileLocItemParameters): LocItem {
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
