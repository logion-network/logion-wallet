import { LocItem } from "./types";
import { File, Link, MetadataItem } from "../../logion-chain/Types";
import { LocFile, LocMetadataItem, LocLink } from "../../common/types/ModelTypes";
import { UUID } from "../../logion-chain/UUID";

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
        return createPublishedFileLocItem({
            name: fileFromBackend.name,
            timestamp: fileFromBackend.addedOn,
            file: fileFromChain,
            submitter
        })
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

function createPublishedFileLocItem(parameters: CreateFileLocItemParameters & Timestamp): MergeResult {
    return publish(createDraftFileLocItem(parameters), parameters.timestamp)
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

export interface MergeLocMetadataItemParameters {
    itemFromBackend: LocMetadataItem,
    itemFromChain?: MetadataItem,
    submitter: string
}

export function mergeLocMetadataItem(parameters: MergeLocMetadataItemParameters): MergeResult {
    const { itemFromBackend, itemFromChain, submitter } = parameters;
    if (itemFromChain) {
        return createPublishedMetadataLocItem({
            metadataItem: itemFromChain,
            timestamp: itemFromBackend.addedOn,
            submitter
        });
    } else {
        const locItem = createDraftMetadataLocItem({
            metadataItem: itemFromBackend,
            submitter
        })
        return { locItem, refreshNeeded: false }
    }
}

export interface CreateLocMetadataItemParameters {
    metadataItem: MetadataItem,
    submitter: string,
}

function createPublishedMetadataLocItem(parameters: CreateLocMetadataItemParameters & Timestamp): MergeResult {
    return publish(createDraftMetadataLocItem(parameters), parameters.timestamp)
}

export function createDraftMetadataLocItem(parameters: CreateLocMetadataItemParameters): LocItem {
    const { metadataItem, submitter } = parameters;
    return {
        name: metadataItem.name,
        value: metadataItem.value,
        submitter,
        timestamp: null,
        type: 'Data',
        status: 'DRAFT'
    }
}

export interface MergeLocLinkItemParameters {
    linkFromBackend: LocLink,
    linkFromChain?: Link,
    otherLocDescription: string,
    submitter: string
}

export function mergeLocLinkItem(parameters: MergeLocLinkItemParameters): MergeResult {
    const { linkFromBackend, linkFromChain, otherLocDescription, submitter } = parameters;
    if (linkFromChain) {
        return createPublishedLinkedLocItem({
            link: linkFromChain,
            otherLocDescription,
            submitter,
            timestamp: linkFromBackend.addedOn
        });
    } else {
        const link: LocLink = { ...linkFromBackend, id: new UUID(linkFromBackend.target) }
        const locItem = createDraftLinkedLocItem({
            link,
            otherLocDescription,
            submitter,
        })
        return { locItem, refreshNeeded: false }
    }
}

export interface CreateLocLinkedLocItemParameters {
    link: Link,
    otherLocDescription: string,
    submitter: string,
}

export function createDraftLinkedLocItem(parameters: CreateLocLinkedLocItemParameters): LocItem {
    const { link, otherLocDescription, submitter } = parameters;
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

function publish(locItem: LocItem, timestamp: string | null): MergeResult {
    const publishedLocItem: LocItem = { ...locItem, status: 'PUBLISHED', timestamp };
    return { locItem: publishedLocItem, refreshNeeded: !locItem.timestamp };
}

function createPublishedLinkedLocItem(parameters: CreateLocLinkedLocItemParameters & Timestamp): MergeResult {
    return publish(createDraftLinkedLocItem(parameters), parameters.timestamp);
}
