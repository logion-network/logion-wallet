import { UUID } from "@logion/node-api/dist/UUID";
import { File, Link, MetadataItem } from "@logion/node-api/dist/Types";

import { LocItem } from "./types";
import { LocFile, LocMetadataItem, LocLink } from "../common/types/ModelTypes";
import { MergedMetadataItem, MergedFile, MergedLink } from "@logion/client";

export interface MergeLocFileParameters {
    fileFromBackend: LocFile,
    fileFromChain?: File,
}

export interface MergeResult {
    locItem: LocItem,
    refreshNeeded: boolean
}

export function mergeLocFile(parameters: MergeLocFileParameters): MergeResult {
    const { fileFromBackend, fileFromChain } = parameters;
    if (fileFromChain) {
        return createPublishedFileLocItem({
            name: fileFromBackend.name,
            timestamp: fileFromBackend.addedOn,
            file: fileFromChain,
        })
    } else {
        const locItem = createDraftFileLocItem({
            name: fileFromBackend.name,
            file: fileFromBackend,
        }, false);
        return { locItem, refreshNeeded: false };
    }
}

export interface CreateFileLocItemParameters {
    file: File,
    name: string
}

interface Timestamp {
    timestamp: string | null
}

function createPublishedFileLocItem(parameters: CreateFileLocItemParameters & Timestamp): MergeResult {
    return publish(createDraftFileLocItem(parameters, false), parameters.timestamp)
}

export function createDraftFileLocItem(parameters: CreateFileLocItemParameters, newItem: boolean): LocItem {
    return {
        name: parameters.name,
        value: parameters.file.hash,
        nature: parameters.file.nature,
        submitter: parameters.file.submitter,
        timestamp: null,
        type: 'Document',
        status: 'DRAFT',
        newItem,
    };
}

export interface MergeLocMetadataItemParameters {
    itemFromBackend: LocMetadataItem,
    itemFromChain?: MetadataItem,
}

export function mergeLocMetadataItem(parameters: MergeLocMetadataItemParameters): MergeResult {
    const { itemFromBackend, itemFromChain } = parameters;
    if (itemFromChain) {
        return createPublishedMetadataLocItem({
            metadataItem: itemFromChain,
            timestamp: itemFromBackend.addedOn,
        });
    } else {
        const locItem = createDraftMetadataLocItem({
            metadataItem: itemFromBackend,
        }, false);
        return { locItem, refreshNeeded: false };
    }
}

export function metadataToLocItem(mergedMetadataItem: MergedMetadataItem): MergeResult {
    if (mergedMetadataItem.published) {
        return createPublishedMetadataLocItem({
            metadataItem: mergedMetadataItem, timestamp: mergedMetadataItem.addedOn || null
        })
    } else {
        const locItem = createDraftMetadataLocItem({ metadataItem: mergedMetadataItem }, false)
        return { locItem, refreshNeeded: false };
    }
}

export function fileToLocItem(mergedFile: MergedFile,): MergeResult {
    if (mergedFile.published) {
        return createPublishedFileLocItem({
            file: mergedFile, name: mergedFile.name, timestamp: mergedFile.addedOn || null
        })
    } else {
        const locItem = createDraftFileLocItem({ file: mergedFile, name: mergedFile.name }, false)
        return { locItem, refreshNeeded: false };
    }
}

export function linkToLocItem(
    mergedLink: MergedLink,
    otherLocDescription: string,
    submitter: string,
    linkDetailsPath: string,
): MergeResult {
    if (mergedLink.published) {
        return createPublishedLinkedLocItem({
            link: mergedLink,
            timestamp: mergedLink.addedOn || null,
            otherLocDescription,
            submitter,
            linkDetailsPath,
        })
    } else {
        const locItem = createDraftLinkedLocItem({
            link: mergedLink,
            otherLocDescription,
            submitter,
            linkDetailsPath,
        }, false)
        return { locItem, refreshNeeded: false };
    }
}

export interface CreateLocMetadataItemParameters {
    metadataItem: MetadataItem,
}

function createPublishedMetadataLocItem(parameters: CreateLocMetadataItemParameters & Timestamp): MergeResult {
    return publish(createDraftMetadataLocItem(parameters, false), parameters.timestamp)
}

export function createDraftMetadataLocItem(parameters: CreateLocMetadataItemParameters, newItem: boolean): LocItem {
    const { metadataItem } = parameters;
    return {
        name: metadataItem.name,
        value: metadataItem.value,
        submitter: metadataItem.submitter,
        timestamp: null,
        type: 'Data',
        status: 'DRAFT',
        newItem
    }
}

export interface MergeLocLinkItemParameters {
    linkFromBackend: LocLink,
    linkFromChain?: Link,
    otherLocDescription: string,
    submitter: string,
    linkDetailsPath: string,
}

export function mergeLocLinkItem(parameters: MergeLocLinkItemParameters): MergeResult {
    const { linkFromBackend, linkFromChain, otherLocDescription, submitter, linkDetailsPath } = parameters;
    if (linkFromChain) {
        return createPublishedLinkedLocItem({
            link: linkFromChain,
            otherLocDescription,
            submitter,
            timestamp: linkFromBackend.addedOn,
            linkDetailsPath,
        });
    } else {
        const link: LocLink = { ...linkFromBackend, id: new UUID(linkFromBackend.target) }
        const locItem = createDraftLinkedLocItem({
            link,
            otherLocDescription,
            submitter,
            linkDetailsPath,
        }, false);
        return { locItem, refreshNeeded: false };
    }
}

export interface CreateLocLinkedLocItemParameters {
    link: Link,
    otherLocDescription: string,
    submitter: string,
    linkDetailsPath: string,
}

export function createDraftLinkedLocItem(parameters: CreateLocLinkedLocItemParameters, newItem: boolean): LocItem {
    const { link, otherLocDescription, submitter, linkDetailsPath } = parameters;
    return {
        name: otherLocDescription,
        value: link.id.toDecimalString(),
        submitter,
        timestamp: null,
        type: 'Linked LOC',
        status: 'DRAFT',
        target: link.id,
        nature: link.nature,
        linkDetailsPath,
        newItem,
    };
}

function publish(locItem: LocItem, timestamp: string | null): MergeResult {
    const publishedLocItem: LocItem = { ...locItem, status: 'PUBLISHED', timestamp };
    return { locItem: publishedLocItem, refreshNeeded: !locItem.timestamp };
}

function createPublishedLinkedLocItem(parameters: CreateLocLinkedLocItemParameters & Timestamp): MergeResult {
    return publish(createDraftLinkedLocItem(parameters, false), parameters.timestamp);
}
